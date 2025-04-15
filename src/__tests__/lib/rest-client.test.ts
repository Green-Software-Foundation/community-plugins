import axios from 'axios';
import AxiosMockAdapter from 'axios-mock-adapter';
import {RESTClient} from '../../lib/rest-client';
import {ERRORS} from '@grnsft/if-core/utils';

const {FetchingFileError, ConfigError} = ERRORS;

describe('rest-client', () => {
  const mock = new AxiosMockAdapter(axios);

  describe('RESTClient: ', () => {
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
          url: '',
          method: 'get',
          output: 'wattage',
          'tls-verify': false,
          jpath: 'data',
        };

        const restClient = RESTClient(config, parametersMetadata, {});

        expect(restClient).toHaveProperty('metadata');
        expect(restClient).toHaveProperty('execute');
      });
    });

    describe('execute(): ', () => {
      it('successfully applies RESTCLient `GET` method to given input. (tls-verify is undefined)', async () => {
        expect.assertions(3);
        const config = {
          method: 'GET',
          url: 'https://api.example.com/data',
          jpath: '$.data',
          output: 'result',
        };

        const restClient = RESTClient(config, parametersMetadata, {});
        mock.onGet(config.url).reply(config => {
          const headers = config.headers ?? {};
          expect(config.httpsAgent.options.rejectUnauthorized).toBe(true);
          expect(headers['Content-Type']).toBeUndefined();
          return [200, {data: 100}];
        });

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

      it('successfully applies RESTCLient `GET` method to given input. (tls-verify is defined)', async () => {
        expect.assertions(3);
        const config = {
          method: 'GET',
          url: 'https://api.example.com/data',
          'tls-verify': false,
          jpath: '$.data',
          output: 'result',
        };

        const restClient = RESTClient(config, parametersMetadata, {});
        mock.onGet(config.url).reply(config => {
          const headers = config.headers ?? {};
          expect(config.httpsAgent.options.rejectUnauthorized).toBe(false);
          expect(headers['Content-Type']).toBeUndefined();
          return [200, {data: 100}];
        });

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

      it('successfully applies RESTClient `PUT` method to given input. (tls-verify is undefined and Content-Type is undefined)', async () => {
        expect.assertions(3);
        const config = {
          method: 'PUT',
          url: 'https://api.example.com/data',
          data: {data: 100},
          jpath: 'data',
          output: 'result',
        };

        const restClient = RESTClient(config, parametersMetadata, {});
        mock.onPut(config.url, config.data).reply(config => {
          const headers = config.headers ?? {};
          expect(config.httpsAgent.options.rejectUnauthorized).toBe(true);
          expect(headers['Content-Type']).toBe('application/json');
          return [200, {data: 100}];
        });

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

      it('successfully applies RESTClient `PUT` method to given input. (tls-verify is defined and Content-Type is undefined)', async () => {
        expect.assertions(3);
        const config = {
          method: 'PUT',
          url: 'https://api.example.com/data',
          data: {data: 100},
          jpath: 'data',
          output: 'result',
          'tls-verify': false,
        };

        const restClient = RESTClient(config, parametersMetadata, {});
        mock.onPut(config.url, config.data).reply(config => {
          const headers = config.headers ?? {};
          expect(config.httpsAgent.options.rejectUnauthorized).toBe(false);
          expect(headers['Content-Type']).toBe('application/json');
          return [200, {data: 100}];
        });

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

      it('successfully applies RESTClient `PUT` method to given input. (tls-verify is undefined and Content-Type is defined)', async () => {
        expect.assertions(3);
        const config = {
          method: 'PUT',
          url: 'https://api.example.com/data',
          data: {data: 100},
          headers: {
            'Content-Type': 'application/vnd.test',
          },
          jpath: 'data',
          output: 'result',
        };

        const restClient = RESTClient(config, parametersMetadata, {});
        mock.onPut(config.url, config.data).reply(config => {
          const headers = config.headers ?? {};
          expect(headers['Content-Type']).toBe('application/vnd.test');
          expect(config.httpsAgent.options.rejectUnauthorized).toBe(true);
          return [200, {data: 100}];
        });

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

      it('successfully applies RESTClient `PUT` method to given input. (tls-verify is defined and Content-Type is defined)', async () => {
        expect.assertions(3);
        const config = {
          method: 'PUT',
          url: 'https://api.example.com/data',
          data: {data: 100},
          headers: {
            'Content-Type': 'application/vnd.test',
          },
          jpath: 'data',
          output: 'result',
          'tls-verify': true,
        };

        const restClient = RESTClient(config, parametersMetadata, {});
        mock.onPut(config.url, config.data).reply(config => {
          const headers = config.headers ?? {};
          expect(headers['Content-Type']).toBe('application/vnd.test');
          expect(config.httpsAgent.options.rejectUnauthorized).toBe(true);
          return [200, {data: 100}];
        });

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

      it('successfully applies RESTClient `POST` method to given input.(tls-verify is undefined and Content-Type is undefined)', async () => {
        expect.assertions(3);
        const config = {
          method: 'POST',
          url: 'https://api.example.com/data',
          data: {data: 100},
          'http-basic-authentication': {
            username: 'yourUsername',
            password: 'yourPassword',
          },
          jpath: 'data',
          output: 'result',
        };

        const restClient = RESTClient(config, parametersMetadata, {});
        mock.onPost(config.url, config.data).reply(config => {
          const headers = config.headers ?? {};
          expect(headers['Content-Type']).toBe('application/json');
          expect(config.httpsAgent.options.rejectUnauthorized).toBe(true);
          return [200, {data: 100}];
        });

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

      it('successfully applies RESTClient `POST` method to given input.(tls-verify is defined and Content-Type is undefined)', async () => {
        expect.assertions(3);
        const config = {
          method: 'POST',
          url: 'https://api.example.com/data',
          data: {data: 100},
          'http-basic-authentication': {
            username: 'yourUsername',
            password: 'yourPassword',
          },
          'tls-verify': false,
          jpath: 'data',
          output: 'result',
        };

        const restClient = RESTClient(config, parametersMetadata, {});
        mock.onPost(config.url, config.data).reply(config => {
          const headers = config.headers ?? {};
          expect(headers['Content-Type']).toBe('application/json');
          expect(config.httpsAgent.options.rejectUnauthorized).toBe(false);
          return [200, {data: 100}];
        });
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

      it('successfully applies RESTClient `POST` method to given input.(tls-verify is undefined and Content-Type is defined)', async () => {
        expect.assertions(3);
        const config = {
          method: 'POST',
          url: 'https://api.example.com/data',
          data: {data: 100},
          'http-basic-authentication': {
            username: 'yourUsername',
            password: 'yourPassword',
          },
          headers: {
            'Content-Type': 'application/vnd.test',
          },
          jpath: 'data',
          output: 'result',
        };

        const restClient = RESTClient(config, parametersMetadata, {});
        mock.onPost(config.url, config.data).reply(config => {
          const headers = config.headers ?? {};
          expect(headers['Content-Type']).toBe('application/vnd.test');
          expect(config.httpsAgent.options.rejectUnauthorized).toBe(true);
          return [200, {data: 100}];
        });

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

      it('successfully applies RESTClient `POST` method to given input.(tls-verify is defined and Content-Type is defined)', async () => {
        expect.assertions(3);
        const config = {
          method: 'POST',
          url: 'https://api.example.com/data',
          data: {data: 100},
          'http-basic-authentication': {
            username: 'yourUsername',
            password: 'yourPassword',
          },
          headers: {
            'Content-Type': 'application/vnd.test',
          },
          'tls-verify': false,
          jpath: 'data',
          output: 'result',
        };

        const restClient = RESTClient(config, parametersMetadata, {});
        mock.onPost(config.url, config.data).reply(config => {
          const headers = config.headers ?? {};
          expect(headers['Content-Type']).toBe('application/vnd.test');
          expect(config.httpsAgent.options.rejectUnauthorized).toBe(false);
          return [200, {data: 100}];
        });

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

      it('successfully executes when the `mapping` map output parameter.', async () => {
        expect.assertions(1);
        const config = {
          method: 'GET',
          url: 'https://api.example.com/data',
          jpath: '$.data',
          output: 'result',
        };
        const parameterMetadata = {inputs: {}, outputs: {}};
        const mapping = {
          result: 'wattage',
        };
        const restClient = RESTClient(config, parameterMetadata, mapping);
        mock.onGet(config.url).reply(200, {data: 100});

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

      it('rejects with axios error.', async () => {
        expect.assertions(1);
        const config = {
          method: 'GET',
          url: 'https://api.example.com/data',
          jpath: '$.data',
          output: 'result',
        };
        mock.onGet(config.url).reply(404);

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

      it('rejects with method not PUT, GET, or POST error.', async () => {
        expect.assertions(1);
        const config = {
          method: 'DELETE',
          url: 'https://api.example.com/data',
          jpath: '$.wattage',
          output: 'result',
        };
        mock.onGet(config.url).reply(200);

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
            expect(error.message).toEqual('Unsupported method: DELETE');
          }
        }
      });

      it('rejects with output not number error. (output is string)', async () => {
        expect.assertions(1);
        const config = {
          method: 'GET',
          url: 'https://api.example.com/data',
          jpath: '$.name',
          output: 'result',
        };
        mock.onGet(config.url).reply(200, {name: 'Jack'});

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
            expect(error.message).toEqual(
              "Only numerical output is supported. 'Jack' is not a number."
            );
          }
        }
      });

      it('rejects with output not number error. (output is array)', async () => {
        expect.assertions(1);
        const config = {
          method: 'GET',
          url: 'https://api.example.com/data',
          jpath: '$.wattage',
          output: 'result',
        };
        mock.onGet(config.url).reply(200, {wattage: [1, 42]});

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
            expect(error.message).toEqual(
              "Only numerical output is supported. '1,42' is not a number."
            );
          }
        }
      });

      it('rejects with response data no content error.', async () => {
        expect.assertions(1);
        const config = {
          method: 'GET',
          url: 'https://api.example.com/data',
          output: 'result',
          jpath: 'data',
        };
        mock.onGet(config.url).reply(204, {});

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
            expect(error.message).toEqual('The response data has no content.');
          }
        }
      });
    });
  });
});
