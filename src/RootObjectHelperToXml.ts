import { IBundleObject, ICompositionObject, IResourceHeader } from "./@types/InterfacesForFHIRStructure";
import {
    BUNDLE_IDENTIFIER_SYSTEM,
    BUNDLE_STRUCTURE_DEFINITION_URL,
    BUNDLE_TYPE,
    BUNDLE_XML_NAMESPACE,
    COMPOSITION_EXTENSION_RECEIVING_INSTITUTION,
    COMPOSITION_NARRATIVE_DIV,
    COMPOSITION_RESOURCE_STATUS,
    COMPOSITION_STATUS,
    COMPOSITION_STRUCTURE_DEFINITION_URL,
    COMPOSITION_TITLE,
    COMPOSITION_TYPE,
    NARRATIVE_DIV_XML_NAMESPACE,
} from "./GlobalVariables";
import { CodePIO, DateTimePIO, EntryType, StringPIO, SubTree, UriPIO, UuidPIO } from "@thaias/pio_editor_meta";
import { getLookUpTable } from "./Helper";
import { BundleEntries } from "./@types/TypesForFHIRStructure";
import { validate as isValidUUID } from "uuid";
import { TransformedEntryType } from "./@types/TypesForRootObject";
import * as _ from "lodash";
import { PIOHeader } from "./PIOHeader";
import { PIOContent } from "./PIOContent";
import { RootObject } from "./RootObject";
import { Coding } from "@thaias/pio_fhir_resources";
import { getAllCompositionSections } from "./generateCompositionSection";

//Constant
const systemSnomed: string = "http://snomed.info/sct";
const versionSnomed: string = "http://snomed.info/sct/900000000000207008/version/20220331";
const codeCodingPath: string = "code.coding";
const valueCodeableConceptCodingPath: string = "valueCodeableConcept.coding";
const subjectReferencePath: string = "subject.reference";
const extensionOpenBraketPath: string = "extension[";
const extensionUrlHasMember: string = "https://fhir.kbv.de/StructureDefinition/KBV_EX_MIO_ULB_Reference_Has_Member";
const braketReferencePath: string = "].reference";
const braketValueReferenceReferencePath: string = "].valueReference.reference";

/**
 * Generates an object, which can be read by 'fast-xml-parser' library.
 * @param {PIOHeader} header Header object of the RootObject
 * @param {PIOContent} content Data content object of the RootObject
 * @returns {IBundleObject} Object representing the xml structure of the pio bundle
 * @remarks The bundle structure is hard coded and not extracted from FHIR StructureDefinitions
 */
export const getBundle = (header: PIOHeader, content: PIOContent): IBundleObject => {
    return {
        Bundle: {
            __xmlns: BUNDLE_XML_NAMESPACE,
            id: { __value: (header.data.bundleUuid as UuidPIO).toString().replace("urn:uuid:", "") },
            meta: {
                profile: {
                    __value: BUNDLE_STRUCTURE_DEFINITION_URL,
                },
            },
            identifier: {
                system: { __value: BUNDLE_IDENTIFIER_SYSTEM },
                value: { __value: (header.data.bundleIdentifierUuid as UuidPIO).toString() },
            },
            type: { __value: BUNDLE_TYPE },
            timestamp: { __value: (header.data.timestampBundle as DateTimePIO).toString() },
            entry: [getComposition(header, content), ...transformEntries(content)],
        },
    };
};

/**
 * Generates the Composition resource in a form, that can be read by 'fast-xml-parser' library.
 * @param {PIOHeader} header Header object of the RootObject
 * @param {PIOContent} content Data content object of the RootObject
 * @returns {ICompositionObject} Object representing the xml structure of the composition
 * @remarks The composition structure is hard coded and not extracted from FHIR StructureDefinitions
 */
