import { DateTimePIO, EntryType, getPrimitiveDataClasses, UuidPIO } from "@thaias/pio_editor_meta";
import * as _ from "lodash";
import { TransformedEntryType } from "./@types/TypesForRootObject";
import { ErrorPath, PioPathObject, PioSmallExcludedPath } from "./@types/InterfacesForRootObject";
import { getPioSmallLookUpTable, getXMLBuilder } from "./Helper";
import xmlFormat from "xml-formatter";
import { RootObject } from "./RootObject";
import { ICompositionSection, IReference } from "./@types/InterfacesForFHIRStructure";
import { ResourceEntries } from "./@types/TypesForFHIRStructure";

/**
 * Extract the Bundle information and save it in the PIOHeader class
 * @param {object} bundle Object which represents the imread bundle
 * @param {RootObject} rootObj RootObject where all imread xml data should be stored
 */
export const extractBundleInformation = (bundle: object, rootObj: RootObject): void => {
    const bundleUuid: object | undefined = bundle["id"];
    if (bundleUuid)
        rootObj.header.setBundleUuid(
            UuidPIO.parseFromString(bundleUuid["__value"].replace("urn:uuid:", "")) as UuidPIO
        );

    const bundleIdentifierUuid: object | undefined = _.get(bundle, "identifier[0].value");
    if (bundleIdentifierUuid)
        rootObj.header.setBundleIdentifierUuid(
            UuidPIO.parseFromString((bundleIdentifierUuid["__value"] as string).replace("urn:uuid:", "")) as UuidPIO
        );

    const bundleTimestamp: object | undefined = bundle["timestamp"];
    if (bundleTimestamp)
        rootObj.header.setTimestampBundle(DateTimePIO.parseFromString(bundleTimestamp["__value"]) as DateTimePIO);
};

/**
 * Extract the Composition information and save it in the PIOHeader class.
 * @param {object} composition Object which represents the imread composition resource
 * @param {RootObject} rootObj RootObject where all imread xml data should be stored
 */
export const extractCompositionInformation = (composition: object, rootObj: RootObject): void => {
    const compositionUuid: string | undefined = composition["id"];
    if (compositionUuid)
        rootObj.header.setCompositionUuid(
            UuidPIO.parseFromString(compositionUuid["__value"].replace("urn:uuid:", "")) as UuidPIO
        );

    const compositionReceivingInstitution: object | undefined =
        _.get(composition, "extension[0].valueReference.reference") ||
        _.get(composition, "extension.valueReference.reference");
    if (compositionReceivingInstitution)
        rootObj.header.setReceivingInstitution(
            UuidPIO.parseFromString(
                (compositionReceivingInstitution["__value"] as string).replace("urn:uuid:", "")
            ) as UuidPIO
        );

    const compositionDate: object | undefined = composition["date"];
    if (compositionDate)
        rootObj.header.setDateComposition(DateTimePIO.parseFromString(compositionDate["__value"]) as DateTimePIO);

    let compositionAuthor: object[] | object | undefined = composition["author"];
    if (compositionAuthor) {
        if (!(compositionAuthor instanceof Array)) {
            compositionAuthor = [compositionAuthor];
        }
        (compositionAuthor as object[]).forEach((author: object) => {
            const authorUuid: object | undefined = author["reference"];
            if (authorUuid)
                rootObj.header.addAuthor(
                    UuidPIO.parseFromString(authorUuid["__value"].replace("urn:uuid:", "")) as UuidPIO
                );
        });
    }

    const compositionSubject: object | undefined = _.get(composition, "subject.reference");
    if (compositionSubject)
        rootObj.header.setPatient(
            UuidPIO.parseFromString((compositionSubject["__value"] as string).replace("urn:uuid:", "")) as UuidPIO
        );
};

/**
 *
 */
