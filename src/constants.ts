export const moduleName = '@openmrs/esm-patient-growth-chart-app';

export const GROWTH_CHART_TYPE = {
  WEIGHT_FOR_AGE: 'weight-for-age',
  HEIGHT_FOR_AGE: 'height-for-age',
} as const;

export const OBSERVATION_CONCEPT_DEFAULTS = {
  weightUuid: '5089AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  heightUuid: '5090AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
} as const;

export const WHO_SD_CURVE_GROUPS = ['-3 SD', '-2 SD', '-1 SD', 'Median', '+1 SD', '+2 SD', '+3 SD'] as const;

export const growthChartConfigurations: Record<GrowthChartType, GrowthChartConfiguration> = {
  [GROWTH_CHART_TYPE.WEIGHT_FOR_AGE]: {
    id: GROWTH_CHART_TYPE.WEIGHT_FOR_AGE,
    titleKey: 'weightForAge',
    titleDefault: 'Weight for Age (0-5 Years)',
    conceptConfigKey: 'weightUuid',
    dataset: 'weight-for-age',
    unit: 'kg',
    yAxisLabelKey: 'weightKg',
    yAxisLabelDefault: 'Weight (kg)',
    patientSeriesLabelKey: 'patientWeight',
    patientSeriesLabelDefault: 'Patient Weight',
    emptyStateMessageKey: 'noWeightObservationsAvailable',
    emptyStateMessageDefault: 'No weight observations available.',
    yAxisTickValues: [0, 5, 10, 15, 20, 25],
  },
  [GROWTH_CHART_TYPE.HEIGHT_FOR_AGE]: {
    id: GROWTH_CHART_TYPE.HEIGHT_FOR_AGE,
    titleKey: 'heightForAge',
    titleDefault: 'Height for Age (0-5 Years)',
    conceptConfigKey: 'heightUuid',
    dataset: 'height-for-age',
    unit: 'cm',
    yAxisLabelKey: 'heightCm',
    yAxisLabelDefault: 'Height (cm)',
    patientSeriesLabelKey: 'patientHeight',
    patientSeriesLabelDefault: 'Patient Height',
    emptyStateMessageKey: 'noHeightObservationsAvailable',
    emptyStateMessageDefault: 'No height observations available.',
    yAxisTickValues: [40, 50, 60, 70, 80, 90, 100, 110, 120],
  },
};