const getComposition = (header: PIOHeader, content: PIOContent): ICompositionObject => {
    const compUuid: string = (header.data.compositionUuid as UuidPIO).toString();

    return {
        fullUrl: { __value: compUuid },
        resource: {
            Composition: {
                id: { __value: compUuid.replace("urn:uuid:", "") },
                meta: {
                    profile: {
                        __value: COMPOSITION_STRUCTURE_DEFINITION_URL,
                    },
                },
                text: {
                    status: { __value: COMPOSITION_RESOURCE_STATUS },
                    div: { __xmlns: NARRATIVE_DIV_XML_NAMESPACE, "#text": COMPOSITION_NARRATIVE_DIV },
                },
                extension: !header.data.receivingInstitution
                    ? undefined
                    : {
                          __url: COMPOSITION_EXTENSION_RECEIVING_INSTITUTION,
                          valueReference: {
                              reference: { __value: header.data.receivingInstitution.toString() },
                          },
                      },
                status: {
                    __value: COMPOSITION_STATUS,
                },
                type: COMPOSITION_TYPE,
                subject: {
                    reference: {
                        __value: (header.data.patient as UuidPIO).toString(),
                    },
                },
                date: { __value: (header.data.dateTimeComposition as DateTimePIO).toString() },
                author: (header.data.author as UuidPIO[]).map((value: UuidPIO) => {
                    return { reference: { __value: value.toString() } };
                }) as [{ reference: { __value: string } }],
                title: {
                    __value: COMPOSITION_TITLE,
                },
                section: getAllCompositionSections(header, content),
            },
        },
    } as ICompositionObject;
};

/**
 * Transforms all entries stored under 'this.content.data' into an object structure, which can be parsed by
 * 'fast-xml-parser' library.
 * @param {PIOContent} content Data content object of the RootObject
 * @returns {BundleEntries[]} An array of 'BundleEntries'
 * @remarks Method contains a recursive call and throws an Error, if invalid paths are detected.
 */
const transformEntries = (content: PIOContent): BundleEntries[] => {
    //Initialize return value
    const transformedRootData: BundleEntries[] = [];

    //Check for invalid paths
    if (content.pV.getInvalidPaths().length > 0) {
        throw Error("Xml generation failed. Invalid paths detected: \n" + content.pV.getInvalidPaths().join("\n"));
    }

    //Iterate through every resource
    Object.keys(content.data).forEach((uuidKey) => {
        //Validate uuid
        if (!isValidUUID(uuidKey)) {
            return;
        }

        //Get important data for transformation
        const mioResourceName: string = Object.keys(content.data[uuidKey.toString()])[0]; //e.g. KBV_PR_MIO_ULB_Patient
        const lookUpTableForCurrentResource: object = getLookUpTable()[mioResourceName.toString()];
        const fhirResourceName = lookUpTableForCurrentResource["resource"]["fhir-resource-type"]; //e.g. Patient
        let currentResource: EntryType | TransformedEntryType = _.cloneDeep(
            content.data[uuidKey.toString()][mioResourceName.toString()]
        ) as EntryType;

        //Recursive call
        transformEntriesRecursive(currentResource);

        //Generate resource header
        const resourceHeader: IResourceHeader = generateHeader(
            uuidKey,
            fhirResourceName,
            currentResource as TransformedEntryType,
            lookUpTableForCurrentResource
        );
        currentResource = { ...resourceHeader, ...currentResource } as unknown as TransformedEntryType;

        const finishedEntry: BundleEntries = {
            fullUrl: { __value: `urn:uuid:${uuidKey}` },
            resource: {
                [fhirResourceName]: currentResource as TransformedEntryType,
            },
        };
        transformedRootData.push(finishedEntry);
    });
    return transformedRootData;
};

/**
 * Recursive function which transforms the 'EntryType' to 'TransformedEntryType', which means that all primitive
 * data types are converted to strings.
 * @param {EntryType | TransformedEntryType} entry This object will be transformed from 'EntryType' to 'TransformedEntryType'
 */
