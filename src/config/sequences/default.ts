import { buildGoldenDemoSequence } from "@/lib/demo/golden-demo";
import type { MotionSequence } from "@/types";

export {
  createBlockInstance,
  createTransitionBetween,
  createBlockFromDefinition,
} from "@/lib/sequence-factory";

/** Default golden demo sequence for new projects and Remotion preview. */
export const defaultMotionSequence: MotionSequence = buildGoldenDemoSequence();
