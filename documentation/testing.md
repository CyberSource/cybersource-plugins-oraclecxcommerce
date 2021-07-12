# Testing <!-- omit in toc -->

1. [General Approach to testing](#general-approach-to-testing)
2. [Unit Testing](#unit-testing)
3. [Integration Testing](#integration-testing)

## General Approach to testing

The payment extension is covered by tests on following Levels:

- Unit Tests
- Integration Tests

Tests on all levels are created using the [Jest](https://jestjs.io/) testing framework. Tests are written in typescript language.

![Note](images/note.jpg) 'Test' and 'Spec' are interchangeable words in this documentation.

Main Jest configuration file is located at `${project_root}/jest.config.js`. It points to all available test configurations residing in each particular package

All specs are written in `__tests__` folder in ech package respectively

## Unit Testing

To run unit tests for all the packages run the following from your project's root:

```bash
yarn test:unit
```

The command above will iterate over each package having unit tests and run `yarn test:unit`command individually

To run tests for a particular package run the following:

```bash
cd ${project_root}/packages/server-extension
yarn test:unit

cd ${project_root}/packages/payment-widget
yarn test:unit

cd ${project_root}/packages/saved-cards-widget
yarn test:unit
```

To run tests with coverage use the following command: `yarn test:coverage:unit`

![Note](images/note.jpg) Test coverage thresholds should be met in order for the `yarn test:coverage:unit` command to result in success

## Integration Testing

![Important](images/important.jpg) Before running integration tests you should make sure you have configuration values provided in `packages/payment-gateway/settings.json` as those are being used to perform real API calls to PSP. The number of integration tests to run will depend on supported payment methods configured in gateway settings.

To run integration tests for all the packages run the following from your project's root:

```bash
yarn test:int
```

To run tests for a particular package run the following:

```bash
cd ${project_root}/packages/server-extension
yarn test:unit
```

To run tests with coverage use the following command: `yarn test:coverage:int`

![Note](images/note.jpg) At the moment integration tests are available only in the `server-extension` package