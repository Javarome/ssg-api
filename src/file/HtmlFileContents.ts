import { JSDOM } from "jsdom"
import { HtmlUtil } from "./HtmlUtil.js"
import { FileContents, FileContentsLang } from "@javarome/fileutil"

export type HtmlMeta = {
  url?: string
  author: string[]
  copyright?: string
  description?: string
  generator?: string
}

export enum LinkType {
  start = "start",
  contents = "contents",
  prev = "prev",
  next = "next"
}

export interface Link {
  type: LinkType;
  text: string;
  url: string;
}

export type HtmlLinks = {
  start?: Link
  contents?: Link
  prev?: Link
  next?: Link
}

/**
 * File info augmented with HTML semantics, such as:
 * - `<head>` info:
 *   - `<meta>` tags values
 *   - `<link>` tags values
 *   - `<title>` tag content
 */
export class HtmlFileContents extends FileContents {
  /**
   * The default generator value
   */
  static readonly generator = "ssg-api"

  protected _meta: HtmlMeta

  protected _links: HtmlLinks

  /**
   * Creates a new HTML file in memory.
   *
   * Values provided in this constructor will override those which could be induced from contents.
   *
   * @param name The HTML filename.
   * @param encoding The contents encoding ("utf-8", "latin1", etc.)
   * @param contents The HTML contents
   * @param lastModified
   * @param lang The lang of the HTML file (will be induced from HTML contents <html lang="xx"> tag otherwise)
   */
  constructor(
    name: string, encoding: BufferEncoding, contents: string, lastModified: Date, lang: FileContentsLang) {
    super(name, encoding, contents, lastModified, lang)
    this._meta = this.meta || {author: []}
    this._links = this.links || {}
    this._title = this.title || ""
  }

  get meta(): HtmlMeta {
    this.dom
    return this._meta
  }

  get links(): HtmlLinks {
    this.dom
    return this._links
  }

  protected _title: string

  get title(): string {
    this.dom
    return this._title
  }

  set title(title: string | undefined) {
    const root = this.document.documentElement
    if (title) {
      const elemTitle = title.trim()
      const split = elemTitle.lastIndexOf(" - ")
      title = split > 0 ? elemTitle.substring(0, split) : elemTitle
      this._title = title?.replace(/\s{2,}/g, " ").replace(/[\n\t]/, " ")
      let titleEl = root.querySelector("title")
      if (!titleEl) {
        titleEl = this.document.createElement("title")
        let head = root.querySelector("head")
        if (!head) {
          head = document.createElement("head")
          root.appendChild(head)
        }
        head.appendChild(titleEl)
      }
      if (split >= 0) {
        titleEl.textContent = title + (titleEl.textContent || "").substring(split)
      } else {
        titleEl.textContent = title
      }
    } else {
      root.querySelector("title")?.remove()
    }
  }

  protected _dom: JSDOM | undefined

  /**
   * @deprecated Avoid this as JSDOM is implementation-specific. Most of the time calling `.document` will be enough.
   */
  get dom(): JSDOM {
    if (!this._dom) {
      this._dom = this.readContents(this.contents)
    }
    return this._dom
  }

  set dom(newDom: JSDOM) {
    this.readDOM(newDom)
  }

  get lang() {
    const lang = super.lang
    this.dom
    return this._lang
  }

  set contents(value: string) {
    this.readContents(value)
  }

  /**
   * Create an HtmlFileContents from a FileContents
   *
   * @param fileInfo
   */
  static create(fileInfo: FileContents): HtmlFileContents {
    return new HtmlFileContents(fileInfo.name, fileInfo.encoding, fileInfo.contents, fileInfo.lastModified,
      fileInfo.lang)  // HTML metadata will be read from HTML fileInfo.contents
  }

