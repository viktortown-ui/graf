import { useEffect, useRef } from 'react';
import cytoscape, { type Core } from 'cytoscape';
import { startGraphStyles } from './startGraphStyles';
import { getStartGraphElements } from './startGraphElements';
import { CORE_NODE_ID, toDomainNodeId } from './startGraphState';
import type { GraphStartDomain } from './graphStartModel';

type StartGraphSceneProps = {
  focusedDomainId: GraphStartDomain['id'] | null;
  onDomainFocus: (domainId: GraphStartDomain['id']) => void;
  onEdgeSelect: (edgeId: string | null) => void;
  onNodePosition: (domainId: GraphStartDomain['id'], position: { x: number; y: number }) => void;
  onRenderedAnchorPosition: (position: { left: number; top: number } | null) => void;
};

export const StartGraphScene = ({
  focusedDomainId,
  onDomainFocus,
  onEdgeSelect,
  onNodePosition,
  onRenderedAnchorPosition,
}: StartGraphSceneProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const cyRef = useRef<Core | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const cy = cytoscape({
      container: containerRef.current,
      elements: getStartGraphElements(),
      style: startGraphStyles as cytoscape.StylesheetJson,
      layout: { name: 'preset', fit: true, padding: 44 },
      minZoom: 0.55,
      maxZoom: 1.7,
      wheelSensitivity: 0.18,
      boxSelectionEnabled: false,
      selectionType: 'single',
    });

    cyRef.current = cy;

    cy.on('tap', 'node[kind = "domain"]', (event) => {
      const domainId = event.target.data('domainId') as GraphStartDomain['id'];
      onDomainFocus(domainId);
      onEdgeSelect(null);
    });

    cy.on('tap', 'edge', (event) => {
      onEdgeSelect(event.target.id());
    });

    cy.on('dragfree', 'node[kind = "domain"]', (event) => {
      const domainId = event.target.data('domainId') as GraphStartDomain['id'];
      const position = event.target.position();
      onNodePosition(domainId, { x: Math.round(position.x), y: Math.round(position.y) });
    });

    const coreNode = cy.getElementById(CORE_NODE_ID);
    let pulse = 0;
    const pulseTick = window.setInterval(() => {
      pulse = (pulse + 1) % 24;
      const blur = 22 + Math.sin(pulse / 24) * 8;
      coreNode.style('shadow-blur', `${blur}`);
      coreNode.style('shadow-opacity', `${0.33 + Math.sin(pulse / 24) * 0.22}`);
    }, 260);

    return () => {
      window.clearInterval(pulseTick);
      cy.destroy();
      cyRef.current = null;
    };
  }, [onDomainFocus, onEdgeSelect, onNodePosition]);

  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;

    const domainNodes = cy.nodes('[kind = "domain"]');
    const focusedNodeId = focusedDomainId ? toDomainNodeId(focusedDomainId) : null;
    const adjacentNodeIds = new Set<string>();

    cy.edges().forEach((edge) => {
      edge.data('state', focusedNodeId ? 'weak' : 'inactive');
      if (!focusedNodeId) return;
      if (edge.source().id() === focusedNodeId || edge.target().id() === focusedNodeId) {
        edge.data('state', 'focused');
        if (edge.source().id() !== focusedNodeId) adjacentNodeIds.add(edge.source().id());
        if (edge.target().id() !== focusedNodeId) adjacentNodeIds.add(edge.target().id());
      }
    });

    domainNodes.forEach((node) => {
      const nodeId = node.id();
      let state = 'available';
      if (focusedNodeId) {
        if (nodeId === focusedNodeId) state = 'focused';
        else if (adjacentNodeIds.has(nodeId)) state = 'adjacent';
        else state = 'weak';
      }
      node.data('state', state);
    });

    if (focusedNodeId) {
      const anchor = cy.getElementById(focusedNodeId);
      if (anchor.nonempty()) {
        const rendered = anchor.renderedPosition();
        onRenderedAnchorPosition({ left: rendered.x, top: rendered.y });
        anchor.animate({ style: { width: 108, height: 108 } }, { duration: 180 }).animate({ style: { width: 104, height: 104 } }, { duration: 180 });
      }
    } else {
      onRenderedAnchorPosition(null);
    }
  }, [focusedDomainId, onRenderedAnchorPosition]);

  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;

    const updateAnchor = () => {
      if (!focusedDomainId) {
        onRenderedAnchorPosition(null);
        return;
      }
      const node = cy.getElementById(toDomainNodeId(focusedDomainId));
      if (node.nonempty()) {
        const rendered = node.renderedPosition();
        onRenderedAnchorPosition({ left: rendered.x, top: rendered.y });
      }
    };

    cy.on('pan zoom dragfree', updateAnchor);
    return () => {
      cy.off('pan zoom dragfree', updateAnchor);
    };
  }, [focusedDomainId, onRenderedAnchorPosition]);

  return <div className="start-graph-canvas" ref={containerRef} aria-label="Живая граф-сцена Start" />;
};
