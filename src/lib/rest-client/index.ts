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
      'tls-verify': z.boolean().optional(),
      jpath: z.string(),
      'observe-mode': z.boolean().optional(),
      output: z.string(),
    });

    return validate<z.infer<typeof configSchema>>(configSchema, config);
  },
  implementation: async (inputs: PluginParams[], config: ConfigParams) => {
    const actualConfig = replaceVars(config);
    const {method, url} = actualConfig;

    try {
      if (['POST', 'PUT', 'GET'].includes(method.toUpperCase())) {
        return await handleRequest(inputs, actualConfig);
      } else {
        throw new Error(`Unsupported method: ${method.toUpperCase()}`);
      }
    } catch (error) {
      if (error instanceof Error) {
        const errorMessage = error.message;
        if (
          errorMessage.startsWith('Unsupported method') ||
          errorMessage.startsWith('Only numerical output is supported.') ||
          errorMessage.startsWith('The response data has no content.') ||
          errorMessage.startsWith('timestamp has already existed in inputs.')
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

const replaceVars = (config: ConfigParams): ConfigParams => {
  const VAR_PATTERN = /\$\{([^:]+):([^}]+)\}/g;
  const replaceVar = (value: any): any => {
    if (typeof value === 'string') {
      return value.replace(VAR_PATTERN, (_, type: string, name: string) => {
        if (type === 'env') {
          return process.env[name] ?? '';
        } else {
          return value;
        }
      });
    } else if (Array.isArray(value)) {
      return value.map(v => replaceVar(v));
    } else if (value && typeof value === 'object') {
      return Object.fromEntries(
        Object.entries(value).map(([k, v]) => [k, replaceVar(v)])
      );
    } else {
      return value;
    }
  };

  const url = replaceVar(config.url);
  const data = replaceVar(config.data);
  const auth = replaceVar(config['http-basic-authentication']);
  const headers = replaceVar(config.headers);
  return {...config, url, data, 'http-basic-authentication': auth, headers};
};

const handleRequest = async (inputs: PluginParams, config: ConfigParams) => {
  const {
    method,
    url,
    data,
    'http-basic-authentication': auth,
    headers,
    'tls-verify': rejectUnauthorized,
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

  const header = ensureContentType(method, headers);

  const response = await axios({
    method: method.toUpperCase(),
    url: url,
    data: data,
    auth: auth,
    headers: header,
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
  const {jpath} = config;
  const result = checkIfNumber(jsonpath.query(data, jpath));

  return addTimestamp(config, inputs, result);
};

const addTimestamp = (
  config: ConfigParams,
  inputs: PluginParams,
  result: any
) => {
  const {output} = config;
  if (config['observe-mode']) {
    if (inputs.some((item: any) => 'timestamp' in item)) {
      throw new Error(
        'timestamp has already existed in inputs. Please set observe-mode to false.'
      );
    } else {
      const isotimestamp = new Date().toISOString();
      const timestamp = isotimestamp.split('.')[0] + 'Z';
      return inputs.map((input: any) => ({
        timestamp: timestamp,
        ...input,
        [output]: result,
      }));
    }
  }

  return inputs.map((input: any) => ({
    ...input,
    [output]: result,
  }));
};

const ensureContentType = (
  method: string,
  headers?: {[key: string]: string}
): any => {
  if (['POST', 'PUT'].includes(method.toUpperCase())) {
    if (headers === undefined) {
      const header = {'Content-Type': 'application/json'};
      return header;
    } else if (!Object.prototype.hasOwnProperty.call(headers, 'Content-Type')) {
      headers['Content-Type'] = 'application/json';
      return headers;
    } else {
      return headers;
    }
  } else {
    return headers;
  }
};
