//This file holds functions, which are used in API routes (see routes.ts file)
import {
    addInformationAboutPrimitiveDataTypes,
    IOrganizationObject,
    IResponse,
    IUserData,
    SubTree,
    transformToSubTree,
} from "@thaias/pio_editor_meta";
import { sessionManager } from "./server";
import { AddressBookHandler } from "../dataBase/AddressBookHandler";
import { ErrorPath, IGivenDevices, PioSmallErrors } from "../@types/InterfacesForRootObject";
import nodemailer from "nodemailer";

import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import * as fs from "fs";
import {
    JWT_SECRET,
    projectRoot,
    SESSION_TIME_LOCAL_VERSION_STRING,
    SESSION_TIME_WEB_VERSION_STRING,
} from "../GlobalVariables";
import Mail from "nodemailer/lib/mailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import svgCaptcha, { CaptchaObj, ConfigObject } from "svg-captcha";
import ValidatorService from "../ValidatorService";

//Constants
const unknownErrorString: string = "Unknown error message";
const errorObjectIfNoSessionExists: IResponse = {
    success: false,
    errorCode: 1,
    message: "No session with stated user data found",
};
const errorObjectIfNoUserExists: IResponse = {
    success: false,
    errorCode: 1,
    message: "No user data provided",
};
const tokenExpiredResponse: IResponse = {
    success: false,
    errorCode: 4,
    message: "Token has expired",
};
const tokenExpiresIn: string =
    process.env.VERSION_ENV === "webVersion" ? SESSION_TIME_WEB_VERSION_STRING : SESSION_TIME_LOCAL_VERSION_STRING;

/**
 * Helper function for checking whether a session is open for passed userData.
 * @param {IUserData | undefined} userData User data for validation
 * @returns {void | IResponse} Returns an error IResponse object, if session for stated user does not exist
 */
const validateUserData = (userData?: IUserData): IUserData | IResponse => {
    try {
        if (!userData) {
            return errorObjectIfNoUserExists;
        } else {
            if (!sessionManager.doesSessionExist(userData)) {
                return errorObjectIfNoSessionExists;
            } else {
                return userData;
            }
        }
    } catch (error) {
        return errorObjectIfNoUserExists;
    }
};

/**
 * Helper function for renewing the session time of a session.
 * @param {IUserData} userData User data of the session
 * @returns {string} A new JWT token
 */
const renewSessionTimeHelper = (userData: IUserData): string => {
    sessionManager.getSession(userData)?.renewSessionTime();
    return jwt.sign(userData, "pioeditor" as Secret, { expiresIn: tokenExpiresIn });
};

/**
 * Returns the message of an error. If parameter is no instance of 'Error', a default error message is returned.
 * @param {unknown} error Unknown input object
 * @returns {string} An error message
 */
const getErrorMessage = (error: unknown): string => {
    let errorMessage: string = unknownErrorString;
    if (error instanceof Error) errorMessage = error.message;
    return errorMessage;
};

/**
 * Helper function for generating the IResponse object.
 * @param {boolean} success Value for the success key of the IResponse object
 * @param {string} message Value for the message key of the IResponse object
 * @param {IUserData | undefined} userData User data of the related session
 * @param {{[key: string]: object | object[] | string | SubTree[] | boolean}} data Value for the data key of IResponse
 * @param {number} errorCode Value for the errorCode key of the IResponse object
 * @param {string} token Session token which can be added to response
 * @param {boolean} consoleLog Will log message to console, if set to true (default: true)
 */
const getIResponseObject = (
    success: boolean,
    message: string,
    userData: IUserData,
    errorCode?: number,
    data?: {
        [key: string]: object | object[] | string | SubTree[] | boolean;
    },
    token?: string,
    consoleLog: boolean = true
): IResponse => {
    const completeMessage: string =
        process.env.VERSION_ENV === "webVersion"
            ? `${message} (user: ${userData.firstName} ${userData.lastName}, ${userData.fingerPrint})`
            : `${message} (user: ${userData.firstName} ${userData.lastName})`;
    if (consoleLog) console.log(completeMessage);
    const returnObject = {
        success: success,
        message: completeMessage,
        errorCode: errorCode,
        data: data,
        token: token,
    } as IResponse;
    if (sessionManager.doesSessionExist(userData)) {
        returnObject.token = renewSessionTimeHelper(userData);
    }
    return returnObject;
};

/**
 * Controller for opening a new Session using MultiSessionManager. If a Session with same user data already exists, no
 * new Session is created.
 * @param {IUserData | undefined} userData User data of the user who wants to open the session
 * @returns {IResponse} A response object
 */
const openSession = (userData: IUserData): IResponse => {
    // Create Session If no Session with same user data exists
    if (!userData.firstName || !userData.lastName) return errorObjectIfNoUserExists;
    try {
        if (sessionManager.doesSessionExist(userData)) {
            const token: string = renewSessionTimeHelper(userData);
            return getIResponseObject(true, "Session successfully opened", userData, undefined, undefined, token);
        } else {
            const token: string = jwt.sign(userData, JWT_SECRET as Secret, { expiresIn: tokenExpiresIn });
            sessionManager.addSession(userData);
            return getIResponseObject(true, "New session successfully created", userData, undefined, undefined, token);
        }
    } catch (error) {
        const errorMessage: string = getErrorMessage(error);
        return getIResponseObject(
            false,
            "Session could not be opened due to following error " + errorMessage,
            userData,
            0
        );
    }
};

/**
 * Controller for checking whether a session is open using MultiSessionManager. To login again with same user data,
 * @param {string} token JWT Token of the session
 * @returns {IResponse} A response object
 */
