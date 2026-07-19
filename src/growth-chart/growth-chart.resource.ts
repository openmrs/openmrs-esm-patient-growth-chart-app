import { openmrsFetch, useConfig, fhirBaseUrl, type FetchResponse } from '@openmrs/esm-framework';
import useSWRImmutable from 'swr/immutable';
import type { ConfigObject } from '../config-schema';
import { growthChartConfigurations, GROWTH_CHART_TYPE } from '../constants';

export interface Observation {
  id: string;
  effectiveDateTime: string;
  value: number;
  unit: string;
  code: string;
}

export interface GrowthChartData {
  patient: fhir.Patient;
  observationsByType: Record<GrowthChartType, Observation[]>;
}

export function buildObservationApiUrl(patientUuid?: string, conceptUuid?: string) {
  if (!patientUuid || !conceptUuid) {
    return null;
  }

  // Use a high _count (500) to avoid pagination for now.
  // This should cover most patients, but we can add pagination if needed later.
  return `${fhirBaseUrl}/Observation?patient=${patientUuid}&code=${conceptUuid}&_sort=-date&_count=500`;
}

export function extractObservationsFromBundle(bundle?: fhir.Bundle): Observation[] {
  return (bundle?.entry?.map((entry) => {
    const resource = entry.resource as fhir.Observation;
    return {
      id: resource.id,
      effectiveDateTime: resource.effectiveDateTime,
      value: resource.valueQuantity?.value,
      unit: resource.valueQuantity?.unit,
      code: resource.code?.coding?.[0]?.code,
    };
  }) ?? []) as Observation[];
}

export function useObservations(patientUuid?: string, conceptUuid?: string) {
  // Use a high _count (500) to avoid pagination for now.
  // This should cover most patients, but we can add pagination if needed later.
  const apiUrl = buildObservationApiUrl(patientUuid, conceptUuid);

  const { data, error, isLoading } = useSWRImmutable<FetchResponse<fhir.Bundle>, Error>(apiUrl, openmrsFetch);

  const observations = extractObservationsFromBundle(data?.data);

  return {
    observations,
    isLoading,
    isError: error,
  };
}

export function useGrowthChartData(patient: fhir.Patient) {
  const { concepts } = useConfig<ConfigObject>();

  const {
    observations: weightObservations,
    isLoading: isWeightLoading,
    isError: isWeightError,
  } = useObservations(
    patient?.id,
    concepts[growthChartConfigurations[GROWTH_CHART_TYPE.WEIGHT_FOR_AGE].conceptConfigKey],
  );

  const {
    observations: heightObservations,
    isLoading: isHeightLoading,
    isError: isHeightError,
  } = useObservations(
    patient?.id,
    concepts[growthChartConfigurations[GROWTH_CHART_TYPE.HEIGHT_FOR_AGE].conceptConfigKey],
  );

  if (!patient) {
    return {
      data: null,
      isLoading: false,
      isError: false,
    };
  }

  const isLoading = isWeightLoading || isHeightLoading;
  const isError = Boolean(isWeightError || isHeightError);

  return {
    data: {
      patient,
      observationsByType: {
        [GROWTH_CHART_TYPE.WEIGHT_FOR_AGE]: weightObservations,
        [GROWTH_CHART_TYPE.HEIGHT_FOR_AGE]: heightObservations,
      },
    },
    isLoading,
    isError,
  };
}
