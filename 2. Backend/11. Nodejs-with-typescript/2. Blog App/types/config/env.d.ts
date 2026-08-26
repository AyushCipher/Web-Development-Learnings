/**
 * @file Environment Configuration
 * @description Load and validate environment variables
 */
export declare const config: {
    port: string | number;
    nodeEnv: string;
    appName: string;
    apiVersion: string;
    mongodbUri: string;
    jwtSecret: string;
    jwtExpire: string;
    isDevelopment: boolean;
    isProduction: boolean;
    isTest: boolean;
};
export declare const validateConfig: () => void;
export default config;
//# sourceMappingURL=env.d.ts.map