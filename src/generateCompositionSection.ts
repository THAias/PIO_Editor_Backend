import { ICodingElement, ICompositionSection, IReference } from "./@types/InterfacesForFHIRStructure";
import { generateCodingElement, getPioSmallLookUpTable } from "./Helper";
import { ResourceLookUpTable, ResourceLookUpTableEntry, ResourceLookUpTablePaths } from "@thaias/pio_fhir_resources";
import _sectionUuidLookUpTable from "./assets/SectionUuidTable.json";
import { PIOHeader } from "./PIOHeader";
import { PIOContent } from "./PIOContent";

const pioSmallLookUpTable: ResourceLookUpTable = getPioSmallLookUpTable();

interface ICompositionNestedObjectSection {
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

interface ICompositionNestedObjectSections {
    KBV_PR_MIO_ULB_Composition: ICompositionNestedObjectSection;
}

interface ISectionUuidsLookUpTable {
    [key: string]: string[];
}
const transformOneCompositionSection = (title: string, code: ICodingElement, uuids: string[]): ICompositionSection => {
    return {
        title: {
            __value: title,
        },
        code: code,
        entry: uuids.map((uuid: string): IReference => {
            if (uuid.includes("urn:uuid:")) return { reference: { __value: uuid } };
            else return { reference: { __value: "urn:uuid:" + uuid } };
        }),
    } as ICompositionSection;
};

/**
 * This function converts the section paths of the PIO small look up table into a nested object structure. This
 * structure is used to generate the composition sections.
 */
const convertSectionToNestedObject = (): ICompositionNestedObjectSections => {
    const composition: ResourceLookUpTableEntry = pioSmallLookUpTable["KBV_PR_MIO_ULB_Composition"];
    const sectionPaths: ResourceLookUpTablePaths = composition.paths;
    const result: object = {};

    Object.keys(sectionPaths).forEach((key: string): void => {
        if (key.includes("KBV_PR_MIO_ULB_Composition.section:")) {
            const keys: string[] = key.split(".");
            let currentObj: object = result;

            keys.forEach((nestedKey: string, index: number): void => {
                if (index === keys.length - 1) {
                    currentObj[nestedKey.toString()] = sectionPaths[key.toString()];
                } else {
                    currentObj[nestedKey.toString()] = currentObj[nestedKey.toString()] || {};
                    currentObj = currentObj[nestedKey.toString()];
                }
            });
        }
    });

    return result as ICompositionNestedObjectSections;
};

/**
 * This function generates the composition sections of the FHIR Composition resource. The composition sections are
 * generated based on the section paths of the PIO small look up table. The section paths are converted into a nested
 * object structure. This structure is used to generate the composition sections.
 * @param header Header of the PIO
 * @param content Content of the PIO
 * @returns {ICompositionSection[]} Array of composition sections
 */
export const getAllCompositionSections = (header: PIOHeader, content: PIOContent): ICompositionSection[] => {
    const nestedObjects: ICompositionNestedObjectSection = convertSectionToNestedObject().KBV_PR_MIO_ULB_Composition;
    const result: ICompositionSection[] = [];
    const sectionUuidLookUpTable: ISectionUuidsLookUpTable = _sectionUuidLookUpTable;
    Object.entries(nestedObjects).forEach((entry: [string, ICompositionNestedObjectSection]): void => {
        const [key, value]: [key: string, value: ICompositionNestedObjectSection] = entry;
        let uuids: string[];
        if (key.includes("mitgegebeneDokumenteArzneimittelHilfsmittelGegenstaende")) {
            uuids = sectionUuidLookUpTable[key.split(":")[1]].flatMap((uuidKey: string) =>
                header.getGivenDevices(uuidKey)
            );
        } else {
            uuids = sectionUuidLookUpTable[key.split(":")[1]].flatMap((uuidKey: string) =>
                content.getAllUuidsOfOneResourceType(uuidKey)
            );
        }
        const title: string = value.title.fixedValue;
        const code: ICodingElement = generateCodingElement(
            value.code.coding.system.fixedValue,
            value.code.coding.version.fixedValue,
            value.code.coding.code.fixedValue,
            value.code.coding.display.fixedValue
        );
        if (uuids.length !== 0) {
            result.push(transformOneCompositionSection(title, code, uuids));
        }
    });

    return result;
};
