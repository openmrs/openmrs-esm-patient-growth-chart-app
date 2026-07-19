# OpenMRS Growth Chart

## Description

The Growth Chart is designed for the OpenMRS 3.x Patient Chart. Its primary purpose is to allow clinicians to visualize pediatric growth trends (Weight-for-Age, Height-for-Age) against standardized normative curves (WHO & CDC) to identify malnutrition or growth abnormalities early.

## Scope

**Phase 1**

- **Project Initialization**: Scaffolding the app and registering it within the O3 shell.
- **Data Integration**: Fetching Patient Demographics (DOB) and Clinical Observations (Weight, Height).
- **Logic Layer**: Integrating official WHO datasets and implementing Z-score calculation logic.
- **Visualization**: Developing both a Longitudinal Table View and an Interactive Graph View.
- **Quality Assurance**: Implementing E2E testing for the core flows.

- **WHO Dataset**
  1.Integrated the data set for girls and boys of weight to age who standards. (Birth-5 years).
  2.Converted original WHO .xlsx data to JSON format.
  3.JSON includes L, M, S parameters for Z-score calculation and P-values for graphing.
  4.Link to the WHO data - https://www.who.int/tools/child-growth-standards/standards/weight-for-age

- **Weight for Age Chart**
  1.Weight for Age chart is displayed for patients under 5 years of age.
  2.If the patient is older than 5 years it will shows and empty state.

- **E2E Testing**
  1.Tested the "Growth Chart Unavailable" view for patients older than 5 years.
  2.Tested the "Growth Chart Visibility" dashboard for patients younger than 5 years using a dynamic birthdate payload.
  3.Tests are deterministic and do not depend on fixed dates.

- **Unit Testing**
  1.Testing utility functions (`growth-chart.utils.ts`) that process and format patient weights.

## Architecture

- `src/growth-chart/growth-chart.resource.ts`
  - Fetches patient observations from FHIR Observation endpoints.
  - Converts response bundles into typed observation objects.
  - Centralizes REST URL construction and loading/error composition.
- `src/growth-chart/growth-chart.utils.ts`
  - Calculates age in months from DOB and observation date.
  - Loads WHO reference data dynamically by gender and chart type.
  - Builds SD curve datasets (`-3 SD` through `+3 SD`) and patient series.
  - Generates chart options from chart configuration.
- `src/growth-chart/growth-chart.component.tsx`
  - Orchestrates data loading and chart selection.
  - Handles unknown gender fallback and age eligibility checks.
  - Passes selected chart type and transformed data to visualization.
- `src/growth-chart/growth-chart-visualization.component.tsx`
  - Renders chart and empty states.
  - Does not fetch or process WHO data directly.

## Data Flow

1. The container requests growth observations for configured concepts (`weightUuid`, `heightUuid`).
2. The selected chart configuration determines WHO dataset, axis labels, unit, and patient series naming.
3. Utilities build WHO SD curve points and patient measurement points on an `Age (Months)` x-axis.
4. Visualization renders a single reusable chart component for Weight-for-Age and Height-for-Age.

## WHO Dataset Organization

WHO references are stored in JSON by sex and indicator:

- `src/who-data/boys/weight-for-age.json`
- `src/who-data/boys/height-for-age.json`
- `src/who-data/girls/weight-for-age.json`
- `src/who-data/girls/height-for-age.json`

## Adding Future Growth Charts

To add a new chart (for example BMI-for-Age), you should only need to:

1. Add WHO dataset JSON files under `src/who-data/boys/` and `src/who-data/girls/`.
2. Add concept UUID in `src/config-schema.ts` defaults.
3. Add one `GrowthChartConfiguration` entry in `src/constants.ts`.

The generic utility and visualization pipeline will reuse the same rendering and processing flow.

## Quick start

```bash
yarn install
yarn start
```

Once started, your module will be available at:
**http://localhost:8080/openmrs/spa/**

## Running unit and integration tests

To run unit and integration tests, run:

```bash
yarn turbo run test
```

To run tests in `watch` mode, run:

```bash
yarn turbo run test:watch
```

