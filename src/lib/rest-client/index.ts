import {z} from 'zod';
import axios from 'axios';
import * as jsonpath from 'jsonpath';
import {Agent} from 'https';

import {ConfigParams, PluginParams} from '@grnsft/if-core/types';
import {PluginFactory} from '@grnsft/if-core/interfaces';
import {ERRORS, validate} from '@grnsft/if-core/utils';

const {ConfigError, FetchingFileError} = ERRORS;

export const RESTClient = PluginFactory({
  configValidation: (config: ConfigParams) => {
    if (!config || !Object.keys(config)?.length) {
      throw new ConfigError('Config is not provided.');
    }

    const configSchema = z.object({
      method: z.string(),
      url: z.string(),
      data: z.any().optional(),
      'http-basic-authentication': z.record(z.string(), z.string()).optional(),
      headers: z.record(z.string(), z.any()).optional(),
      'ssl-tls-active': z.boolean().optional(),
      jpath: z.string(),
      output: z.string(),
    });

    return validate<z.infer<typeof configSchema>>(configSchema, config);
  },
  implementation: async (inputs: PluginParams[], config: ConfigParams) => {
    const {method, url} = config;

    try {
      if (['POST', 'PUT', 'GET'].includes(method.toUpperCase())) {
        return await handleRequest(inputs, config);
      } else {
        throw new Error(`Unsupported method: ${method.toUpperCase()}`);
      }
    } catch (error) {
      if (error instanceof Error) {
        const errorMessage = error.message;
        if (
          errorMessage.startsWith('Unsupported method') ||
          errorMessage.startsWith('Only numerical output is supported.') ||
          errorMessage.startsWith('The response data has no content.')
        ) {
          throw new Error(errorMessage);
        } else {
          throw new FetchingFileError(
            `Failed fetching the file: ${url}. ${errorMessage}`
          );
        }
      } else {
        throw new FetchingFileError(
          `Failed fetching the file: ${url}. Unknown error occurred.`
        );
      }
    }
  },
});

const handleRequest = async (inputs: PluginParams, config: ConfigParams) => {
  const {
    method,
    url,
    data,
    'http-basic-authentication': auth,
    headers,
    'ssl-tls-active': rejectUnauthorized,
  } = config;

  let agent;
  if (rejectUnauthorized === undefined) {
    agent = new Agent({
      rejectUnauthorized: true,
    });
  } else {
    agent = new Agent({
      rejectUnauthorized: rejectUnauthorized,
    });
  }

  const response = await axios({
    method: method.toUpperCase(),
    url: url,
    data: data,
    auth: auth,
    headers: headers,
    httpsAgent: agent,
  });

  return processData(response, config, inputs);
};

const checkIfNumber = (input: any): number => {
  const data = extractSingleElement(input);
  if (isNaN(data)) {
    throw new Error(
      `Only numerical output is supported. '${data}' is not a number.`
    );
  }
  if (data.length === 0) {
    throw new Error('The response data has no content.');
  }
  return data;
};

const extractSingleElement = (input: any): any => {
  if (Array.isArray(input) && input.length === 1) {
    return input[0];
  }
  return input;
};

const processData = (
  response: any,
  config: ConfigParams,
  inputs: PluginParams
) => {
  const data = response.data;
  const {jpath, output} = config;
  const result = checkIfNumber(jsonpath.query(data, jpath));

  return inputs.map((input: any) => ({
    ...input,
    [output]: result,
  }));
};
