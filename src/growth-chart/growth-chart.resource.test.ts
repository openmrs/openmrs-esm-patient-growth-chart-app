import { buildObservationApiUrl, extractObservationsFromBundle } from './growth-chart.resource';

describe('growth-chart.resource', () => {
  describe('buildObservationApiUrl', () => {
    it('builds observation URL for weight concept', () => {
      const url = buildObservationApiUrl('patient-uuid', '5089AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA');
      expect(url).toContain('/Observation?patient=patient-uuid');
      expect(url).toContain('code=5089AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA');
    });

    it('builds observation URL for height concept', () => {
      const url = buildObservationApiUrl('patient-uuid', '5090AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA');
      expect(url).toContain('code=5090AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA');
    });

    it('returns null when patient or concept is missing', () => {
      expect(buildObservationApiUrl(undefined, '5090')).toBeNull();
      expect(buildObservationApiUrl('patient-uuid', undefined)).toBeNull();
    });
  });

  describe('extractObservationsFromBundle', () => {
    it('maps FHIR observations to app observations', () => {
      const bundle = {
        entry: [
          {
            resource: {
              id: 'obs-1',
              effectiveDateTime: '2024-01-10',
              valueQuantity: {
                value: 96.3,
                unit: 'cm',
              },
              code: {
                coding: [{ code: '5090AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' }],
              },
            },
          },
        ],
      } as unknown as fhir.Bundle;

      const result = extractObservationsFromBundle(bundle);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('obs-1');
      expect(result[0].value).toBe(96.3);
      expect(result[0].unit).toBe('cm');
      expect(result[0].code).toBe('5090AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA');
    });

    it('returns empty array for undefined bundle', () => {
      expect(extractObservationsFromBundle(undefined)).toEqual([]);
    });
  });
});