To generate a `coverage` report, run:

```bash
yarn turbo run coverage
```

By default, `turbo` will cache test runs. This means that re-running tests wihout changing any of the related files will return the cached logs from the last run. To bypass the cache, run tests with the `force` flag, as follows:

```bash
yarn turbo run test --force
```

## Running End-to-End (E2E) tests

Before running the E2E tests, you need to set up the test environment. Install Playwright browsers and setup the default test environment variables by running the following commands:

```bash
npx playwright install
cp example.env .env
```

By default, tests run against a local backend at http://localhost:8080/openmrs. To test local changes, make sure your dev server is running before executing tests.

```bash
yarn start
```

To test against a remote instance (such as the OpenMRS refapp hosted on dev3.openmrs.org, update the E2E_BASE_URL environment variable in your .env file:

```
E2E_BASE_URL=https://dev3.openmrs.org/openmrs
```

To run E2E tests:

```bash
yarn test-e2e
```

This will run all the E2E tests (files in the e2e directory with the \*.spec.ts extension) in headless mode. That means no browser UI will be visible.

To run tests in headed mode (shows the browser while tests run) use:

```bash
yarn test-e2e --headed
```

To run tests in Playwright's UI mode (interactive debugger), use:

```bash
yarn test-e2e --ui
```

You'll most often want to run tests in both headed and UI mode:

```bash
yarn test-e2e --headed --ui
```

To run a specific test file:

```bash
yarn test-e2e <test-name>
```

Read the [e2e testing guide](https://openmrs.atlassian.net/wiki/x/K4L-C) to learn more about End-to-End tests in this project.

### Updating Playwright

The Playwright version in the [Bamboo e2e Dockerfile](e2e/support/bamboo/playwright.Dockerfile#L2) and the `package.json` file must match. If you update the Playwright version in one place, you must update it in the other.

## What's included

- ✅ OpenMRS 3.0 microfrontend setup
- ✅ Carbon Design System integration
- ✅ Internationalization (i18n) ready
- ✅ TypeScript configuration
- ✅ Jest testing setup
- ✅ ESLint + Prettier

## Learn more

### OpenMRS O3 resources

- [Getting Started](https://o3-docs.openmrs.org/docs/getting-started) - Start here for O3 development
- [Creating a Frontend Module](https://o3-docs.openmrs.org/docs/frontend-modules/creating-a-frontend-module) - Step-by-step guide
- [Framework Concepts](https://o3-docs.openmrs.org/docs/framework-concepts) - Core O3 patterns

### Development guide

- [Extension System](https://o3-docs.openmrs.org/docs/extension-system) - Adding widgets and extensions
- [State Management](https://o3-docs.openmrs.org/docs/state-management) - Managing app state
- [Carbon and Styling](https://o3-docs.openmrs.org/docs/carbon-and-styling) - UI components and styling
- [Testing](https://o3-docs.openmrs.org/docs/testing) - Testing your module

### Community

- [OpenMRS Talk](https://talk.openmrs.org/) - Community forum for questions
- [OpenMRS Wiki](https://wiki.openmrs.org/display/RES/OpenMRS+3.x+Dev+Forum) - Join the developer community

## Common tasks

### Adding new routes

See the [Routing Guide](https://o3-docs.openmrs.org/docs/frontend-modules/routing) for details.

## Installation

```bash
yarn add @openmrs/esm-patient-growth-chart
```

## Building

```bash
yarn build
```

## Testing

```bash
yarn test
```

## Troubleshooting

### `openmrs develop` crashes with `Cannot read properties of undefined (reading 'devServer')`

Ensure your build config exports the default OpenMRS config:

For rspack (default):

```js
const config = require('@openmrs/rspack-config');

module.exports = config.default ?? config;
```

For webpack:

```js
const config = require('@openmrs/webpack-config');

module.exports = config.default ?? config;
```

### Yarn peer dependency warnings (dayjs, i18next, single-spa, swr, react-is, sass)

If you see missing peer dependency warnings, add the missing deps and align `react-i18next` to `11.x` in your `package.json`, then re-run `yarn install`.
