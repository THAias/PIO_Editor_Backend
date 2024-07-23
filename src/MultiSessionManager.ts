import { Session } from "./Session";
import { IUserData } from "@thaias/pio_editor_meta";
import { SESSION_TIME_LOCAL_VERSION_NUMBER, SESSION_TIME_WEB_VERSION_NUMBER } from "./GlobalVariables";

/**
 * Generates, manages and deletes multiple Sessions.
 * @property {Session[]} sessions Array of Session instances. The user data (first and last name) is used as unique id.
 * @property {number} maxDurationOfSession Maximum duration for all Sessions (default = 24h)
 */
export class MultiSessionManager {
    sessions: Session[];
    maxDurationOfSession: number;

    constructor() {
        this.sessions = [] as Session[];
        this.maxDurationOfSession =
            process.env.VERSION_ENV === "webVersion"
                ? SESSION_TIME_WEB_VERSION_NUMBER
                : SESSION_TIME_LOCAL_VERSION_NUMBER;
    }

    /**
     * Method to validate a session against user data.
     * @param {Session} session A session object
     * @param {IUserData} userData IUserData interface which will be compared to the session object
     * @returns {boolean} True, if session belongs to stated user data. In "webVersion" mode the fingerPrint property is
     * taken into account, in "localVersion" mode not.
     */
    private doesSessionBelongToUserData = (session: Session, userData: IUserData): boolean => {
        if (process.env.VERSION_ENV === "webVersion") {
            return (
                session.userData.firstName === userData.firstName &&
                session.userData.lastName === userData.lastName &&
                session.userData.fingerPrint === userData.fingerPrint
            );
        } else {
            return session.userData.firstName === userData.firstName && session.userData.lastName === userData.lastName;
        }
    };

    /**
     * Adds a new session to the sessions array.
     * @param {IUserData} userData Data of the user who wants to open a new session
     * @remarks The method can throw an error, if userData already exist. UserData needs to be unique
     */
    addSession = (userData: IUserData): void => {
        if (this.sessions.find((item: Session) => this.doesSessionBelongToUserData(item, userData)) !== undefined) {
            throw Error("Can not create new session because userName already exists");
        }
        this.sessions.push(new Session(userData, this.maxDurationOfSession));
    };

    /**
     * Method for getting a Session.
     * @param {IUserData} userData UserData of the Session which should be returned
     * @returns {Session | undefined} A Session instance or undefined, if no appropriate Session was found
     */
    getSession = (userData: IUserData): Session | undefined => {
        return this.sessions.find((item: Session) => this.doesSessionBelongToUserData(item, userData));
    };

    /**
     * Closes a specific Session identified by userData
     * @param {string} userData UserData of the Session which should be deleted
     * @remarks Method can throw an error, if no appropriate Session was found
     */
    deleteSession = (userData: IUserData): void => {
        const sessionIndex: number = this.sessions.findIndex((item: Session) =>
            this.doesSessionBelongToUserData(item, userData)
        );
        if (sessionIndex != -1) {
            this.sessions.splice(sessionIndex, 1);
        } else {
            throw Error(
                process.env.VERSION_ENV === "webVersion"
                    ? `Can not delete session! No session with passed user data (${userData.firstName} ${userData.lastName}, ${userData.fingerPrint}) found`
                    : `Can not delete session! No session with passed user data (${userData.firstName} ${userData.lastName}) found`
            );
        }
    };

    /**
     * Checks whether session with passed user data exists.
     * @param {IUserData} userData User data to check
     * @returns {boolean} True, if session exists, otherwise false
     */
    doesSessionExist = (userData: IUserData): boolean => {
        return this.sessions.find((item: Session) => this.doesSessionBelongToUserData(item, userData)) !== undefined;
    };

    /**
     * Deletes all Sessions, which are expired.
     * @returns {number} The number of sessions which were expired
     */
    cleanSessions = (): number => {
        const expiredSessionIds: number[] = [];
        this.sessions.forEach((item: Session, index: number) => {
            if (item.sessionStarted + item.maxDurationOfSession < Date.now()) {
                expiredSessionIds.push(index);
            }
        });
        expiredSessionIds.reverse();
        for (const id of expiredSessionIds) {
            this.sessions.splice(id, 1);
        }
        return expiredSessionIds.length;
    };
}
