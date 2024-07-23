import { DateTimePIO, EntryType, UuidPIO } from "@thaias/pio_editor_meta";

/** This interface represents all necessary PIO header data. */
export interface IPIOHeaderData {
    receivingInstitution?: UuidPIO;
    patient?: UuidPIO;
    dateTimeComposition?: DateTimePIO;
    timestampBundle?: DateTimePIO;
    author?: UuidPIO[];
    bundleUuid?: UuidPIO;
    bundleIdentifierUuid?: UuidPIO;
    compositionUuid?: UuidPIO;
}

/**
 * This interface is used for imreading xml PIOs. Every 'PioPathObject' holds information about one FHIR path.
 * @property {string} pathForSettingValues Path including array indexes (e.g. "...extension[1]...") and excluding cake
 * elements (e.g. "...identifier:pid..."). This path is used for setting values in the RootObject using the setValue()
 * method. That's why this path always ends with '__value', '__url' or '__xmlns'
 * @property {string} pathForSearching Path excluding array indexes and excluding cake elements. This path is used for
 * searching information in the LookUpTable. This path does not end with '__value', '__url' or '__xmlns'
 * @property {boolean} isHeader Is true, if path belongs to header data
 * @property {string} dataType Data type of the primitive data stored under the path (e.g. StringPIO or CodePIO)
 */
export interface PioPathObject {
    pathForSettingValues: string;
    pathForSearching: string;
    isHeader: boolean | undefined;
    dataType: string | undefined;
    includedInPioSmall?: boolean;
}

/**
 * This interface represents an error while imreading a PIO. These interfaces are stored in the RootObject.
 * @property {string} path Invalid path where the error occurred
 * @property {string} message Error message as string
 * @property {string | EntryType | EntryType[]} data Data which should be stored under the invalid path
 */
export interface ErrorPath {
    path: string;
    message: string;
    data: string | EntryType | EntryType[];
    pioPathObject?: PioPathObject;
}

/**
 * Interface to store pio small exclusions. First key is the resource name (e.g. KBV_PR_MIO_ULB_CareTeam). Second key is
 * the resource uuid.
 */
export interface PioSmallErrors {
    [key: string]: {
        [key: string]: PioSmallExcludedPath;
    };
}

/** Interface for storing one single path, which is excluded in pio small, as key and its data as value. */
export interface PioSmallExcludedPath {
    [key: string]: string | EntryType | EntryType[];
}

/**
 * This interface stores uuids of device, medication and document FHIR resources, which are given to the patient for
 * transition. These uuids will be added to the FHIR Composition.
 * @property {string[]} KBV_PR_MIO_ULB_Device_Aid Uuids of all device aids, which are given to the patient
 * @property {string[]} KBV_PR_MIO_ULB_Medication Uuids of all medications, which are given to the patient (excluded in PIO small)
 * @property {string[]} KBV_PR_MIO_ULB_Provenance_Source_of_Information Uuids of all documents, which are given to the patient (excluded in PIO small)
 * @property {string[]} KBV_PR_MIO_ULB_Device Uuids of all devices, which are given to the patient
 * @property {string[]} KBV_PR_MIO_ULB_Device_Other_Item Uuids of all other items, which are given to the patient (excluded in PIO small)
 */
export interface IGivenDevices {
    KBV_PR_MIO_ULB_Device_Aid: string[];
    KBV_PR_MIO_ULB_Medication: string[];
    KBV_PR_MIO_ULB_Provenance_Source_of_Information: string[];
    KBV_PR_MIO_ULB_Device: string[];
    KBV_PR_MIO_ULB_Device_Other_Item: string[];
}
