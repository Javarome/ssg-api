import {SsgContext} from "../../../../SsgContext"

/**
 * @returns a string or undefined, depending on context.
 */
export type StringContextHandler<C extends SsgContext = SsgContext> = (context: C) => string | undefined
