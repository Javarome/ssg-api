import {SsgContext} from "../../SsgContext"
import {SsgFile} from "./SsgFile"
import {JSDOM} from "jsdom"

export type HtmlMeta = {
  url?: string
  author: string[]
  copyright?: string
}

export type HtmlLinks = {
  start?: Link
  contents?: Link
  prev?: Link
  next?: Link
}

/**
 * File info augmented with HTML semantics, such as:
 * - head info
 *   - meta tags
 *   - links tags
 *   - title
 */
export class HtmlSsgFile extends SsgFile {

  constructor(
    name: string, encoding: BufferEncoding, contents: string, lastModified: Date, lang: string | string[],
    readonly meta: HtmlMeta, readonly links: HtmlLinks, public title?: string) {
    super(name, encoding, contents, lastModified, lang)
  }

  _dom: JSDOM | undefined

  get dom(): JSDOM {
    if (!this._dom) {
      this._dom = new JSDOM(this._contents)
    }
    return this._dom
  }

  set dom(newDom: JSDOM) {
    this._contents = newDom.serialize()
    this._dom = newDom
  }

  get contents(): string {
    return this._contents
  }

  set contents(value: string) {
    this._dom = undefined
    this._contents = value
  }
}

function getMeta(name: string, doc: Document): string[] {
  const metaElems = doc.querySelectorAll(`meta[name='${name}']`)
  return Array.from(metaElems).map(metaElem => (metaElem as HTMLMetaElement).content)
}

export enum LinkType {
  start = "start",
  contents = "contents",
  prev = "prev",
  next = "next"
}

export interface Link {
  type: LinkType
  text: string
  url: string
}

function getLink(rel: LinkType, doc: Document): Link | undefined {
  const linkElem = doc.querySelector(`link[rel='${rel}']`) as HTMLLinkElement
  if (linkElem) {
    return {text: linkElem.title, url: linkElem.href, type: rel}
  }
}

export function getHtmlFileInfo(context: SsgContext, fileName: string): HtmlSsgFile {
  const fileInfo = SsgFile.read(context, fileName)
  const fileContents = fileInfo.contents
  const dom = new JSDOM(fileContents)
  let title: string | undefined
  const doc = dom.window.document
  let titleElem = doc.querySelector("title")
  if (titleElem) {
    const elemTitle = titleElem.textContent ? titleElem.textContent.trim() : ""
    const split = elemTitle.lastIndexOf(" - ")
    title = split > 0 ? elemTitle.substring(0, split) : elemTitle
  }
  const url = getMeta("url", doc)[0]
  const author = getMeta("author", doc)
  const copyright = getMeta("copyright", doc)[0]
  const meta: HtmlMeta = {url, author, copyright}
  const start = getLink(LinkType.start, doc)
  const contents = getLink(LinkType.contents, doc)
  const prev = getLink(LinkType.prev, doc)
  const next = getLink(LinkType.next, doc)
  const links: HtmlLinks = {start, contents, prev, next}
  return new HtmlSsgFile(fileInfo.name, fileInfo.encoding, fileInfo.contents, fileInfo.lastModified, fileInfo.lang,
    meta, links, title)
}