export const extractAllGivenThings = (composition: object, rootObj: RootObject, obj: TransformedEntryType) => {
    const givenThingsSection: ICompositionSection | undefined = composition["section"].find(
        (sectionItem: ICompositionSection) => {
            return (
                sectionItem.code.coding.code.__value ===
                "363787002:704326004=(404684003:47429007=49062001,363713009=52101004)"
            );
        }
    );

    if (givenThingsSection && givenThingsSection.entry.length > 0) {
        //Get uuids of all given things
        const allUuidsOfGivenThings: string[] = givenThingsSection.entry.map(
            (entryItem: IReference): string => entryItem.reference.__value.split(":").pop() as string
        );

        //Get all uuids of resources which are named equal to 'searchValues'
        const searchValues: string[] = [
            "KBV_PR_MIO_ULB_Device_Aid",
            "KBV_PR_MIO_ULB_Medication",
            "KBV_PR_MIO_ULB_Provenance_Source_of_Information",
            "KBV_PR_MIO_ULB_Device",
            "KBV_PR_MIO_ULB_Device_Other_Item",
        ];
        const possibleUuidsWithResourceName: { uuid: string; resourceName: string }[] = (
            obj["Bundle"]["entry"] as ResourceEntries[]
        )
            .map((entryItem: ResourceEntries): { uuid: string; resourceName: string } | undefined => {
                try {
                    const uuid: string | undefined = entryItem.fullUrl.__value.split(":").pop();
                    const resourceXmlTag: string = Object.keys(entryItem.resource)[0];
                    const resourceName: string | undefined = (
                        entryItem.resource[resourceXmlTag.toString()]["meta"]["profile"]["__value"] as string
                    )
                        .split("/")
                        .pop()
                        ?.split("|")[0];
                    if (uuid && resourceName && searchValues.includes(resourceName))
                        return { uuid: uuid, resourceName: resourceName };
                    else return undefined;
                } catch {
                    return undefined;
                }
            })
            .filter((item: { uuid: string; resourceName: string } | undefined) => item !== undefined) as unknown as {
            uuid: string;
            resourceName: string;
        }[];

        //Iterate through all possible elements and filter non given things -> write given things to RootObject
        possibleUuidsWithResourceName
            .filter((item: { uuid: string; resourceName: string }) => allUuidsOfGivenThings.includes(item.uuid))
            .forEach((item: { uuid: string; resourceName: string }) => {
                (rootObj.header.givenDevices[item.resourceName.toString()] as string[]).push(item.uuid);
            });
    }
    console.log();
};

/**
 * Imreads all paths from a xml-string (= PIO).
 * @param {TransformedEntryType} obj Object representing a whole FHIR resource starting with the 'fhirResourceName' as root tag
 * @param {string} mioResourceName Name of the KBV profile (e.g. KBV_PR_MIO_ULB_Patient)
 * @param {string} fhirResourceName Name of the FHIR resource (e.g. Patient)
 * @param {string} path Current path which is passed to the next recursive call
 * @returns {string[]} A string array with all path existing in 'obj'
 * @remarks This function calls itself recursively
 */
export const getAllPaths = (
    obj: TransformedEntryType,
    mioResourceName: string,
    fhirResourceName: string,
    path: string = ""
): string[] => {
    const paths: string[] = [];
    Object.keys(obj).forEach((key: string) => {
        if (key === "div" && Object.keys(obj[key.toString()]).includes("__xmlns")) {
            //The header element <div> must be read as one path, even if further html-tags are used inside <div>
            paths.push(path + key);
        } else if (obj[key.toString()] instanceof Object) {
            //Build new path for recursive function
            let newPath: string;
            if (key === fhirResourceName) {
                //Use mioResourceName (e.g. KBV_PR_MIO_ULB_Patient) instead of fhirResourceName (e.g. Patient) for
                //path generation
                newPath = mioResourceName + ".";
            } else {
                newPath = checkIfNumber(key) ? path.slice(0, -1) + "[" + key + "]" + "." : path + key + ".";
            }
            //Recursive call
            paths.push(...getAllPaths(obj[key.toString()], mioResourceName, fhirResourceName, newPath));
        } else {
            paths.push(path + key);
        }
    });
    return paths;
};

/**
 * @param {string | number} input Input value
 * @returns {boolean} True, if the input value is from type number and greater or equal zero
 */
const checkIfNumber = (input: string | number): boolean => {
    if (typeof input !== "string") return false;
    const num = Number(input);
    return Number.isInteger(num) && num >= 0;
};

/**
 * Transforms all imread paths (passed as string array) into PioPathObjects.
 * @param {string[]} allPaths Imread paths as string array
 * @param {object} relevantLookUpTablePaths Object which holds all paths from the look-up table for the currently
 * processed FHIR resource
 * @returns {PioPathObject[]}
 * @remarks If imread path is not found in look-up table, properties 'isHeader' and 'dataType' of the PioPathObject
 * are 'undefined'.
 */
