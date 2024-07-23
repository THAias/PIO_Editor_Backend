import { DateTimePIO, EntryType, IUserData, SubTree, UuidPIO } from "@thaias/pio_editor_meta";
import { BundleEntries, ResourceEntries } from "./@types/TypesForFHIRStructure";
import { IBundleObject } from "./@types/InterfacesForFHIRStructure";
import { TransformedEntryType } from "./@types/TypesForRootObject";
import * as _ from "lodash";
import xmlFormat from "xml-formatter";
import { PIOHeader } from "./PIOHeader";
import { PIOContent } from "./PIOContent";
import { XMLBuilder, XmlBuilderOptions, XMLParser } from "fast-xml-parser";
import { findObjectByKey, getLookUpTable, getXMLBuilder, getXmlFormatterOptions, getXMLParser } from "./Helper";
import { ErrorPath, PioPathObject, PioSmallErrors, PioSmallExcludedPath } from "./@types/InterfacesForRootObject";
import { KBV_PATIENT_RESOURCE_NAME, projectRoot } from "./GlobalVariables";
import * as fs from "fs";
import { generateContextResources, getBundle } from "./RootObjectHelperToXml";
import {
    extractAllGivenThings,
    extractBundleInformation,
    extractCompositionInformation,
    generateRootObject,
    getAllPaths,
    transformToPioPathObjects,
} from "./RootObjectHelperReadXml";

/**
 * This class represents a PIO.
 * @property {IUserData} userData Holds user data of the session where RootObject is used (= first and last name)
 * @property {PIOHeader} header Holds all header data of the PIO (composition and bundle resource)
 * @property {PIOContent} content Holds all pio data according to the specified FHIR structure
 * @property {ErrorPath[]} readXmlErrors All paths, which are not included in the ResourceLookUpTable, will be ignored and saved here
 * @property {ErrorPath[]} pioSmallExclusions All paths, which are not included in PIO Small, will be ignored and saved here
 * while reading a xml-file but stored under this property
 */
export class RootObject {
    userData: IUserData;
    header: PIOHeader = new PIOHeader();
    content: PIOContent = new PIOContent();
    readXmlErrors: ErrorPath[] = [];
    pioSmallExclusions: PioSmallErrors = {} as PioSmallErrors;
    numberOfPioSmallExclusions: number = 0;

    constructor(userData: IUserData) {
        this.userData = userData;
    }

