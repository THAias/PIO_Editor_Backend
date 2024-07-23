/** Defines an object structure with arbitrary keys and string values in the end which can be read by 'fast-xml-parser'
 * library. */
type TransformedEntryType = { [key: string]: TransformedEntryType | TransformedEntryType[] } | string;

export { TransformedEntryType };
