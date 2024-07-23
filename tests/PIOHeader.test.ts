import { PIOHeader } from "../src/PIOHeader";
import { DateTimePIO, UuidPIO } from "@thaias/pio_editor_meta";
import { IPIOHeaderData } from "../src/@types/InterfacesForRootObject";

describe("Tests for class 'PIOHeader'", () => {
    const pioHeader = new PIOHeader();

    describe("Tests for methods setReceivingInstitution() AND setPatient()", () => {
        const institutionUuid: UuidPIO = new UuidPIO("c90c4fb0-2242-4bdc-b08d-28e4acc960af");
        const patientUuid: UuidPIO = new UuidPIO("3902835b-243d-4f86-ac61-28168c440dea");
        const returnedData: IPIOHeaderData = pioHeader
            .setReceivingInstitution(institutionUuid)
            .setPatient(patientUuid).data;

        it("should return the receiving institution uuid as string", () => {
            expect((returnedData.receivingInstitution as UuidPIO).toString()).toEqual(
                "urn:uuid:c90c4fb0-2242-4bdc-b08d-28e4acc960af"
            );
        });

        it("should return the patients uuid as string", () => {
            expect((returnedData.patient as UuidPIO).toString()).toEqual(
                "urn:uuid:3902835b-243d-4f86-ac61-28168c440dea"
            );
        });
    });

    describe("Tests for method setDateComposition()", () => {
        const dateTime: DateTimePIO = new DateTimePIO(2022, 8, 9, 12, 16, 42);
        const returnedData: IPIOHeaderData = pioHeader.setDateComposition(dateTime).data;

        it("should return '2022-08-09T12:16:42' as string", () => {
            expect((returnedData.dateTimeComposition as DateTimePIO).toString()).toEqual("2022-08-09T12:16:42Z");
        });
    });

    describe("Tests for method setTimestapBundle()", () => {
        const dateTime: DateTimePIO = new DateTimePIO(2022, 11, 23, 18, 42, 42);
        const returnedData: IPIOHeaderData = pioHeader.setTimestampBundle(dateTime).data;

        it("should return '2022-11-23T18:42:42' as string", () => {
            expect((returnedData.timestampBundle as DateTimePIO).toString()).toEqual("2022-11-23T18:42:42Z");
        });
    });

    describe("Tests for method addAuthor()", () => {
        const firstAuthor: UuidPIO = new UuidPIO("35f984fd-7749-4c9c-8d37-a6e94ee138b8");
        const secondAuthor: UuidPIO = new UuidPIO("1d5a9f04-8f68-47e0-87d2-0399756bca7e");
        const returnedData: IPIOHeaderData = pioHeader.addAuthor(firstAuthor).addAuthor(secondAuthor).data;

        it("should return the uuid of the first author as string", () => {
            expect((returnedData.author as UuidPIO[])[0].toString()).toEqual(
                "urn:uuid:35f984fd-7749-4c9c-8d37-a6e94ee138b8"
            );
        });

        it("should return the uuid of the second author as string", () => {
            expect((returnedData.author as UuidPIO[])[1].toString()).toEqual(
                "urn:uuid:1d5a9f04-8f68-47e0-87d2-0399756bca7e"
            );
        });

        it("should hold two authors in the array", () => {
            expect((returnedData.author as UuidPIO[]).length).toEqual(2);
        });
    });

    describe("Tests for method setBundleUuid()", () => {
        const bundleUuid: UuidPIO = new UuidPIO("1906ec29-2186-4ebd-9782-30b539aba542");
        const returnedData: IPIOHeaderData = pioHeader.setBundleUuid(bundleUuid).data;

        it("should return the bundle uuid as string", () => {
            expect((returnedData.bundleUuid as UuidPIO).toString()).toEqual(
                "urn:uuid:1906ec29-2186-4ebd-9782-30b539aba542"
            );
        });
    });

    describe("Tests for method setBundleIdentifierUuid()", () => {
        const bundleUuid: UuidPIO = new UuidPIO("cb06c815-529d-4423-99d2-7c2068125e2c");
        const returnedData: IPIOHeaderData = pioHeader.setBundleIdentifierUuid(bundleUuid).data;

        it("should return the bundle identifier uuid as string", () => {
            expect((returnedData.bundleIdentifierUuid as UuidPIO).toString()).toEqual(
                "urn:uuid:cb06c815-529d-4423-99d2-7c2068125e2c"
            );
        });
    });

    describe("Tests for method setCompositionUuid()", () => {
        const bundleUuid: UuidPIO = new UuidPIO("3e49195e-81ea-4688-8eed-ad7225e7559b");
        const returnedData: IPIOHeaderData = pioHeader.setCompositionUuid(bundleUuid).data;

        it("should return the composition uuid as string", () => {
            expect((returnedData.compositionUuid as UuidPIO).toString()).toEqual(
                "urn:uuid:3e49195e-81ea-4688-8eed-ad7225e7559b"
            );
        });
    });
});
