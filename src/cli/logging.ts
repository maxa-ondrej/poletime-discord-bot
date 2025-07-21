import { Layer, Logger, LogLevel } from 'effect';

export const AppLogger = Logger.prettyLogger();

export const loggerLayer = Layer.merge(
  Logger.replace(Logger.defaultLogger, AppLogger),
  Logger.minimumLogLevel(import.meta.env.DEV ? LogLevel.Debug : LogLevel.Info),
);
