import axios from 'axios';
import AxiosMockAdapter from 'axios-mock-adapter';
import {RESTClient} from '../../lib/rest-client';
import {ERRORS} from '@grnsft/if-core/utils';

const {FetchingFileError, ConfigError} = ERRORS;

describe('builtins/rest-client', () => {
  const mock = new AxiosMockAdapter(axios);

  describe('RESRClient: ', () => {
    const parametersMetadata = {
      inputs: {},
      outputs: {},
    };

    afterEach(() => {
      mock.reset();
    });

    describe('init: ', () => {
      it('successfully initalized.', () => {
        const config = {
          query: {
            url: '',
            method: 'get',
          },
          output: 'wattage',
        };

        const restClient = RESTClient(config, parametersMetadata, {});

        expect(restClient).toHaveProperty('metadata');
        expect(restClient).toHaveProperty('execute');
      });
    });

    describe('execute(): ', () => {
      it('successfully applies RESTCLient `GET` method to given input.', async () => {
        expect.assertions(1);
        const config = {
          query: {
            method: 'GET',
            url: 'https://api.example.com/data',
          },
          jpath: '$.data',
          output: 'result',
        };

        const restClient = RESTClient(config, parametersMetadata, {});
        mock.onGet(config.query.url).reply(200, {data: 100});

        const result = await restClient.execute([
          {
            timestamp: '2024-03-01',
            duration: 3600,
          },
        ]);
        const expectedResult = [
          {
            timestamp: '2024-03-01',
            duration: 3600,
            result: 100,
          },
        ];

        expect(result).toStrictEqual(expectedResult);
      });

      it('successfully applies RESTClient `PUT` method to given input.', async () => {
        expect.assertions(1);
        const config = {
          query: {
            method: 'PUT',
            url: 'https://api.example.com/data',
            data: {data: 100},
          },
        };
        const restClient = RESTClient(config, parametersMetadata, {});
        mock.onPut(config.query.url, config.query.data).reply(200, {data: 100});
        const result = await restClient.execute([
          {
            timestamp: '2024-03-01',
            duration: 3600,
          },
        ]);
        const expectedResult = [
          {
            timestamp: '2024-03-01',
            duration: 3600,
          },
        ];
        expect(result).toStrictEqual(expectedResult);
      });

      it('successfully applies RESTClient `POST` method to given input.', async () => {
        expect.assertions(1);
        const config = {
          query: {
            method: 'POST',
            url: 'https://api.example.com/data',
            data: {data: 100},
          },
        };
        const restClient = RESTClient(config, parametersMetadata, {});
        mock
          .onPost(config.query.url, config.query.data)
          .reply(200, {data: 100});
        const result = await restClient.execute([
          {
            timestamp: '2024-03-01',
            duration: 3600,
          },
        ]);
        const expectedResult = [
          {
            timestamp: '2024-03-01',
            duration: 3600,
          },
        ];
        expect(result).toStrictEqual(expectedResult);
      });

      it('successfully executes when the `mapping` map output parameter.', async () => {
        expect.assertions(1);
        const config = {
          query: {
            method: 'GET',
            url: 'https://api.example.com/data',
          },
          jpath: '$.data',
          output: 'result',
        };
        const parameterMetadata = {inputs: {}, outputs: {}};
        const mapping = {result: 'wattage'};
        const restClient = RESTClient(config, parameterMetadata, mapping);
        mock.onGet(config.query.url).reply(200, {data: 100});
        const result = await restClient.execute([
          {
            timestamp: '2024-03-01',
            duration: 3600,
          },
        ]);
        const expectedResult = [
          {
            timestamp: '2024-03-01',
            duration: 3600,
            wattage: 100,
          },
        ];
        expect(result).toStrictEqual(expectedResult);
      });

      it('rejects with method error.', async () => {
        expect.assertions(2);
        const config = {
          query: {
            method: 'DELETE',
            url: 'https://api.example.com/data',
          },
          jpath: '$.data',
          output: 'result',
        };
        mock.onGet(config.query.url).reply(404);
        const restClient = RESTClient(config, parametersMetadata, {});
        const input = [
          {
            timestamp: '2024-03-01',
            duration: 3600,
          },
        ];
        try {
          await restClient.execute(input);
        } catch (error) {
          if (error instanceof Error) {
            expect(error).toBeInstanceOf(Error);
            expect(error.message).toEqual('Unsupported method: DELETE');
          }
        }
      });

      it('rejects with axios error.', async () => {
        expect.assertions(1);
        const config = {
          query: {
            method: 'GET',
            url: 'https://api.example.com/data',
          },
          jpath: '$.data',
          output: 'result',
        };
        mock.onGet(config.query.url).reply(404);
        const restClient = RESTClient(config, parametersMetadata, {});
        const input = [
          {
            timestamp: '2024-03-01',
            duration: 3600,
          },
        ];
        try {
          await restClient.execute(input);
        } catch (error) {
          if (error instanceof Error) {
            expect(error).toBeInstanceOf(FetchingFileError);
          }
        }
      });

      it('rejects with config not found error.', async () => {
        expect.assertions(2);
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const restClient = RESTClient();
        const input = [
          {
            timestamp: '2024-03-01',
            duration: 3600,
          },
        ];
        try {
          await restClient.execute(input);
        } catch (error) {
          if (error instanceof Error) {
            expect(error).toBeInstanceOf(ConfigError);
            expect(error.message).toEqual('Config is not provided.');
          }
        }
      });
    });
  });
});
