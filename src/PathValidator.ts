import { getLookUpTable } from "./Helper";
import { validate as isValidUUID } from "uuid";

/** This class can be used for validating paths. Paths which can not be found in the lookup table are considered as
 * invalid.
 * @property {object} lookUpTable LookUp table which defines the PIO structure. Used for path validation
 * @property {string[]} invalidPaths All detected invalid paths are stored here
 */
export class PathValidator {
    lookUpTable: object;
    invalidPaths: string[];

    constructor() {
        this.lookUpTable = getLookUpTable();
        this.invalidPaths = [] as string[];
    }

    /**
     * Validates one path or an array of paths by comparing to the lookUpTable. The lookUpTable defines the PIO
     * structure according to the PIO specification.
     * @param {string | string[]} path Absolute path for validation
     * @returns {string[]} An array of all invalid paths
     * @remarks All invalid paths will be stored in class property 'invalidPaths' removing duplicates
     */
    validatePaths = (path: string | string[]): string[] => {
        const invalidPaths: string[] = [];

        if (path instanceof Array) {
            path.forEach((singlePath: string) => {
                if (!this.validateOnePath(singlePath)) {
                    invalidPaths.push(singlePath);
                }
            });
        } else {
            if (!this.validateOnePath(path)) {
                invalidPaths.push(path);
            }
        }

        //Save invalid paths and skip redundant paths
        invalidPaths.forEach((iP: string) => {
            if (!this.invalidPaths.includes(iP)) this.invalidPaths.push(iP);
        });

        return invalidPaths;
    };

    /** @returns {string[]} The class property 'invalidPaths' */
    getInvalidPaths = (): string[] => {
        return this.invalidPaths;
    };

    /** Resets the class property 'invalidPaths' to an empty array. */
    clearInvalidPaths = (): void => {
        this.invalidPaths = [];
    };

    /**
     * @returns {boolean} True, if path can be found in the lookup table, otherwise false.
     * @remarks All array notations (e.g. name[1]) and cake elements (e.g. identifier:pid) are removed from paths.
     */
    private validateOnePath = (path: string): boolean => {
        const splittedPath: string[] = path.split(".");
        const uuid: string = splittedPath[0];
        const mioResourceName: string = splittedPath[1];
        let lookUpTablePaths: string[];

        //Validate uuid
        if (!isValidUUID(uuid)) {
            return false;
        }

        //Get all paths of one resource and validate 'mioResourceName' at the same time
        try {
            lookUpTablePaths = Object.keys(this.lookUpTable[mioResourceName.toString()]["paths"]);
        } catch {
            return false;
        }

        //Check for header paths
        if (["@profile@", "@status@", "@div@", "@id@"].includes(splittedPath[2]) && splittedPath.length === 3) {
            return true;
        }

        //Remove uuid and array notation (e.g. name[1]) from path
        const searchPath: string = splittedPath
            .slice(1)
            .map((element: string) => {
                return element.split("[")[0];
            })
            .join(".");

        //Remove cake notation (e.g. extension:konfession or identifier:pid) from lookUpTable-paths
        const transformedLookUpTablePaths: string[] = lookUpTablePaths.map((singlePath: string) => {
            return singlePath
                .split(".")
                .map((element: string) => {
                    return element.split(":")[0];
                })
                .join(".");
        });

        return transformedLookUpTablePaths.includes(searchPath);
    };
}
