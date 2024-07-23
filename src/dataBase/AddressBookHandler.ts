import { IOrganizationObject } from "@thaias/pio_editor_meta";
import * as dbConnection from "./dbConnection";
import { checkConnectionDB } from "./dbConnection";
import { organizationAddressBookModel } from "./dbSchema";

/** Constants. */
const unknownErrorMessage = "Unknown error";

const validateId = async (id: string, message: string, update: boolean = false): Promise<void> => {
    const doesIdExist: boolean = await AddressBookHandler.doesIdExist(id, false);
    if ((update && !doesIdExist) || (!update && doesIdExist)) {
        console.error(message);
        throw Error(message);
    }
};
/**
 * This class manages the address book data in the database. Information about whole FHIR resources (e.g. Practitioner,
 * Organization) can be stored and requested from the database.
 */
export class AddressBookHandler {
    /**
     * Adds a new resource to the address book. Property 'id' of parameter 'resource' is used as unique id in database.
     * @param {IOrganizationObject } resource Resource data to be added to the database
     * @remarks Method is asynchronous
     */
    static createResource = async (resource: IOrganizationObject): Promise<void> => {
        try {
            //Connect to database
            await dbConnection.connectDB();
            await checkConnectionDB();

            //Validate id property of 'resource'
            await validateId(
                resource.id,
                "Adding organization resource to database failed. Id (" + resource.id + ") is not unique."
            );

            //Write data to database
            await organizationAddressBookModel.create(resource);
        } catch (err) {
            const message = "Adding organization resource to database failed due to following error: ";
            let errorMessage = unknownErrorMessage;
            if (err instanceof Error) errorMessage = err.message;
            console.error(message + errorMessage);
            throw Error(message + errorMessage);
        } finally {
            //Disconnect from database
            await dbConnection.disconnectDB();
        }
    };

    /**
     * Adds multiple resources to the address book. Property 'id' of parameter 'resources' is used as unique id in database.
     * @param {IOrganizationObject[]} resources Resource data to be added to the database
     * @returns {Promise<void>} A promise
     * @remarks Method is asynchronous
     */
    static createResources = async (resources: IOrganizationObject[]): Promise<void> => {
        try {
            //Connect to database
            await dbConnection.connectDB();
            await checkConnectionDB();

            //Validate id property of 'resource'
            for (const resource of resources) {
                await validateId(
                    resource.id,
                    "Adding organization resource to database failed. Id (" + resource.id + ") is not unique."
                );
            }

            //Write data to database
            await organizationAddressBookModel.create(resources);
        } catch (err) {
            const message = "Adding organization resource to database failed due to following error: ";
            let errorMessage = unknownErrorMessage;
            if (err instanceof Error) errorMessage = err.message;
            console.error(message + errorMessage);
            throw Error(message + errorMessage);
        } finally {
            //Disconnect from database
            await dbConnection.disconnectDB();
        }
    };

    /**
     * Updates a resource in the address book.
     * @param {string} id Id used to identify resource in database
     * @param {IOrganizationObject} data Data for updating
     * @remarks Method is asynchronous
     */
    static updateResource = async (id: string, data: IOrganizationObject): Promise<void> => {
        try {
            //Connect to database
            await dbConnection.connectDB();
            await checkConnectionDB();

            //Validate existence of id
            await validateId(
                id,
                "Updating organization resource in database failed due to following error: Id does not exist!",
                true
            );

            //Update resource

            await organizationAddressBookModel.findOneAndReplace({ id: id }, data);
        } catch (err) {
            const message = "Updating organization resource in database failed due to following error: ";
            let errorMessage = unknownErrorMessage;
            if (err instanceof Error) errorMessage = err.message;
            console.error(message + errorMessage);
            throw Error(message + errorMessage);
        } finally {
            //Disconnect from database
            await dbConnection.disconnectDB();
        }
    };

    /**
     * Updates multiple resource in the address book.
     * @param {{ id: string; data: IOrganizationObject }[]} data Data for updating
     * @remarks Method is asynchronous
     */
    static updateResources = async (data: { uuid: string; data: IOrganizationObject }[]): Promise<void> => {
        try {
            //Connect to database
            await dbConnection.connectDB();
            await checkConnectionDB();

            //Validate existence of id
            for (const updateObject of data)
                await validateId(
                    updateObject.uuid,
                    "Updating organization resource in database failed due to following error: Id does not exist!",
                    true
                );

            //Update resources in mongoDB
            // Prepare an array of update operations
            const bulkOps = data.map((updateObject: { uuid: string; data: IOrganizationObject }) => ({
                updateOne: {
                    filter: { id: updateObject.uuid },
                    update: updateObject.data,
                    upsert: true,
                },
            }));

            // Execute the operations
            await organizationAddressBookModel.bulkWrite(bulkOps);
        } catch (err) {
            const message = `Updating ${data.length} organization resources in database failed due to following error: `;
            let errorMessage = unknownErrorMessage;
            if (err instanceof Error) errorMessage = err.message;
            console.error(message + errorMessage);
            throw Error(message + errorMessage);
        } finally {
            //Disconnect from database
            await dbConnection.disconnectDB();
        }
    };

