# Red 🔴
A TUI Redis client to inspect and manage your Redis databases.
Inspired by [k9s](https://github.com/derailed/k9s).

![Demo](./docs/readme-assets/demo.gif "Demo")

> ⚠️ This is a work in progress. At time of writing, it's a little project I'm working on for two main reasons:
> - Because I actually want something like this for my own use
> - To explore [OpenTUI](https://github.com/sst/opentui)
>
> It's yet to be seen how far I'll take this. If you're from the far future and this message is still here, then it probably means it never got anywhere beyond a prototype stage :\)

## Installation using Homebrew
```sh
brew tap evertdespiegeleer/tap
brew install red-cli
```

## Usage
Simply run `red` command, potentially providing certain configuration options.

```sh
red --connection-string="redis://localhost:6379"
```

## Configuration
Configuration can be provided in multiple ways. In decreasing order of precedence:
1. Command line arguments
2. Environment variables
3. Configuration file
5. Built-in defaults

### Command line arguments
Run `red --help` to see all available command line arguments.

### Environment variables
- `RED_CONNECTION_STRING`: The Redis connection string (e.g. `redis://localhost:6379`)
- `RED_DELIMITER`: The delimiter used to group keys (default: `:`)

### Configuration file
A configuration file can be placed either in the directory where Red is executed, or in any higher-level directory, up to your home directory. Lower level configuration files take precedence over higher-level ones.
The following file names are supported:

- .redrc
- .redrc.json
- .redrc.yaml
- .redrc.yml
- .redrc.js
- .redrc.ts
- .redrc.cjs
- red.config.js
- red.config.ts
- red.config.cjs

Use the json schema as reference for the configuration file structure. Mind the version in the `$schema` property!
Below is an example `.redrc.json` file:
```json
{
    "$schema": "https://github.com/evertdespiegeleer/red-cli/releases/download/v0.0.11/redrc.schema.json",
    "connectionString": "redis://localhost:6379",
    "delimiter": ":",
    "path": "some:nested:path",
    "autoRefresh": true,
    "refreshInterval": 3000
}
```

### 

## Development
Initialize the repository:
```sh
./scripts/init.sh
```

Run the project:
```sh
bun run dev
```