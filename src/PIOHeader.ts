import { DateTimePIO, UuidPIO } from "@thaias/pio_editor_meta";
import { IGivenDevices, IPIOHeaderData } from "./@types/InterfacesForRootObject";

/**
 * Class holds all PIO header information in 'PIOHeader.data' and is used as property in RootObject. Header information
 * will be used in the Bundle and Composition (FHIR resources)
 * @property {IPIOHeaderData} data Stores all PIO header data in one object
 */
class PIOHeader {
    data: IPIOHeaderData = {} as IPIOHeaderData;
    givenDevices: IGivenDevices = {
        KBV_PR_MIO_ULB_Device_Aid: [],
        KBV_PR_MIO_ULB_Medication: [],
        KBV_PR_MIO_ULB_Provenance_Source_of_Information: [],
        KBV_PR_MIO_ULB_Device: [],
        KBV_PR_MIO_ULB_Device_Other_Item: [],
    } as IGivenDevices;

    /**
     * Sets the uuid of the receiving institution (FHIR organization resource).
     * @param {UuidPIO} uuid Uuid of the receiving institution as UuidPIO
     * @returns {PIOHeader} Its own instance, so that methods can be chained
     */
    setReceivingInstitution = (uuid: UuidPIO): PIOHeader => {
        this.data.receivingInstitution = uuid;
        return this;
    };

    /**
     * Clears the uuid of the receiving institution (FHIR organization resource).
     * @returns {PIOHeader} Its own instance, so that methods can be chained
     */
    clearReceivingInstitution = (): PIOHeader => {
        this.data.receivingInstitution = undefined;
        return this;
    };

    /**
     * Getting the uuid of the receiving institution (FHIR organization resource). If no receiving institution is
     * stated, an error is thrown.
     * @returns {string} The uuid of the receiving institution as string
     */
    getReceivingInstitution = (): string => {
        if (this.data.receivingInstitution) return this.data.receivingInstitution.get();
        else throw Error("No receiving institution stated");
    };

    /**
     * Sets the uuid of the patient (FHIR patient resource).
     * @param {UuidPIO} uuid Uuid of the patient resource as UuidPIO
     * @returns {PIOHeader} Its own instance, so that methods can be chained
     */
    setPatient = (uuid: UuidPIO): PIOHeader => {
        this.data.patient = uuid;
        return this;
    };

    /**
     * Sets timestamp for Composition FHIR resource.
     * @param {DateTimePIO} dateTime DateTimePIO object representing the timestamp
     * @returns {PIOHeader} Its own instance, so that methods can be chained
     */
    setDateComposition = (dateTime: DateTimePIO): PIOHeader => {
        this.data.dateTimeComposition = dateTime;
        return this;
    };

    /**
     * Sets timestamp for Bundle FHIR resource.
     * @param {DateTimePIO} dateTime DateTimePIO object representing the timestamp
     * @returns {PIOHeader} Its own instance, so that methods can be chained
     */
    setTimestampBundle = (dateTime: DateTimePIO): PIOHeader => {
        this.data.timestampBundle = dateTime;
        return this;
    };

    /**
     * Adds an author to the author list.
     * @param {UuidPIO} uuid UuidPIO object referencing a Practitioner, PractitionerRole or Organization FHIR resource
     * @returns {PIOHeader} Its own instance, so that methods can be chained
     */
    addAuthor = (uuid: UuidPIO): PIOHeader => {
        if (!this.data.hasOwnProperty("author")) {
            this.data.author = [uuid];
        } else {
            (this.data.author as UuidPIO[]).push(uuid);
        }
        return this;
    };

    /**
     * Deletes an author from the author list.
     * @param {string} uuid Uuid string referencing a Practitioner, PractitionerRole or Organization FHIR resource
     */
    deleteAuthor = (uuid: string): void => {
        if (this.data.author) {
            const newAuthorArray: UuidPIO[] = this.data.author.filter((item: UuidPIO) => item.get() !== uuid);
            if (this.data.author.length === newAuthorArray.length) throw Error("Uuid does not exist");
            else this.data.author = newAuthorArray;
        } else {
            throw Error("No author existing");
        }
    };

