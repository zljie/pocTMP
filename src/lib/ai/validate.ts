import type { AiAction, AiActionPriority, AiFinding, AiResult, AiSeverity } from './types';

const isObject = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object';

const isStringArray = (v: unknown): v is string[] =>
  Array.isArray(v) && v.every((x) => typeof x === 'string');

const normalizeSeverity = (v: unknown): AiSeverity => {
  if (v === 'low' || v === 'medium' || v === 'high' || v === 'critical') return v;
  return 'medium';
};

const normalizePriority = (v: unknown): AiActionPriority => {
  if (v === 'p0' || v === 'p1' || v === 'p2' || v === 'p3') return v;
  return 'p2';
};

const normalizeFinding = (v: unknown): AiFinding | null => {
  if (!isObject(v)) return null;
  if (typeof v.title !== 'string' || !v.title.trim()) return null;
  const evidence = isStringArray(v.evidence) ? v.evidence : undefined;
  const detail = typeof v.detail === 'string' && v.detail.trim() ? v.detail : undefined;
  return {
    title: v.title.trim(),
    severity: normalizeSeverity(v.severity),
    evidence,
    detail,
  };
};

const normalizeAction = (v: unknown): AiAction | null => {
  if (!isObject(v)) return null;
  if (typeof v.title !== 'string' || !v.title.trim()) return null;
  const steps = isStringArray(v.steps) ? v.steps : undefined;
  return { title: v.title.trim(), priority: normalizePriority(v.priority), steps };
};

export const normalizeAiResult = (v: unknown, fallbackSummary: string): AiResult => {
  if (!isObject(v)) return { summary: fallbackSummary, findings: [], actions: [] };
  const summary = typeof v.summary === 'string' && v.summary.trim() ? v.summary.trim() : fallbackSummary;
  const findings = Array.isArray(v.findings) ? v.findings.map(normalizeFinding).filter((x): x is AiFinding => !!x) : [];
  const actions = Array.isArray(v.actions) ? v.actions.map(normalizeAction).filter((x): x is AiAction => !!x) : [];

  let artifacts: AiResult['artifacts'] = undefined;
  if (isObject(v.artifacts)) {
    const markdown = typeof v.artifacts.markdown === 'string' ? v.artifacts.markdown : undefined;
    const bugDraft = typeof v.artifacts.bugDraft === 'string' ? v.artifacts.bugDraft : undefined;
    const checklist = isStringArray(v.artifacts.checklist) ? v.artifacts.checklist : undefined;
    if (markdown || bugDraft || checklist) {
      artifacts = { markdown, bugDraft, checklist };
    }
  }

  return { summary, findings, actions, artifacts };
};
