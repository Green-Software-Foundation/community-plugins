# REST client

`rest-client` is a plugin for executing HTTP methods GET, PUT, and POST

You provide some query parameters including `url`, `method`, and so on. `url` is URL for an online resource. `method` specifies the HTTP method. This plugin supports several authentication.


## Parameters

### Plugin config

Three parameters are required in config: `query`, `jpath` and `output`.

- `query`: a string array matching an existing key and includes the following:
  - `method`: HTTP method, you can choose `GET`, `PUT`, and `POST`
  - `url`: The URL to which you send the request
  - `headers`: optional and HTTP request header
    - `Authorization`: optional and provide authentication information to the target. For example,
      - Bearer Token Authentication: 
        ```yml
        Authorization: Bearer <token>
        ```
      - API Key Authentication: 
        ```yml
        Authorization: ApiKey <api_key>
        ```
  - `data` : request body, used with `PUT` and `POST` methods
  - `auth` : optional and authentication information for HTTP Basic Authentication
    ```yml
    auth: {
      username: 'yourUsername',
      password: 'yourPassword'
    }
    ```
- `jpath`: optional, JSONPath expression, and you can use it when using the GET method
- `output`: parameter name to store the result of GET method in the output array and you only need to configure it when using the GET method

### Inputs

There are no strict requirements on input for this plugin because they depend upon the contents of the target and your input data at the time the rest client is invoked. Please make sure you are requesting data from target that exist in the target database.

## Returns

input data with value requested by `GET` method or input data for `PUT` and `POST`

## Example manifest

IF users will typically call the plugin as part of a pipeline defined in a manifest file. In this case, instantiating the plugin is handled by `if-run` and does not have to be done explicitly by the user. The followings are example manifests that calls `rest-client`:

```yaml
name: get-wattge
description: successful path
tags:
initialize:
  plugins:
    get-wattage:
      path: 'https://github.com/Green-Software-Foundation/community-plugins'
      method: RESTClient
      config:
        query:
          url: https://api.example.com/data
          method: get
          headers: 
            Authorization: Bearer your-secret-token
        jpath: $.information[?(@.id==1)].wattage
        output: wattage
tree:
  children:
    child:
      pipeline:
        compute:
          - get-wattage
      inputs:
        - timestamp: 2023-07-06T00:00 
          duration: 100
```
```yaml
name: put-wattge
description: successful path
tags:
initialize:
  plugins:
    put-wattage:
      path: 'https://github.com/Green-Software-Foundation/community-plugins'
      method: RESTClient
      config:
        query:
          method: put
          url: https://api.example.com/data
          data: {wattage: 100}
          auth: {
            username: 'yourUsername',
            password: 'yourPassword'
          }
tree:
  children:
    child:
      pipeline:
        compute:
          - put-wattage
      inputs:
        - timestamp: 2023-07-06T00:00 
          duration: 100


```
```yaml
name: post-wattge
description: successful path
tags:
initialize:
  plugins:
    post-wattage:
      path: 'https://github.com/Green-Software-Foundation/community-plugins'
      method: RESTClient
      config:
        query:
          url: https://api.example.com/data
          method: post
          data: {wattage: 100}
tree:
  children:
    child:
      pipeline:
        compute:
          - post-wattage
      inputs:
        - timestamp: 2023-07-06T00:00 
          duration: 100
```
You can set `community-plugins` to `path` insted of `https://github.com/Green-Software-Foundation/community-plugins`. 
You can run this example as following when you save it to `./examples/manifests/rest-client.yml`:

```sh
if-run --manifest ./examples/manifests/rest-client.yml --output ./examples/outputs/rest-client
```

The results will be saved to a new `yaml` file in `./examples/outputs`

## Errors

`rest-client` exposes two of the IF error classes.

### ConfigError

You will receive an error starting `ConfigError: ` if you have not provided the expected configuration data in the plugin's `initialize` block.

The required parameters are:

- `query`: this must be an array of key-value pairs 
- `jpath`: this must be a string
- `output`: this must be a string

You can fix this error by checking you are providing valid values for each parameter in the config.

### FetchingFileError

This error is caused by connection problems. Please check your internet connection or `url`. You can check your connection to the target using a tool such as `ping` or `curl`.

For more information on these error classes, please visit [IF docs](https://if.greensoftware.foundation/reference/errors)
