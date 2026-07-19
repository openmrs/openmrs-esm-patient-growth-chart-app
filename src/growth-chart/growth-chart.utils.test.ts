import {
  buildGrowthDataset,
  buildWHOReferenceSeries,
  calculateAgeInMonths,
  getChartOptions,
  loadWHOReference,
  processGrowthObservations,
} from './growth-chart.utils';
import type { Observation } from './growth-chart.resource';
import type { TFunction } from 'i18next';
import { growthChartConfigurations, GROWTH_CHART_TYPE } from '../constants';

describe('growth-chart.utils', () => {
  describe('calculateAgeInMonths', () => {
    it('returns age in months for valid dates', () => {
      const age = calculateAgeInMonths('2023-01-01', '2023-02-01');
      expect(age).toBeCloseTo(1, 1);
    });

    it('returns null for invalid dates', () => {
      expect(calculateAgeInMonths('invalid', '2023-02-01')).toBeNull();
    });

    it('returns null for observations before birth date', () => {
      expect(calculateAgeInMonths('2023-02-01', '2023-01-01')).toBeNull();
    });
  });

  describe('loadWHOReference', () => {
    it('loads male weight-for-age dataset', () => {
      const result = loadWHOReference('male', GROWTH_CHART_TYPE.WEIGHT_FOR_AGE);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('M');
    });

    it('loads female height-for-age dataset', () => {
      const result = loadWHOReference('female', GROWTH_CHART_TYPE.HEIGHT_FOR_AGE);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('SD0');
    });

    it('returns empty for unsupported gender', () => {
      const result = loadWHOReference('other', GROWTH_CHART_TYPE.HEIGHT_FOR_AGE);
      expect(result).toEqual([]);
    });
  });

  describe('buildWHOReferenceSeries', () => {
    it('builds SD curves for male height-for-age', () => {
      const result = buildWHOReferenceSeries('male', GROWTH_CHART_TYPE.HEIGHT_FOR_AGE);
      expect(result.length).toBeGreaterThan(0);
      expect(result.find((item) => item.group === '+3 SD')).toBeTruthy();
      expect(result.find((item) => item.group === 'Median')).toBeTruthy();
    });
  });

  describe('processGrowthObservations', () => {
    const birthDate = '2023-01-01';
    const patientWeightLabel = 'Patient Weight';

    it('transforms observations to age-based series', () => {
      const weights: Observation[] = [
        {
          id: '1',
          effectiveDateTime: '2023-02-01',
          value: 10,
          unit: 'kg',
          code: 'weight',
        },
      ];

      const result = processGrowthObservations(weights, birthDate, patientWeightLabel);

      expect(result).toHaveLength(1);
      expect(result[0].group).toBe('Patient Weight');
      expect(result[0].value).toBe(10);
      expect(result[0].age).toBeCloseTo(1, 0); // 1 month
    });

    it('filters out observations before birth date', () => {
      const weights: Observation[] = [
        {
          id: '1',
          effectiveDateTime: '2022-12-01',
          value: 10,
          unit: 'kg',
          code: 'weight',
        },
      ];

      const result = processGrowthObservations(weights, birthDate, patientWeightLabel);

      expect(result).toHaveLength(0);
    });

    it('sorts observations by age', () => {
      const weights: Observation[] = [
        {
          id: '1',
          effectiveDateTime: '2023-03-01',
          value: 12,
          unit: 'kg',
          code: 'weight',
        },
        {
          id: '2',
          effectiveDateTime: '2023-02-01',
          value: 10,
          unit: 'kg',
          code: 'weight',
        },
      ];

      const result = processGrowthObservations(weights, birthDate, patientWeightLabel);

      expect(result).toHaveLength(2);
      expect(result[0].value).toBe(10);
      expect(result[1].value).toBe(12);
    });
  });

  describe('buildGrowthDataset', () => {
    it('combines reference and patient series for height-for-age', () => {
      const observations: Observation[] = [
        {
          id: '1',
          effectiveDateTime: '2023-02-01',
          value: 55,
          unit: 'cm',
          code: 'height',
        },
      ];

      const result = buildGrowthDataset({
        gender: 'female',
        chartType: GROWTH_CHART_TYPE.HEIGHT_FOR_AGE,
        observations,
        birthDate: '2023-01-01',
        patientSeriesLabel: 'Patient Height',
      });

      expect(result.length).toBeGreaterThan(1);
      expect(result.some((item) => item.group === 'Patient Height')).toBeTruthy();
    });
  });

  describe('getChartOptions', () => {
    it('returns chart options object for weight chart', () => {
      const t = (key: string, defaultValue: string) => defaultValue;

      const options = getChartOptions(
        t as unknown as TFunction,
        growthChartConfigurations[GROWTH_CHART_TYPE.WEIGHT_FOR_AGE],
        'Patient Weight',
      );

      expect(options).toHaveProperty('title');
      expect(options).toHaveProperty('axes');
      expect(options).toHaveProperty('toolbar');
    });
  });
});
