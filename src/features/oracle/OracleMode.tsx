type OracleModeProps = {
  selectedNodeName: string;
};

export const OracleMode = ({ selectedNodeName }: OracleModeProps) => (
  <>
    <p className="scene-mode-kicker">Predictive Layer</p>
    <h2 className="scene-mode-title">Project probable futures before acting.</h2>
    <p className="scene-mode-copy">
      Oracle mode forecasts intervention impact around <strong>{selectedNodeName}</strong> using the same influence graph and scene
      coordinates.
    </p>
  </>
);
