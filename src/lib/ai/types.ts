export type AiSeverity = 'low' | 'medium' | 'high' | 'critical';

export type AiFinding = {
  title: string;
  severity: AiSeverity;
  evidence?: string[];
  detail?: string;
};

export type AiActionPriority = 'p0' | 'p1' | 'p2' | 'p3';

export type AiAction = {
  title: string;
  priority: AiActionPriority;
  steps?: string[];
};

export type AiArtifacts = {
  markdown?: string;
  bugDraft?: string;
  checklist?: string[];
};

export type AiResult = {
  summary: string;
  findings: AiFinding[];
  actions: AiAction[];
  artifacts?: AiArtifacts;
};

export type AiErrorPayload = {
  message: string;
  code?: string;
  upstream?: unknown;
};
