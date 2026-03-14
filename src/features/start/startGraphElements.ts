import type { ElementDefinition } from 'cytoscape';
import { CORE_NODE_ID, toDomainNodeId } from './startGraphState';
import {
  DEFAULT_RELATION_USER_MODIFIER,
  RELATION_CONFIDENCE_LABEL,
  RELATION_STATE_LABEL,
  RELATION_STRENGTH_LABEL,
  RELATION_TYPE_LABEL,
  V1_MAJOR_DOMAINS,
  V1_NATIVE_RELATION_MATRIX,
  getEffectiveStrength,
  resolveEffectiveRelationState,
  type GraphStartDomain,
  type UserRelationModifier,
} from './graphStartModel';

const domainPositions: Record<GraphStartDomain['id'], { x: number; y: number }> = {
  'health-energy': { x: 500, y: 64 },
  'work-income': { x: 690, y: 150 },
  'finance-obligations': { x: 742, y: 336 },
  'relationships-family': { x: 606, y: 492 },
  'environment-home': { x: 394, y: 492 },
  'focus-development': { x: 258, y: 336 },
  'goals-meaning': { x: 310, y: 150 },
};

const strengthToWeight: Record<'low' | 'med' | 'high', number> = {
  low: 1,
  med: 2,
  high: 3,
};

export const getStartGraphElements = (
  positionOverrides: Partial<Record<GraphStartDomain['id'], { x: number; y: number }>> = {},
  relationModifiers: Record<string, UserRelationModifier> = {},
): ElementDefinition[] => {
  const core: ElementDefinition = {
    data: {
      id: CORE_NODE_ID,
      label: 'Я / Моя система',
      kind: 'core',
      state: 'available',
    },
    position: { x: 500, y: 280 },
    grabbable: false,
    selectable: false,
  };

  const domains: ElementDefinition[] = V1_MAJOR_DOMAINS.map((domain) => ({
    data: {
      id: toDomainNodeId(domain.id),
      domainId: domain.id,
      label: domain.shortTitle,
      title: domain.title,
      kind: 'domain',
      state: 'available',
    },
    position: positionOverrides[domain.id] ?? domainPositions[domain.id],
    grabbable: true,
    selectable: true,
  }));

  const coreEdges: ElementDefinition[] = V1_MAJOR_DOMAINS.map((domain) => ({
    data: {
      id: `core-edge:${domain.id}`,
      source: CORE_NODE_ID,
      target: toDomainNodeId(domain.id),
      label: 'несущая связь',
      relation: 'core-link',
      state: 'weak',
      confidence: 'verified',
      weight: 'med',
    },
    selectable: true,
  }));

  const domainEdges: ElementDefinition[] = V1_NATIVE_RELATION_MATRIX.map((relation) => {
    const modifier = relationModifiers[relation.id] ?? DEFAULT_RELATION_USER_MODIFIER;
    const effectiveStrength = getEffectiveStrength(relation.defaultStrength, modifier.strengthDelta);
    const effectiveState = resolveEffectiveRelationState(relation, modifier);
    return {
      data: {
        id: `edge:${relation.id}`,
        relationId: relation.id,
        source: toDomainNodeId(relation.source),
        target: toDomainNodeId(relation.target),
        label: RELATION_TYPE_LABEL[relation.relationType],
        relationType: relation.relationType,
        relationTypeLabel: RELATION_TYPE_LABEL[relation.relationType],
        directionality: relation.directionality,
        confidence: relation.defaultConfidence,
        confidenceLabel: RELATION_CONFIDENCE_LABEL[relation.defaultConfidence],
        defaultStrength: relation.defaultStrength,
        defaultStrengthLabel: RELATION_STRENGTH_LABEL[relation.defaultStrength],
        effectiveStrength,
        effectiveStrengthLabel: RELATION_STRENGTH_LABEL[effectiveStrength],
        effectiveWeight: strengthToWeight[effectiveStrength],
        activationMode: relation.activationMode,
        modifierStrengthDelta: modifier.strengthDelta,
        state: 'inactive',
        effectiveState,
        effectiveStateLabel: RELATION_STATE_LABEL[effectiveState],
      },
      selectable: true,
    };
  });

  return [core, ...domains, ...coreEdges, ...domainEdges];
};
