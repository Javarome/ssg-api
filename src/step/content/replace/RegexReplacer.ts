export type RegexReplaceCallback = (substring: string, ...args: any[]) => string

/**
 * A class that implements the Regex standard replace callback.
 *
 * Sometimes replacers need some SsgContext to tune their replacements.
 * In such case, the replacer should be instantiated through a ReplacerFactory that will instantiate them with a
 * SsgContext parameter.
 */
export interface RegexReplacer {
  replace: RegexReplaceCallback
}
