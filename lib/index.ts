import {LoggerMiddleware, LogLevel} from "./logger";

export function logger(console?:Console,logLevel?:LogLevel):Console{
    return new LoggerMiddleware(console,logLevel);
}