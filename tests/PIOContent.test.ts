import { PIOContent } from "../src/PIOContent";
import {
    BinaryPIO,
    BooleanPIO,
    CodePIO,
    DatePIO,
    DateTimePIO,
    DecimalPIO,
    IntegerPIO,
    StringPIO,
    UnsignedIntegerPIO,
    UriPIO,
    UuidPIO,
    RootObjectType,
} from "@thaias/pio_editor_meta";

describe("Tests for class 'PIOContent'", () => {
    const pioContent = new PIOContent();

    //Define string constants
    const patientUuid = "39f928a1-52f6-4563-8918-214cb3b2b55f";
    const patientResourceName = "KBV_PR_MIO_ULB_Patient";
    const patientPath = patientUuid + "." + patientResourceName;
    const encounterUuid = "e029b2b8-5dc6-4feb-990a-7471fb9b54e3";
    const encounterResourceName = "KBV_PR_MIO_ULB_Encounter_Current_Location";
    const encounterPath = encounterUuid + "." + encounterResourceName;
    const patientProfileUrl = "https://fhir.kbv.de/StructureDefinition/KBV_PR_MIO_ULB_Patient|1.0.0";
    const binaryString = "VGVzdCBCYXNlNjQgc3RyaW5n";

    describe("Tests for methods setValue()", () => {
        pioContent.setValue(patientPath + ".name[0].text", new StringPIO("Dr. Alex Mayr"));
        pioContent.setValue(patientPath + ".gender", new CodePIO("female"));
        pioContent.setValue(patientPath + ".@profile@", new StringPIO(patientProfileUrl));
        pioContent.setValue(patientPath + ".attachment[0]", new BinaryPIO(binaryString)); //invalid path
        pioContent.setValue(encounterPath + ".subject.reference", new UuidPIO(patientUuid));
        pioContent.setValue(encounterPath + ".dateTime", new DateTimePIO(2022, 8, 9, 12, 45, 56)); //invalid path
        pioContent.setValue(patientPath + ".birthDate", new DatePIO(1965, 8, 9));
        pioContent.setValue(patientPath + ".disabled", new BooleanPIO(true)); //invalid path
        pioContent.setValue(patientPath + ".daysUntilRelease", new IntegerPIO(35873)); //invalid path
        pioContent.setValue(patientPath + ".weight", new DecimalPIO(123.99)); //invalid path
        pioContent.setValue(patientPath + ".numberOfFalls", new UnsignedIntegerPIO(267)); //invalid path

        it("should return 'Dr. Alex Mayr' as string", () => {
            expect(
                pioContent.data[patientUuid.toString()][patientResourceName.toString()]["name"][0]["text"][
                    "__value"
                ].toString()
            ).toEqual("Dr. Alex Mayr");
        });

        it("should return 'female' as string", () => {
            expect(
                pioContent.data[patientUuid.toString()][patientResourceName.toString()]["gender"]["__value"].toString()
            ).toEqual("female");
        });

        it("should return the patients profile url as string", () => {
            expect(
                pioContent.data[patientUuid.toString()][patientResourceName.toString()]["@profile@"].toString()
            ).toEqual(patientProfileUrl);
        });

        it("should return 'AmgRGes348G//fds+++7tF==' as string", () => {
            expect(
                pioContent.data[patientUuid.toString()][patientResourceName.toString()]["attachment"][0][
                    "__value"
                ].toString()
            ).toEqual(binaryString);
        });

        it("should return the patients uuid as string", () => {
            expect(
                pioContent.data[encounterUuid.toString()][encounterResourceName.toString()]["subject"]["reference"][
                    "__value"
                ].toString()
            ).toEqual("urn:uuid:" + patientUuid);
        });

        it("should return the date as string (format: YYY-MM-DDThh:mm:ss)", () => {
            expect(
                pioContent.data[encounterUuid.toString()][encounterResourceName.toString()]["dateTime"][
                    "__value"
                ].toString()
            ).toEqual("2022-08-09T12:45:56Z");
        });

        it("should return '1965-08-09' as string", () => {
            expect(
                pioContent.data[patientUuid.toString()][patientResourceName.toString()]["birthDate"][
                    "__value"
                ].toString()
            ).toEqual("1965-08-09");
        });

        it("should return 'true' as string", () => {
            expect(
                pioContent.data[patientUuid.toString()][patientResourceName.toString()]["disabled"][
                    "__value"
                ].toString()
            ).toEqual("true");
        });

        it("should return '35873' as string", () => {
            expect(
                pioContent.data[patientUuid.toString()][patientResourceName.toString()]["daysUntilRelease"][
                    "__value"
                ].toString()
            ).toEqual("35873");
        });

        it("should return '123.99' as string", () => {
            expect(
                pioContent.data[patientUuid.toString()][patientResourceName.toString()]["weight"]["__value"].toString()
            ).toEqual("123.99");
        });

        it("should return '267' as string", () => {
            expect(
                pioContent.data[patientUuid.toString()][patientResourceName.toString()]["numberOfFalls"][
                    "__value"
                ].toString()
            ).toEqual("267");
        });
    });

    describe("Test PathValidator", () => {
        it("should detect all invalid paths", () => {
            expect(pioContent.pV.invalidPaths).toEqual([
                patientPath + ".attachment[0]",
                encounterPath + ".dateTime",
                patientPath + ".disabled",
                patientPath + ".daysUntilRelease",
                patientPath + ".weight",
                patientPath + ".numberOfFalls",
            ]);
        });
    });

    describe("Tests for method getValueByPath()", () => {
        it("should be equal to the values (primitive data) set in the test before", () => {
            expect(pioContent.getValueByPath(patientPath + "." + "numberOfFalls").toString()).toEqual("267");
            expect(pioContent.getValueByPath(patientPath + ".gender").toString()).toEqual("female");
        });

        it("should be possible to get header data", () => {
            expect(pioContent.getValueByPath(patientPath + ".@profile@").toString()).toEqual(patientProfileUrl);
        });

        it("should be possible to get extension urls", () => {
            const extensionUrl = "https://fhir.kbv.de/StructureDefinition/KBV_EX_MIO_ULB_Interpreter_Required";
            pioContent.setValue(patientPath + ".extension[0]", new UriPIO(extensionUrl));
            expect(pioContent.getValueByPath(patientPath + ".extension[0]").toString()).toEqual(extensionUrl);
        });

        it("should throw an error if path does not exist", () => {
            expect(() => pioContent.getValueByPath(patientPath + ".xdf[3]")).toThrow();
        });

        it("should throw an error if path does not point to a primitive data type", () => {
            expect(() => pioContent.getValueByPath(patientPath + "name[0]")).toThrow();
        });
    });

    describe("Tests for method getAllUuidsOfOneResourceType()", () => {
        //Add another 'KBV_PR_MIO_ULB_Encounter_Current_Location' resource
        pioContent.setValue(
            "59b209c4-8e53-475a-9158-2d3f5668a42e.KBV_PR_MIO_ULB_Encounter_Current_Location.subject",
            new UuidPIO(patientUuid)
        );

        it("should return all uuid of all encounter resources", () => {
            expect(pioContent.getAllUuidsOfOneResourceType(encounterResourceName)).toEqual([
                "e029b2b8-5dc6-4feb-990a-7471fb9b54e3",
                "59b209c4-8e53-475a-9158-2d3f5668a42e",
            ]);
        });

        it("should return the uuid of the patient resource as string[]", () => {
            expect(pioContent.getAllUuidsOfOneResourceType(patientResourceName)).toEqual([patientUuid]);
        });

        it("should return an empty array because no organization resources are present", () => {
            expect(pioContent.getAllUuidsOfOneResourceType("KBV_PR_MIO_ULB_Organization")).toEqual([] as string[]);
        });
    });

    describe("Tests for clearData() method", () => {
        it("should clear all data", () => {
            pioContent.clearData();
            expect(pioContent.data).toEqual({} as RootObjectType);
        });
    });
});
