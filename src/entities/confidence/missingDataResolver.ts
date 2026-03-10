import type { ConfidenceFieldDescriptor } from './confidenceEngine';

export type MissingDataResult = {
  critical: string[];
  recommended: string[];
  forNextUnlock: string[];
};

export const resolveMissingData = (
  fields: (ConfidenceFieldDescriptor & { filled: boolean })[],
  nextUnlockDaysLeft: number,
): MissingDataResult => {
  const critical = fields.filter((field) => field.priority === 'critical' && !field.filled).map((field) => field.label);
  const recommended = fields.filter((field) => field.priority === 'recommended' && !field.filled).map((field) => field.label);
  const forNextUnlock = nextUnlockDaysLeft > 0 ? [...critical, ...recommended.slice(0, 2)] : [];

  return { critical, recommended, forNextUnlock };
};
