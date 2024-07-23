import { connection, connect, set } from "mongoose";

/**
 * Method to connect with the database. If already connected, method will do nothing.
 * @remarks Method throws an error, if database connection failed
 */
const connectDB = async (): Promise<void> => {
    const state: number = connection.readyState; //0: disconnected, 1: connected, 2: connecting, 3: disconnecting
    if (state === 0 || state === 3) {
        try {
            await connect(process.env.DB_CONNECTION_STRING_ADDRESSBOOK ?? "", {
                connectTimeoutMS: 5000,
            });
        } catch (error) {
            console.error("Connection to data base failed:", error);
            throw error;
        }
    }
    await checkConnectionDB();
};

/**
 * Method to disconnect from the database. If already disconnected, method will do nothing.
 * @remarks Method throws an error, if database disconnection failed
 */
const disconnectDB = async (): Promise<void> => {
    const state: number = connection.readyState; //0: disconnected, 1: connected, 2: connecting, 3: disconnecting

    if (state === 1 || state === 2) {
        try {
            await connection.close();
        } catch (error) {
            console.error("Disconnection from data base failed:", error);
            throw error;
        }
    }
};

/**
 * Method to check the database connection.
 * @remarks Method throws an error, if database is not connected
 */
const checkConnectionDB = async (): Promise<void> => {
    const maxRetries: number = 4;
    let success: boolean;

    //First try
    success = connection.readyState === 1; //0: disconnected, 1: connected, 2: connecting, 3: disconnecting

    //Further retries
    for (let retry = 1; retry <= maxRetries && !success; retry++) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        success = connection.readyState === 1;
    }

    if (!success) {
        throw Error("Data base connection test failed");
    }
};

/**
 * Method for initializing mongoose, a library for handling a MongoDB database.
 */
const initialMongooseSetup = (): void => {
    set("strictQuery", false);
};

export { connectDB, disconnectDB, initialMongooseSetup, checkConnectionDB };
