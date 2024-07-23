import { ICodingElement } from "./@types/InterfacesForFHIRStructure";
import path from "path";

//Root directory of whole project
const projectRoot = path.resolve(__dirname, "..");

//Secret for Json Web Token
const JWT_SECRET: string = "pioeditor";

//Maximal session time for "webVersion" and "localVersion"
const SESSION_TIME_WEB_VERSION_STRING: string = "4h";
const SESSION_TIME_WEB_VERSION_NUMBER: number = 14400000; //in ms (=4h)
const SESSION_TIME_LOCAL_VERSION_STRING: string = "24h";
const SESSION_TIME_LOCAL_VERSION_NUMBER: number = 86400000; //in ms (=24h)

//Name of the mandatory FHIR resource 'Patient' according to the PIO specification
const KBV_PATIENT_RESOURCE_NAME = "KBV_PR_MIO_ULB_Patient";

//Url to the structure definition of the bundle FHIR resource
const BUNDLE_STRUCTURE_DEFINITION_URL = "https://fhir.kbv.de/StructureDefinition/KBV_PR_MIO_ULB_Bundle|1.0.0";

//System for the 'identifier' element in the FHIR 'Bundle' resource
const BUNDLE_IDENTIFIER_SYSTEM = "urn:ietf:rfc:3986";

//Value for the 'type' element in the FHIR 'Bundle' resource
const BUNDLE_TYPE = "document";

//Url to the structure definition of the composition FHIR resource
const COMPOSITION_STRUCTURE_DEFINITION_URL = "https://fhir.kbv.de/StructureDefinition/KBV_PR_MIO_ULB_Composition|1.0.0";

//Value for the resource 'status' element in the FHIR 'Composition' resource
const COMPOSITION_RESOURCE_STATUS = "extensions";

//Xml namespace for the 'div' element in the FHIR 'Composition' resource
const NARRATIVE_DIV_XML_NAMESPACE = "http://www.w3.org/1999/xhtml";

//Xml namespace for the wrapping 'Bundle' xml tag
const BUNDLE_XML_NAMESPACE = "http://hl7.org/fhir";

//Value for the narrative 'div' element in the FHIR 'Composition' resource
const COMPOSITION_NARRATIVE_DIV = "<h1>Composition</h1>";

//Url for the 'extension' element in the FHIR 'Composition' resource
const COMPOSITION_EXTENSION_RECEIVING_INSTITUTION =
    "https://fhir.kbv.de/StructureDefinition/KBV_EX_MIO_ULB_Reference_Receiving_Institution";

//Value for the 'status' element in the FHIR 'Composition' resource
const COMPOSITION_STATUS = "final";

//Value for the 'type' element in the FHIR 'Composition' resource
const COMPOSITION_TYPE: ICodingElement = {
    coding: {
        system: { __value: "http://snomed.info/sct" },
        version: { __value: "http://snomed.info/sct/900000000000207008/version/20220331" },
        code: { __value: "721919000" },
        display: { __value: "Nurse discharge summary (record artifact)" },
    },
};

//Value for the 'title' element in the FHIR 'Composition' resource
const COMPOSITION_TITLE = "Überleitungsbogen";

export {
    KBV_PATIENT_RESOURCE_NAME,
    BUNDLE_STRUCTURE_DEFINITION_URL,
    BUNDLE_IDENTIFIER_SYSTEM,
    BUNDLE_TYPE,
    COMPOSITION_STRUCTURE_DEFINITION_URL,
    COMPOSITION_RESOURCE_STATUS,
    NARRATIVE_DIV_XML_NAMESPACE,
    COMPOSITION_NARRATIVE_DIV,
    COMPOSITION_EXTENSION_RECEIVING_INSTITUTION,
    COMPOSITION_STATUS,
    COMPOSITION_TYPE,
    COMPOSITION_TITLE,
    BUNDLE_XML_NAMESPACE,
    projectRoot,
    JWT_SECRET,
    SESSION_TIME_LOCAL_VERSION_STRING,
    SESSION_TIME_LOCAL_VERSION_NUMBER,
    SESSION_TIME_WEB_VERSION_NUMBER,
    SESSION_TIME_WEB_VERSION_STRING,
};
