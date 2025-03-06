# Power-to-Energy

`power-to-energy` is a plugin for calculating enegy consumption (kWh) from wattage and duration.

You provide the wattage value and the duration.

For example, you could add `wattage` and `duration`. The `energy-consumption` would then be added to every observation in your input array as the calculated value of `wattage` and `duration`.

## Parameters

### Plugin config

Two parameters are required in config: `input-parameter` and `output-parameter`.

- `input-parameter`: a string matching an existing key which represents `wattage` in the `inputs` array.
- `output-parameter`: parameter name to store the result of calculation in the output array.

### Inputs

`input-parameter` must be available in the `inputs` array

## Returns

energy consumption derived by input parameters (`wattage` and `duration`)

## Calculation

```pseudocode
output-parameter = wattage * duration / 3600 / 1000
```

## Example manifest

IF users will typically call the plugin as part of a pipeline defined in a manifest file. In this case, instantiating the plugin is handled by `if-run` and does not have to be done explicitly by the user. The following is an example manifest that calls `power-to-energy`:

```yaml
name: power-to-energy-demo
description:
tags:
initialize:
  plugins:
    power-to-energy:
      method: ConvertPowerToEnergy
      path: 'https://github.com/Green-Software-Foundation/community-plugins'
      config:
        input-parameter: 'wattage'
        output-parameter: 'energy-consumption'

tree:
  children:
    child:
      pipeline:
        compute:
          - power-to-energy
      inputs:
        - timestamp: 2023-08-06T00:00
          duration: 3600
          wattage: 3
```
You can also use `community-plugins` as a path insted of `https://github.com/Green-Software-Foundation/community-plugins`. 
You can run this example by saving it as `./examples/manifests/power-to-energy.yml` and executing the following command from the project root:

```sh
if-run --manifest ./examples/manifests/power-to-energy.yml --output ./examples/outputs/power-to-energy
```

The results will be saved to a new `yaml` file in `./examples/outputs`

## Errors

`power-to-energy` exposes two of the IF error classes.

### ConfigError

You will receive an error starting `ConfigError: ` if you have not provided the expected configuration data in the plugin's `initialize` block.

The required parameters are:

- `input-parameter`: this must be a string
- `output-parameter`: this must be a string

You can fix this error by checking you are providing valid values for each parameter in the config.

### `MissingInputDataError`

This error arises when a necessary piece of input data is missing from the `inputs` array.
Every element in the `inputs` array must contain:

- `timestamp`
- `duration`
- whatever value you passed to `input-parameter`

For more information on our error classes, please visit [our docs](https://if.greensoftware.foundation/reference/errors)