    /**
     * Builds the whole PIO Bundle as xml string including all resources stored in property 'content'. Furthermore, the
     * Composition is generated. The returned xml-string gets formatted by the xmlFormatter library.
     * @param {XmlBuilderOptions} XMLBuilderOptions - This parameter overwrites the standard options used by the fast-xml-parser library
     * @returns {string} An XML-string representing the PIO according to the FHIR specification
     * @remarks Throws an error, if patient resource is missing
     */
    toXML = (XMLBuilderOptions?: XmlBuilderOptions): string => {
        //Clean all empty Uuids
        this.deleteAllEmptyUuids();

        //Validate author
        if (!this.header.data.author) {
            throw Error("No author is stated but this information is mandatory");
        }

        //Validate number of patient resources
        const numberOfPatientResources: number =
            this.content.getAllUuidsOfOneResourceType(KBV_PATIENT_RESOURCE_NAME).length;
        if (numberOfPatientResources === 0) throw Error("No patient resource found but this resource is mandatory");
        else if (numberOfPatientResources > 1) throw Error("More than one patient resource found. Just one is allowed");

        //Set patient uuid in header data
        this.header.data.patient = new UuidPIO(this.content.getAllUuidsOfOneResourceType(KBV_PATIENT_RESOURCE_NAME)[0]);

        //Generate uuids for the bundle and the composition, if not present
        if (!this.header.data.bundleUuid) {
            this.header.data.bundleUuid = new UuidPIO(UuidPIO.generateUuid());
        }
        if (!this.header.data.bundleIdentifierUuid) {
            this.header.data.bundleIdentifierUuid = new UuidPIO(UuidPIO.generateUuid());
        }
        if (!this.header.data.compositionUuid) {
            this.header.data.compositionUuid = new UuidPIO(UuidPIO.generateUuid());
        }

        //Generate new timestamps
        const date: Date = new Date();
        let dateString: string = "";
        dateString += date.getFullYear().toString() + "-";
        dateString += ("0" + (date.getMonth() + 1).toString()).slice(-2) + "-";
        dateString += ("0" + date.getDate()).slice(-2) + "T";
        dateString += ("0" + date.getHours()).slice(-2) + ":";
        dateString += ("0" + date.getMinutes()).slice(-2) + ":";
        dateString += ("0" + date.getSeconds()).slice(-2);
        const currentTimeStamp: DateTimePIO = DateTimePIO.parseFromString(dateString) as DateTimePIO;
        this.header.data.dateTimeComposition = currentTimeStamp;
        this.header.data.timestampBundle = currentTimeStamp;

        //Generate resources automatically in backend because no user input needed for its generation
        generateContextResources(this);

        //Generate bundle as xml-string
        this.deleteAllEmptyUuids();
        const bundle: IBundleObject = getBundle(this.header, this.content);
        const firstNode: string = Object.keys(bundle)[0];
        const xmlBuilder: XMLBuilder = getXMLBuilder(firstNode, XMLBuilderOptions);
        // quick fix for fast xml parser deleting "true" values
        const xmlString: string = xmlBuilder
            .build(bundle)
            .replaceAll("<valueBoolean value/>", '<valueBoolean value="true"/>');
        return xmlFormat(xmlString, getXmlFormatterOptions());
    };

    /**
     * Deserializes a xml string and stores all information in a newly generated RootObject.
     * @param {IUserData} userData User data used for RootObject generation
     * @param {string} xmlString Input xml string
     * @returns {RootObject} A newly generated RootObject
     * @remarks Throws an Error, if no Bundle is found, no FHIR resource is found or relevant paths are missing in the
     * look-up table
     */
    static readXML = (userData: IUserData, xmlString: string): RootObject => {
        //Parse XML file to Json Object
        const xmlParser: XMLParser = getXMLParser([
            "extension",
            "name",
            "identifier",
            "address",
            "telecom",
            "communication",
        ]);
        const obj: TransformedEntryType = xmlParser.parse(xmlString);

        //Create new RootObject and get lookUpTable
        const rootObj = new RootObject(userData);
        const lookUpTable: object = getLookUpTable();

        //Extract all entries (= FHIR resources), the Composition and the Bundle
        const entriesWithComposition: BundleEntries | BundleEntries[] | undefined = findObjectByKey(
            obj as object,
            "entry"
        ) as BundleEntries | BundleEntries[] | undefined;
        const composition: object | undefined = findObjectByKey(obj as object, "Composition");
        const bundle: object | undefined = findObjectByKey(obj as object, "Bundle");

        //Validate PIO
        if (!entriesWithComposition) throw Error("No FHIR resources found");
        if (!bundle) throw Error("No Bundle found");

        //Generate an array of entries without Composition
        const entryListWithComposition: BundleEntries[] =
            entriesWithComposition instanceof Array ? entriesWithComposition : [entriesWithComposition];
        const entryList: ResourceEntries[] = entryListWithComposition.filter((entry: BundleEntries) => {
            return Object.keys(entry.resource)[0] !== "Composition";
        }) as ResourceEntries[];

        //Extract Bundle and Composition data
        extractBundleInformation(bundle, rootObj);
        if (composition) {
            extractCompositionInformation(composition, rootObj);
            extractAllGivenThings(composition, rootObj, obj);
        }

        //Read all entries. 'fast-xml-parser' library will imread 'TransformedEntryTypes'. These 'TransformedEntryTypes'
        //will be converted to 'EntryTypes' and stored under 'this.content.data'
        entryList.forEach((entry: ResourceEntries) => {
            const uuid: string = entry.fullUrl.__value.split(":").pop() as string;
            const resourceObj: TransformedEntryType = entry.resource;
            const fhirResourceName: string = Object.keys(resourceObj)[0]; // e.g. Patient
            const mioResourceName: string = resourceObj[fhirResourceName.toString()]["meta"]["profile"]["__value"]
                .split("/")
                .pop()
                .split("|")[0]; // e.g. KBV_PR_MIO_ULB_Patient

            //Get relevant paths from lookUpTable
            const temp: object | undefined = lookUpTable[mioResourceName.toString()];
            if (!temp) {
                console.warn(`Resource "${mioResourceName}" not included in PIO specification`);
                return;
            }
            const relevantLookUpTablePaths: object = temp["paths"];
            if (!relevantLookUpTablePaths) throw Error(`No paths for resource ${mioResourceName} found`);

            //Imread all existing paths for the entry by generating PioPathObjects
            const transformedPaths: PioPathObject[] = transformToPioPathObjects(
                getAllPaths(resourceObj, mioResourceName, fhirResourceName),
                relevantLookUpTablePaths
            );

            //Iterate through all PioPathObjects and store data in 'rootObj'
            generateRootObject(transformedPaths, rootObj, resourceObj, mioResourceName, fhirResourceName, uuid);
        });
        return rootObj;
    };

