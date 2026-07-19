import React from 'react';
import { useTranslation } from 'react-i18next';
import { Tile } from '@carbon/react';
import { LineChart } from '@carbon/charts-react';
import { buildGrowthDataset, getChartOptions, getGrowthChartConfiguration } from './growth-chart.utils';
import type { GrowthChartData } from './growth-chart.resource';
import '@carbon/charts/styles.css';
import styles from './growth-chart-main.scss';

interface GrowthChartVisualizationProps {
  data: GrowthChartData;
  chartType: GrowthChartType;
}

const GrowthChartVisualization: React.FC<GrowthChartVisualizationProps> = ({ data, chartType }) => {
  const { t } = useTranslation();
  const { patient, observationsByType } = data;

  const chartConfig = React.useMemo(() => getGrowthChartConfiguration(chartType), [chartType]);
  const observations = React.useMemo(() => observationsByType?.[chartType] ?? [], [observationsByType, chartType]);

  const patientSeriesLabel = t(chartConfig.patientSeriesLabelKey, chartConfig.patientSeriesLabelDefault);

  const chartOptions = React.useMemo(
    () => getChartOptions(t, chartConfig, patientSeriesLabel),
    [t, chartConfig, patientSeriesLabel],
  );

  const chartData = React.useMemo(() => {
    if (!patient || !patient.birthDate) {
      return [];
    }

    return buildGrowthDataset({
      gender: patient.gender,
      chartType,
      observations,
      birthDate: patient.birthDate,
      patientSeriesLabel,
    });
  }, [patient, chartType, observations, patientSeriesLabel]);

  if (!observations.length) {
    return <Tile>{t(chartConfig.emptyStateMessageKey, chartConfig.emptyStateMessageDefault)}</Tile>;
  }

  return (
    <div className={styles.chartContainer}>
      <LineChart data={chartData} options={chartOptions} />
    </div>
  );
};

export default GrowthChartVisualization;
