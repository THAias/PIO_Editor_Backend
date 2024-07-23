import { BundleEntries } from "./TypesForFHIRStructure";

/**
 * Interface which represents a whole FHIR bundle and can be read by fast-xml-parser library.
 * @property {object} Bundle Key holds all bundle information
 */
export interface IBundleObject {
    Bundle: {
        __xmlns: string;
        id: IStringValue;
        meta: {
            profile: IStringValue;
        };
        identifier: {
            system: IStringValue;
            value: IStringValue;
        };
        type: IStringValue;
        timestamp: IStringValue;
        entry: BundleEntries[];
    };
}

/**
 * Interface which represents the nested object of the composition resource.
 * @property {object} modifierExtension Holds the modifier extension
 * @property {object} title Holds the title of the section
 * @property {object} code Holds the code of the section
 * @property {object} entry Holds the references to the FHIR resources
 */
export interface ICompositionNestedObjectSection {
    modifierExtension: {
        type: string;
    };
    title: {
        type: string;
        fixedValue: string;
    };
    code: {
        type: string;
        coding: {
            type: string;
            system: {
                type: string;
                fixedValue: string;
            };
            version: {
                type: string;
                fixedValue: string;
            };
            code: {
                type: string;
                fixedValue: string;
            };
            display: {
                type: string;
                fixedValue: string;
            };
        };
    };
    entry: {
        type: string;
        reference: {
            type: string;
        };
    };
}

/**
 * Interface which represents the nested object of the composition resource.
 */
export interface ICompositionNestedObjectSections {
    KBV_PR_MIO_ULB_Composition: ICompositionNestedObjectSection;
}

/**
 * Interface which represents the lookup table for the section uuids. To get the uuids for the different sections.
 */
export interface ISectionUuidsLookUpTable {
    [key: string]: string[];
}

/**
 * Interface which represents the FHIR composition resource and can be read by fast-xml-parser library.
 * @property {object} fullUrl Holds the composition uuid
 * @property {object} resource Holds all data of the composition
 */
export interface ICompositionObject {
    fullUrl: IStringValue;
    resource: {
        Composition: {
            id: IStringValue;
            meta: {
                profile: IStringValue;
            };
            text: {
                status: IStringValue;
                div: INarrativeDiv;
            };
            extension?: {
                __url: string;
                valueReference: IReference;
            };
            status: IStringValue;
            type: ICodingElement;
            subject: IReference;
            date: IStringValue;
            author: IReference[];
            title: IStringValue;
            section: ICompositionSection[];
        };
    };
}

/**
 * Interface which represents one 'Composition' section and can be read by fast-xml-parser library.
 * @property {object} title Name of the section
 * @property {object} code Coded type of section
 * @property {object} entry Holds one or more references to the FHIR resources
 */
export interface ICompositionSection {
    title: IStringValue;
    code: ICodingElement;
    entry: IReference[];
}

/**
 * Interface which represents the header of a FHIR resource and can be read by the 'fast-xml-parser' library. This
 * header is similar in all resources.
 * @property {object} id Holds the uuid of the FHIR resource
 * @property {object} meta Holds the canonical url to the structure definition of the FHIR resources
 * @property {object} text Holds the status and the div element of the FHIR resource
 */
export interface IResourceHeader {
    id: IStringValue;
    meta: { profile: IStringValue };
    text: {
        status: IStringValue;
        div: INarrativeDiv;
    };
}

/**
 * Interface for the narrative 'div' element of the FHIR resource header which can be read by the 'fast-xml-parser' library.
 * @property {string} __xmlns Xml namespace of the narrative element
 * @property {string} #text Human readable description of the FHIR resource
 */
export interface INarrativeDiv {
    __xmlns: string;
    "#text": string;
}

/**
 * Interface for storing a primitive data type as string. Can be read by 'fast-xml-parser' library.
 * @property {string} __value Holds data as string
 */
export interface IStringValue {
    __value: string;
}

/**
 * Interface which represents a reference element. Can be read by 'fast-xml-parser' library.
 * @property {IStringValue} reference Holds the reference as uuid
 */
export interface IReference {
    reference: IStringValue;
}

/**
 * Interface which represents a FHIR 'coding' element and can be read by 'fast-xml-parser' library.
 * @property {object} coding Holds the coding element
 */
export interface ICodingElement {
    coding: {
        system: IStringValue;
        version: IStringValue;
        code: IStringValue;
        display: IStringValue;
    };
}