export const transformToPioPathObjects = (allPaths: string[], relevantLookUpTablePaths: object): PioPathObject[] => {
    //Remove cake notation (e.g. extension:konfession or identifier:pid) from lookUpTable-paths
    const transformedLookUpTable: object = {};
    Object.keys(relevantLookUpTablePaths).forEach((key: string) => {
        const newKey: string = key
            .split(".")
            .map((element: string) => {
                return element.split(":")[0];
            })
            .join(".");
        transformedLookUpTable[newKey.toString()] = relevantLookUpTablePaths[key.toString()];
    });

    //Get pioSmallLookUpTable and remove cake notation (e.g. extension:konfession) from pioSmallLookUpTable-paths
    const mioResourceName: string = allPaths[0].split(".")[0];
    const relevantPioSmallLookUpTablePaths: object = getPioSmallLookUpTable()[mioResourceName.toString()]?.paths ?? {};
    const validPioSmallPaths: string[] = [];
    Object.keys(relevantPioSmallLookUpTablePaths).forEach((key: string) => {
        const newKey: string = key
            .split(".")
            .map((element: string) => {
                return element.split(":")[0];
            })
            .join(".");
        validPioSmallPaths.push(newKey);
    });

    //Iterate through all paths and generate an array of PIOPathObjects
    return allPaths.map((path: string) => {
        const pathForSearching: string = path
            .replace(/\[\d+]/g, "")
            .split(".")
            .slice(0, -1)
            .join(".");
        let isHeader: boolean | undefined = isHeaderPath(pathForSearching);
        let dataType: string | undefined;
        try {
            dataType = isHeader ? "StringPIO" : transformedLookUpTable[pathForSearching.toString()]["type"];
        } catch {
            //Path could not be found in look-up table
            isHeader = undefined;
            dataType = undefined;
        }
        //Check whether path is included in PIO Small
        const includedInPioSmall: boolean = validPioSmallPaths.includes(pathForSearching);

        return {
            pathForSettingValues: path,
            pathForSearching: path.split(".").pop() === "div" ? path : pathForSearching,
            isHeader: isHeader,
            dataType: dataType,
            includedInPioSmall: includedInPioSmall,
        } as PioPathObject;
    });
};

/** @returns {boolean} True, if path points to resource header information (<id>, <meta>, <text>), otherwise false. */
const isHeaderPath = (path: string): boolean => {
    const splittedPath: string[] = path.split(".");
    return splittedPath[1] === "id" || splittedPath[1] === "meta" || splittedPath[1] === "text";
};

/**
 * This method reads all PioPathObjects and generates the content of the RootObject for ONE resource.
 * @param {PioPathObject[]} pioPathObj Array of PioPathObjects holds all imread paths
 * @param {RootObject} rootObj The RootObject for adding all imread data. This object is directly changed in method
 * @param {TransformedEntryType} resourceObj Object which represents the imread FHIR resource. This object holds the real medical data
 * @param {string} mioResourceName Name of the KBV profile (e.g. KBV_PR_MIO_ULB_Patient)
 * @param {string} fhirResourceName Name of the FHIR resource (e.g. Patient)
 * @param {string} uuid Uuid of the currently processed FHIR resource
 */
export const generateRootObject = (
    pioPathObj: PioPathObject[],
    rootObj: RootObject,
    resourceObj: TransformedEntryType,
    mioResourceName: string,
    fhirResourceName: string,
    uuid: string
): void => {
    pioPathObj.forEach((pathObj: PioPathObject): void => {
        if (!pathObj.isHeader && !pathObj.dataType) {
            //Handle invalid paths which couldn't be found in look-up table
            const data: string | object = _.get(
                resourceObj,
                insertFhirResourceNameInPath(pathObj.pathForSettingValues, fhirResourceName)
            );
            const errorObj: ErrorPath = {
                path: pathObj.pathForSettingValues,
                message: "Path could not be found in look-up table (path does not match pio specification)",
                data: data as string | EntryType | EntryType[],
                pioPathObject: pathObj,
            };
            rootObj.readXmlErrors.push(errorObj);
        } else if (!pathObj.includedInPioSmall && !pathObj.isHeader) {
            //Path is not part of PIO Small
            const data: string | object = _.get(
                resourceObj,
                insertFhirResourceNameInPath(pathObj.pathForSettingValues, fhirResourceName)
            );
            const excludedPath: string = pathObj.pathForSettingValues
                .split(".")
                .filter((item: string) => !item.includes("__"))
                .join(".");
            const excludedPathWithData: PioSmallExcludedPath = {} as PioSmallExcludedPath;
            excludedPathWithData[excludedPath.toString()] = data as string | EntryType | EntryType[];
            rootObj.addPioSmallExcludedPath(excludedPathWithData, uuid);
        } else {
            //Write data to RootObject
            if (pathObj.pathForSettingValues.split(".").pop() == "__xmlns") {
                //Skip XML namespace information (it's added hardcoded in method toXML() -> imread not necessary)
            } else if (pathObj.isHeader) {
                writeHeaderDataToRootObject(resourceObj, rootObj, pathObj, fhirResourceName, mioResourceName, uuid);
            } else {
                writePrimitiveDataToRootObject(resourceObj, rootObj, pathObj, fhirResourceName, uuid); //including extension urls
            }
        }
    });
};

