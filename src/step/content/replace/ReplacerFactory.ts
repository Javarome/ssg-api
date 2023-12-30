import {SsgContext} from "../../../SsgContext.js"

export interface ReplacerFactory<R> {

  create(context: SsgContext): Promise<R>
}

