import { RootObject } from "./RootObject";
import { IUserData, UuidPIO, SubTree } from "@thaias/pio_editor_meta";

/**
 * This class represents a single Session, which is managed by the SessionManger. A Session makes it possible, to open
 * multiple sessions for different users by using the same backend. Every Session holds one RootObject max.
 * @property {IUserData} userData Holds a IUserData interface representing the logged-in user
 * @property {number} sessionStarted Time when the session was started (in milliseconds)
 * @property {number} maxDurationOfSession Maximum session duration of inactivity in milliseconds
 * @property {RootObject} pio Holds up to one RootObject representing a PIO
 */
export class Session {
    userData: IUserData;
    sessionStarted: number;
    maxDurationOfSession: number;
    pio?: RootObject;

    constructor(userData: IUserData, maxDuration: number) {
        this.userData = userData;
        this.sessionStarted = Date.now();
        this.maxDurationOfSession = maxDuration;
    }

    /** Opens a new PIO by generating a new RootObject without saving changes in the old RootObject. */
    newPio = (): void => {
        try {
            this.pio = new RootObject(this.userData);
        } catch (e) {
            throw Error("Can not create new PIO");
        }
    };

    /**
     * Exports a PIO by calling the 'toXML()' method of the RootObject.
     * @returns {string} An xml-string representing the finalized PIO
     */
    exportPio = (): string => {
        if (this.pio) {
            return this.pio.toXML();
        } else {
            return "";
        }
    };

    /** Closes the current PIO without saving changes. */
    closePio = (): void => {
        this.pio = undefined;
    };

    /** @returns {boolean} True, if a PIO is currently open */
    isPioOpen = (): boolean => {
        return !!this.pio;
    };

    /**
     * For getting one or multiple SubTrees.
     * @param {string[]} paths Input paths as strings (e.g. e029b2b8-5dc6-4feb-990a-7471fb9b54e3.KBV_PR_MIO_ULB_Patient.gender)
     * @return {SubTree[]} An array of SubTrees. SubTree at index 1 belongs to input path at index 1.
     */
    getSubTrees = (paths: string[]): SubTree[] => {
        if (this.pio && paths != null && paths.length > 0) {
            return this.pio.getSubTrees(paths);
        } else {
            return [] as SubTree[];
        }
    };

    /**
     * Will save all SubTree data to the RootObject.
     * @param {SubTree[]} subTrees Array of SubTrees which should be integrated to the RootObject
     */
    saveSubTrees = (subTrees: SubTree[]): void => {
        if (this.pio) {
            this.pio.saveSubTrees(subTrees);
        }
    };

    /**
     * WIll delete all SubTrees from the RootObject.
     * @param {SubTree[]} subTrees Array of SubTrees which should be deleted from the RootObject
     */
    deleteSubTrees = (subTrees: SubTree[]): void => {
        if (this.pio) {
            this.pio.deleteSubTrees(subTrees);
        }
    };

    /**
     * Will open a PIO.
     * @param {string} xmlString Xml string representing the PIO, which should be opened
     */
    openPio = (xmlString: string): void => {
        this.pio = RootObject.readXML(this.userData, xmlString);
    };

    /**
     * Will add an author to the currently opened PIO.
     * @param {string} uuid Uuid as string referring to the author resource
     */
    addAuthor = (uuid: string): void => {
        this.pio?.header.addAuthor(new UuidPIO(uuid));
    };

    /**
     * Will delete an author by uuid from the currently opened PIO.
     * @param {string} uuid Uuid as string referring to the author resource
     */
    deleteAuthor = (uuid: string): void => {
        this.pio?.header.deleteAuthor(uuid);
    };

    /**
     * Will return all author uuids from the currently opened PIO.
     * @returns {string[] | undefined} Array of author uuids. If no author is stated, an empty array is returned. If pio
     * is not open, undefined is returned.
     */
    getAllAuthorUuids = (): string[] | undefined => {
        return this.pio?.header.getAllAuthorUuids();
    };

    /**
     * Will set the receiving institution uuid of the currently opened PIO (header data).
     * @param {string} uuid Uuid as string to be set as receiving institution
     */
    setReceivingInstitution = (uuid: string): void => {
        this.pio?.header.setReceivingInstitution(new UuidPIO(uuid));
    };

    /** Will clear the receiving institution uuid of the currently opened PIO (header data). */
    clearReceivingInstitution = (): void => {
        this.pio?.header.clearReceivingInstitution();
    };

    /**
     * Will get the receiving institution uuid of the currently opened PIO (header data). Will throw an error, if no
     * receiving institution is stated.
     * @returns {string | undefined} The uuid of the receiving institution, or undefined, if pio is not open
     */
    getReceivingInstitution = (): string | undefined => {
        return this.pio?.header.getReceivingInstitution();
    };

    /** Will set the starting time of session to the current time. Session will expire in another 4h. */
    renewSessionTime = (): void => {
        this.sessionStarted = Date.now();
    };

    /**
     * Will return the number of minutes until session expires.
     * @returns {number} Number of minutes until session will expire
     */
    getRemainingSessionTime = (): number => {
        return (this.sessionStarted + this.maxDurationOfSession - Date.now()) / (1000 * 60);
    };
}