const checkSession = (token: string): IResponse => {
    try {
        let decodedToken: JwtPayload | string;
        //Check whether token is expired
        try {
            decodedToken = jwt.verify(token, JWT_SECRET as Secret);
        } catch {
            return tokenExpiredResponse;
        }

        if (typeof decodedToken !== "string") {
            const userData: IUserData = {
                firstName: decodedToken.firstName,
                lastName: decodedToken.lastName,
                fingerPrint: decodedToken.fingerPrint,
            };
            if (sessionManager.doesSessionExist(userData)) {
                sessionManager.getSession(userData)?.renewSessionTime();
                return getIResponseObject(
                    true,
                    "Session is open",
                    userData,
                    undefined,
                    { userData: userData },
                    undefined,
                    false
                );
            } else {
                return errorObjectIfNoSessionExists;
            }
        } else {
            return errorObjectIfNoSessionExists;
        }
    } catch (error) {
        return errorObjectIfNoSessionExists;
    }
};

/**
 * Controller for closing the Session using MultiSessionManager.
 * @param {IUserData | undefined} _userData User data of the user who wants to close the session
 * @returns {IResponse} A response object
 */
const closeSession = (_userData: IUserData | undefined): IResponse => {
    const validateObject: IUserData | IResponse = validateUserData(_userData);
    if (!validateObject.hasOwnProperty("firstName")) return validateObject as IResponse;
    const userData: IUserData = validateObject as IUserData;
    try {
        sessionManager.deleteSession(userData);
        return getIResponseObject(true, "Session successfully closed", userData);
    } catch (error) {
        return getIResponseObject(
            false,
            "Session could not be closed due to following error: " + getErrorMessage(error),
            userData,
            0
        );
    }
};

/**
 * Controller for checking whether a session is open.
 * @param {IUserData | undefined} _userData User data of the user
 * @returns {IResponse} A response object
 */
const isSessionOpen = (_userData: IUserData | undefined): IResponse => {
    try {
        const validateObject: IUserData | IResponse = validateUserData(_userData);
        if (!validateObject.hasOwnProperty("firstName")) return validateObject as IResponse;
        const userData: IUserData = validateObject as IUserData;
        if (sessionManager.doesSessionExist(userData)) {
            return getIResponseObject(
                true,
                "Session is open",
                userData,
                undefined,
                { userData: userData },
                undefined,
                false
            );
        } else {
            return errorObjectIfNoSessionExists;
        }
    } catch (error) {
        return errorObjectIfNoSessionExists;
    }
};

/**
 * Will set the starting time of session to the current time. Session time gets renewed.
 * @param {IUserData | undefined} _userData User data of the user
 * @returns {IResponse} A response object
 */
const renewSessionTime = (_userData: IUserData | undefined): IResponse => {
    const validateObject: IUserData | IResponse = validateUserData(_userData);
    if (!validateObject.hasOwnProperty("firstName")) return validateObject as IResponse;
    const userData: IUserData = validateObject as IUserData;
    try {
        return getIResponseObject(true, "Session time successfully renewed", userData);
    } catch (error) {
        return getIResponseObject(
            false,
            "Session time could not be renewed due to following error: " + getErrorMessage(error),
            userData,
            0
        );
    }
};

/**
 * Controller for imreading a xml-string received from frontend. Will convert xmlString to RootObject with readXML()
 * method.
 * @param {IUserData | undefined} _userData User data of the user
 * @param {string} xmlString XML-string received from frontend
 * @returns {IResponse} A response object
 */
const imreadXmlString = (_userData: IUserData | undefined, xmlString: string): IResponse => {
    const validateObject: IUserData | IResponse = validateUserData(_userData);
    if (!validateObject.hasOwnProperty("firstName")) return validateObject as IResponse;
    const userData: IUserData = validateObject as IUserData;

    if (sessionManager.getSession(userData)?.isPioOpen()) {
        return getIResponseObject(false, "Cannot open new PIO, because a PIO is already open", userData, 2);
    } else {
        try {
            sessionManager.getSession(userData)?.openPio(xmlString);
            const readingErrors: number = sessionManager.getSession(userData)?.pio?.readXmlErrors.length as number;
            const pioSmallExclusions: number = sessionManager.getSession(userData)?.pio
                ?.numberOfPioSmallExclusions as number;
            const message: string =
                "PIO successfully opened (reading errors: " +
                readingErrors +
                ", pio small exclusions: " +
                pioSmallExclusions +
                ")";
            return getIResponseObject(true, message, userData);
        } catch (error) {
            return getIResponseObject(
                false,
                "PIO could not be opened due to following error: " + getErrorMessage(error),
                userData,
                0
            );
        }
    }
};

/**
 * Controller for closing a PIO which is currently open in a session.
 * @param {IUserData | undefined} _userData User data of the user
 * @returns {IResponse} A response object
 */
const closePIO = (_userData: IUserData | undefined): IResponse => {
    const validateObject: IUserData | IResponse = validateUserData(_userData);
    if (!validateObject.hasOwnProperty("firstName")) return validateObject as IResponse;
    const userData: IUserData = validateObject as IUserData;

    if (sessionManager.getSession(userData)?.isPioOpen()) {
        try {
            sessionManager.getSession(userData)?.closePio();
            return getIResponseObject(true, "PIO successfully closed", userData);
        } catch (error) {
            return getIResponseObject(
                false,
                "PIO could not be closed due to following error: " + getErrorMessage(error),
                _userData as IUserData,
                0
            );
        }
    } else {
        return getIResponseObject(false, "No open PIO exists. Can't close PIO.", userData, 3);
    }
};

