type StartModeProps = {
  selectedNodeName: string;
};

export const StartMode = ({ selectedNodeName }: StartModeProps) => (
  <>
    <p className="scene-mode-kicker">Командный контур</p>
    <h2 className="scene-mode-title">Соберите стартовый фокус перед входом в Мир, Граф и Оракул.</h2>
    <p className="scene-mode-copy">
      Текущий якорь: <strong>{selectedNodeName}</strong>. Зафиксируйте цель, проверьте риски и задайте ритм следующего шага.
    </p>
  </>
);