const transformEntriesRecursive = (entry: EntryType | TransformedEntryType): void => {
    Object.keys(entry).forEach((key) => {
        if (key === "@profile@" || key === "@status@" || key === "@div@" || key === "@id@") {
            //Do nothing -> Header data will be processed in method generateHeader()
        } else if (key === "__value" || key === "__url") {
            //Recursive call reached a primitive data type -> Transform to string and end recursive call
            try {
                entry[key.toString()] = entry[key.toString()].toString();
            } catch {
                throw Error(
                    "Conversion of primitive data type to string failed for following entry: " + JSON.stringify(entry)
                );
            }
        } else {
            //Go on with recursive call
            if (entry[key.toString()] instanceof Array) {
                entry[key.toString()].forEach((item: EntryType) => {
                    transformEntriesRecursive(item);
                });
            } else {
                entry[key.toString()] && transformEntriesRecursive(entry[key.toString()]);
            }
        }
    });
};

/**
 * This method generates the resource header according to the PIO specification.
 * @param {string} uuidKey Uuid of the resource
 * @param {string} fhirResourceName FHIR resource name (e.g. Patient)
 * @param {TransformedEntryType} currentResource Object representing the resource
 * @param {object} lookUpTableForCurrentResource Part of the look-up table which belongs to 'currentResource'
 * @returns {IResourceHeader}
 * @remarks If header data is missing in 'currentResource', header data from look-up table are used
 */
const generateHeader = (
    uuidKey: string,
    fhirResourceName: string,
    currentResource: TransformedEntryType,
    lookUpTableForCurrentResource: object
): IResourceHeader => {
    //Get header data
    const profile: string = currentResource["@profile@"]
        ? (currentResource["@profile@"] as StringPIO).get()
        : lookUpTableForCurrentResource["resource"]["profile"];
    const status: string = currentResource["@status@"]
        ? (currentResource["@status@"] as StringPIO).get()
        : lookUpTableForCurrentResource["resource"]["status"];
    const narrative: string = currentResource["@div@"]
        ? (currentResource["@div@"] as StringPIO).get()
        : "<h1>" + fhirResourceName + "</h1>";

    //Delete header data from TransformedEntryType ('currentResource')
    if (currentResource["@profile@"]) {
        delete currentResource["@profile@"];
    }
    if (currentResource["@status@"]) {
        delete currentResource["@status@"];
    }
    if (currentResource["@div@"]) {
        delete currentResource["@div@"];
    }
    if (currentResource["@id@"]) {
        delete currentResource["@id@"];
    }

    return {
        id: { __value: `${uuidKey}` },
        meta: { profile: { __value: profile } },
        text: {
            status: { __value: status },
            div: { __xmlns: NARRATIVE_DIV_XML_NAMESPACE, "#text": narrative },
        },
    } as IResourceHeader;
};

/**
 * Writes a FHIR 'coding' element to a SubTree.
 * @param {SubTree} subTree SubTree for writing 'coding' data
 * @param {string} subTreePath Path for writing data to SubTree ending with ".coding"
 * @param {Coding} coding Data of 'coding' element
 */
export const writeCodingToSubTree = (subTree: SubTree, subTreePath: string, coding?: Coding): void => {
    if (!coding) return;
    subTree.setValue(subTreePath + ".system", new UriPIO(coding.system as string));
    subTree.setValue(subTreePath + ".version", new StringPIO(coding.version as string));
    subTree.setValue(subTreePath + ".code", new CodePIO(coding.code as string));
    subTree.setValue(subTreePath + ".display", new StringPIO(coding.display as string));
};

/**
 * Generates the resource KBV_PR_MIO_ULB_Observation_Degree_Of_Disability_Available automatically. If degree of
 * disability is 'unknown', this value is set in frontend.
 * @param {RootObject} root Current root object
 * @param {string} patientUuid Uuid of patient
 */