/**
 * Controller for checking whether a PIO is open.
 * @param {IUserData | undefined} _userData User data of the user
 * @returns {IResponse} A response object
 */
const isPIOOpen = (_userData: IUserData | undefined): IResponse => {
    const validateObject: IUserData | IResponse = validateUserData(_userData);
    if (!validateObject.hasOwnProperty("firstName")) return validateObject as IResponse;
    const userData: IUserData = validateObject as IUserData;
    try {
        if (sessionManager.getSession(userData)?.isPioOpen()) {
            return getIResponseObject(true, "PIO is open", userData, undefined, undefined, undefined, false);
        } else {
            return getIResponseObject(false, "PIO is not open", userData, undefined, undefined, undefined, false);
        }
    } catch (error) {
        return getIResponseObject(
            false,
            "Could not check whether PIO is open due to following error: " + getErrorMessage(error),
            userData,
            0,
            undefined,
            undefined,
            false
        );
    }
};

/**
 * Controller for generating an empty PIO. Will generate an empty RootObject which must be stored in backend for
 * specific session.
 * @param {IUserData | undefined} _userData User data of the user
 * @returns {IResponse} A response object
 */
const createEmptyPIO = (_userData: IUserData | undefined): IResponse => {
    const validateObject: IUserData | IResponse = validateUserData(_userData);
    if (!validateObject.hasOwnProperty("firstName")) return validateObject as IResponse;
    const userData: IUserData = validateObject as IUserData;

    if (sessionManager.getSession(userData)?.isPioOpen()) {
        return getIResponseObject(false, "Can not open a new pio, because another PIO is already open", userData, 2);
    } else {
        try {
            sessionManager.getSession(userData)?.newPio();
            return getIResponseObject(true, "New PIO successfully created", userData);
        } catch (error) {
            return getIResponseObject(
                false,
                "New PIO could not be created due to following error: " + getErrorMessage(error),
                userData,
                0
            );
        }
    }
};

/**
 * Controller for integrating one or multiple SubTree objects to the RootObject of a specific session. Every time, when
 * a subTree is integrated, the session time gets reset. The session closes after a fixed time interval of inactivity.
 * @param {IUserData | undefined} _userData User data of the user
 * @param {object[]} objects unconverted SubTree objects for integration
 * @returns {IResponse} A response object
 */
const integrateSubTreeInRootObject = (_userData: IUserData | undefined, objects: object[]): IResponse => {
    const validateObject: IUserData | IResponse = validateUserData(_userData);
    if (!validateObject.hasOwnProperty("firstName")) return validateObject as IResponse;
    const userData: IUserData = validateObject as IUserData;

    if (sessionManager.getSession(userData)?.isPioOpen()) {
        try {
            const subTrees: SubTree[] = objects.map((item: object) => {
                return transformToSubTree(item);
            });

            sessionManager.getSession(userData)?.renewSessionTime();
            sessionManager.getSession(userData)?.saveSubTrees(subTrees);
            return getIResponseObject(
                true,
                "SubTrees successfully integrated",
                userData,
                undefined,
                undefined,
                undefined,
                false
            );
        } catch (error) {
            return getIResponseObject(
                false,
                "SubTrees could not be saved due to following error: " + getErrorMessage(error),
                userData,
                0
            );
        }
    } else {
        return getIResponseObject(
            false,
            "Couldn't integrate SubTrees, because no PIO is open",
            userData,
            3,
            undefined,
            undefined,
            false
        );
    }
};

/**
 * Controller for deleting one or multiple SubTree objects from the RootObject of a specific session.
 * @param {IUserData | undefined} _userData User data of the user
 * @param {object[]} objects unconverted SubTree objects for integration
 * @returns {IResponse} A response object
 */
const deleteSubTreeFromRootObject = (_userData: IUserData | undefined, objects: object[]): IResponse => {
    const validateObject: IUserData | IResponse = validateUserData(_userData);
    if (!validateObject.hasOwnProperty("firstName")) return validateObject as IResponse;
    const userData: IUserData = validateObject as IUserData;

    if (sessionManager.getSession(userData)?.isPioOpen()) {
        try {
            const subTrees: SubTree[] = objects.map((item: object) => {
                return transformToSubTree(item);
            });

            sessionManager.getSession(userData)?.deleteSubTrees(subTrees);
            return getIResponseObject(
                true,
                "SubTrees successfully deleted",
                userData,
                undefined,
                undefined,
                undefined,
                false
            );
        } catch (error) {
            return getIResponseObject(
                false,
                "SubTrees could not be deleted due to following error: " + getErrorMessage(error),
                userData,
                0
            );
        }
    } else {
        return getIResponseObject(
            false,
            "Couldn't delete SubTrees, because no PIO is open",
            userData,
            3,
            undefined,
            undefined,
            false
        );
    }
};

/**
 * Controller for getting a new SubTree object. Will extract new SubTree out of the RootObject of a specific session.
 * @param {IUserData | undefined} _userData User data of the user
 * @param {string[]} paths Absolute paths for SubTree generation in an array
 * @returns {IResponse} A response object including the SubTress as data
 */
