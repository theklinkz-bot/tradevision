export type WorkspacePreset = 'EXECUTIVE' | 'QUANT' | 'RISK' | 'EDGE' | 'PSYCHOLOGY' | 'CONTEXT' | 'FULL';

export type StrategySectionId =
  | 'strategy-intelligence'
  | 'strategy-validation'
  | 'strategy-risk'
  | 'strategy-edge'
  | 'strategy-consistency'
  | 'strategy-context'
  | 'strategy-psychology';

export type StrategySectionMeta = {
  id: StrategySectionId;
  label: string;
  href: `#${StrategySectionId}`;
};

export type WorkspacePresetConfig = {
  label: WorkspacePreset;
  description: string;
  descriptionTh: string;
  sections: StrategySectionId[];
};

export const workspacePresetStorageKey = 'strategy-lab-workspace-preset';

export const workspacePresets: WorkspacePreset[] = [
  'EXECUTIVE',
  'QUANT',
  'RISK',
  'EDGE',
  'PSYCHOLOGY',
  'CONTEXT',
  'FULL'
];

export const strategySectionRegistry: Record<StrategySectionId, StrategySectionMeta> = {
  'strategy-intelligence': {
    id: 'strategy-intelligence',
    label: 'AI Review',
    href: '#strategy-intelligence'
  },
  'strategy-validation': {
    id: 'strategy-validation',
    label: 'Validation',
    href: '#strategy-validation'
  },
  'strategy-risk': {
    id: 'strategy-risk',
    label: 'Risk',
    href: '#strategy-risk'
  },
  'strategy-edge': {
    id: 'strategy-edge',
    label: 'Edge',
    href: '#strategy-edge'
  },
  'strategy-consistency': {
    id: 'strategy-consistency',
    label: 'Consistency',
    href: '#strategy-consistency'
  },
  'strategy-context': {
    id: 'strategy-context',
    label: 'Context',
    href: '#strategy-context'
  },
  'strategy-psychology': {
    id: 'strategy-psychology',
    label: 'Psych',
    href: '#strategy-psychology'
  }
};

export const workspacePresetConfig: Record<WorkspacePreset, WorkspacePresetConfig> = {
  EXECUTIVE: {
    label: 'EXECUTIVE',
    description: 'High-level deployment review',
    descriptionTh: 'สรุปภาพรวมก่อนใช้งานจริง',
    sections: ['strategy-intelligence', 'strategy-validation']
  },
  QUANT: {
    label: 'QUANT',
    description: 'Full statistical validation',
    descriptionTh: 'ตรวจสอบสถิติครบชุด',
    sections: ['strategy-validation', 'strategy-edge', 'strategy-consistency', 'strategy-risk']
  },
  RISK: {
    label: 'RISK',
    description: 'Capital protection and stress profile',
    descriptionTh: 'ดูความเสี่ยงและแรงกดดันของทุน',
    sections: ['strategy-risk', 'strategy-psychology', 'strategy-validation']
  },
  EDGE: {
    label: 'EDGE',
    description: 'Expectancy and payoff quality',
    descriptionTh: 'คุณภาพ Expectancy และ Payoff',
    sections: ['strategy-edge', 'strategy-consistency', 'strategy-context']
  },
  PSYCHOLOGY: {
    label: 'PSYCHOLOGY',
    description: 'Execution pressure and discipline load',
    descriptionTh: 'แรงกดดันและวินัยในการเทรด',
    sections: ['strategy-psychology', 'strategy-risk', 'strategy-intelligence']
  },
  CONTEXT: {
    label: 'CONTEXT',
    description: 'Where the strategy performs best',
    descriptionTh: 'บริบทที่กลยุทธ์ทำงานดีที่สุด',
    sections: ['strategy-context', 'strategy-edge', 'strategy-consistency']
  },
  FULL: {
    label: 'FULL',
    description: 'All validation modules',
    descriptionTh: 'ทุกโมดูลตรวจสอบ',
    sections: [
      'strategy-intelligence',
      'strategy-validation',
      'strategy-risk',
      'strategy-edge',
      'strategy-consistency',
      'strategy-context',
      'strategy-psychology'
    ]
  }
};

export const isWorkspacePreset = (value: string | null): value is WorkspacePreset =>
  workspacePresets.includes(value as WorkspacePreset);

export const getPresetSections = (preset: WorkspacePreset) => workspacePresetConfig[preset].sections;

export const getPresetAnchors = (preset: WorkspacePreset) =>
  getPresetSections(preset).map((sectionId) => strategySectionRegistry[sectionId]);

export const isPresetSectionVisible = (preset: WorkspacePreset, sectionId: StrategySectionId) =>
  getPresetSections(preset).includes(sectionId);

export const getPresetSectionOrder = (preset: WorkspacePreset, sectionId: StrategySectionId) =>
  getPresetSections(preset).indexOf(sectionId);
