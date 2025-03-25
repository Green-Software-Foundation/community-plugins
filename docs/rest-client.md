# REST client

`rest-client` is a plugin for executing HTTP methods `GET`, `PUT`, and `POST`. 

You provide some query parameters including `url`, `method`, and so on. `url` is URL for an online resource. `method` specifies the HTTP method.Only a numeric value is accepted as `output`, otherwise an error is returned.

## Parameters

### Plugin config

The parameters are required in config: `method`, `url`, `data`, `headers`, `http-basic-authentication`, `jpath` and `output`.


- `method`: HTTP method, you can choose `GET`, `PUT`, and `POST`
- `url`: the URL to which you send the request 
- `data` : used with `PUT` and `POST` methods and the data specified in `data` is set in the request body in JSON format but if `Content-Type` is specified in `headers`, it can be overridden by that value.
- `headers`: optional and request header
    ```yml
    headers: 
      - Accept: application/json
      - Authorization: Bearer xxxxxx
      - X-Custom-Header: foo
    
    ```
- `http-basic-authentication` : optional and authentication information for HTTP Basic Authentication
    ```yml
    http-basic-authentication: 
      username: 'yourUsername'
      password: 'yourPassword'
    
    ```
- `ssl-tls-active`: optional, SSL/TLS is enabled if true and undefined, SSL/TLS is disabled if false
- `jpath`: JSONPath expression and you can use it when using the GET method
- `output`: parameter name to store the result of this plugin

### Inputs

There are no strict requirements on input for this plugin because they depend upon the contents of the target and your input data at the time the rest client is invoked. Please make sure you are requesting data from target that exist in the target database.

## Returns

`output`: a numerical value requested by `GET`, `PUT`, and `POST` and scraped by `jpath`

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
        url: https://api.example.com/data
        method: get
        headers:
          Authorization: Bearer your-secret-token
        ssl-tls-active: true
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
name: wattage-in-put-request
description: successful path
tags:
initialize:
  plugins:
    wattage-in-put-request:
      path: 'https://github.com/Green-Software-Foundation/community-plugins'
      method: RESTClient
      config:
        method: put
        url: https://api.example.com/data
        data: 
          wattage: 100
        http-basic-authentication: 
          username: 'yourUsername'
          password: 'yourPassword'
        output: result
        jpath: data
          
tree:
  children:
    child:
      pipeline:
        compute:
          - wattage-in-put-request
      inputs:
        - timestamp: 2023-07-06T00:00 
          duration: 100


```
```yaml
name: wattage-in-post-request
description: successful path
tags:
initialize:
  plugins:
    wattage-in-post-request:
      path: 'https://github.com/Green-Software-Foundation/community-plugins'
      method: RESTClient
      config:
        url: https://api.example.com/data
        method: post
        data: 
          wattage: 100
        output: result
        jpath: data
tree:
  children:
    child:
      pipeline:
        compute:
          - wattage-in-post-request
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

- `method`: this must be a string
- `url`: this must be a string
- `data` : this is must be array
- `bearer-tokken`: this must be a string
- `http-basic-authentication` : this must be a string
- `jpath`: this must be a string
- `output`: this must be a string

You can fix this error by checking you are providing valid values for each parameter in the config.

### FetchingFileError

This error is caused by connection problems. Please check your internet connection or `url`. You can check your connection to the target using a tool such as `ping` or `curl`.

For more information on these error classes, please visit [IF docs](https://if.greensoftware.foundation/reference/errors)
