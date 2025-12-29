/**
 * Navigation configuration for PipeWeave ML Workbench
 * Defines workflow steps and utility navigation items
 */

export type WorkflowStep =
  | 'dashboard'
  | 'dataset'
  | 'eda'
  | 'schema'
  | 'preprocessing'
  | 'business-rules'
  | 'pipeline'
  | 'models'
  | 'settings';

export interface NavItem {
  id: WorkflowStep;
  label: string;
  icon: string; // Lucide icon name
  path: string;
  step?: number; // For workflow items (1-6)
}

export const WORKFLOW_NAV_ITEMS: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'LayoutDashboard',
    path: '/dashboard',
    step: 1
  },
  {
    id: 'dataset',
    label: 'Dataset',
    icon: 'Upload',
    path: '/dataset',
    step: 2
  },
  {
    id: 'eda',
    label: 'EDA',
    icon: 'BarChart3',
    path: '/eda',
    step: 3
  },
  {
    id: 'schema',
    label: 'Schema',
    icon: 'Table2',
    path: '/schema',
    step: 4
  },
  {
    id: 'preprocessing',
    label: 'Preprocessing',
    icon: 'Wand2',
    path: '/preprocessing',
    step: 5
  },
  {
    id: 'business-rules',
    label: 'Rules',
    icon: 'Scale',
    path: '/business-rules',
    step: 6
  },
  {
    id: 'pipeline',
    label: 'Pipeline',
    icon: 'GitBranch',
    path: '/pipeline',
    step: 7
  },
  {
    id: 'models',
    label: 'Models',
    icon: 'Brain',
    path: '/models',
    step: 8
  },
];

export const UTILITY_NAV_ITEMS: NavItem[] = [
  {
    id: 'settings',
    label: 'Settings',
    icon: 'Settings',
    path: '/settings'
  },
];