const getNewSubTree = (_userData: IUserData | undefined, paths: string[]): IResponse => {
    const validateObject: IUserData | IResponse = validateUserData(_userData);
    if (!validateObject.hasOwnProperty("firstName")) return validateObject as IResponse;
    const userData: IUserData = validateObject as IUserData;

    if (sessionManager.getSession(userData)?.isPioOpen()) {
        try {
            const subTrees: SubTree[] | undefined = sessionManager.getSession(userData)?.getSubTrees(paths);
            if (subTrees) {
                return getIResponseObject(
                    true,
                    "SubTrees successfully requested",
                    userData,
                    undefined,
                    {
                        subTrees: addInformationAboutPrimitiveDataTypes(subTrees),
                    },
                    undefined,
                    false
                );
            } else {
                return getIResponseObject(
                    false,
                    "SubTrees could not be requested  from the current session",
                    userData,
                    0
                );
            }
        } catch (error) {
            return getIResponseObject(
                false,
                "SubTrees could not be requested due to following error: " + getErrorMessage(error),
                userData,
                0
            );
        }
    } else {
        return getIResponseObject(
            false,
            "Couldn't get SubTrees, because no PIO is open",
            userData,
            3,
            undefined,
            undefined,
            false
        );
    }
};

/**
 * Controller for exporting the RootObject to xml-string.
 * @param {IUserData | undefined} _userData User data of the user
 * @returns {IResponse} A response object including the XML-string (=PIO) as data
 */
const exportToXmlString = (_userData: IUserData | undefined): IResponse => {
    const validateObject: IUserData | IResponse = validateUserData(_userData);
    if (!validateObject.hasOwnProperty("firstName")) return validateObject as IResponse;
    const userData: IUserData = validateObject as IUserData;

    if (sessionManager.getSession(userData)?.isPioOpen()) {
        try {
            return getIResponseObject(true, "PIO successfully exported", userData, undefined, {
                xmlString: sessionManager.getSession(userData)?.exportPio() as string,
            });
        } catch (error) {
            return getIResponseObject(
                false,
                "PIO could not be exported due to following error: " + getErrorMessage(error),
                userData,
                0
            );
        }
    } else {
        return getIResponseObject(
            false,
            "Couldn't export PIO, because no PIO is open",
            userData,
            3,
            undefined,
            undefined,
            false
        );
    }
};

/**
 * Controller for adding a new author to the currently opened PIO.
 * @param {IUserData | undefined} _userData User data of the user
 * @param {string} uuid Uuid to be added to author list in pio header data
 * @returns {IResponse} A response object
 */
const addAuthor = (_userData: IUserData | undefined, uuid: string): IResponse => {
    const validateObject: IUserData | IResponse = validateUserData(_userData);
    if (!validateObject.hasOwnProperty("firstName")) return validateObject as IResponse;
    const userData: IUserData = validateObject as IUserData;

    if (sessionManager.getSession(userData)?.isPioOpen()) {
        try {
            //Check whether author uuid already exists
            const currentUuids: string[] | undefined = sessionManager.getSession(userData)?.getAllAuthorUuids();
            if (currentUuids && currentUuids.includes(uuid)) {
                return getIResponseObject(true, "Author not added, because uuid already exists as author", userData);
            }
            //Try to add author
            sessionManager.getSession(userData)?.addAuthor(uuid);
            return getIResponseObject(true, "Author successfully added", userData);
        } catch (error) {
            return getIResponseObject(
                false,
                "Author could not be added due to following error: " + getErrorMessage(error),
                userData,
                0
            );
        }
    } else {
        return getIResponseObject(
            false,
            "Can not add author, because no PIO is open",
            userData,
            3,
            undefined,
            undefined,
            false
        );
    }
};

/**
 * Controller for deleting an author by uuid from the currently opened PIO (pio header data).
 * @param {IUserData | undefined} _userData User data of the user
 * @param {string} uuid Uuid as string referring to the author resource
 * @returns {IResponse} A response object
 */
const deleteAuthor = (_userData: IUserData | undefined, uuid: string): IResponse => {
    const validateObject: IUserData | IResponse = validateUserData(_userData);
    if (!validateObject.hasOwnProperty("firstName")) return validateObject as IResponse;
    const userData: IUserData = validateObject as IUserData;
    if (sessionManager.getSession(userData)?.isPioOpen()) {
        try {
            sessionManager.getSession(userData)?.deleteAuthor(uuid);
            return getIResponseObject(true, "Author successfully deleted", userData);
        } catch (error) {
            return getIResponseObject(
                false,
                "Author could not be deleted due to following error: " + getErrorMessage(error),
                userData,
                0
            );
        }
    } else {
        return getIResponseObject(
            false,
            "Can not delete author, because no PIO is open",
            userData,
            3,
            undefined,
            undefined,
            false
        );
    }
};

/**
 * Controller for getting all author uuids from the currently opened PIO (pio header data).
 * @param {IUserData | undefined} _userData User data of the user
 * @returns {IResponse} A response object
 */
const getAllAuthorUuids = (_userData: IUserData | undefined): IResponse => {
    const validateObject: IUserData | IResponse = validateUserData(_userData);
    if (!validateObject.hasOwnProperty("firstName")) return validateObject as IResponse;
    const userData: IUserData = validateObject as IUserData;

    if (sessionManager.getSession(userData)?.isPioOpen()) {
        try {
            return getIResponseObject(
                true,
                "Author uuids successfully requested",
                userData,
                undefined,
                { uuids: sessionManager.getSession(userData)?.getAllAuthorUuids() as string[] },
                undefined,
                false
            );
        } catch (error) {
            return getIResponseObject(
                false,
                "Could not get author uuids due to following error: " + getErrorMessage(error),
                userData,
                0,
                undefined,
                undefined,
                false
            );
        }
    } else {
        return getIResponseObject(
            false,
            "Can not get author uuids, because no PIO is open",
            userData,
            3,
            undefined,
            undefined,
            false
        );
    }
};

/**
 * Controller for setting the receiving institution of the currently opened PIO.
 * @param {IUserData | undefined} _userData User data of the user
 * @param {string} uuid Uuid to be set in pio header data
 * @returns {IResponse} A response object
 */
