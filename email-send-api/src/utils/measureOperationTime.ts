/* ----------- Utils -------------- */
import { logger } from "@/utils/logger";

export const measureOperationTime = async (operation: () => Promise<unknown>, description: string) => {
  const time = Date.now();

  await operation();

  const milliseconds = Date.now() - time;
  const seconds = milliseconds / 1000;

  logger.info(`${description} after ${milliseconds > 999 ? `${seconds} seconds` : `${milliseconds} ms`}`);
}