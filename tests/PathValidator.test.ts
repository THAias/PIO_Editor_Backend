import { PathValidator } from "../src/PathValidator";
import { RootObject } from "../src/RootObject";
import { CodePIO, StringPIO, UriPIO } from "@thaias/pio_editor_meta";

describe("Tests for class PathValidator", () => {
    const pV: PathValidator = new PathValidator();

    //Generation of some valid and invalid paths
    const somePaths: string[] = [
        "e029b2b8-5dc6-4feb-990a-7471fb9b54e3.KBV_PR_MIO_ULB_Patient.identifier[0].use", //valid
        "e029b2b8-5dc6-4feb-990a-7471fb9b54e3.KBV_PR_MIO_ULB_Ptient.name[0].family", //invalid
        "39f928a1-52f6-4563-8918-214cb3b2b55f.KBV_PR_MIO_ULB_Organization.@div@", //valid
        "e029b2b8-5dc6-4feb-990a-7471fb9b54e3.KBV_PR_MIO_ULB_Patient.extension[1]", //valid
        "39f928a1-52f6-4563-8918-214cb3b2b55f.KBV_PR_MIO_ULB_Organization.@statuuus@", //invalid
        "39f928a1-52f6-4563-8918-214cb3b2b55f.KBV_PR_MIO_ULB_Organization.telecom[0].value", //valid
        "39f928a1-52f6-4563-8918-214cb3b2b55f.KBV_PR_MIO_ULB_Organization.telecom[0].number", //invalid
    ];

    describe("Tests for method validatePaths()", () => {
        it("should return an empty array because the stated path is valid", () => {
            const result: string[] = pV.validatePaths(somePaths[0]);
            expect(result).toEqual([] as string[]);
            expect(pV.invalidPaths).toEqual([] as string[]);
        });
        it("should return the stated path as array because the stated path is invalid", () => {
            const result: string[] = pV.validatePaths(somePaths[1]);
            expect(result).toEqual([somePaths[1]]);
            expect(pV.invalidPaths).toEqual([somePaths[1]]);
        });
        it("should return all invalid paths as array and add them to class property 'invalidPaths'", () => {
            const result: string[] = pV.validatePaths(somePaths);
            expect(result).toEqual([somePaths[1], somePaths[4], somePaths[6]]);
            expect(pV.invalidPaths).toEqual([somePaths[1], somePaths[4], somePaths[6]]);
        });
    });

    describe("Tests for method 'getInvalidPaths()'", () => {
        it("should return the current state of the class property 'invalidPaths'", () => {
            expect(pV.getInvalidPaths()).toEqual([somePaths[1], somePaths[4], somePaths[6]]);
        });
    });

    describe("Tests for method 'clearInvalidPaths()'", () => {
        it("should clear the class property 'invalidPaths'", () => {
            pV.clearInvalidPaths();
            expect(pV.getInvalidPaths()).toEqual([] as string[]);
        });
    });

    describe("Integration test for pathValidator operating in class PIOContent", () => {
        it("should add the invalid path to the RootObject but path should be detected by pV", () => {
            const root: RootObject = new RootObject({ firstName: "test", lastName: "test" });

            //Set values in RootObject
            root.content.setValue(somePaths[0], new CodePIO("official"));
            root.content.setValue(somePaths[1], new StringPIO("Schneider"));
            root.content.setValue(somePaths[2], new StringPIO("Sendende Einrichtung"));
            root.content.setValue(
                somePaths[3],
                new UriPIO("https://fhir.kbv.de/StructureDefinition/KBV_EX_MIO_ULB_Interpreter_Required")
            );
            root.content.setValue(somePaths[4], new CodePIO("extensions"));
            root.content.setValue(somePaths[5], new StringPIO("082192374"));
            root.content.setValue(somePaths[6], new StringPIO("080510218374"));

            //Check existence of paths in RootObject
            expect(root.content.getValueByPath(somePaths[0]).toString()).toEqual("official");
            expect(root.content.getValueByPath(somePaths[1]).toString()).toEqual("Schneider");
            expect(root.content.getValueByPath(somePaths[2]).toString()).toEqual("Sendende Einrichtung");
            expect(root.content.getValueByPath(somePaths[3]).toString()).toEqual(
                "https://fhir.kbv.de/StructureDefinition/KBV_EX_MIO_ULB_Interpreter_Required"
            );
            expect(root.content.getValueByPath(somePaths[4]).toString()).toEqual("extensions");
            expect(root.content.getValueByPath(somePaths[5]).toString()).toEqual("082192374");
            expect(root.content.getValueByPath(somePaths[6]).toString()).toEqual("080510218374");

            //Check detection by PathValidator
            expect(root.content.pV.invalidPaths).toEqual([
                "e029b2b8-5dc6-4feb-990a-7471fb9b54e3.KBV_PR_MIO_ULB_Ptient.name[0].family",
                "39f928a1-52f6-4563-8918-214cb3b2b55f.KBV_PR_MIO_ULB_Organization.@statuuus@",
                "39f928a1-52f6-4563-8918-214cb3b2b55f.KBV_PR_MIO_ULB_Organization.telecom[0].number",
            ]);
        });
    });
});