    /**
     * For getting one or multiple SubTrees.
     * @param {string[]} paths Input paths as strings (e.g. e029b2b8-5dc6-4feb-990a-7471fb9b54e3.KBV_PR_MIO_ULB_Patient.gender)
     * @return {SubTree[]} An array of SubTrees. SubTree at index 1 belongs to input path at index 1.
     */
    getSubTrees = (paths: string[]): SubTree[] => {
        const returnArray: SubTree[] = [];
        const data: EntryType = _.cloneDeep(this.content.data) as EntryType;
        if (!paths) return [] as SubTree[];
        paths.forEach((path: string) => returnArray.push(new SubTree(path, data)));
        return returnArray;
    };

    /**
     * Will save all SubTree data to the RootObject.
     * @param {SubTree[]} subTrees Array of SubTrees which should be integrated to the RootObject
     */
    saveSubTrees = (subTrees: SubTree[]): void => {
        //Save SubTrees
        subTrees.forEach((sub: SubTree) => {
            this.content.pV.validatePaths(sub.addedPaths);
            const entry: EntryType | EntryType[] = sub.transformSubTreeToEntryType();
            _.set(this.content.data, sub.absolutePath, entry);
        });

        //Delete empty uuids
        const numberOfEmptyUuids: number = this.deleteAllEmptyUuids();

        //Console logs
        console.log(
            `${subTrees.length} SubTrees successfully saved (user: ${this.userData.firstName} ${this.userData.lastName})`
        );
        subTrees
            .map((subTree: SubTree): string => subTree.absolutePath)
            .forEach((path: string) => console.log("     " + path));
        if (numberOfEmptyUuids > 0) {
            console.log("     " + numberOfEmptyUuids + " empty resources deleted after subTree integration");
        }

        if (process.env.NODE_ENV === "development") {
            const path: string = `${projectRoot}/outputFiles/RootObject${this.userData.firstName}${this.userData.lastName}.json`;
            // eslint-disable-next-line security/detect-non-literal-fs-filename
            fs.writeFileSync(path, JSON.stringify(this.content.data), "utf8");
        }
    };