const setReceivingInstitution = (_userData: IUserData | undefined, uuid: string): IResponse => {
    const validateObject: IUserData | IResponse = validateUserData(_userData);
    if (!validateObject.hasOwnProperty("firstName")) return validateObject as IResponse;
    const userData: IUserData = validateObject as IUserData;

    if (sessionManager.getSession(userData)?.isPioOpen()) {
        try {
            sessionManager.getSession(userData)?.setReceivingInstitution(uuid);
            return getIResponseObject(true, "Receiving institution successfully set", userData);
        } catch (error) {
            return getIResponseObject(
                false,
                "Setting receiving institution failed due to following error: " + getErrorMessage(error),
                userData,
                0
            );
        }
    } else {
        return getIResponseObject(
            false,
            "Can not set receiving institution, because no PIO is open",
            userData,
            3,
            undefined,
            undefined,
            false
        );
    }
};

/**
 * Controller for clearing the receiving institution of the currently opened PIO.
 * @param {IUserData | undefined} _userData User data of the user
 * @returns {IResponse} A response object
 */
const clearReceivingInstitution = (_userData: IUserData | undefined): IResponse => {
    const validateObject: IUserData | IResponse = validateUserData(_userData);
    if (!validateObject.hasOwnProperty("firstName")) return validateObject as IResponse;
    const userData: IUserData = validateObject as IUserData;

    if (sessionManager.getSession(userData)?.isPioOpen()) {
        try {
            sessionManager.getSession(userData)?.clearReceivingInstitution();
            return getIResponseObject(true, "Receiving institution successfully cleared", userData);
        } catch (error) {
            return getIResponseObject(
                false,
                "Could not clear receiving institution due to following error: " + getErrorMessage(error),
                userData,
                0
            );
        }
    } else {
        return getIResponseObject(
            false,
            "Can not clear receiving institution, because no PIO is open",
            userData,
            3,
            undefined,
            undefined,
            false
        );
    }
};

/**
 * Controller for getting the uuid of the receiving institution from the currently opened PIO (pio header data).
 * @param {IUserData | undefined} _userData User data of the user
 * @returns {IResponse} A response object
 */
const getReceivingInstitution = (_userData: IUserData | undefined): IResponse => {
    const validateObject: IUserData | IResponse = validateUserData(_userData);
    if (!validateObject.hasOwnProperty("firstName")) return validateObject as IResponse;
    const userData: IUserData = validateObject as IUserData;

    if (sessionManager.getSession(userData)?.isPioOpen()) {
        try {
            return getIResponseObject(
                true,
                "Receiving institution successfully requested",
                userData,
                undefined,
                { uuid: sessionManager.getSession(userData)?.getReceivingInstitution() as string },
                undefined,
                false
            );
        } catch (error) {
            return getIResponseObject(
                false,
                "Could not get receiving institution due to following error: " + getErrorMessage(error),
                userData,
                0,
                undefined,
                undefined,
                false
            );
        }
    } else {
        return getIResponseObject(
            false,
            "Can not get uuid of receiving institution, because no PIO is open",
            userData,
            3,
            undefined,
            undefined,
            false
        );
    }
};

/**
 * Controller for adding a new given device to the composition data.
 * @param {IUserData | undefined} _userData User data of the user
 * @param {string} uuid UUid to be added
 * @param {string} resourceType Key where the uuid should be added (e.g. KBV_PR_MIO_ULB_Device_Aid)
 * @returns {IResponse} A response object
 */
const addGivenDevice = (_userData: IUserData | undefined, uuid: string, resourceType: string): IResponse => {
    const validateObject: IUserData | IResponse = validateUserData(_userData);
    if (!validateObject.hasOwnProperty("firstName")) return validateObject as IResponse;
    const userData: IUserData = validateObject as IUserData;

    if (sessionManager.getSession(userData)?.isPioOpen()) {
        try {
            sessionManager.getSession(userData)?.pio?.header.addGivenDevice(uuid, resourceType);
            return getIResponseObject(true, "Successfully added given device (" + resourceType + ")", userData);
        } catch (error) {
            return getIResponseObject(
                false,
                "Could not add given device due to following error " + getErrorMessage(error),
                userData,
                0
            );
        }
    } else {
        return getIResponseObject(
            false,
            "Can not add given device, because no PIO is open",
            userData,
            3,
            undefined,
            undefined,
            false
        );
    }
};

/**
 * Controller for deleting a given device from the composition data.
 * @param {IUserData | undefined} _userData User data of the user
 * @param {string} uuid UUid to be deleted
 * @param {string} resourceType Key where the uuid should be deleted (e.g. KBV_PR_MIO_ULB_Device_Aid)
 * @returns {IResponse} A response object
 */
const deleteGivenDevice = (_userData: IUserData | undefined, uuid: string, resourceType: string): IResponse => {
    const validateObject: IUserData | IResponse = validateUserData(_userData);
    if (!validateObject.hasOwnProperty("firstName")) return validateObject as IResponse;
    const userData: IUserData = validateObject as IUserData;

    if (sessionManager.getSession(userData)?.isPioOpen()) {
        try {
            sessionManager.getSession(userData)?.pio?.header.deleteGivenDevice(uuid, resourceType);
            return getIResponseObject(true, "Successfully deleted given device (" + resourceType + ")", userData);
        } catch (error) {
            return getIResponseObject(
                false,
                "Could not delete given device due to following error " + getErrorMessage(error),
                userData,
                0
            );
        }
    } else {
        return getIResponseObject(
            false,
            "Can not delete given device, because no PIO is open",
            userData,
            3,
            undefined,
            undefined,
            false
        );
    }
};

