import _ from "lodash";
import { StringPIO, UriPIO, RootObjectType, PrimitiveDataTypes, isPrimitiveDataType } from "@thaias/pio_editor_meta";
import { PathValidator } from "./PathValidator";

/**
 * This class holds all PIO data in PIOContent.data and is used as property in RootObject.
 * @property {RootObjectType} data Stores all PIO data as object. The object follows the structure of 'RootObjectType'
 * (see example)
 * @property {PathValidator} pV Instance of PathValidator class in order to validate all paths set by setValue() method
 *
 * @example Structure of type 'RootObjectType':
 * ```typescript
 * { e029b2b8-5dc6-4feb-990a-7471fb9b54e3: {
 *     KBV_PR_MIO_ULB_Patient: {
 *         @profile@: { _value: "https://fhir.kbv.de/StructureDefinition/KBV_PR_MIO_ULB_Patient" } as StringPIO,
 *         extension: [
 *             {
 *                 __url: { _value: "https://fhir.kbv.de/StructureDefinition/KBV_EX_MIO_ULB_Religion" } as UriPIO,
 *                 valueString: {
 *                     __value: { _value: "Römisch katholisch" } as StringPIO,
 *                 },
 *             }
 *         ],
 *         name: [
 *             {
 *                 use: {
 *                     __value: { _value: "official" } as CodePIO,
 *                 },
 *                 family: {
 *                     __value: { _value: "Schneider" } as StingPIO,
 *                 },
 *                 given: {
 *                     __value: { _value: "Peter" } as StingPIO,
 *                 },
 *             }
 *         ]
 *     }
 * } }
 * ```
 *
 * @remarks Primitive data types are stored under key '__value'. That is because library fast-xml-parser will interpret
 * prefix '__' and generate a xml attribute
 */
class PIOContent {
    data: RootObjectType = {};
    pV: PathValidator = new PathValidator();

    /** Inserts primitive data to the 'data' property according to the stated path.
     *  @param {string} path Absolute path under which the new data should be stored
     *  @param {PrimitiveDataTypes} data Primitive data which should be added
     *  @returns {PIOContent} Its own instance, so that this method can be chained
     *  @remarks Path gets validated by 'PathValidator'. Path must follow this format:
     *  e.g. "e029b2b8-5dc6-4feb-990a-7471fb9b54e3.KBV_PR_MIO_ULB_Patient.telecom[1].system". Header data are always
     *  stored as StringPIO.
     */
    setValue = (path: string, data: PrimitiveDataTypes): PIOContent => {
        const splittedPath: string[] = path.split(".");
        const lastPathElement: string = splittedPath[splittedPath.length - 1];

        if (
            splittedPath[2] == "@div@" ||
            splittedPath[2] == "@status@" ||
            splittedPath[2] == "@profile@" ||
            splittedPath[2] == "@id@"
        ) {
            //Handle header data
            _.set(this.data, path, data as StringPIO);
        } else if (lastPathElement.includes("extension")) {
            //Handle extension url
            _.set(this.data, path + ".__url", data);
        } else {
            //Handle primitive data
            _.set(this.data, path + ".__value", data);
        }

        this.pV.validatePaths(path);
        return this;
    };

    /** Returns the value from property 'data' specified by argument 'path'.
     * @param {string} path Absolute path pointing to a primitive data type (path without "__value" ending)
     * @returns {PrimitiveDataTypes} A primitive data type specified by the argument 'path'
     * @remarks If path does not exist, an error is thrown.
     */
    getValueByPath = (path: string): PrimitiveDataTypes => {
        const lastPathElement: string = path.split(".").pop() as string;
        const data: object | undefined = _.get(this.data, path);

        //Validate data
        if (!data) {
            throw Error("Path does not exist");
        }

        //Get correct return value
        if (["@id@", "@profile@", "@status@", "@div@"].includes(lastPathElement)) {
            //Handle header data
            return data as StringPIO;
        } else if (lastPathElement.includes("extension")) {
            //Handle extension url
            return _.get(data, "__url") as unknown as UriPIO;
        } else {
            //Handle primitive data
            const primitiveData: PrimitiveDataTypes | undefined = _.get(data, "__value");
            if (primitiveData && isPrimitiveDataType(primitiveData)) {
                return primitiveData;
            } else {
                throw Error("Path does not point to a primitive value");
            }
        }
    };

    /**
     * Will search for all uuids in the 'data' property which belong to the stated 'resourceType'.
     * @param {string} resourceType Search parameter (e.g. KBV_PR_MIO_ULB_AllergyIntolerance)
     * @returns {string[]} An array of strings with all matching uuids
     */
    getAllUuidsOfOneResourceType = (resourceType: string): string[] => {
        const returnValue: string[] = [];
        Object.keys(this.data).forEach((uuid: string) => {
            if (Object.keys(this.data[uuid.toString()])[0] === resourceType) {
                returnValue.push(uuid);
            }
        });
        return returnValue;
    };

    /** Clears all PIO data stored in 'PIOContent.data'. */
    clearData = (): void => {
        this.data = {};
    };
}

export { PIOContent };
