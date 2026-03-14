import type { GraphStartDomain } from './graphStartModel';

export type GraphNodeState = 'inactive' | 'available' | 'focused' | 'adjacent' | 'locked' | 'weak' | 'unlock-ready';

export const domainIdList = [
  'health-energy',
  'work-income',
  'finance-obligations',
  'relationships-family',
  'environment-home',
  'focus-development',
  'goals-meaning',
] as const satisfies readonly GraphStartDomain['id'][];

export const DOMAIN_NODE_PREFIX = 'domain:';
export const CORE_NODE_ID = 'core:nucleus';

export const toDomainNodeId = (domainId: GraphStartDomain['id']) => `${DOMAIN_NODE_PREFIX}${domainId}`;
export const fromDomainNodeId = (nodeId: string) => nodeId.replace(DOMAIN_NODE_PREFIX, '') as GraphStartDomain['id'];

export const getDomainState = (
  domainId: GraphStartDomain['id'],
  focusedId: GraphStartDomain['id'] | null,
  adjacentIds: Set<GraphStartDomain['id']>,
  unlockedIds: Set<GraphStartDomain['id']>,
): GraphNodeState => {
  if (!focusedId) {
    if (unlockedIds.has(domainId)) return 'available';
    return 'locked';
  }

  if (domainId === focusedId) return 'focused';
  if (adjacentIds.has(domainId)) {
    return unlockedIds.has(domainId) ? 'adjacent' : 'unlock-ready';
  }
  return unlockedIds.has(domainId) ? 'weak' : 'locked';
};