/**
 * Controller for getting all given devices of one type from the composition data.
 * @param {IUserData | undefined} _userData User data of the user
 * @param {string} resourceType Key where the uuid should be requested (e.g. KBV_PR_MIO_ULB_Device_Aid)
 * @returns {IResponse} A response object
 */
const getGivenDevices = (_userData: IUserData | undefined, resourceType: string): IResponse => {
    const validateObject: IUserData | IResponse = validateUserData(_userData);
    if (!validateObject.hasOwnProperty("firstName")) return validateObject as IResponse;
    const userData: IUserData = validateObject as IUserData;

    if (sessionManager.getSession(userData)?.isPioOpen()) {
        try {
            return getIResponseObject(
                true,
                "Successfully requested given devices of type " + resourceType,
                userData,
                undefined,
                {
                    uuids: sessionManager.getSession(userData)?.pio?.header.getGivenDevices(resourceType) as string[],
                },
                undefined,
                false
            );
        } catch (error) {
            return getIResponseObject(
                false,
                "Could not request given devices due to following error " + getErrorMessage(error),
                userData,
                0,
                undefined,
                undefined,
                false
            );
        }
    } else {
        return getIResponseObject(
            false,
            "Can not request given devices, because no PIO is open",
            userData,
            3,
            undefined,
            undefined,
            false
        );
    }
};

/**
 * Controller for getting all given devices from composition data.
 * @param {IUserData | undefined} _userData User data of the user
 * @returns {IResponse} A response object
 */
const getAllGivenDevices = (_userData: IUserData | undefined): IResponse => {
    const validateObject: IUserData | IResponse = validateUserData(_userData);
    if (!validateObject.hasOwnProperty("firstName")) return validateObject as IResponse;
    const userData: IUserData = validateObject as IUserData;

    if (sessionManager.getSession(userData)?.isPioOpen()) {
        try {
            return getIResponseObject(
                true,
                "Successfully requested all given devices",
                userData,
                undefined,
                {
                    allGivenDevices: sessionManager
                        .getSession(userData)
                        ?.pio?.header.getAllGivenDevices() as IGivenDevices,
                },
                undefined,
                false
            );
        } catch (error) {
            return getIResponseObject(
                false,
                "Could not request all given devices due to following error " + getErrorMessage(error),
                userData,
                0,
                undefined,
                undefined,
                false
            );
        }
    } else {
        return getIResponseObject(
            false,
            "Can not request all given devices, because no PIO is open",
            userData,
            3,
            undefined,
            undefined,
            false
        );
    }
};

/**
 * Controller for getting all used uuids in the PIO.
 * @param {IUserData | undefined} _userData User data of the user
 * @returns {IResponse} A response object including an object with all uuids and their FHIR resource type as data
 */
const getAllUuids = (_userData: IUserData | undefined): IResponse => {
    const validateObject: IUserData | IResponse = validateUserData(_userData);
    if (!validateObject.hasOwnProperty("firstName")) return validateObject as IResponse;
    const userData: IUserData = validateObject as IUserData;

    if (sessionManager.getSession(userData)?.isPioOpen()) {
        try {
            return getIResponseObject(
                true,
                "UUIDs successfully requested",
                userData,
                undefined,
                { uuids: sessionManager.getSession(userData)?.pio?.getAllUuids() as object },
                undefined,
                false
            );
        } catch (error) {
            return getIResponseObject(
                false,
                "Could not get all uuids due to following error: " + getErrorMessage(error),
                userData,
                0
            );
        }
    } else {
        return getIResponseObject(
            false,
            "Can not get all uuids, because no PIO is open",
            userData,
            3,
            undefined,
            undefined,
            false
        );
    }
};

/**
 * Controller for getting all readXmlErrors which occurred during importing a xml file.
 * @param {IUserData | undefined} _userData User data of the user
 * @returns {IResponse} A response object including an object with all readXmlErrors
 */
const getReadXmlErrors = (_userData: IUserData | undefined): IResponse => {
    const validateObject: IUserData | IResponse = validateUserData(_userData);
    if (!validateObject.hasOwnProperty("firstName")) return validateObject as IResponse;
    const userData: IUserData = validateObject as IUserData;
    try {
        if (sessionManager.getSession(userData)?.isPioOpen()) {
            return getIResponseObject(
                true,
                "readXmlErrors successfully requested",
                userData,
                undefined,
                { readXmlErrors: sessionManager.getSession(userData)?.pio?.readXmlErrors as ErrorPath[] },
                undefined,
                false
            );
        } else {
            return getIResponseObject(
                false,
                "Can not get readXmlErrors, because no PIO is open",
                userData,
                3,
                undefined,
                undefined,
                false
            );
        }
    } catch (error) {
        return getIResponseObject(
            false,
            "Could not get readXmlErrors due to following error: " + getErrorMessage(error),
            userData,
            0
        );
    }
};

/**
 * Controller for getting all pioSmallExclusions which occurred during importing a xml file.
 * @param {IUserData | undefined} _userData User data of the user
 * @returns {IResponse} A response object including an object with all pioSmallExclusions
 */
const getPioSmallExclusions = (_userData: IUserData | undefined): IResponse => {
    const validateObject: IUserData | IResponse = validateUserData(_userData);
    if (!validateObject.hasOwnProperty("firstName")) return validateObject as IResponse;
    const userData: IUserData = validateObject as IUserData;

    if (sessionManager.getSession(userData)?.isPioOpen()) {
        try {
            return getIResponseObject(
                true,
                "pioSmallExclusions successfully requested",
                userData,
                undefined,
                { pioSmallExclusions: sessionManager.getSession(userData)?.pio?.pioSmallExclusions as PioSmallErrors },
                undefined,
                false
            );
        } catch (error) {
            return getIResponseObject(
                false,
                "Could not get pioSmallExclusions due to following error: " + getErrorMessage(error),
                userData,
                0
            );
        }
    } else {
        return getIResponseObject(
            false,
            "Can not get pioSmallExclusions, because no PIO is open",
            userData,
            3,
            undefined,
            undefined,
            false
        );
    }
};

