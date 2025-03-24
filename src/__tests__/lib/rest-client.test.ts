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
          method: 'GET',
          url: 'https://api.example.com/data',
          jpath: '$.data',
          output: 'result',
        };

        const restClient = RESTClient(config, parametersMetadata, {});
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
            result: 100,
          },
        ];

        expect(result).toStrictEqual(expectedResult);
      });

      it('successfully applies RESTClient `PUT` method to given input.', async () => {
        expect.assertions(1);
        const config = {
          method: 'PUT',
          url: 'https://api.example.com/data',
          data: {data: 100},
          output: 'status',
        };

        const restClient = RESTClient(config, parametersMetadata, {});
        mock.onPut(config.url, config.data).reply(200, {data: 100});

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
            status: {
              config:
                '{"transitional":{"silentJSONParsing":true,"forcedJSONParsing":true,"clarifyTimeoutError":false},"transformRequest":[null],"transformResponse":[null],"timeout":0,"xsrfCookieName":"XSRF-TOKEN","xsrfHeaderName":"X-XSRF-TOKEN","maxContentLength":-1,"maxBodyLength":-1,"env":{},"headers":{"Accept":"application/json, text/plain, */*","Content-Type":"application/json"},"method":"put","url":"https://api.example.com/data","data":"{\\"data\\":100}","auth":null,"httpsAgent":{"_events":{},"_eventsCount":2,"defaultPort":443,"protocol":"https:","options":{"rejectUnauthorized":false,"noDelay":true,"path":null},"requests":{},"sockets":{},"freeSockets":{},"keepAliveMsecs":1000,"keepAlive":false,"maxSockets":null,"maxFreeSockets":256,"scheduling":"lifo","maxTotalSockets":null,"totalSocketCount":0,"maxCachedSessions":100,"_sessionCache":{"map":{},"list":[]}},"allowAbsoluteUrls":true}',
              data: '{"data":100}',
              headers: '{}',
              request:
                '"[{\\"responseURL\\":\\"1\\"},\\"https://api.example.com/data\\"]"',
              status: 200,
              statusText: undefined,
            },
          },
        ];

        expect(result).toStrictEqual(expectedResult);
      });

      it('successfully applies RESTClient `POST` method to given input.', async () => {
        expect.assertions(1);
        const config = {
          method: 'POST',
          url: 'https://api.example.com/data',
          data: {data: 100},
          'http-basic-authentication': {
            username: 'yourUsername',
            password: 'yourPassword',
          },
          output: 'status',
        };

        const restClient = RESTClient(config, parametersMetadata, {});
        mock.onPost(config.url, config.data).reply(200, {data: 100});

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
            status: {
              config:
                '{"transitional":{"silentJSONParsing":true,"forcedJSONParsing":true,"clarifyTimeoutError":false},"transformRequest":[null],"transformResponse":[null],"timeout":0,"xsrfCookieName":"XSRF-TOKEN","xsrfHeaderName":"X-XSRF-TOKEN","maxContentLength":-1,"maxBodyLength":-1,"env":{},"headers":{"Accept":"application/json, text/plain, */*","Content-Type":"application/json"},"method":"post","url":"https://api.example.com/data","data":"{\\"data\\":100}","auth":{"username":"yourUsername","password":"yourPassword"},"httpsAgent":{"_events":{},"_eventsCount":2,"defaultPort":443,"protocol":"https:","options":{"rejectUnauthorized":false,"noDelay":true,"path":null},"requests":{},"sockets":{},"freeSockets":{},"keepAliveMsecs":1000,"keepAlive":false,"maxSockets":null,"maxFreeSockets":256,"scheduling":"lifo","maxTotalSockets":null,"totalSocketCount":0,"maxCachedSessions":100,"_sessionCache":{"map":{},"list":[]}},"allowAbsoluteUrls":true}',
              data: '{"data":100}',
              headers: '{}',
              request:
                '"[{\\"responseURL\\":\\"1\\"},\\"https://api.example.com/data\\"]"',
              status: 200,
              statusText: undefined,
            },
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

      it('rejects with output not number error.', async () => {
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
    });
  });
});
