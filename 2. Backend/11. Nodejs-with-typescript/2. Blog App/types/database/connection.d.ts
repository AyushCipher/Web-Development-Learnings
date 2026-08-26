/**
 * @file MongoDB Connection
 * @description Establish connection to MongoDB using Mongoose
 */
import { Connection } from 'mongoose';
export declare const connectDatabase: () => Promise<Connection>;
export declare const disconnectDatabase: () => Promise<void>;
export declare const getDatabase: () => Connection | null;
export default connectDatabase;
//# sourceMappingURL=connection.d.ts.map