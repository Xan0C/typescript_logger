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

export class Logger {
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

    private static dummy(){}

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
                this.trace = Logger.dummy;
                return;
            case LogLevel.INFO:
                this.trace = Logger.dummy;
                this.debug = Logger.dummy;
                return;
            case LogLevel.LOG:
                this.trace = Logger.dummy;
                this.debug = Logger.dummy;
                this.info = Logger.dummy;
                return;
            case LogLevel.WARN:
                this.trace = Logger.dummy;
                this.debug = Logger.dummy;
                this.info = Logger.dummy;
                this.log = Logger.dummy;
                return;
            case LogLevel.ERROR:
                this.trace = Logger.dummy;
                this.debug = Logger.dummy;
                this.info = Logger.dummy;
                this.log = Logger.dummy;
                return;
            case LogLevel.NONE:
                for (let type of this.logFuncs) {
                    this[type] = Logger.dummy;
                }
        }
    }

    trace(message?: any, ...optionalParams: any[]): void {}
    debug(message?: any, ...optionalParams: any[]): void {}
    info(message?: any, ...optionalParams: any[]): void {}
    log(message?: any, ...optionalParams: any[]): void {}

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
 * @returns {(...args:any[])=>any}
 */
export function log(level: LogLevel = LogLevel.LOG):(...args)=>any {
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
function logClass<T extends {new(...args):any}>(level: LogLevel):(target:T)=>T {
    return function (target: T):T {
        let wrapper = function(...args){ return new (target.bind.apply(target, [void 0].concat(args)))(); };
        let f:any = function (...args) {
            Logger.getInstance()[level as string]("@Log{Class}: Creating instance of: " + (target as any).name);
            let result = wrapper.apply(this,args);
            Object['setPrototypeOf'](result,Object.getPrototypeOf(this));
            return result;
        };
        f.prototype = target.prototype;
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

//setPrototypeOf Polyfill
Object['setPrototypeOf'] = Object['setPrototypeOf'] || function(obj, proto) {
        obj.__proto__ = proto;
        return obj;
};