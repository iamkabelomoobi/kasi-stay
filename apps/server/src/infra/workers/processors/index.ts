import { registerAuthProcessors } from "./auth";
import { registerPropertyPlatformProcessors } from "./property-platform";

export const registerWorkerProcessors = (): void => {
  registerAuthProcessors();
  registerPropertyPlatformProcessors();
};
