import type { ElementDefinition } from 'cytoscape';
import { CORE_NODE_ID, toDomainNodeId } from './startGraphState';
import { V1_DOMAIN_EDGES, V1_MAJOR_DOMAINS, type GraphStartDomain } from './graphStartModel';

const domainPositions: Record<GraphStartDomain['id'], { x: number; y: number }> = {
  'energy-state': { x: 500, y: 90 },
  'stability-constraints': { x: 200, y: 240 },
  'direction-commitments': { x: 280, y: 470 },
  'execution-delivery': { x: 720, y: 470 },
  'capability-craft': { x: 800, y: 240 },
};

export const getStartGraphElements = (): ElementDefinition[] => {
  const core: ElementDefinition = {
    data: {
      id: CORE_NODE_ID,
      label: 'Ядро GRAF',
      kind: 'core',
      state: 'available',
    },
    position: { x: 500, y: 290 },
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
    position: domainPositions[domain.id],
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

  const domainEdges: ElementDefinition[] = V1_DOMAIN_EDGES.map((edge) => ({
    data: {
      id: `edge:${edge.id}`,
      source: toDomainNodeId(edge.from),
      target: toDomainNodeId(edge.to),
      label: edge.relation,
      relation: edge.relation,
      confidence: edge.confidence,
      weight: edge.strength,
      state: 'inactive',
    },
    selectable: true,
  }));

  return [core, ...domains, ...coreEdges, ...domainEdges];
};
