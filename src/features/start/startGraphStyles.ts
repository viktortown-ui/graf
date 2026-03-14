export const startGraphStyles = [
  {
    selector: 'core',
    style: {
      'background-color': '#8f8cff',
      width: 120,
      height: 120,
      label: 'data(label)',
      color: '#f5f6ff',
      'text-valign': 'center',
      'text-halign': 'center',
      'font-size': 14,
      'font-weight': 700,
      'border-width': 2,
      'border-color': '#c2d0ff',
      'shadow-color': '#8f8cff',
      'shadow-opacity': 0.45,
      'shadow-blur': 28,
      'z-index': 7,
    },
  },
  {
    selector: 'node[kind = "domain"]',
    style: {
      'background-color': '#1f2937',
      width: 84,
      height: 84,
      label: 'data(label)',
      color: '#eef2ff',
      'text-wrap': 'wrap',
      'text-max-width': 96,
      'text-valign': 'center',
      'text-halign': 'center',
      'font-size': 12,
      'font-weight': 600,
      'border-width': 2,
      'border-color': '#3f4d68',
      'overlay-padding': '12px',
      'overlay-opacity': 0,
      'transition-property': 'background-color border-color width height shadow-blur shadow-opacity opacity',
      'transition-duration': '220ms',
      'z-index': 10,
    },
  },
  {
    selector: 'node[state = "focused"]',
    style: {
      'background-color': '#4f46e5',
      'border-color': '#bfdbfe',
      width: 104,
      height: 104,
      'shadow-color': '#818cf8',
      'shadow-opacity': 0.7,
      'shadow-blur': 24,
    },
  },
  {
    selector: 'node[state = "adjacent"], node[state = "unlock-ready"]',
    style: {
      'background-color': '#155e75',
      'border-color': '#67e8f9',
      opacity: 1,
    },
  },
  {
    selector: 'node[state = "available"]',
    style: {
      'background-color': '#1d4ed8',
      'border-color': '#93c5fd',
      opacity: 0.96,
    },
  },
  {
    selector: 'node[state = "weak"]',
    style: {
      opacity: 0.5,
      'background-color': '#334155',
      'border-color': '#64748b',
    },
  },
  {
    selector: 'node[state = "locked"]',
    style: {
      opacity: 0.3,
      'background-color': '#111827',
      'border-color': '#374151',
    },
  },
  {
    selector: 'edge',
    style: {
      width: 'mapData(effectiveWeight, 1, 3, 1.5, 5.5)',
      opacity: 0.45,
      'line-color': '#64748b',
      'target-arrow-color': '#64748b',
      'target-arrow-shape': 'triangle',
      'curve-style': 'bezier',
      label: 'data(label)',
      color: '#94a3b8',
      'font-size': 9,
      'text-background-color': '#0f172a',
      'text-background-opacity': 0.8,
      'text-background-padding': '2px',
      'text-rotation': 'autorotate',
      'line-style': 'solid',
      'line-dash-pattern': [8, 4],
      'transition-property': 'line-color width opacity target-arrow-color line-style',
      'transition-duration': '220ms',
      'z-index': 3,
    },
  },
  {
    selector: 'edge[relationType = "opens"], edge[relationType = "strengthens"]',
    style: {
      'line-color': '#22c55e',
      'target-arrow-color': '#22c55e',
    },
  },
  {
    selector: 'edge[relationType = "stabilizes"]',
    style: {
      'line-color': '#14b8a6',
      'target-arrow-color': '#14b8a6',
    },
  },
  {
    selector: 'edge[relationType = "drains"], edge[relationType = "destabilizes"], edge[relationType = "slows"]',
    style: {
      'line-color': '#f97316',
      'target-arrow-color': '#f97316',
    },
  },
  {
    selector: 'edge[relationType = "depends-on"]',
    style: {
      'line-color': '#a78bfa',
      'target-arrow-color': '#a78bfa',
    },
  },
  {
    selector: 'edge[relationType = "masks"]',
    style: {
      'line-color': '#eab308',
      'target-arrow-color': '#eab308',
    },
  },
  {
    selector: 'edge[effectiveState = "muted"]',
    style: {
      opacity: 0.18,
      'line-style': 'dotted',
    },
  },
  {
    selector: 'edge[effectiveState = "disabled"]',
    style: {
      opacity: 0.08,
      'line-style': 'dashed',
      'target-arrow-shape': 'none',
    },
  },
  {
    selector: 'edge[effectiveState = "hypothesis"]',
    style: {
      opacity: 0.32,
      'line-style': 'dashed',
    },
  },
  {
    selector: 'edge[confidence = "hypothesis"]',
    style: {
      color: '#fda4af',
      'text-background-color': '#2a0d15',
    },
  },
  {
    selector: 'edge[state = "focused"]',
    style: {
      width: 'mapData(effectiveWeight, 1, 3, 2.6, 7)',
      opacity: 1,
      color: '#e2e8f0',
      'shadow-blur': 10,
      'shadow-opacity': 0.4,
    },
  },
  {
    selector: 'edge[state = "adjacent"]',
    style: {
      opacity: 0.75,
    },
  },
  {
    selector: 'edge[state = "weak"]',
    style: {
      opacity: 0.14,
    },
  },
  {
    selector: ':selected',
    style: {
      'overlay-color': '#93c5fd',
      'overlay-opacity': 0.1,
      'overlay-padding': '10px',
    },
  },
];
