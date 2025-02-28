# Community plugins

This repository is for IF community members to host Impact Frameowrk plugins in cases where their organization's internal policies or other factors block them from creating their own external repositories. 
The GSF does not actively maintain these plugins nor do we necessarily review PRs here.

This is for edge cases only - our preferred mode of operation is for plugins to be hosted externally in developer's own Github repositories. 

If you need to hoist plugins here, please get in touch by email to `research@greensoftware.foundation`.

# List of methods

| Method | Description |
|------- | ----------- |
| ConvertPowerToEnergy | The method converts power to energy |

# How to use

You can install this plugin directly from GitHub repository.

```sh
npm install -g https://github.com/Green-Software-Foundation/community-plugins
```

Then, in your `manifest`, provide the path in the plugin instantiation. You also need to specify which method the plugin instantiates. In this case you are using the `FuncA`.

```yaml
name: plugin-demo-git
description: loads plugin
tags: null
initialize:
  plugins:
    community-plugin:
      method: FuncA
      path: https://github.com/Green-Software-Foundation/community-plugins
      config:
        ...
...
```

Now, when you run the `manifest` using the IF CLI, it will load the plugin automatically. Run using:

```sh
if-run -m <path-to-your-manifest> -o <path-to-save-output>
```
