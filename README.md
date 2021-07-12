# ISV OCC Payment

## Documentation

Please refer to the [official documentation](documentation/occ.md) to get all details about payment integration and installation steps.

## Local development

## Prerequisites

- Yarn version: [1.22.4](https://classic.yarnpkg.com/en/docs/install/#mac-stable)
- NodeJS version: 10.18.0, You could use [NVM](https://github.com/nvm-sh/nvm) to manage multiple versions locally

Please make sure you familiarize yourself with Typescript v3.9.5 as it is being used for both widget and server side extension development.

## Install dependencies

From your project's root run

```bash
yarn install
```

## Building code

Running `build` script from project's root will build code for all the packages

```bash
yarn build
```

To build packages individually make sure you switch to respective package directory as shown below

```bash
cd packages/<package_name>
yarn build
yarn start
```

## Local development servers

To quickly start all servers from project's root directory run

- Start OCC Mock Server: `yarn start:mock-server`
- Start Server Side extension: `yarn start:server`
- Start Payment Widget: `yarn start:widget`

If all servers above have successfully started you should be  able to test payment integrations

### Configuration

Before starting local dev servers make sure you provide gateway settings in `packages/payment-gateway/settings.json`. More details about available settings can be found in the [Payment Gateway Package](documentation/occ.md#payment-gateway-package-payment-gateway) section

### OCC Mock Server (packages/occ-mock-server)

`packages/occ-mock-server` package acts as REST API mocks in order to abstract away dependencies on certain OCC endpoints. Endpoints are defined in the following file `packages/occ-mock-server/src/routes/index.ts`.

The package is used only for local development and is not deployed to OCC

| **Endpoint**                                   | **Description**                                                                                      |
|------------------------------------------------|------------------------------------------------------------------------------------------------------|
| `/ccadmin/v1/sitesettings/isv-occ-gateway`     | Stubs gateway settings manage in `packages/payment-gateway/settings.json`                            |
| `/ccadmin/v1/login`                            | Stubs OCC login API                                                                                  |
| `/ccstore/v1/orders`                           | Stubs OCC order API. Does the minimum required 'order to webhook' and 'webhook to order' conversions |
| `/ccstore/v1/profiles/current/creditCards`     | Stubs the list of saved cards. Helps with testing saved cards locally.                               |
| `/ccstore/v1/profiles/current/creditCards/:id` | Stubs saved cards CRUD API                                                                           |

To start server run the following:

```bash
cd packages/occ-mock-server
yarn start:watch
```

By default server will listen on port 5000 (HTTP) and 5001 (HTTPS)

### Server Side Extension (packages/server-extension)

You can start SSE locally by running

```bash
cd packages/server-extension
yarn start:watch
```

Server startup script and setup is located at `packages/server-extension/src/server.ts` By default server will listen on port 3000 (HTTP) and 3001 (HTTPS).

For local development `packages/server-extension/config/app.local.json` configuration file is loaded.

`server-extension` consumes endpoints from `occ-mock-server` so make sure both are running locally

### OCC Mock Storefront (packages/occ-mock-storefront)

Both `packages/payment-widget` and `packages/saved-cards-widget` packages depend on `packages/occ-mock-storefront`.

`occ-mock-storefront` acts as storefront stub for OCC view models. It mimics OCC storefront behavior without need to deploy payment widget to see it in action. It can help you avoid setting up [Design Code Utility](https://docs.oracle.com/en/cloud/saas/commerce-cloud/20a/occ-developer/use-design-code-utility.html) to develop payment widget locally.

`occ-mock-storefront` also provides Typescript friendly environment and type declarations as OCC does not support it out of the box.

### Payment widget (packages/payment-widget)

Payment Widget can be started locally using webpack dev server with configuration located at `packages/payment-widget/webpack.dev.config.js`

You can start the widget locally by running

```bash
cd packages/payment-widget
yarn start
```

Make sure both `occ-mock-server` and `server -extension` have been also started.

In case you would like to start dev server using secure connection (HTTPS) run the following:

```bash
NODE_HTTPS=true yarn start
```

`NODE_HTTPS` env variable will instruct dev server to start using HTTPS.

All local development steps being prepared in `packages/payment-widget/widget/isv-occ-payment/js/dev`

```text
.
├── webpack.dev.config.js
└── widget
    └── isv-occ-payment
        └── js
            └── dev
                ├── client-main.ts // Instantiate payment widget component and initialize it
                ├── controls.ts // Helper tools to control test data and logging output
                └── index.html // HTML template injecting payment widget for rendering
```

### Saved Cards widget (packages/saved-cards-widget)

Saved Cards widget can be started locally using webpack dev server with configuration located at `packages/saved-cards-widget/webpack.dev.config.js`

You can start the widget locally by running

```bash
cd packages/saved-cards-widget
yarn start
```

Make sure both `occ-mock-server` and `server -extension` have been also started.

All local development steps being prepared in `packages/saved-cards-widget/widget/saved-cards/js/dev`

```text
.
├── webpack.dev.config.js
└── widget
    └── saved-cards
        └── js
            └── dev
                ├── client-main.ts // Instantiate saved cards widget component and initialize it
                ├── controls.ts // Helper tools to control test data and logging output
                └── index.html // HTML template injecting saved cards widget for rendering
```

## Extension management CLI

Solution include CLI tool to deploy and manage both server side extensions and widgets.

Run `yarn occ` from project's root to see all available commands. You will need to provide credentials to be able to execute commands. Credentials in some cases are username and password for OCC Admin, in other cases [Application Key](https://docs.oracle.com/en/cloud/saas/commerce-cloud/20a/occ-developer/register-applications.html) should be provided.
