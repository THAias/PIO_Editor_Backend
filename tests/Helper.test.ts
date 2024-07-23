import { findObjectByKey, generateCodingElement } from "../src/Helper";
import { ICodingElement } from "../src/@types/InterfacesForFHIRStructure";

describe("Tests for function findObjectByKey()", () => {
    const testObj: object = {
        Patient: {
            name: {
                use: "official",
                family: "Schneider",
                given: "Markus",
            },
            birthDate: "1945-09-23",
            telecom: [
                {
                    system: "phone",
                    value: "0821872364",
                },
                {
                    system: "email",
                    value: "lol@gmx.de",
                },
            ],
        },
        Organization: {
            name: "Tiger GmbH",
            address: {
                line: "Merkurweg",
                city: "Neusaess",
                postalCode: "86356",
            },
        },
    };

    it("should return the 'address' key as single object", () => {
        expect(findObjectByKey(testObj, "address")).toEqual({
            line: "Merkurweg",
            city: "Neusaess",
            postalCode: "86356",
        });
    });

    it("should return the first 'name' key in testObj", () => {
        expect(findObjectByKey(testObj, "name")).toEqual({
            use: "official",
            family: "Schneider",
            given: "Markus",
        });
    });

    it("should return the key 'telecom' as array of objects", () => {
        expect(findObjectByKey(testObj, "telecom")).toEqual([
            {
                system: "phone",
                value: "0821872364",
            },
            {
                system: "email",
                value: "lol@gmx.de",
            },
        ]);
    });

    it("should return undefined because key is not in testObj", () => {
        expect(findObjectByKey(testObj, "extension")).toEqual(undefined);
    });
});

describe("Tests for the function generateCodingElement()", () => {
    it("should return the right FHIR coding element", () => {
        expect(generateCodingElement("https://mio42.de/codesystem12", "4.0.1", "de", "deutsch")).toEqual({
            coding: {
                system: { __value: "https://mio42.de/codesystem12" },
                version: { __value: "4.0.1" },
                code: { __value: "de" },
                display: { __value: "deutsch" },
            },
        } as unknown as ICodingElement);
    });
});

//Functions getXMLParser(), getXMLBuilder(), getXmlFormatterOptions() and getLookUpTable() are tested in the tests for
//RootObject class
