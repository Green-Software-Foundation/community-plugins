import {z} from 'zod';
import axios from 'axios';
import * as jsonpath from 'jsonpath';
import {Agent} from 'https';
import {stringify} from 'flatted';

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
      'bearer-tokken': z.string().optional(),
      jpath: z.string().optional(),
      output: z.string(),
    });

    return validate<z.infer<typeof configSchema>>(configSchema, config);
  },
  implementation: async (inputs: PluginParams[], config: ConfigParams) => {
    const {method, url} = config;

    try {
      if (
        method.toUpperCase() === 'POST' ||
        method.toUpperCase() === 'PUT' ||
        method.toUpperCase() === 'GET'
      ) {
        const result = await handleRequest(inputs, config);
        return result;
      } else {
        throw new Error(`Unsupported method: ${method.toUpperCase()}`);
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.startsWith('Unsupported method')) {
          throw new Error(error.message);
        } else if (
          error.message.startsWith('Only numerical output is supported.')
        ) {
          throw new Error(error.message);
        } else {
          throw new FetchingFileError(
            `Failed fetching the file: ${url}. ${error.message}`
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
    'bearer-tokken': authorization,
    output,
  } = config;
  const agent = new Agent({
    rejectUnauthorized: false,
  });
  const response = await axios({
    method: method.toUpperCase(),
    url: url,
    data: data || null,
    auth: auth || null,
    headers: {Authorization: authorization || null},
    httpsAgent: agent,
  });
  if (method.toUpperCase() === 'GET') {
    const data = response.data;
    const {jpath} = config;
    if (typeof jpath === 'undefined') {
      const result = checkIfNumber(data);
      return inputs.map((input: any) => ({
        ...input,
        [output]: result,
      }));
    } else {
      const result = checkIfNumber(jsonpath.query(data, jpath));
      return inputs.map((input: any) => ({
        ...input,
        [output]: result,
      }));
    }
  } else if (
    method.toUpperCase() === 'POST' ||
    method.toUpperCase() === 'PUT'
  ) {
    const result = {
      status: response.status,
      statusText: response.statusText,
      data: JSON.stringify(response.data),
      headers: JSON.stringify(response.headers),
      config: JSON.stringify(response.config),
      request: JSON.stringify(stringify(response.request)),
    };
    return inputs.map((input: any) => ({
      ...input,
      [output]: result,
    }));
  }
};

const checkIfNumber = (input: any): number => {
  const data = extractSingleElement(input);
  if (isNaN(data)) {
    throw new Error(
      `Only numerical output is supported. '${data}' is not a number.`
    );
  }
  return data;
};

const extractSingleElement = (input: any): any => {
  if (Array.isArray(input) && input.length === 1) {
    return input[0];
  }
  return input;
};
