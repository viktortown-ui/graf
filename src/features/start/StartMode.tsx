import type { AppMode } from '../../entities/system/modes';
import type { LaunchContext } from '../../app/state/launchContext';
import type { ChainContext } from '../../app/state/useSceneState';
import type { ConfidenceSnapshot } from '../../entities/confidence/confidenceEngine';
import { StartGraphStage } from './StartGraphStage';

type StartModeProps = {
  selectedNodeName: string;
  launchContext: LaunchContext;
  chainContext: ChainContext;
  confidence: ConfidenceSnapshot;
  onAnchorChange: (nodeId: string) => void;
  onLaunchContextChange: (context: LaunchContext) => void;
  onLaunch: (mode: AppMode) => void;
};

export const StartMode = (props: StartModeProps) => <StartGraphStage {...props} />;
