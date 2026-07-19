import type { TFunction } from 'i18next';
import dayjs from 'dayjs';
import { ScaleTypes, ToolbarControlTypes } from '@carbon/charts/interfaces';
import { getCoreTranslation } from '@openmrs/esm-framework';
import { growthChartConfigurations, GROWTH_CHART_TYPE } from '../constants';
import boysWeightData from '../who-data/boys/weight-for-age.json';
import girlsWeightData from '../who-data/girls/weight-for-age.json';
import boysHeightData from '../who-data/boys/height-for-age.json';
import girlsHeightData from '../who-data/girls/height-for-age.json';
import type { Observation } from './growth-chart.resource';

type WHODataPoint = {
  age_months: number;
  L: number;
  M: number;
  S: number;
  SD3neg?: number;
  SD2neg?: number;
  SD1neg?: number;
  SD0?: number;
  SD1?: number;
  SD2?: number;
  SD3?: number;
};

const SD_CURVE_DEFINITIONS: Array<{
  group: '-3 SD' | '-2 SD' | '-1 SD' | 'Median' | '+1 SD' | '+2 SD' | '+3 SD';
  z: number;
  key: keyof WHODataPoint;
}> = [
  { group: '-3 SD', z: -3, key: 'SD3neg' },
  { group: '-2 SD', z: -2, key: 'SD2neg' },
  { group: '-1 SD', z: -1, key: 'SD1neg' },
  { group: 'Median', z: 0, key: 'SD0' },
  { group: '+1 SD', z: 1, key: 'SD1' },
  { group: '+2 SD', z: 2, key: 'SD2' },
  { group: '+3 SD', z: 3, key: 'SD3' },
];

const getLmsValueForZScore = (point: WHODataPoint, zScore: number) => {
  const { L, M, S } = point;

  if (L === 0) {
    return M * Math.exp(S * zScore);
  }

  const base = 1 + L * S * zScore;
  if (base <= 0) {
    return null;
  }

  return M * Math.pow(base, 1 / L);
};

const getSeriesValueForSdCurve = (point: WHODataPoint, zScore: number, fieldKey: keyof WHODataPoint) => {
  const explicitValue = point[fieldKey];
  if (typeof explicitValue === 'number') {
    return explicitValue;
  }

  return getLmsValueForZScore(point, zScore);
};

export const calculateAgeInMonths = (birthDate: string, observationDate: string) => {
  const birth = dayjs(birthDate);
  const observation = dayjs(observationDate);

  if (!birth.isValid() || !observation.isValid()) {
    return null;
  }

  const ageInMonths = observation.diff(birth, 'month', true);
  return ageInMonths >= 0 ? ageInMonths : null;
};

export const processGrowthObservations = (
  observations: Observation[],
  birthDate: string,
  patientSeriesLabel: string,
): GrowthChartSeriesPoint[] => {
  return observations
    .map((observation) => {
      if (observation.value == null || !observation.effectiveDateTime) {
        return null;
      }

      const age = calculateAgeInMonths(birthDate, observation.effectiveDateTime);
      if (age == null) {
        return null;
      }

      return {
        group: patientSeriesLabel,
        age,
        value: observation.value,
      };
    })
    .filter((point): point is GrowthChartSeriesPoint => point !== null)
    .sort((a, b) => a.age - b.age);
};

export const loadWHOReference = (gender: string | undefined, chartType: GrowthChartType): WHODataPoint[] => {
  const supportedGender = gender?.toLowerCase();

  if (supportedGender !== 'male' && supportedGender !== 'female') {
    return [];
  }

  if (chartType === GROWTH_CHART_TYPE.WEIGHT_FOR_AGE) {
    return supportedGender === 'female' ? (girlsWeightData as WHODataPoint[]) : (boysWeightData as WHODataPoint[]);
  }

  return supportedGender === 'female' ? (girlsHeightData as WHODataPoint[]) : (boysHeightData as WHODataPoint[]);
};

