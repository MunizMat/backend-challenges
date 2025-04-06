/* -------------- External ---------------- */
import { createLogger, format, transports } from "winston";
import util from 'util';

const utilFormatter = () => ({
  transform: (info: any, opts: any) => {
    const args = info[Symbol.for('splat')];
    if (args) { info.message = util.format(info.message, ...args); }
    return info;
  }
});

export const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: format.combine(
    format.timestamp(),
    utilFormatter(),
    format.colorize({ all: true, colors: { info: 'blue', warn: 'yellow', error: 'red' } }),
    format.printf(({ level, message, label, timestamp }) => `${timestamp} ${label || '-'} ${level}: ${message}`),
  ),
  transports: [
    new transports.Stream({
      stream: process.stdout,
    })
  ],
});