    /**
     * Will delete all SUbTree from the RootObject.
     * @param {SubTree[]} subTrees Array of SubTrees which should be deleted from the RootObject
     */
    deleteSubTrees = (subTrees: SubTree[]): void => {
        subTrees.forEach((sub: SubTree) => {
            // delete the idem with only the uuid
            delete this.content.data[sub.absolutePath.split(".")[0]];
        });

        //Console logs
        console.log(
            `${subTrees.length} SubTrees successfully deleted (user: ${this.userData.firstName} ${this.userData.lastName})`
        );
        subTrees
            .map((subTree: SubTree): string => subTree.absolutePath)
            .forEach((path: string) => console.log("\t" + path));

        if (process.env.NODE_ENV === "development") {
            const path: string = `${projectRoot}/outputFiles/RootObject${this.userData.firstName}${this.userData.lastName}.json`;
            // eslint-disable-next-line security/detect-non-literal-fs-filename
            fs.writeFileSync(path, JSON.stringify(this.content.data), "utf8");
        }
    };

    /**
     * @returns {object} all uuids and their FHIR resource type (e.g. KBV_PR_MIO_ULB_Patient) as object. The objects
     * keys are the uuids and the values are the resource types.
     */
    getAllUuids = (): object => {
        const allUuids: string[] = Object.keys(this.content.data);
        const returnObj: object = {};

        if (allUuids.length === 0) return returnObj;
        allUuids.forEach((uuid: string) => {
            returnObj[uuid.toString()] = Object.keys(this.content.data[uuid.toString()])[0];
        });

        return returnObj;
    };

    /**
     * Deletes all resources from root object which are equal to stated resource type.
     * @param {string} resourceType Type of resource to be deleted (e.g. KBV_PR_MIO_ULB_Observation_Presence_Allergies)
     */
    deleteAllResourcesOfType = (resourceType: string): void => {
        Object.keys(this.content.data).forEach((uuid: string) => {
            if (Object.keys(this.content.data[uuid.toString()])[0] === resourceType) {
                delete this.content.data[uuid.toString()];
            }
        });
    };

    /**
     * Removes all uuid keys in PIOContent.data which hold no data.
     * @returns {number} number of empty uuids which were deleted
     */
    deleteAllEmptyUuids = (): number => {
        const allUuids: string[] = Object.keys(this.content.data);
        let counter: number = 0;
        allUuids.forEach((uuid: string) => {
            const uuidObject: object = this.content.data[uuid.toString()];
            const isUuidKeyEmpty: boolean = uuidObject ? Object.keys(uuidObject).length === 0 : true;
            let isResourceNameKeyEmpty: boolean = false;

            if (!isUuidKeyEmpty) {
                const resourceName: string = Object.keys(uuidObject)[0];
                const resourceObject: object = uuidObject[resourceName.toString()];
                isResourceNameKeyEmpty = resourceObject ? Object.keys(resourceObject).length === 0 : true;
            }

            if (isUuidKeyEmpty || isResourceNameKeyEmpty) {
                delete this.content.data[uuid.toString()];
                counter += 1;
            }
        });
        return counter;
    };

    /**
     * Adds one path, which couldn't be imported due to pio small exclusion
     * @param {PioSmallExcludedPath} excludedPathWithData Data about excluded path which couldn't be read
     * @param {string} uuid Uuid of the FHIR resource, the path belongs to
     */
    addPioSmallExcludedPath = (excludedPathWithData: PioSmallExcludedPath, uuid: string): void => {
        //Get data
        const resourceName: string = Object.keys(excludedPathWithData)[0].split(".")[0];
        const resourceNameAlreadyExists: boolean = !!this.pioSmallExclusions[resourceName.toString()];
        const oldEntry: PioSmallExcludedPath | undefined = resourceNameAlreadyExists
            ? this.pioSmallExclusions[resourceName.toString()][uuid.toString()]
            : undefined;

        //Generate key if not present
        if (!resourceNameAlreadyExists) {
            this.pioSmallExclusions[resourceName.toString()] = {};
        }

        //Write data
        this.pioSmallExclusions[resourceName.toString()][uuid.toString()] = oldEntry
            ? { ...oldEntry, ...excludedPathWithData }
            : excludedPathWithData;
        this.numberOfPioSmallExclusions++;
    };
}