  protected readDOM(dom: JSDOM) {
    this._dom = dom
    const declaredEncoding = HtmlUtil.getHtmlDeclaredEncoding(dom)
    if (declaredEncoding && declaredEncoding !== this.encoding) {
      console.warn(`Encoding of ${this.name} is ${this.encoding} but declares ${declaredEncoding}`)
    }
    const doc = this.document
    let docLang = doc.documentElement.lang
    if (docLang) {
      this.lang.lang = docLang
    }
    if (this._title) {
      this.title = this._title
    } else {
      this.readTitle(doc)
    }
    let meta = this._meta
    if (!meta) {
      meta = this._meta = {author: []}
    }
    if (!meta.url) {
      meta.url = HtmlFileContents.getMeta("url", doc)[0]
    }
    if (meta.author.length <= 0) {
      meta.author = HtmlFileContents.getMeta("author", doc)
    }
    if (!meta.copyright) {
      meta.copyright = HtmlFileContents.getMeta("copyright", doc)[0]
    }
    if (!meta.description) {
      meta.description = HtmlFileContents.getMeta("description", doc)[0]
    }
    if (!meta.generator) {
      meta.generator = HtmlFileContents.getMeta("generator", doc)[0] || HtmlFileContents.generator
    }
    let links = this._links
    if (!links) {
      links = this._links = {}
    }
    if (!links.start) {
      links.start = HtmlFileContents.getLink(LinkType.start, doc)
    }
    if (!links.contents) {
      links.contents = HtmlFileContents.getLink(LinkType.contents, doc)
    }
    if (!links.prev) {
      links.prev = HtmlFileContents.getLink(LinkType.prev, doc)
    }
    if (!links.next) {
      links.next = HtmlFileContents.getLink(LinkType.next, doc)
    }
    this._contents = dom.serialize()
    return this._dom
  }

  protected readTitle(doc: Document) {
    let title = doc.title
    if (title) {
      this.title = title
    }
    return title
  }

  get document(): Document {
    return this.dom.window.document
  }

  get contents(): string {
    return super.contents
  }

  protected updateTitle() {
    const document = this.document
    const title = this.title
    if (title && document.title !== title) {
      this.title = title
    }
  }

  static read(fileName: string): HtmlFileContents {
    const fileInfo = super.read(fileName)
    return this.create(fileInfo)
  }

  protected readContents(contents: string): JSDOM {
    const dom = this._dom = new JSDOM(contents)
    this.readDOM(dom)
    return dom
  }

  static getMeta(name: string, doc: Document): string[] {
    const metaElems = doc.querySelectorAll(`meta[name='${name}']`)
    return Array.from(metaElems).map(metaElem => (metaElem as HTMLMetaElement).content)
  }

  static getLink(rel: LinkType, doc: Document): Link | undefined {
    const linkElem = doc.querySelector(`link[rel='${rel}']`) as HTMLLinkElement
    if (linkElem) {
      return {text: linkElem.title, url: linkElem.href, type: rel}
    }
  }

  /**
   * Converts document's state to an HTML string.
   */
  serialize(): string {
    this.updateTitle()
    this.updateMetaTags()
    this.updateLinkTags()
    return this.dom.serialize()
  }

  protected updateLinkTags() {
    const document = this.document
    const links = this.links
    for (const linkRel in links) {
      const link = links[linkRel as keyof HtmlLinks]
      if (link) {
        const rel = link.type
        let linkElem = document.querySelector(`link[rel="${rel}"]`)
        if (!linkElem) {
          linkElem = document.createElement("link") as HTMLLinkElement
          linkElem.setAttribute("rel", rel)
          document.head.append(linkElem)
        }
        linkElem.setAttribute("href", link.url)
        if (link.text) {
          linkElem.setAttribute("title", link.text)
        }
      }
    }
  }

  protected updateMetaTags() {
    const document = this.document
    const meta = this.meta
    meta.generator = meta.generator || "ssg-api"
    for (const metaName in meta) {
      const newContent = meta[metaName as keyof HtmlMeta]
      const contents = newContent ? Array.isArray(newContent) ? newContent : [newContent] : []
      for (const content of contents) {
        let metaElem = document.querySelector(`meta[name="${metaName}"]`)
        if (!metaElem) {
          metaElem = document.createElement("meta") as HTMLMetaElement
          metaElem.setAttribute("name", metaName)
          document.head.append(metaElem)
        }
        metaElem.setAttribute("content", content)
      }
    }
  }
}
