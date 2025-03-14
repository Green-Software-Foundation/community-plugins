import {z} from 'zod';
import axios, {AxiosResponse} from 'axios';
import * as jsonpath from 'jsonpath';

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
    const {query, jpath, output} = config;

    try {
      let response: AxiosResponse;
      const method = query.method;
      if (method.toUpperCase() === 'GET') {
        response = await axios(query);
        const data = response.data;

        if (typeof jpath === 'undefined') {
          return inputs.map(input => ({
            ...input,
            [output]: data,
          }));
        } else {
          const result = jsonpath.query(data, jpath);

          if (result.length === 1) {
            return inputs.map(input => ({
              ...input,
              [output]: result[0],
            }));
          }

          return inputs.map(input => ({
            ...input,
            [output]: result,
          }));
        }
      } else if (method.toUpperCase() === 'POST') {
        response = await axios(query);
        return inputs;
      } else if (method.toUpperCase() === 'PUT') {
        response = await axios(query);
        return inputs;
      } else {
        throw new Error('Unsupported method: ${method}');
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
