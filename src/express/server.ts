import { setupRoutes } from "./routes";
import express, { Express } from "express";
import cors from "cors";
import { initialMongooseSetup } from "../dataBase/dbConnection";
import { MultiSessionManager } from "../MultiSessionManager";
import helmet from "helmet";
import { projectRoot } from "../GlobalVariables";
import { AddressBookHandler } from "../dataBase/AddressBookHandler";
import { IOrganizationObject } from "@thaias/pio_editor_meta";
import * as fs from "fs";
import dotenv from "dotenv";
import path from "path";
import session from "express-session";
const app: Express = express();
const port: number = process.env.PORT ? parseInt(process.env.PORT) : 7654;

app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(express.json({ limit: "50mb" }));

const result = dotenv.config({ path: path.join(path.resolve(__dirname), "..", "..", `.env.${process.env.NODE_ENV}`) });
if (result.error) {
    throw result.error;
} else {
    console.log("Environment variables loaded from .env." + process.env.NODE_ENV);
}
const whitelist: string[] = [
    "http://localhost:3000",
    "http://localhost",
    "https://pioeditor.informatik.tha.de",
    "https://pioeditor.informatik.tha.de/api",
    "https://www.pioeditor.informatik.tha.de",
    "https://www.pioeditor.informatik.tha.de/api",
    "https://pio-editor.de",
    "https://pio-editor.de/api",
    "https://pio-editor.de/editor",
    "https://www.pio-editor.de",
    "https://www.pio-editor.de/api",
    "https://www.pio-editor.de/editor",
];
const corsOptions: cors.CorsOptions = {
    origin: function (origin: string | undefined, callback): void {
        if (!origin || whitelist.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            const msg =
                "The CORS policy for this site does not allow access from the specified (" + origin + ") Origin.";
            callback(new Error(msg), false);
        }
    },
    credentials: true,
};
app.use(cors(corsOptions));

app.use(
    session({
        secret: process.env.SESSION_SECRET ?? "",
        rolling: true,
        saveUninitialized: false,
        cookie: { secure: "auto", maxAge: 1000 * 60 * 60 * 4 }, // 4 hours
        name: "captcha-session",
        resave: true,
    })
);

// Manually setting security headers
app.use(helmet());
app.use((req, res, next) => {
    res.setHeader("Permissions-Policy", "interest-cohort=()");
    next();
});

app.listen(port, (): void => {
    console.log("Server started on port " + port);
    console.log("Start server in " + process.env.NODE_ENV + " mode");
    console.log("Connect DB with connection string: " + process.env.DB_CONNECTION_STRING_ADDRESSBOOK);
});
setupRoutes(app);
initialMongooseSetup();

console.log("Backend started in '" + process.env.VERSION_ENV + "' mode");

//Create a MultiSessionManager and frequently (every 10 minutes) clear expired sessions
export const sessionManager: MultiSessionManager = new MultiSessionManager();
const clearIntervallID: NodeJS.Timeout = setInterval((): void => {
    const numberOfCleanings: number = sessionManager.cleanSessions();
    const date: Date = new Date();
    const timeString: string = date.getHours() + ":" + ("0" + date.getMinutes().toString()).slice(-2);
    console.log("Session cleaning started: " + numberOfCleanings + " expired sessions cleaned (" + timeString + ")");
}, 600000);

process.on("SIGTERM", (): void => {
    console.log(`Server shutting down due to SIGTERM signal...`);
    clearInterval(clearIntervallID);
    console.log("Session cleaning finished by cleaning the interval ID (" + clearIntervallID + ")");
    process.exit(0);
});

//For "webVersion":Initialize dataBase with example organizations
if (process.env.VERSION_ENV === "webVersion") {
    AddressBookHandler.deleteAllResource().then(() => {
        const exampleData: IOrganizationObject[] = JSON.parse(
            // eslint-disable-next-line security/detect-non-literal-fs-filename
            fs.readFileSync(`${projectRoot}/src/dataBase/exampleData.json`).toString()
        );
        AddressBookHandler.createResources(exampleData).then(() => {
            console.log("Data base initialized with example organizations (just happening in 'webVersion' mode)");
        });
    });
}
