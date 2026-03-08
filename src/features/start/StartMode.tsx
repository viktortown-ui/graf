type StartModeProps = {
  selectedNodeName: string;
};

export const StartMode = ({ selectedNodeName }: StartModeProps) => (
  <>
    <p className="scene-mode-kicker">Mission Control</p>
    <h2 className="scene-mode-title">Initialize the graph-native command loop.</h2>
    <p className="scene-mode-copy">
      Start mode anchors from <strong>{selectedNodeName}</strong> and primes intent before entering World, Graph, or Oracle passes.
    </p>
  </>
);