/**
 * Controller for adding a new address book item.
 * @param {IUserData | undefined} _userData User data of the user
 * @param {object} data Address book item for adding
 * @returns {IResponse} A response object
 */
const addAddressBookItem = async (_userData: IUserData | undefined, data: object): Promise<IResponse> => {
    const validateObject: IUserData | IResponse = validateUserData(_userData);
    if (!validateObject.hasOwnProperty("firstName")) return validateObject as IResponse;
    const userData: IUserData = validateObject as IUserData;
    try {
        await AddressBookHandler.createResource(data as IOrganizationObject);
        return getIResponseObject(true, "Organization successfully added to database", userData);
    } catch (error) {
        return getIResponseObject(
            false,
            "Failed to add organization resource to database due to following error: " + getErrorMessage(error),
            userData,
            0
        );
    }
};

/**
 * Controller for adding multiple new address book item.
 * @param {IUserData | undefined} _userData User data of the user
 * @param {object} data Address book item for adding
 * @returns {IResponse} A response object
 */
const addAddressBookItems = async (_userData: IUserData | undefined, data: object): Promise<IResponse> => {
    const validateObject: IUserData | IResponse = validateUserData(_userData);
    if (!validateObject.hasOwnProperty("firstName")) return validateObject as IResponse;
    const userData: IUserData = validateObject as IUserData;
    try {
        await AddressBookHandler.createResources(data as IOrganizationObject[]);
        return getIResponseObject(
            true,
            `${(data as IOrganizationObject[]).length} x Organizations successfully added to database`,
            userData
        );
    } catch (error) {
        return getIResponseObject(
            false,
            `Failed to add ${(data as IOrganizationObject[]).length} x Organizations to database due to following error: ${getErrorMessage(error)}`,
            userData,
            0
        );
    }
};

/**
 * Controller for updating an existing address book item.
 * @param {IUserData | undefined} _userData User data of the user
 * @param {string} id Unique id to specify the address book item which should be updated
 * @param {object} data Address book item for updating
 * @returns {IResponse} A response object
 */
const updateAddressBookItem = async (
    _userData: IUserData | undefined,
    id: string,
    data: object
): Promise<IResponse> => {
    const validateObject: IUserData | IResponse = validateUserData(_userData);
    if (!validateObject.hasOwnProperty("firstName")) return validateObject as IResponse;
    const userData: IUserData = validateObject as IUserData;
    try {
        await AddressBookHandler.updateResource(id, data as IOrganizationObject);
        return getIResponseObject(true, "Organization successfully updated in database", userData);
    } catch (error) {
        return getIResponseObject(
            false,
            "Failed to update organization resource in database due to following error: " + getErrorMessage(error),
            userData,
            0
        );
    }
};

/**
 * Controller for updating an existing address book items.
 * @param {IUserData | undefined} _userData User data of the user
 * @param {object} data Address book item for updating
 * @returns {IResponse} A response object
 */
const updateAddressBookItems = async (
    _userData: IUserData | undefined,
    data: { uuid: string; data: IOrganizationObject }[]
): Promise<IResponse> => {
    const validateObject: IUserData | IResponse = validateUserData(_userData);
    if (!validateObject.hasOwnProperty("firstName")) return validateObject as IResponse;
    const userData: IUserData = validateObject as IUserData;
    try {
        await AddressBookHandler.updateResources(data);
        return getIResponseObject(true, "Organization successfully updated in database", userData);
    } catch (error) {
        return getIResponseObject(
            false,
            "Failed to update multiple organization resources in database due to following error: " +
                getErrorMessage(error),
            userData,
            0
        );
    }
};

/**
 * Controller for deleting an existing address book item.
 * @param {IUserData | undefined} _userData User data of the user
 * @param {string} id Unique id to specify the address book item which should be deleted
 * @returns {IResponse} A response object
 */
const deleteAddressBookItem = async (_userData: IUserData | undefined, id: string): Promise<IResponse> => {
    const validateObject: IUserData | IResponse = validateUserData(_userData);
    if (!validateObject.hasOwnProperty("firstName")) return validateObject as IResponse;
    const userData: IUserData = validateObject as IUserData;
    try {
        await AddressBookHandler.deleteResource(id);
        return getIResponseObject(true, "Organization successfully deleted from database", userData);
    } catch (error) {
        return getIResponseObject(
            false,
            "Failed to delete organization resource from database due to following error: " + getErrorMessage(error),
            userData,
            0
        );
    }
};

/**
 * Controller for deleting all existing address book items of one type.
 * @param {IUserData | undefined} _userData User data of the user
 * @returns {IResponse} A response object
 */
const deleteAllAddressBookItem = async (_userData: IUserData | undefined): Promise<IResponse> => {
    const validateObject: IUserData | IResponse = validateUserData(_userData);
    if (!validateObject.hasOwnProperty("firstName")) return validateObject as IResponse;
    const userData: IUserData = validateObject as IUserData;
    try {
        await AddressBookHandler.deleteAllResource();
        return getIResponseObject(true, "All organizations successfully deleted from database", userData);
    } catch (error) {
        return getIResponseObject(
            false,
            "Failed to delete all organizations from database due to following error: " + getErrorMessage(error),
            userData,
            0
        );
    }
};

