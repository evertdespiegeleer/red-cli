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
```sh
REDIS_CONNECTION_STRING="redis://localhost:6379" red
```

## Development
Initialize the repository:
```sh
./scripts/init.sh
```

Run the project:
```sh
bun run dev
```