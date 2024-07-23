import { XMLBuilder, XmlBuilderOptions, XMLParser } from "fast-xml-parser";
import { ResourceLookUpTableJson, PioSmallLookUpTableJson, ResourceLookUpTable } from "@thaias/pio_fhir_resources";
import { ICodingElement } from "./@types/InterfacesForFHIRStructure";

/**
 * Returns a XMLParser object from library fast-xml-parser individualized by options. This object can be used to imread
 * a xml file (=PIO).
 * @param {string[]} alwaysArrayParameter Specify xml tag names which should be interpreted always as array. This
 * parameter is optional and will be replaced by a standard list if not stated
 * @returns {XMLParser} A XMLParser object from fast-xml-parser library
 * @remarks In order to process xml attributes correctly ignoreAttributes-option must be set to false. All attributes
 * will be stored with a '__' prefix while parsing
 */
function getXMLParser(alwaysArrayParameter?: string[]): XMLParser {
    const alwaysArrayStandard: string[] = [];
    const alwaysArray: string[] = alwaysArrayParameter ? alwaysArrayParameter : alwaysArrayStandard;
    return new XMLParser({
        attributeNamePrefix: "__",
        ignoreAttributes: false,
        isArray: (tagName) => alwaysArray.includes(tagName),
    });
}

/**
 * Returns a XMLBuilder object from library fast-xml-parser individualized by options. This object can be used to export
 * a PIO (=building a xml file).
 * @param {string} firstNodeName Name of first node while building xml
 * @param {XmlBuilderOptions} XMLBuilderOptions Options for XMLBuilder which is optional. If not stated standard
 * options are used
 * @returns {XMLBuilder} A XMLBuilder object from fast-xml-parser library
 * @remarks In order to process xml attributes correctly ignoreAttributes-option must be set to false. All attributes
 * must be stored with a '__' prefix for building. The format-option (= true) will format xml file. Empty nodes should
 * be ignored (set suppressEmptyNode-option to true).
 */
function getXMLBuilder(firstNodeName: string, XMLBuilderOptions?: XmlBuilderOptions): XMLBuilder {
    return new XMLBuilder(
        XMLBuilderOptions
            ? XMLBuilderOptions
            : {
                  format: true,
                  suppressEmptyNode: true,
                  attributeNamePrefix: "__",
                  arrayNodeName: firstNodeName,
                  ignoreAttributes: false,
                  processEntities: false,
              }
    );
}

/**
 * Searches in 'obj' for a key. The method returns the first key which matches the parameter 'key'. All nested objects
 * in 'obj' will be recursively called.
 * @param {object} obj Arbitrary object which will be searched through
 * @param {string} key Key as string which should be searched for in 'obj'
 * @returns {object | object[] | undefined} The value of the stated key. This could be a single or multiple objects. If
 * key was not found, undefined is returned
 * @remarks Used in readXML() method of RootObject. This function is recursive.
 */
function findObjectByKey(obj: object, key: string): object | object[] | undefined {
    let result;

    for (const property in obj) {
        if (obj.hasOwnProperty(property)) {
            if (property === key) {
                return obj[key.toString()];
            } else if (typeof obj[property.toString()] === "object") {
                result = findObjectByKey(obj[property.toString()], key);

                if (typeof result !== "undefined") {
                    return result;
                }
            }
        }
    }
}

/**
 * @returns {object} The lookUpTable as javascript object
 * @remarks The lookUpTable stores all valid paths according to the PIO specification and their data types.
 */
function getLookUpTable(): ResourceLookUpTable {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    return ResourceLookUpTableJson;
}

/**
 * @returns {object} The pioSmallLookUpTable as javascript object
 * @remarks The pioSmallLookUpTable stores all valid paths according to our self defined PIO Small
 */
function getPioSmallLookUpTable(): ResourceLookUpTable {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    return PioSmallLookUpTableJson;
}

/**
 * @returns {object} An object with should be used as options for xml-formatter library to ensure similar xml style
 */
function getXmlFormatterOptions(): object {
    return {
        collapseContent: true,
        lineSeparator: "\n",
        indentation: "  ",
    };
}

/**
 * Generates a FHIR coding element
 * @param {string} system Code system of the coding element
 * @param {string} version Version of the code system
 * @param {string} code Code
 * @param {string} display Display value for the code
 * @returns {ICodingElement} A CodingElement interface
 */
function generateCodingElement(system: string, version: string, code: string, display: string): ICodingElement {
    return {
        coding: {
            system: { __value: system },
            version: { __value: version },
            code: { __value: code },
            display: { __value: display },
        },
    } as ICodingElement;
}

// Exports
export {
    findObjectByKey,
    getXMLParser,
    getXMLBuilder,
    getLookUpTable,
    getXmlFormatterOptions,
    generateCodingElement,
    getPioSmallLookUpTable,
};
