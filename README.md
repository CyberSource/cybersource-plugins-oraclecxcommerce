# Cybersource Official

## Documentation

Please refer to the [official documentation](documentation/occ.md) to get all details about payment integration and installation steps.

## Local development

## Prerequisites

- Yarn version: [1.22.4](https://classic.yarnpkg.com/en/docs/install/#mac-stable)
- NodeJS version: 18.16.1, You could use [NVM](https://github.com/nvm-sh/nvm) to manage multiple versions locally


## Install dependencies

From your project's root run

```bash
yarn install
```

## Building code

Running `build` script from project's root will build code for all the packages

```bash
yarn build:prod
```

To build packages individually make sure you switch to respective package directory as shown below

```bash
cd packages/<package_name>
yarn build:prod
yarn start
```

## Local development servers

To quickly start all servers from project's root directory run

- Start OCC Mock Server: `yarn start:mock-server`
- Start Server Side extension: `yarn start:server`

If all servers above have successfully started you should be  able to test payment integrations

### Configuration

Before starting local dev servers make sure you provide gateway settings in `packages/payment-gateway/settings.json`. More details about available settings can be found in the [Payment Gateway Package](documentation/occ.md#payment-gateway-package-payment-gateway) section

### OCC Mock Server

`packages/occ-mock-server` package acts as REST API mocks in order to abstract away dependencies on certain OCC endpoints. Endpoints are defined in the following file `packages/occ-mock-server/src/routes/index.ts`.

The package is used only for local development and is not deployed to OCC

To start server run the following:

```bash
cd packages/occ-mock-server
yarn start:watch
```

By default server will listen on port 5000 (HTTP) and 5001 (HTTPS)

### Server Side Extension

You can start SSE locally by running

```bash
cd packages/server-extension
yarn start:watch
```

Server startup script and setup is located at `packages/server-extension/src/server.ts`, by default server will listen on port 3000 (HTTP) and 3001 (HTTPS).

For local development `packages/server-extension/config/app.local.json` configuration file is loaded.

`server-extension` consumes endpoints from `occ-mock-server` so make sure both are running locally


## Extension management CLI

Solution include CLI tool to deploy and manage both server side extensions and widgets.

Run `yarn occ` from project's root to see all available commands. You will need to provide credentials to be able to execute commands. Credentials in some cases are username and password for OCC Admin, in other cases [Application Key](https://docs.oracle.com/en/cloud/saas/commerce-cloud/20a/occ-developer/register-applications.html) should be provided.


