/**
 * @file Logger Utility
 * @description Simple logging utility with different log levels
 */
declare class Logger {
    private getTimestamp;
    private formatMessage;
    error(message: string, data?: any): void;
    warn(message: string, data?: any): void;
    info(message: string, data?: any): void;
    debug(message: string, data?: any): void;
}
export declare const logger: Logger;
export default logger;
//# sourceMappingURL=logger.d.ts.map