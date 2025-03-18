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
      query: z.record(
        z.string(),
        z.union([
          z.string(),
          z.record(z.string(), z.union([z.string(), z.any()])),
        ])
      ),
      jpath: z.string().optional(),
      output: z.string().optional(),
    });

    return validate<z.infer<typeof configSchema>>(configSchema, config);
  },
  implementation: async (inputs: PluginParams[], config: ConfigParams) => {
    const {query} = config;
    const method = query.method;

    try {
      if (
        method.toUpperCase() === 'POST' ||
        method.toUpperCase() === 'PUT' ||
        method.toUpperCase() === 'GET'
      ) {
        const result = await handleRequest(inputs, config);
        return result;
      } else {
        throw new Error(`Unsupported method: ${query.method}`);
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.startsWith('Unsupported method')) {
          throw new Error(error.message);
        } else {
          throw new FetchingFileError(
            `Failed fetching the file: ${query.url}. ${error.message}`
          );
        }
      } else {
        throw new FetchingFileError(
          `Failed fetching the file: ${query.url}. Unknown error occurred.`
        );
      }
    }
  },
});

const handleRequest = async (inputs: PluginParams, config: ConfigParams) => {
  const {query, jpath, output} = config;
  const method = query.method;
  const agent = new Agent({
    rejectUnauthorized: false,
  });
  const response = await axios({
    ...query,
    httpsAgent: agent,
  });
  const data = response.data;

  if (method.toUpperCase() === 'GET') {
    if (typeof jpath === 'undefined') {
      return inputs.map((input: any) => ({
        ...input,
        [output]: data,
      }));
    } else {
      const result = jsonpath.query(data, jpath);

      if (result.length === 1) {
        return inputs.map((input: any) => ({
          ...input,
          [output]: result[0],
        }));
      }

      return inputs.map((input: any) => ({
        ...input,
        [output]: result,
      }));
    }
  } else if (method === 'POST' || method === 'PUT') {
    return inputs;
  }
};
