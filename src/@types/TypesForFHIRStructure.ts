import { ICompositionObject, IStringValue } from "./InterfacesForFHIRStructure";
import { TransformedEntryType } from "./TypesForRootObject";

/** Type for bundle entries (including Composition). Can be read by 'fast-xml-parser' library. */
type BundleEntries = ResourceEntries | ICompositionObject;

/**
 * Type for entries representing a FHIR resources except Composition. Can be read by 'fast-xml-parser' library.
 * @property {IStringValue} fullUrl Uuid of the FHIR resource
 * @property {TransformedEntryType} resource Holds all data of the FHIR resource
 */
type ResourceEntries = { fullUrl: IStringValue; resource: TransformedEntryType };

export { BundleEntries, ResourceEntries };
