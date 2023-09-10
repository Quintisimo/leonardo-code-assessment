# Fastify and Prisma Rest Server

This repo uses [devcontainers](https://code.visualstudio.com/docs/devcontainers/containers). You will need the [Dev Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) plugin and [Docker](https://www.docker.com/)

## Steps To Run

- Spin up the dev container, this should automatically run `pnpm install` and `prisma generate`
- Run `pnpm dev` to start the dev server
- For production run `pnpm build` and then `pnpm start`
- The repo also uses `prettier` for formatting and `denolint` for linting. These can be run using `pnpm format` and `pnpm lint` respectively
