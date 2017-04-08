/**
 * Created by Soeren on 29.03.2017.
 */
export class LogLevel {
    public static readonly TRACE:string = "trace";
    public static readonly DEBUG:string = "debug";
    public static readonly INFO:string = "info";
    public static readonly LOG:string = "log";
    public static readonly WARN:string = "warn";
    public static readonly ERROR:string = "error";
    public static readonly NONE:string = "none";
}
export class Logger implements Console{
    private logLevel:LogLevel;
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
        'msIsIndependentlyComposed'
    ];

    constructor(logger:Console=console,logLevel:LogLevel=LogLevel.WARN){
        this.logLevel = logLevel;
        this.bindLogger(logger);
    }

    assert(test?: boolean, message?: string, ...optionalParams): void {}
    clear(): void {}
    count(countTitle?: string): void {}
    debug(message?: string, ...optionalParams): void {}
    dir(value?: any, ...optionalParams): void {}
    dirxml(value: any): void {}
    error(message?: any, ...optionalParams): void {}
    exception(message?: string, ...optionalParams): void {}
    group(groupTitle?: string): void {}
    groupCollapsed(groupTitle?: string): void {}
    groupEnd(): void {}
    info(message?: any, ...optionalParams): void {}
    log(message?: any, ...optionalParams): void {}
    profile(reportName?: string): void {}
    profileEnd(): void {}
    select(element: Element): void {}
    table(...data): void {}
    time(timerName?: string): void {}
    timeEnd(timerName?: string): void {}
    trace(message?: any, ...optionalParams): void {}
    warn(message?: any, ...optionalParams): void {}
    msIsIndependentlyComposed(element: Element): boolean {
        return false;
    }

    private bindLogger(logger:Console):void{
        for(let type of this.logFuncs){
            if(logger[type] && logger[type].bind){
                this[type] = logger[type].bind(logger[type]);
            }
        }
        switch(this.logLevel){
            case LogLevel.TRACE:
                return;
            case LogLevel.DEBUG:
                this.trace = (msg?:string,...args)=>{};
                return;
            case LogLevel.INFO:
                this.debug = (msg?:string,...args)=>{};
                return;
            case LogLevel.LOG:
                this.debug = (msg?:string,...args)=>{};
                this.info = (msg?:string,...args)=>{};
                return;
            case LogLevel.WARN:
                this.debug = (msg?:string,...args)=>{};
                this.info = (msg?:string,...args)=>{};
                this.log = (msg?:string,...args)=>{};
                return;
            case LogLevel.ERROR:
                this.debug = (msg?:string,...args)=>{};
                this.info = (msg?:string,...args)=>{};
                this.log = (msg?:string,...args)=>{};
                return;
            case LogLevel.NONE:
                for(let type of this.logFuncs){
                    this[type] = ()=>{};
                }
        }
    }
}