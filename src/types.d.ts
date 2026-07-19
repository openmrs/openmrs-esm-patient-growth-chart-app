/// <reference types="fhir" />
/// <reference types="webpack-env" />

declare namespace fhir {
  // Add any specific extensions if needed, but the reference above should cover it if it works
}

interface Require {
  context: (
    directory: string,
    useSubdirectories?: boolean,
    regExp?: RegExp,
    mode?: 'sync' | 'eager' | 'weak' | 'lazy' | 'lazy-once',
  ) => any;
}

type GrowthChartType = 'weight-for-age' | 'height-for-age';

type GrowthObservationConceptKey = 'weightUuid' | 'heightUuid';

type GrowthDatasetName = 'weight-for-age' | 'height-for-age';

interface GrowthChartConfiguration {
  id: GrowthChartType;
  titleKey: string;
  titleDefault: string;
  conceptConfigKey: GrowthObservationConceptKey;
  dataset: GrowthDatasetName;
  unit: 'kg' | 'cm';
  yAxisLabelKey: string;
  yAxisLabelDefault: string;
  patientSeriesLabelKey: string;
  patientSeriesLabelDefault: string;
  emptyStateMessageKey: string;
  emptyStateMessageDefault: string;
  yAxisTickValues: number[];
}

interface GrowthChartSeriesPoint {
  group: string;
  age: number;
  value: number;
}