/**
 * Controller for getting all address book items of one specific type.
 * @param {IUserData | undefined} _userData User data of the user
 * @returns {IResponse} A response object including data about all address book items
 */
const getAllAddressBookItems = async (_userData: IUserData | undefined): Promise<IResponse> => {
    const validateObject: IUserData | IResponse = validateUserData(_userData);
    if (!validateObject.hasOwnProperty("firstName")) return validateObject as IResponse;
    const userData: IUserData = validateObject as IUserData;
    try {
        return getIResponseObject(true, "All organizations successfully requested", userData, undefined, {
            items: await AddressBookHandler.getAllResources(),
        });
    } catch (error) {
        return getIResponseObject(
            false,
            "Failed to request all organizations due to following error: " + getErrorMessage(error),
            userData,
            0
        );
    }
};

/**
 * Controller for checking the availability of uuids.
 * @param {IUserData | undefined} _userData User data of the user
 * @param {string} id Id for checking
 * @returns {IResponse} A response object including a true/false flag
 */
const doesUuidExistInAddressBook = async (_userData: IUserData | undefined, id: string): Promise<IResponse> => {
    const validateObject: IUserData | IResponse = validateUserData(_userData);
    if (!validateObject.hasOwnProperty("firstName")) return validateObject as IResponse;
    const userData: IUserData = validateObject as IUserData;
    try {
        return getIResponseObject(true, "Availability of uuid successfully checked", userData, undefined, {
            doesExist: await AddressBookHandler.doesIdExist(id, true),
        });
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        return getIResponseObject(
            false,
            "Failed to check availability of uuid due to following error: " + errorMessage,
            userData,
            0,
            undefined,
            undefined,
            true
        );
    }
};

/**
 * Controller for getting the PDF file containing technical limitations about the PIO editor.
 * @returns {IResponse} A response object including the pdf data
 */
const getLimitationsPDF = (): IResponse => {
    try {
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        const dataToSend: Buffer = fs.readFileSync(`${projectRoot}/assets/PIOEditorLimitationenMitAnhang.pdf`);
        return {
            success: true,
            message: "PDF successfully requested",
            data: { pdf: dataToSend },
        } as IResponse;
    } catch (error) {
        const errorMessage: string = getErrorMessage(error);
        return {
            success: false,
            message: "Unable to request PDF due to following error: " + errorMessage,
            errorCode: 0,
        } as IResponse;
    }
};

const validatePIO = async (_userData: IUserData | undefined, xmlString: string): Promise<IResponse> => {
    const validateObject: IUserData | IResponse = validateUserData(_userData);
    if (!validateObject.hasOwnProperty("firstName")) return validateObject as IResponse;

    return await ValidatorService.validatePIO(xmlString);
};

const sendContactMail = async (name: string, email: string, message: string): Promise<boolean> => {
    const transporter: Mail<SMTPTransport.SentMessageInfo> = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT as string),
        secure: process.env.SMTP_SECURE === "true",
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
        debug: true,
    });

    const mailOptions: Mail.Options = {
        from: {
            name: "PIO-Editor",
            address: process.env.SENDER_MAIL || "",
        },
        to: process.env.CONTACT_MAIL,
        subject: "Kontaktformular PIO-Editor",
        text: `Name: ${name || "Anonymous"}\nE-Mail: ${email || "Not provided"}\n\n${message}`,
    };

    if (email !== "" && email != null) {
        try {
            const verificationMailOptions: Mail.Options = {
                from: {
                    name: "PIO-Editor",
                    address: process.env.SENDER_MAIL || "",
                },
                to: email,
                subject: "Vielen Dank für Ihre Nachricht",
                text: `Vielen Dank für Ihre Nachricht! Falls notwendig melden wir uns bei Ihnen.\n\n\n
                =====================Ihre Nachricht======================\n
                Name: ${name || "Anonymous"}\n
                E-Mail: ${email || "Not provided"}\n\n
                ${message}`,
            };

            await transporter.sendMail(verificationMailOptions);
        } catch (error) {
            console.error("Error while sending verification mail: " + error);
        }
    }

    return transporter
        .sendMail(mailOptions)
        .then((): boolean => {
            return true;
        })
        .catch((error: Error): boolean => {
            console.error("Error while sending contact mail: " + error.message);
            return false;
        });
};

const generateCaptcha = (): CaptchaObj => {
    const captchaOptions: ConfigObject = {
        size: 6,
        ignoreChars: "0o1i",
        noise: 3,
        background: "#fff",
        width: 300,
        height: 125,
        fontSize: 150,
    };
    return svgCaptcha.create(captchaOptions);
};

export {
    imreadXmlString,
    createEmptyPIO,
    integrateSubTreeInRootObject,
    getNewSubTree,
    exportToXmlString,
    openSession,
    closeSession,
    closePIO,
    addAuthor,
    getAllUuids,
    isPIOOpen,
    isSessionOpen,
    addAddressBookItem,
    addAddressBookItems,
    updateAddressBookItem,
    updateAddressBookItems,
    deleteAddressBookItem,
    deleteAllAddressBookItem,
    getAllAddressBookItems,
    doesUuidExistInAddressBook,
    deleteSubTreeFromRootObject,
    deleteAuthor,
    getAllAuthorUuids,
    setReceivingInstitution,
    clearReceivingInstitution,
    getReceivingInstitution,
    renewSessionTime,
    addGivenDevice,
    deleteGivenDevice,
    getGivenDevices,
    getAllGivenDevices,
    getPioSmallExclusions,
    getReadXmlErrors,
    checkSession,
    getLimitationsPDF,
    validatePIO,
    sendContactMail,
    generateCaptcha,
};
