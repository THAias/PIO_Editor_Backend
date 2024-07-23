import { Schema, model, Model } from "mongoose";
import { IOrganizationObject } from "@thaias/pio_editor_meta";

const OrganizationAddressBookSchema: Schema<IOrganizationObject> = new Schema({
    id: { type: String, required: true, index: true },
    name: { type: String, required: true },
    type: { type: String, required: false },
    identifier: [
        {
            _id: false,
            label: { type: String, required: false },
            value: { type: String, required: false },
        },
    ],
    address: [
        {
            use: { type: String, required: false },
            type: { type: String, required: false },
            text: { type: String, required: false },
            line: [{ type: String, required: false }],
            street: { type: String, required: false },
            houseNumber: { type: String, required: false },
            additionalLocator: { type: String, required: false },
            district: { type: String, required: false },
            city: { type: String, required: false },
            postalCode: { type: String, required: false },
            country: { type: String, required: false },
            postOfficeBoxNumber: { type: String, required: false },
            postOfficeBoxRadio: { type: String, required: false },
            _id: false,
        },
    ],
    telecom: [
        {
            _id: false,
            system: { type: String, required: false },
            value: { type: String, required: false },
            label: { type: String, required: false },
        },
    ],
});

const organizationAddressBookModel: Model<IOrganizationObject> = model(
    "organizationAddressBook",
    OrganizationAddressBookSchema
);

export { organizationAddressBookModel };