/**
 * Function to write one primitive data to RootObject during imreading an xml file.
 * @param {TransformedEntryType} resourceObj Currently processed resource data
 * @param {RootObject} rootObj RootObject where primitive data should be added
 * @param {PioPathObject} pathObj Currently processed PioPathObject
 * @param {string} fhirResourceName Name of the FHIR resource (e.g. Patient)
 * @param {string} uuid Uuid of the currently processed FHIR resource
 */
const writePrimitiveDataToRootObject = (
    resourceObj: TransformedEntryType,
    rootObj: RootObject,
    pathObj: PioPathObject,
    fhirResourceName: string,
    uuid: string
): void => {
    let value: string = _.get(
        resourceObj,
        insertFhirResourceNameInPath(pathObj.pathForSettingValues, fhirResourceName)
    );

    const correctPath = pathObj.pathForSettingValues.split(".").slice(0, -1).join("."); //discard '__value' or '__url'
    if (pathObj.dataType === "Base64BinaryPIO") pathObj.dataType = "BinaryPIO"; //correct dataType
    if (pathObj.dataType === "UrlPIO") pathObj.dataType = "UriPIO"; //correct dataType
    if (pathObj.dataType === "StringPIO" && value.includes("urn:uuid:")) value = value.replace("urn:uuid:", ""); //cut prefix of all uuid references

    try {
        rootObj.content.setValue(
            uuid + "." + correctPath,
            getPrimitiveDataClasses()[pathObj.dataType as string].parseFromString(value)
        );
    } catch {
        const errorObj: ErrorPath = {
            path: pathObj.pathForSettingValues,
            message: "Could not parse string-value to primitive data type",
            data: value,
            pioPathObject: pathObj,
        };
        rootObj.readXmlErrors.push(errorObj);
    }
};

/**
 * Function to write one primitive data to RootObject during imreading an xml file.
 * @param {TransformedEntryType} resourceObj Currently processed resource data
 * @param {RootObject} rootObj RootObject where primitive data should be added
 * @param {PioPathObject} pathObj Currently processed PioPathObject
 * @param {string} fhirResourceName Name of the FHIR resource (e.g. Patient)
 * @param {string} mioResourceName Name of the KBV profile (e.g. KBV_PR_MIO_ULB_Patient)
 * @param {string} uuid Uuid of the currently processed FHIR resource
 */
const writeHeaderDataToRootObject = (
    resourceObj: TransformedEntryType,
    rootObj: RootObject,
    pathObj: PioPathObject,
    fhirResourceName: string,
    mioResourceName: string,
    uuid: string
): void => {
    let value = _.get(resourceObj, insertFhirResourceNameInPath(pathObj.pathForSettingValues, fhirResourceName));

    if (pathObj.pathForSearching.split(".").pop() === "div" && value instanceof Object) {
        //The <div> tag must be interpreted as string even if further html-tags are included
        const xmlBuilder = getXMLBuilder("temporaryRoot");
        value = xmlFormat(xmlBuilder.build(value), {
            collapseContent: true,
            lineSeparator: "",
            indentation: "",
        });
    }

    //If pathForSetting is invalid do not setValue
    const lastElement = pathObj.pathForSettingValues.split(".").pop();
    if (lastElement === "div" || lastElement === "__value") {
        rootObj.content.setValue(
            `${uuid}.${mioResourceName}.@${pathObj.pathForSearching.split(".").pop()}@`,
            getPrimitiveDataClasses()[pathObj.dataType as string].parseFromString(value)
        );
    }
};

/**
 * Changes the first element of path (which is usually the mio resource name e.g. KBV_PR_MIO_ULB_Patient) with the
 * fhir resource name e.g. Patient.
 * @param {string} path Input path for changing
 * @param {string} fhirResourceName Name of the FHIR resource (e.g. Patient)
 * @return {string} The changed path as string
 */
const insertFhirResourceNameInPath = (path: string, fhirResourceName: string): string => {
    const splittedPath: string[] = path.split(".");
    splittedPath[0] = fhirResourceName;
    return splittedPath.join(".");
};