const generateDegreeOfDisabilityAvailable = (root: RootObject, patientUuid: string): void => {
    const resourceName: string = "KBV_PR_MIO_ULB_Observation_Degree_Of_Disability_Available";
    const uuids: string[] = root.content.getAllUuidsOfOneResourceType(
        "KBV_PR_MIO_ULB_Observation_Degree_Of_Disability"
    );
    const availableUuid: string[] = root.content.getAllUuidsOfOneResourceType(resourceName);
    let unknownCase: boolean = false;
    if (availableUuid.length > 0) {
        const value: string | undefined = root
            .getSubTrees([
                availableUuid[0] +
                    ".KBV_PR_MIO_ULB_Observation_Degree_Of_Disability_Available.valueCodeableConcept.coding.code",
            ])[0]
            .getValueAsString();
        unknownCase = value === "404684003:363713009=373068000,47429007=(21134002:363713009=272520006)";
    }

    if (!unknownCase) {
        //Delete resource
        root.deleteAllResourcesOfType(resourceName);

        //Write resource
        const subTree: SubTree = new SubTree(UuidPIO.generateUuid() + "." + resourceName, undefined);
        subTree.setValue("status", new CodePIO("final"));
        writeCodingToSubTree(subTree, codeCodingPath, {
            system: systemSnomed,
            version: versionSnomed,
            code: "363787002:704326004=(404684003:363713009=260411009,47429007=(21134002:363713009=272520006))",
            display:
                "Observable entity (observable entity) : Precondition (attribute) = ( Clinical finding (finding) : Has interpretation (attribute) = Presence findings (qualifier value) , Associated with (attribute) = ( Disability (finding) : Has interpretation (attribute) = Degree findings (qualifier value) ) )",
        });
        subTree.setValue(subjectReferencePath, new UuidPIO(patientUuid));
        writeCodingToSubTree(subTree, valueCodeableConceptCodingPath, {
            system: "https://fhir.kbv.de/ValueSet/KBV_VS_MIO_ULB_Disability_Degree_Presence_Status",
            version: "1.0.0",
            code:
                uuids.length === 0
                    ? "404684003:363713009=2667000,47429007=(21134002:363713009=272520006)"
                    : "404684003:363713009=52101004,47429007=(21134002:363713009=272520006)",
            display:
                uuids.length === 0
                    ? "Clinical finding (finding) : Has interpretation (attribute) = Absent (qualifier value) , Associated with (attribute) = ( Disability (finding) : Has interpretation (attribute) = Degree findings (qualifier value) )"
                    : "Clinical finding (finding) : Has interpretation (attribute) = Present (qualifier value) , Associated with (attribute) = ( Disability (finding) : Has interpretation (attribute) = Degree findings (qualifier value) )",
        });
        subTree.setValue("hasMember.reference", uuids.length === 0 ? undefined : new UuidPIO(uuids[0]));
        root.saveSubTrees([subTree]);
    }
};

/**
 * Generates the resource KBV_PR_MIO_ULB_Observation_Presence_Allergies automatically.
 * @param {RootObject} root Current root object
 * @param {string} patientUuid Uuid of patient
 */