export const buildWHOReferenceSeries = (
  gender: string | undefined,
  chartType: GrowthChartType,
): GrowthChartSeriesPoint[] => {
  const whoData = loadWHOReference(gender, chartType);

  if (!whoData) {
    return [];
  }

  const referenceSeries: GrowthChartSeriesPoint[] = [];

  whoData.forEach((point) => {
    SD_CURVE_DEFINITIONS.forEach(({ group, z, key }) => {
      const value = getSeriesValueForSdCurve(point, z, key);

      if (value == null) {
        return;
      }

      referenceSeries.push({
        group,
        age: point.age_months,
        value,
      });
    });
  });

  return referenceSeries;
};

export const buildGrowthDataset = ({
  gender,
  chartType,
  observations,
  birthDate,
  patientSeriesLabel,
}: {
  gender: string | undefined;
  chartType: GrowthChartType;
  observations: Observation[];
  birthDate: string;
  patientSeriesLabel: string;
}): GrowthChartSeriesPoint[] => {
  const referenceSeries = buildWHOReferenceSeries(gender, chartType);
  const patientSeries = processGrowthObservations(observations, birthDate, patientSeriesLabel);

  return [...referenceSeries, ...patientSeries];
};

export const getChartOptions = (t: TFunction, chartConfig: GrowthChartConfiguration, patientSeriesLabel: string) => {
  const referencePalette = {
    '-3 SD': 'var(--cds-support-error)',
    '-2 SD': 'var(--cds-support-warning)',
    '-1 SD': 'var(--cds-border-subtle-02)',
    Median: 'var(--cds-support-success)',
    '+1 SD': 'var(--cds-border-subtle-02)',
    '+2 SD': 'var(--cds-support-warning)',
    '+3 SD': 'var(--cds-support-error)',
  };

  return {
    title: t(chartConfig.titleKey, chartConfig.titleDefault),
    axes: {
      bottom: {
        title: t('ageInMonths', 'Age (Months)'),
        mapsTo: 'age',
        scaleType: ScaleTypes.LINEAR,
        ticks: {
          values: Array.from({ length: 31 }, (_, i) => i * 2),
          formatter: (value) => value,
        },
      },
      left: {
        title: t(chartConfig.yAxisLabelKey, chartConfig.yAxisLabelDefault),
        mapsTo: 'value',
        scaleType: ScaleTypes.LINEAR,
        ticks: {
          values: chartConfig.yAxisTickValues,
        },
      },
    },
    curve: 'curveMonotoneX',
    height: '800px',
    points: {
      radius: ((d) => {
        if (d.group === patientSeriesLabel) {
          return 3;
        }
        return 0;
      }) as unknown as number,
    },
    legend: {
      position: 'bottom',
    },
    color: {
      scale: {
        ...referencePalette,
        [patientSeriesLabel]: 'var(--cds-text-primary)',
      },
    },
    grid: {
      x: {
        alignWithAxisTicks: true,
      },
    },
    toolbar: {
      controls: [
        { type: ToolbarControlTypes.MAKE_FULLSCREEN },
        { type: ToolbarControlTypes.EXPORT_CSV },
        { type: ToolbarControlTypes.EXPORT_PNG },
        { type: ToolbarControlTypes.EXPORT_JPG },
      ],
    },
    getIsFilled: (group) => {
      if (group === patientSeriesLabel) {
        return true;
      }
      return false;
    },
    tooltip: {
      valueFormatter: (value, label) => {
        if (label === t('ageInMonths', 'Age (Months)')) {
          return Math.floor(value);
        }

        if (label === t(chartConfig.yAxisLabelKey, chartConfig.yAxisLabelDefault)) {
          return Number(value).toFixed(1);
        }

        return value;
      },
      showTotal: false,
    },
  };
};

export const getGenderTranslation = (gender: string | null | undefined) => {
  switch (gender?.toLowerCase()) {
    case 'male':
      return getCoreTranslation('male', 'Male');
    case 'female':
      return getCoreTranslation('female', 'Female');
    case 'other':
      return getCoreTranslation('other', 'Other');
    default:
      return getCoreTranslation('unknown', 'Unknown');
  }
};

export const getGrowthChartConfiguration = (chartType: GrowthChartType) => {
  return growthChartConfigurations[chartType];
};
