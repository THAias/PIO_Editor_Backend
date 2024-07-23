import {
    addAddressBookItem,
    addAddressBookItems,
    addAuthor,
    addGivenDevice,
    checkSession,
    clearReceivingInstitution,
    closePIO,
    closeSession,
    createEmptyPIO,
    deleteAddressBookItem,
    deleteAllAddressBookItem,
    deleteAuthor,
    deleteGivenDevice,
    deleteSubTreeFromRootObject,
    doesUuidExistInAddressBook,
    exportToXmlString,
    generateCaptcha,
    getAllAddressBookItems,
    getAllAuthorUuids,
    getAllGivenDevices,
    getAllUuids,
    getGivenDevices,
    getLimitationsPDF,
    getNewSubTree,
    getPioSmallExclusions,
    getReadXmlErrors,
    getReceivingInstitution,
    imreadXmlString,
    integrateSubTreeInRootObject,
    isPIOOpen,
    isSessionOpen,
    openSession,
    renewSessionTime,
    sendContactMail,
    setReceivingInstitution,
    updateAddressBookItem,
    updateAddressBookItems,
    validatePIO,
} from "./controllers";
import { IResponse, IUserData } from "@thaias/pio_editor_meta";
import { Express, Request, Response } from "express";
import * as packageJson from "../../package.json";
import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import { connectDB } from "../dataBase/dbConnection";
import { CaptchaObj } from "svg-captcha";
import { JWT_SECRET } from "../GlobalVariables";

/**
 * Converts the header token to a IUserData interface. Token includes user data payload.
 * @param {string} token Authorization header received from frontend
 * @returns {IUserData} IUserData interface
 */
const decodeTokenToUserData = (token: string): IUserData | undefined => {
    if (!token) return undefined;

    try {
        const decodedToken: JwtPayload | string = jwt.verify(token, JWT_SECRET as Secret);
        if (typeof decodedToken !== "string") {
            return {
                firstName: decodedToken.firstName,
                lastName: decodedToken.lastName,
                fingerPrint: decodedToken.fingerPrint,
            };
        } else return undefined;
    } catch {
        console.log("JWT has expired (token: " + token + ")");
        return undefined;
    }
};

export type SessionRequest = Request & {
    session: {
        captcha?: string;
    };
};

/**
 * Defines all API routes. Function is used in server.ts file to set up routes. All routes are calling functions from
 * controllers.ts file, which hold the logic.
 * @param {Express} app Express object from 'express' library
 */