    /**
     * Deletes a resource from the address book.
     * @param {string} id Id used in the database. The resource with a matching id will be deleted
     * @remarks Method is asynchronous
     */
    static deleteResource = async (id: string): Promise<void> => {
        try {
            //Connect to database
            await dbConnection.connectDB();
            await checkConnectionDB();

            //Validate uuid
            await validateId(
                id,
                "Deleting organization resource from database failed due to following error: Id does not exist!",
                true
            );

            //Delete resource
            await organizationAddressBookModel.deleteOne({ id: id });
        } catch (err) {
            const message = "Deleting organization resource from database failed due to following error: ";
            let errorMessage = unknownErrorMessage;
            if (err instanceof Error) errorMessage = err.message;
            console.error(message + errorMessage);
            throw Error(message + errorMessage);
        } finally {
            //Disconnect from database
            await dbConnection.disconnectDB();
        }
    };

    /**
     * Deletes all resources from the address book.
     * @remarks Method is asynchronous
     */
    static deleteAllResource = async (): Promise<void> => {
        try {
            //Connect to database
            await dbConnection.connectDB();
            await checkConnectionDB();

            //Clear database
            await organizationAddressBookModel.deleteMany();
        } catch (err) {
            const message = "Deleting all organization resources from database failed due to following error: ";
            let errorMessage = unknownErrorMessage;
            if (err instanceof Error) errorMessage = err.message;
            console.error(message + errorMessage);
            throw Error(message + errorMessage);
        } finally {
            //Disconnect from database
            await dbConnection.disconnectDB();
        }
    };

    /**
     * Get all address book entries for one specific type.
     * @returns {Promise<IOrganizationObject[]>} Array of all address book entries including
     * the uuid as object
     * @remarks Method is asynchronous
     */
    static getAllResources = async (): Promise<IOrganizationObject[]> => {
        const checkData = (orgValue: unknown) => {
            if (!orgValue) throw Error("Database request (getAllResources for organization resources) failed");
        };

        try {
            //Connect to database
            await dbConnection.connectDB();
            await checkConnectionDB();

            //Get data
            const orgValue = await organizationAddressBookModel.find().exec();
            checkData(orgValue);

            return orgValue.map((org) => {
                return {
                    id: org.id,
                    name: org.name,
                    type: org.type,
                    identifier: org.identifier,
                    address: org.address,
                    telecom: org.telecom,
                } as unknown as IOrganizationObject;
            });
        } catch (err) {
            const message = "Getting all organization resources from database failed due to following error: ";
            let errorMessage = unknownErrorMessage;
            if (err instanceof Error) errorMessage = err.message;
            console.error(message + errorMessage);
            throw Error(message + errorMessage);
        } finally {
            //Disconnect from database
            await dbConnection.disconnectDB();
        }
    };

    /**
     * Checks whether the id already exists in the database.
     * @param {string} id Uuid as string which gets validated against all other existing ids
     * @param {boolean} connect If set to true, the query will connect and disconnect from the database, otherwise not. If you
     * use this method outside the class, 'connect' must be set to true
     * @returns {Promise<boolean>} True, if id exists in the database
     * @remarks Method is asynchronous
     */
    static doesIdExist = async (id: string, connect: boolean): Promise<boolean> => {
        try {
            //Connect to database
            if (connect) {
                await dbConnection.connectDB();
                await checkConnectionDB();
            }

            //Get data
            const org = await organizationAddressBookModel.findOne({ id: id }).exec();

            return org != null;
        } catch (err) {
            const message = "Checking whether id exists in database failed due to following error: ";
            let errorMessage = unknownErrorMessage;
            if (err instanceof Error) errorMessage = err.message;
            console.error(message + errorMessage);
            throw Error(message + errorMessage);
        } finally {
            //Disconnect from database
            if (connect) {
                await dbConnection.disconnectDB();
            }
        }
    };
}
