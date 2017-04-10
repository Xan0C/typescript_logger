/**
 * Created by Soeren on 29.03.2017.
 */
export class LogLevel {
    public static readonly TRACE: string = "trace";
    public static readonly DEBUG: string = "debug";
    public static readonly INFO: string = "info";
    public static readonly LOG: string = "log";
    public static readonly WARN: string = "warn";
    public static readonly ERROR: string = "error";
    public static readonly NONE: string = "none";
}
export class Logger implements Console {
    private static instance: Logger;
    private _logLevel: LogLevel;
    private _console: Console;
    /**
     * Interface functions that should be implemented
     * @type {[string]}
     */
    private logFuncs = [
        'assert',
        'clear',
        'count',
        'debug',
        'dir',
        'dirxml',
        'error',
        'exception',
        'group',
        'groupCollapsed',
        'groupEnd',
        'info',
        'log',
        'profile',
        'profileEnd',
        'select',
        'table',
        'time',
        'timeEnd',
        'trace',
        'warn',
        'msIsIndependentlyComposed',
        'none'
    ];

    private constructor(logger: Console = console, logLevel: LogLevel = LogLevel.LOG) {
        this._logLevel = logLevel;
        this._console = logger;
        this.bindLogger(logger);
    }

    public static getInstance(): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }

    assert(test?: boolean, message?: string, ...optionalParams): void {
    }

    clear(): void {
    }

    count(countTitle?: string): void {
    }

    debug(message?: string, ...optionalParams): void {
    }

    dir(value?: any, ...optionalParams): void {
    }

    dirxml(value: any): void {
    }

    error(message?: any, ...optionalParams): void {
    }

    exception(message?: string, ...optionalParams): void {
    }

    group(groupTitle?: string): void {
    }

    groupCollapsed(groupTitle?: string): void {
    }

    groupEnd(): void {
    }

    info(message?: any, ...optionalParams): void {
    }

    log(message?: any, ...optionalParams): void {
    }

    profile(reportName?: string): void {
    }

    profileEnd(): void {
    }

    select(element: Element): void {
    }

    table(...data): void {
    }

    time(timerName?: string): void {
    }

    timeEnd(timerName?: string): void {
    }

    trace(message?: any, ...optionalParams): void {
    }

    warn(message?: any, ...optionalParams): void {
    }

    msIsIndependentlyComposed(element: Element): boolean {
        return false;
    }

    private bindLogger(logger: Console): void {
        for (let type of this.logFuncs) {
            if (logger[type] && logger[type].bind) {
                this[type] = logger[type].bind(logger[type]);
            }
        }
        switch (this._logLevel) {
            case LogLevel.TRACE:
                return;
            case LogLevel.DEBUG:
                this.trace = (msg?: string, ...args) => {
                };
                return;
            case LogLevel.INFO:
                this.trace = (msg?: string, ...args) => {
                };
                this.debug = (msg?: string, ...args) => {
                };
                return;
            case LogLevel.LOG:
                this.trace = (msg?: string, ...args) => {
                };
                this.debug = (msg?: string, ...args) => {
                };
                this.info = (msg?: string, ...args) => {
                };
                return;
            case LogLevel.WARN:
                this.trace = (msg?: string, ...args) => {
                };
                this.debug = (msg?: string, ...args) => {
                };
                this.info = (msg?: string, ...args) => {
                };
                this.log = (msg?: string, ...args) => {
                };
                return;
            case LogLevel.ERROR:
                this.trace = (msg?: string, ...args) => {
                };
                this.debug = (msg?: string, ...args) => {
                };
                this.info = (msg?: string, ...args) => {
                };
                this.log = (msg?: string, ...args) => {
                };
                return;
            case LogLevel.NONE:
                for (let type of this.logFuncs) {
                    this[type] = () => {
                    };
                }
        }
    }

    get logLevel(): LogLevel {
        return this._logLevel;
    }

    set logLevel(value: LogLevel) {
        this._logLevel = value;
        this.bindLogger(this._console)
    }

    get console(): Console {
        return this._console;
    }

    set console(value: Console) {
        this._console = value;
        this.bindLogger(this._console);
    }
}
/**
 * See http://blog.wolksoftware.com/decorators-metadata-reflection-in-typescript-from-novice-to-expert-part-i
 * @param level
 * @returns {(...args:any[])=>undefined}
 */
export function log(level: LogLevel = LogLevel.LOG) {
    return (...args: any[]) => {
        switch (args.length) {
            case 1:
                return logClass(level).apply(this,args);
            case 3:
                if(!args[2]){
                    return logProperty(level).apply(this,args);
                }else if(args[2].value && typeof args[2].value === "function"){
                    return logMethod(level).apply(this,args);
                }else if(args[2].get && args[2].set){
                    return logAccessor(level).apply(this,args);
                }
                return;
        }
    }
}
/**
 * @param level
 * @returns {(target:any)=>any}
 */
function logClass(level: LogLevel): any {
    return function (target: any) {
        let original = target;

        function construct(classConstructor, args) {
            let c: any = function () {
                return classConstructor.apply(this, args);
            };
            c.prototype = classConstructor.prototype;
            return new c();
        }

        let f: any = function (...args) {
            Logger.getInstance()[level as string]("@Log{Class}: Created instance of: " + original.name);
            return construct(original, args);
        };
        f.prototype = original.prototype;
        return f;
    };
}
function logAccessor(level:LogLevel){
    return function <T>(target: any, key: string, descriptor: TypedPropertyDescriptor<T>)  {
        let get = descriptor.get;
        descriptor.get = function():T{
          let val = get.apply(this);
          Logger.getInstance()[level as string](`@Log{get}: Get ${key} => ${val}`);
          return val;
        };
        let set = descriptor.set;
        descriptor.set = function(...args){
            Logger.getInstance()[level as string](`@Log{set}: Set ${key} => ${args}`);
            set.apply(this,args);
        }
    };
}
function logMethod(level:LogLevel){
    return function(target: Function, key: string, descriptor: PropertyDescriptor) {
        let value = descriptor.value;
        descriptor.value = function (...args: any[]) {
            let a = args.map(a => JSON.stringify(a)).join();
            let result = value.apply(this,args);
            let r = JSON.stringify(result);
            Logger.getInstance()[level as string](`@Log{method} ${key}(${a}) => ${r}`);
            return result;
        };
        return descriptor;
    }
}
function logProperty(level:LogLevel){
    return function(target:any,key:string){
        Logger.getInstance()[level as string](`@Log{property} declared property ${key} for class ${target.constructor.name}`);
    }
}