const generatePresenceAllergies = (root: RootObject, patientUuid: string): void => {
    const resourceName: string = "KBV_PR_MIO_ULB_Observation_Presence_Allergies";
    const uuids: string[] = root.content.getAllUuidsOfOneResourceType("KBV_PR_MIO_ULB_AllergyIntolerance");

    //Delete resource
    root.deleteAllResourcesOfType(resourceName);

    //Write resource
    const subTree: SubTree = new SubTree(UuidPIO.generateUuid() + "." + resourceName, undefined);
    subTree.setValue("status", new CodePIO("final"));
    writeCodingToSubTree(subTree, codeCodingPath, {
        system: systemSnomed,
        version: versionSnomed,
        code: "363787002:704326004=420134006",
        display:
            "Observable entity (observable entity) : Precondition (attribute) = Propensity to adverse reaction (finding)",
    });
    subTree.setValue(subjectReferencePath, new UuidPIO(patientUuid));
    writeCodingToSubTree(subTree, valueCodeableConceptCodingPath, {
        system: "https://fhir.kbv.de/ValueSet/KBV_VS_MIO_ULB_Allergies",
        version: "1.0.0",
        code: uuids.length === 0 ? "420134006:363713009=2667000" : "420134006:363713009=52101004",
        display:
            uuids.length === 0
                ? "Propensity to adverse reaction (finding) : Has interpretation (attribute) = Absent (qualifier value)"
                : "Propensity to adverse reaction (finding) : Has interpretation (attribute) = Present (qualifier value)",
    });
    uuids.forEach((uuid: string, index: number) => {
        subTree.setValue(extensionOpenBraketPath + index + "]", new UriPIO(extensionUrlHasMember));
        subTree.setValue(extensionOpenBraketPath + index + braketValueReferenceReferencePath, new UuidPIO(uuid));
    });
    root.saveSubTrees([subTree]);
};

/**
 * Generates the resource KBV_PR_MIO_ULB_Observation_Presence_Functional_Assessment automatically. Referenced resources
 * KBV_PR_MIO_ULB_ClinicalImpression_Individual_Functions_Barthel and KBV_PR_MIO_ULB_Observation_Assessment_Free is not
 * part of PIO Small
 * @param {RootObject} root Current root object
 * @param {string} patientUuid Uuid of patient
 */
const generatePresenceFunctionalAssessment = (root: RootObject, patientUuid: string): void => {
    const resourceName: string = "KBV_PR_MIO_ULB_Observation_Presence_Functional_Assessment";
    const uuids: string[] = root.content
        .getAllUuidsOfOneResourceType("KBV_PR_MIO_ULB_Observation_Total_Barthel_Index")
        .concat(
            root.content.getAllUuidsOfOneResourceType("KBV_PR_MIO_ULB_ClinicalImpression_Individual_Functions_Barthel")
        )
        .concat(root.content.getAllUuidsOfOneResourceType("KBV_PR_MIO_ULB_Observation_Assessment_Free"));

    //Delete resource
    root.deleteAllResourcesOfType(resourceName);

    //Write resource
    const subTree: SubTree = new SubTree(UuidPIO.generateUuid() + "." + resourceName, undefined);
    subTree.setValue("status", new CodePIO("final"));
    writeCodingToSubTree(subTree, codeCodingPath, {
        system: systemSnomed,
        version: versionSnomed,
        code: "363787002:704326004=105719004",
        display:
            "Observable entity (observable entity) : Precondition (attribute) = Body disability AND/OR failure state (finding)",
    });
    subTree.setValue(subjectReferencePath, new UuidPIO(patientUuid));
    writeCodingToSubTree(subTree, valueCodeableConceptCodingPath, {
        system: "https://fhir.kbv.de/ValueSet/KBV_VS_MIO_ULB_Allergies",
        version: "1.0.0",
        code: uuids.length === 0 ? "373572006:246090004=105719004" : "373573001:246090004=105719004",
        display:
            uuids.length === 0
                ? "Clinical finding absent (situation) : Associated finding (attribute) = Body disability AND/OR failure state (finding)"
                : "Clinical finding present (situation) : Associated finding (attribute) = Body disability AND/OR failure state (finding)",
    });
    uuids.forEach((uuid: string, index: number) => {
        subTree.setValue(extensionOpenBraketPath + index + "]", new UriPIO(extensionUrlHasMember));
        subTree.setValue(extensionOpenBraketPath + index + braketValueReferenceReferencePath, new UuidPIO(uuid));
    });
    root.saveSubTrees([subTree]);
};

/**
 * Generates the resource KBV_PR_MIO_ULB_Observation_Presence_Problems automatically.
 * @param {RootObject} root Current root object
 * @param {string} patientUuid Uuid of patient
 */
