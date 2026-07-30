import type { DashboardExtensionProps } from '@openmrs/esm-framework';

export const dashboardMeta: Omit<DashboardExtensionProps, 'basePath'> & {
  slot: string;
  columns: number;
  hideDashboardTitle?: boolean;
} = {
  slot: 'patient-chart-growth-dashboard-slot',
  columns: 1,
  title: 'Growth chart',
  hideDashboardTitle: false,
  icon: 'omrs-icon-chart-line',
  path: 'growth-chart',
};