    /**
     * Gets all author uuids from the author list.
     * @returns {string[]} Array of author uuids. If no author is stated, an empty array is returned.
     */
    getAllAuthorUuids = (): string[] => {
        if (this.data.author) {
            return this.data.author.map((item: UuidPIO) => item.get());
        } else {
            return [] as string[];
        }
    };

    /**
     * Sets the Bundle (FHIR resource) uuid.
     * @param {UuidPIO} uuid UuidPIO object as unique identifier for the Bundle used as header data
     * @returns {PIOHeader} Its own instance, so that methods can be chained
     */
    setBundleUuid(uuid: UuidPIO): PIOHeader {
        this.data.bundleUuid = uuid;
        return this;
    }

    /**
     * Sets the Bundle (FHIR resource) identifier uuid.
     * @param {UuidPIO} uuid UuidPIO object as unique identifier for the Bundle
     * @returns {PIOHeader} Its own instance, so that methods can be chained
     */
    setBundleIdentifierUuid(uuid: UuidPIO): PIOHeader {
        this.data.bundleIdentifierUuid = uuid;
        return this;
    }

    /**
     * Sets the Composition (FHIR resource) uuid.
     * @param {UuidPIO} uuid UuidPIO object as unique identifier for the Composition used as header data
     * @returns {PIOHeader} Its own instance, so that methods can be chained
     */
    setCompositionUuid(uuid: UuidPIO): PIOHeader {
        this.data.compositionUuid = uuid;
        return this;
    }

    /** Clears all header data. */
    clearHeader(): void {
        this.data = {};
    }

    /**
     * Adds a new uuid to the givenDevices property, if uuid does not already exist. Otherwise, no uuid is added.
     * @param {string} uuid UUid to be added
     * @param {string} resourceType Key where the uuid should be added (e.g. KBV_PR_MIO_ULB_Device_Aid)
     */
    addGivenDevice(uuid: string, resourceType: string): void {
        if (!this.givenDevices[resourceType.toString()].includes(uuid)) {
            this.givenDevices[resourceType.toString()].push(uuid);
        }
    }

    /**
     * Deletes an uuid from the givenDevices property, if stated uuid exists. Otherwise, no uuid is deleted.
     * @param {string} uuid UUid to be deleted
     * @param {string} resourceType Key where the uuid should be deleted (e.g. KBV_PR_MIO_ULB_Device_Aid)
     */
    deleteGivenDevice(uuid: string, resourceType: string): void {
        this.givenDevices[resourceType.toString()] = this.givenDevices[resourceType.toString()].filter(
            (existingUuid: string) => existingUuid !== uuid
        );
    }

    /**
     * Returns all uuids of one resource type.
     * @param {string} resourceType All uuids of this resource type will be returned (e.g. KBV_PR_MIO_ULB_Device_Aid)
     * @returns {string[]} All uuids of the stated resource type
     */
    getGivenDevices(resourceType: string): string[] {
        return this.givenDevices[resourceType.toString()];
    }

    /** @returns {IGivenDevices} The givenDevices property. */
    getAllGivenDevices(): IGivenDevices {
        return this.givenDevices;
    }

    /** Clears all given devices. */
    clearAllGivenDevices(): void {
        this.givenDevices = {
            KBV_PR_MIO_ULB_Device_Aid: [],
            KBV_PR_MIO_ULB_Medication: [],
            KBV_PR_MIO_ULB_Provenance_Source_of_Information: [],
            KBV_PR_MIO_ULB_Device: [],
            KBV_PR_MIO_ULB_Device_Other_Item: [],
        } as IGivenDevices;
    }
}

export { PIOHeader };