const generatePresenceProblems = (root: RootObject, patientUuid: string): void => {
    const resourceName: string = "KBV_PR_MIO_ULB_Observation_Presence_Problems";
    const uuids: string[] = root.content
        .getAllUuidsOfOneResourceType("KBV_PR_MIO_ULB_Condition_Medical_Problem_Diagnosis")
        .concat(root.content.getAllUuidsOfOneResourceType("KBV_PR_MIO_ULB_Condition_Care_Problem"));

    //Delete resource
    root.deleteAllResourcesOfType(resourceName);

    //Write resource
    const subTree: SubTree = new SubTree(UuidPIO.generateUuid() + "." + resourceName, undefined);
    subTree.setValue("status", new CodePIO("final"));
    writeCodingToSubTree(subTree, codeCodingPath, {
        system: systemSnomed,
        version: versionSnomed,
        code: "363787002:704326004=(404684003:47429007=55607006)",
        display:
            "Observable entity (observable entity) : Precondition (attribute) = ( Clinical finding (finding) : Associated with (attribute) = Problem (finding) )",
    });
    subTree.setValue(subjectReferencePath, new UuidPIO(patientUuid));
    writeCodingToSubTree(subTree, valueCodeableConceptCodingPath, {
        system: "https://fhir.kbv.de/ValueSet/KBV_VS_MIO_ULB_Problem_Presence",
        version: "1.0.0",
        code: uuids.length === 0 ? "373572006:246090004=55607006" : "373573001:246090004=55607006",
        display:
            uuids.length === 0
                ? "Clinical finding absent (situation) : Associated finding (attribute) = Problem (finding)"
                : "Clinical finding present (situation) : Associated finding (attribute) = Problem (finding)",
    });
    uuids.forEach((uuid: string, index: number) => {
        subTree.setValue(extensionOpenBraketPath + index + "]", new UriPIO(extensionUrlHasMember));
        subTree.setValue(extensionOpenBraketPath + index + braketValueReferenceReferencePath, new UuidPIO(uuid));
    });
    root.saveSubTrees([subTree]);
};

/**
 * Generates the resource KBV_PR_MIO_ULB_Observation_Presence_Risks automatically.
 * @param {RootObject} root Current root object
 * @param {string} patientUuid Uuid of patient
 */
const generatePresenceRisks = (root: RootObject, patientUuid: string): void => {
    const resourceName: string = "KBV_PR_MIO_ULB_Observation_Presence_Risks";
    const uuids: string[] = root.content.getAllUuidsOfOneResourceType("KBV_PR_MIO_ULB_Observation_Risk");

    //Delete resource
    root.deleteAllResourcesOfType(resourceName);

    //Write resource
    const subTree: SubTree = new SubTree(UuidPIO.generateUuid() + "." + resourceName, undefined);
    subTree.setValue("status", new CodePIO("final"));
    writeCodingToSubTree(subTree, codeCodingPath, {
        system: systemSnomed,
        version: versionSnomed,
        code: "102485007",
        display: "Personal risk factor (observable entity)",
    });
    subTree.setValue(subjectReferencePath, new UuidPIO(patientUuid));
    writeCodingToSubTree(subTree, valueCodeableConceptCodingPath, {
        system: "https://fhir.kbv.de/ValueSet/KBV_VS_MIO_ULB_Risk_Presence",
        version: "1.0.0",
        code: uuids.length === 0 ? "373572006:246090004=281694009" : "373573001:246090004=281694009",
        display:
            uuids.length === 0
                ? "Clinical finding absent (situation) : Associated finding (attribute) = Finding of at risk (finding)"
                : "Clinical finding present (situation) : Associated finding (attribute) = Finding of at risk (finding)",
    });
    uuids.forEach((uuid: string, index: number) => {
        subTree.setValue("hasMember[" + index + braketReferencePath, new UuidPIO(uuid));
    });
    root.saveSubTrees([subTree]);
};

/**
 * Generates the resource KBV_PR_MIO_ULB_Observation_Presence_Information_Nutrition automatically.
 * @param {RootObject} root Current root object
 * @param {string} patientUuid Uuid of patient
 */