export const setupRoutes = (app: Express): void => {
    //---------------------------   Log In Route & Open sessions   ---------------------------

    //Check if pio is open
    app.get("/isPIOOpen", (req: Request, res: Response): void => {
        const responseObject: IResponse = isPIOOpen(decodeTokenToUserData(req.headers.authorization as string));
        res.send(responseObject);
    });

    //Check if session is open
    app.get("/isSessionOpen", (req: Request, res: Response): void => {
        const responseObject: IResponse = isSessionOpen(decodeTokenToUserData(req.headers.authorization as string));
        res.send(responseObject);
    });

    //Route for opening a new session
    //Name of the user should be sent with request
    //response message is sent to frontend
    app.post("/openSession", (req: Request, res: Response): void => {
        const responseObject: IResponse = openSession(req.body.userData as IUserData);
        res.send(responseObject);
    });

    // Route for checking if a session is still valid
    // response message is sent to frontend
    app.post("/checkSession", (req: Request, res: Response): void => {
        const responseObject: IResponse = checkSession(req.body.token as string);
        res.send(responseObject);
    });

    //Route for closing the session
    //response message is sent to frontend
    app.post("/closeSession", (req: Request, res: Response): void => {
        const responseObject: IResponse = closeSession(decodeTokenToUserData(req.headers.authorization as string));
        res.send(responseObject);
    });

    //Renew session time
    app.post("/renewSessionTime", (req: Request, res: Response): void => {
        const responseObject: IResponse = renewSessionTime(decodeTokenToUserData(req.headers.authorization as string));
        res.send(responseObject);
    });

    //--------------------   PIO routes   --------------------
    //Route for opening a PIO file
    //xml-String is sent with http-request, which will be imread in backend
    //response message is sent to frontend
    app.post("/openPIO", (req: Request, res: Response): void => {
        const responseObject: IResponse = imreadXmlString(
            decodeTokenToUserData(req.headers.authorization as string),
            req.body.xmlString as string
        );
        res.send(responseObject);
    });

    //Route for closing a PIO
    //response message is sent to frontend
    app.post("/closePIO", (req: Request, res: Response): void => {
        const responseObject: IResponse = closePIO(decodeTokenToUserData(req.headers.authorization as string));
        res.send(responseObject);
    });

    //Route for creating a new PIO
    //response message is sent to frontend
    app.post("/newPIO", (req: Request, res: Response): void => {
        const responseObject: IResponse = createEmptyPIO(decodeTokenToUserData(req.headers.authorization as string));
        res.send(responseObject);
    });

    //Route for saving a SubTree to the RootObject
    //SubTree object is sent with http-request, which will be integrated into the RootObject
    //response message is sent to frontend
    app.post("/saveSubTree", (req: Request, res: Response): void => {
        const responseObject: IResponse = integrateSubTreeInRootObject(
            decodeTokenToUserData(req.headers.authorization as string),
            req.body.subTrees
        );
        res.send(responseObject);
    });

    //Route for deleting a whole SubTree from the RootObject
    //SubTree object is sent with http-request, which will be deleted from the RootObject
    //response message is sent to frontend
    app.post("/deleteSubTree", (req: Request, res: Response): void => {
        const responseObject: IResponse = deleteSubTreeFromRootObject(
            decodeTokenToUserData(req.headers.authorization as string),
            req.body.subTrees
        );
        res.send(responseObject);
    });

    //Route for getting new SubTree objects from current RootObject
    //paths for subTree generation is sent with http-request
    //SubTrees or error message is sent to frontend
    app.get("/getSubTree", (req: Request, res: Response): void => {
        const responseObject: IResponse = getNewSubTree(
            decodeTokenToUserData(req.headers.authorization as string),
            req.query.paths as string[]
        );
        res.send(responseObject);
    });

    //Route for exporting the RootObject to xml-file
    //response message includes the xml-string (=PIO)
    app.get("/exportPIO", (req: Request, res: Response): void => {
        const responseObject: IResponse = exportToXmlString(decodeTokenToUserData(req.headers.authorization as string));
        res.send(responseObject);
    });

    //Route for adding a new author  (pio header data)
    //response message is sent to frontend
    app.post("/addAuthor", (req: Request, res: Response): void => {
        const responseObject: IResponse = addAuthor(
            decodeTokenToUserData(req.headers.authorization as string),
            req.body.author as string
        );
        res.send(responseObject);
    });

    //Route for deleting an author by uuid  (pio header data)
    //response message is sent to frontend
    app.post("/deleteAuthor", (req: Request, res: Response): void => {
        const responseObject: IResponse = deleteAuthor(
            decodeTokenToUserData(req.headers.authorization as string),
            req.body.author as string
        );
        res.send(responseObject);
    });

    //Route for getting all author uuids  (pio header data)
    //response message is sent to frontend
    app.get("/getAllAuthorUuids", (req: Request, res: Response): void => {
        const responseObject: IResponse = getAllAuthorUuids(decodeTokenToUserData(req.headers.authorization as string));
        res.send(responseObject);
    });

    //Route for setting the receiving institution (pio header data)
    //response message is sent to frontend
    app.post("/setReceivingInstitution", (req: Request, res: Response): void => {
        const responseObject: IResponse = setReceivingInstitution(
            decodeTokenToUserData(req.headers.authorization as string),
            req.body.institution as string
        );
        res.send(responseObject);
    });

    //Route for deleting the receiving institution (pio header data)
    //response message is sent to frontend
    app.post("/clearReceivingInstitution", (req: Request, res: Response): void => {
        const responseObject: IResponse = clearReceivingInstitution(
            decodeTokenToUserData(req.headers.authorization as string)
        );
        res.send(responseObject);
    });

    //Route for getting the uuid of the receiving institution (pio header data)
    //response message is sent to frontend
    app.get("/getReceivingInstitution", (req: Request, res: Response): void => {
        const responseObject: IResponse = getReceivingInstitution(
            decodeTokenToUserData(req.headers.authorization as string)
        );
        res.send(responseObject);
    });

    //Route for adding a new given device
    //response message is sent to frontend
    app.post("/addGivenDevice", (req: Request, res: Response): void => {
        const responseObject: IResponse = addGivenDevice(
            decodeTokenToUserData(req.headers.authorization as string),
            req.body.uuid as string,
            req.body.type as string
        );
        res.send(responseObject);
    });

    //Route for deleting a given device
    //response message is sent to frontend
    app.post("/deleteGivenDevice", (req: Request, res: Response): void => {
        const responseObject: IResponse = deleteGivenDevice(
            decodeTokenToUserData(req.headers.authorization as string),
            req.body.uuid as string,
            req.body.type as string
        );
        res.send(responseObject);
    });

    //Route for getting all given devices of one type
    //response message includes an object with all uuids
    app.post("/getGivenDevices", (req: Request, res: Response): void => {
        const responseObject: IResponse = getGivenDevices(
            decodeTokenToUserData(req.headers.authorization as string),
            req.body.type as string
        );
        res.send(responseObject);
    });

    //Route for getting all given devices
    //response message includes an object with all uuids
    app.get("/getAllGivenDevices", (req: Request, res: Response): void => {
        const responseObject: IResponse = getAllGivenDevices(
            decodeTokenToUserData(req.headers.authorization as string)
        );
        res.send(responseObject);
    });

    //Route for getting all used uuids
    //response message includes an object with all uuids
    app.get("/getAllUuids", (req: Request, res: Response): void => {
        const responseObject: IResponse = getAllUuids(decodeTokenToUserData(req.headers.authorization as string));
        res.send(responseObject);
    });

    //Route for getting all readXmlErrors while importing a xml file
    //response message includes an object with all errors
    app.get("/getReadXmlErrors", (req: Request, res: Response): void => {
        const responseObject: IResponse = getReadXmlErrors(decodeTokenToUserData(req.headers.authorization as string));
        res.send(responseObject);
    });

    //Route for getting all pioSmallExclusions while importing a xml file
    //response message includes an object with all exclusions
    app.get("/getPioSmallExclusions", (req: Request, res: Response): void => {
        const responseObject: IResponse = getPioSmallExclusions(
            decodeTokenToUserData(req.headers.authorization as string)
        );
        res.send(responseObject);
    });

    //--------------------   Address Book routes   --------------------
    //Route for adding a new address book item
    app.post("/addAddressBookItem", async (req: Request, res: Response): Promise<void> => {
        const responseObject: IResponse = await addAddressBookItem(
            decodeTokenToUserData(req.headers.authorization as string),
            req.body.data
        );
        res.send(responseObject);
    });

    //Route for adding multiple new address book items
    app.post("/addAddressBookItems", async (req: Request, res: Response): Promise<void> => {
        const responseObject: IResponse = await addAddressBookItems(
            decodeTokenToUserData(req.headers.authorization as string),
            req.body.data
        );
        res.send(responseObject);
    });

    //Route for updating an existing address book item
    app.post("/updateAddressBookItem", async (req: Request, res: Response): Promise<void> => {
        const responseObject: IResponse = await updateAddressBookItem(
            decodeTokenToUserData(req.headers.authorization as string),
            req.body.uuid as string,
            req.body.data
        );
        res.send(responseObject);
    });

    //Route for updating multiple existing address book item
    app.post("/updateAddressBookItems", async (req: Request, res: Response): Promise<void> => {
        const responseObject: IResponse = await updateAddressBookItems(
            decodeTokenToUserData(req.headers.authorization as string),
            req.body.data
        );
        res.send(responseObject);
    });

    //Route for deleting an existing address book item
    app.post("/deleteAddressBookItem", async (req: Request, res: Response): Promise<void> => {
        const responseObject: IResponse = await deleteAddressBookItem(
            decodeTokenToUserData(req.headers.authorization as string),
            req.body.uuid as string
        );
        res.send(responseObject);
    });

    //Route for deleting all existing address book items of one type
    app.post("/deleteAllAddressBookItem", async (req: Request, res: Response): Promise<void> => {
        const responseObject: IResponse = await deleteAllAddressBookItem(
            decodeTokenToUserData(req.headers.authorization as string)
        );
        res.send(responseObject);
    });

    //Route for getting all address book items of one type
    app.get("/getAllAddressBookItems", async (req: Request, res: Response): Promise<void> => {
        const responseObject: IResponse = await getAllAddressBookItems(
            decodeTokenToUserData(req.headers.authorization as string)
        );
        res.send(responseObject);
    });

    //Route for checking the availability of uuid
    app.get("/doesUuidExistInAddressBook", async (req: Request, res: Response): Promise<void> => {
        const responseObject: IResponse = await doesUuidExistInAddressBook(
            decodeTokenToUserData(req.headers.authorization as string),
            req.query.uuid as string
        );
        res.send(responseObject);
    });

    //--------------------   Database routes   --------------------
    //Route for checking the availability of database
    app.get("/checkConnectionDB", async (req: Request, res: Response): Promise<void> => {
        try {
            await connectDB();
            res.send({
                success: true,
                message: "Connection to data base established.",
            } as IResponse);
        } catch (err) {
            console.error(err);
            res.send({
                success: false,
                message: "Connection to data base failed.",
            } as IResponse);
        }
    });

    //--------------------   Other Routes   --------------------
    //Getting the version of backend
    app.get("/getVersion", (req: Request, res: Response): void => {
        res.send({
            success: true,
            message: "Version successfully requested.",
            data: { version: packageJson["default"]["version"] as string },
        } as IResponse);
    });

    //Getting PIOEditorLimitationenMitAnhang.pdf
    app.get("/getLimitationsPDF", (req: Request, res: Response): void => {
        const responseObject: IResponse = getLimitationsPDF();
        res.send(responseObject);
    });

    //------------------   Validation Route   ------------------
    //Route for validating the PIO structure with help of the validation server
    app.post("/validatePIO", async (req: Request, res: Response): Promise<void> => {
        const responseObject: IResponse = await validatePIO(
            decodeTokenToUserData(req.headers.authorization as string),
            req.body.xmlString as string
        );
        res.send(responseObject);
    });

    app.get("/getCaptcha", (req: SessionRequest, res: Response): void => {
        const captcha: CaptchaObj = generateCaptcha();
        const captchaImage: string = captcha.data;
        req.session.captcha = captcha.text;
        console.log("store in session", req.session.captcha, captcha.text);

        res.type("svg");
        res.send(captchaImage);
    });

    app.post("/submit_contact", (req: SessionRequest, res: Response): void => {
        const name: string = req.body.name;
        const email: string = req.body.email;
        const message: string = req.body.text;
        const captchaText: string = req.body.captcha;
        console.log("session:", req.session.captcha, "input:", captchaText);
        if (req.session.captcha === captchaText) {
            if (!name && !email && !message) {
                res.send({
                    success: false,
                    message: "Please fill in at least one field.",
                    data: { type: "emptyFields" },
                });
            } else {
                sendContactMail(name, email, message).then((mailResponse: boolean): void => {
                    if (mailResponse) {
                        res.send({
                            success: true,
                            message: "Email successfully sent.",
                        });
                    } else {
                        res.send({
                            success: false,
                            message: "Email could not be sent.",
                            data: { type: "emailError" },
                        });
                    }
                });
            }
        } else {
            res.send({
                success: false,
                message: "Captcha is not correct.",
                data: { type: "captchaError" },
            });
        }
    });
};