const generatePresenceInformationNutrition = (root: RootObject, patientUuid: string): void => {
    const resourceName: string = "KBV_PR_MIO_ULB_Observation_Presence_Information_Nutrition";
    const uuids: string[] = root.content
        .getAllUuidsOfOneResourceType("KBV_PR_MIO_ULB_Observation_Food_Type")
        .concat(root.content.getAllUuidsOfOneResourceType("KBV_PR_MIO_ULB_Observation_Food_Administration_Form"))
        .concat(root.content.getAllUuidsOfOneResourceType("KBV_PR_MIO_ULB_Observation_Nutrition"));

    //Delete resource
    root.deleteAllResourcesOfType(resourceName);

    //Write resource
    const subTree: SubTree = new SubTree(UuidPIO.generateUuid() + "." + resourceName, undefined);
    subTree.setValue("status", new CodePIO("final"));
    writeCodingToSubTree(subTree, codeCodingPath, {
        system: systemSnomed,
        version: versionSnomed,
        code: "364393001:704321009=384760004",
        display:
            "Nutritional observable (observable entity) : Characterizes (attribute) = Feeding and dietary regime (regime/therapy)",
    });
    subTree.setValue(subjectReferencePath, new UuidPIO(patientUuid));
    writeCodingToSubTree(subTree, valueCodeableConceptCodingPath, {
        system: "https://fhir.kbv.de/ValueSet/KBV_VS_MIO_ULB_Nutritional_Information",
        version: "1.0.0",
        code: uuids.length === 0 ? "373572006:246090004=300893006" : "373573001:246090004=300893006",
        display:
            uuids.length === 0
                ? "Clinical finding absent (situation) : Associated finding (attribute) = Nutritional finding (finding)"
                : "Clinical finding present (situation) : Associated finding (attribute) = Nutritional finding (finding)",
    });
    uuids.forEach((uuid: string, index: number) => {
        subTree.setValue("hasMember[" + index + braketReferencePath, new UuidPIO(uuid));
    });
    root.saveSubTrees([subTree]);
};

/**
 * Generates the resource KBV_PR_MIO_ULB_DiagnosticReport_Vital_Signs_and_Body_Measures automatically.
 * @param {RootObject} root Current root object
 * @param {string} patientUuid Uuid of patient
 */
const generateVitalSignsAndBodyMeasures = (root: RootObject, patientUuid: string): void => {
    const resourceName: string = "KBV_PR_MIO_ULB_DiagnosticReport_Vital_Signs_and_Body_Measures";
    const uuids: string[] = root.content
        .getAllUuidsOfOneResourceType("KBV_PR_MIO_ULB_Observation_Blood_Pressure")
        .concat(root.content.getAllUuidsOfOneResourceType("KBV_PR_MIO_ULB_Observation_Body_Weight"))
        .concat(root.content.getAllUuidsOfOneResourceType("KBV_PR_MIO_ULB_Observation_Body_Height"))
        .concat(root.content.getAllUuidsOfOneResourceType("KBV_PR_MIO_ULB_Observation_Heart_Rate"))
        .concat(root.content.getAllUuidsOfOneResourceType("KBV_PR_MIO_ULB_Observation_Peripheral_Oxygen_Saturation"))
        .concat(root.content.getAllUuidsOfOneResourceType("KBV_PR_MIO_ULB_Observation_Respiratory_Rate"))
        .concat(root.content.getAllUuidsOfOneResourceType("KBV_PR_MIO_ULB_Observation_Body_Temperature"))
        .concat(root.content.getAllUuidsOfOneResourceType("KBV_PR_MIO_ULB_Observation_Glucose_Concentration"))
        .concat(root.content.getAllUuidsOfOneResourceType("KBV_PR_MIO_ULB_Observation_Assessment_Free"));

    //Delete resource
    root.deleteAllResourcesOfType(resourceName);

    //Write resource
    if (uuids.length > 0) {
        const subTree: SubTree = new SubTree(UuidPIO.generateUuid() + "." + resourceName, undefined);
        subTree.setValue("status", new CodePIO("final"));
        writeCodingToSubTree(subTree, codeCodingPath, {
            system: systemSnomed,
            version: versionSnomed,
            code: "1184593002",
            display: "Vital sign document section (record artifact)",
        });
        subTree.setValue(subjectReferencePath, new UuidPIO(patientUuid));
        uuids.forEach((uuid: string, index: number) => {
            subTree.setValue("result[" + index + braketReferencePath, new UuidPIO(uuid));
        });
        root.saveSubTrees([subTree]);
    }
};

/**
 * Generates the resource KBV_PR_MIO_ULB_Observation_Personal_Statements automatically. Referenced resource
 * KBV_PR_MIO_ULB_Consent_Statement is not part of PIO Small -> always 'absent'
 * @param {RootObject} root Current root object
 * @param {string} patientUuid Uuid of patient
 */
const generatePersonalStatements = (root: RootObject, patientUuid: string): void => {
    const resourceName: string = "KBV_PR_MIO_ULB_Observation_Personal_Statements";
    const uuids: string[] = root.content.getAllUuidsOfOneResourceType("KBV_PR_MIO_ULB_Consent_Statement");

    //Delete resource
    root.deleteAllResourcesOfType(resourceName);

    //Write resource
    const subTree: SubTree = new SubTree(UuidPIO.generateUuid() + "." + resourceName, undefined);
    subTree.setValue("status", new CodePIO("final"));
    writeCodingToSubTree(subTree, codeCodingPath, {
        system: systemSnomed,
        version: versionSnomed,
        code: "363787002:704325000=371538006",
        display:
            "Observable entity (observable entity): Relative to (attribute) = Advance directive report (record artifact)",
    });
    subTree.setValue(subjectReferencePath, new UuidPIO(patientUuid));
    writeCodingToSubTree(subTree, valueCodeableConceptCodingPath, {
        system: "https://fhir.kbv.de/ValueSet/KBV_VS_MIO_ULB_Advance_Directive_Status",
        version: "1.0.0",
        code: uuids.length === 0 ? "310301000:363713009=2667000" : "310301000:363713009=52101004",
        display:
            uuids.length === 0
                ? "Advance healthcare directive status (finding) : Has interpretation (attribute) = Absent (qualifier value)"
                : "Advance healthcare directive status (finding) : Has interpretation (attribute) = Present (qualifier value)",
    });
    uuids.forEach((uuid: string, index: number) => {
        subTree.setValue(extensionOpenBraketPath + index + "]", new UriPIO(extensionUrlHasMember));
        subTree.setValue(extensionOpenBraketPath + index + braketValueReferenceReferencePath, new UuidPIO(uuid));
    });
    root.saveSubTrees([subTree]);
};

/**
 * This function adds resources which can be automatically generated in backend.
 * (e.g. KBV_PR_MIO_ULB_Observation_Degree_Of_Disability_Available, KBV_PR_MIO_ULB_Observation_Presence_Allergies, ...)
 * @param {RootObject} root Whole RootObject
 */
export const generateContextResources = (root: RootObject) => {
    //Patient uuid
    const patientUuid: string = root.content.getAllUuidsOfOneResourceType("KBV_PR_MIO_ULB_Patient")[0];

    //Write resources
    generateDegreeOfDisabilityAvailable(root, patientUuid);
    generatePresenceAllergies(root, patientUuid);
    generatePresenceFunctionalAssessment(root, patientUuid);
    generatePresenceProblems(root, patientUuid);
    generatePresenceRisks(root, patientUuid);
    generatePresenceInformationNutrition(root, patientUuid);
    generateVitalSignsAndBodyMeasures(root, patientUuid);
    generatePersonalStatements(root, patientUuid);
};
