import { SsgContext } from '../../SsgContext.js';
import { SsgFile, SsgFileLang } from './SsgFile.js';
import { JSDOM } from 'jsdom';

export type HtmlMeta = {
  url?: string
  author: string[]
  copyright?: string
  description?: string
  generator?: string
}

export enum LinkType {
  start = 'start',
  contents = 'contents',
  prev = 'prev',
  next = 'next'
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
export class HtmlSsgFile extends SsgFile {

  static readonly generator = 'ssg-api';

  constructor(
    name: string, encoding: BufferEncoding, contents: string, lastModified: Date, lang: SsgFileLang,
    readonly meta: HtmlMeta, readonly links: HtmlLinks, public title?: string) {
    super(name, encoding, contents, lastModified, lang);
  }

  _dom: JSDOM | undefined;

  /**
   * @deprecated Avoid this as JSDOM is implementation-specific. Most of the time calling `.document` will be enough.
   */
  get dom(): JSDOM {
    if (!this._dom) {
      this._dom = new JSDOM(this._contents);
    }
    return this._dom;
  }

  get document(): Document {
    return this.dom.window.document;
  }

  /**
   * Converts document's state to an HTML string.
   */
  serialize(): string {
    this.updateMetaTags();
    this.updateLinkTags();
    return this.dom.serialize();
  }

  private updateLinkTags() {
    const document = this.document;
    const links = this.links;
    for (const linkRel in links) {
      const link = links[linkRel as keyof HtmlLinks];
      if (link) {
        const rel = link.type;
        let linkElem = document.querySelector(`link[rel="${rel}"]`);
        if (!linkElem) {
          linkElem = document.createElement('link') as HTMLLinkElement;
          linkElem.setAttribute('rel', rel);
          document.head.append(linkElem);
        }
        linkElem.setAttribute('href', link.url);
        if (link.text) {
          linkElem.setAttribute('title', link.text);
        }
      }
    }
  }

  private updateMetaTags() {
    const document = this.document;
    const meta = this.meta;
    meta.generator = meta.generator || 'ssg-api';
    for (const metaName in meta) {
      const newContent = meta[metaName as keyof HtmlMeta];
      const contents = newContent ? Array.isArray(newContent) ? newContent : [newContent] : [];
      for (const content of contents) {
        let metaElem = document.querySelector(`meta[name="${metaName}"]`);
        if (!metaElem) {
          metaElem = document.createElement('meta') as HTMLMetaElement;
          metaElem.setAttribute('name', metaName);
          document.head.append(metaElem);
        }
        metaElem.setAttribute('content', content);
      }
    }
  }

  set dom(newDom: JSDOM) {
    this._contents = newDom.serialize();
    this._dom = newDom;
  }

  get contents(): string {
    return this._contents;
  }

  set contents(value: string) {
    this._dom = undefined;
    this._contents = value;
  }

  static read(context: SsgContext, fileName: string): HtmlSsgFile {
    const fileInfo = super.read(context, fileName);
    const fileContents = fileInfo.contents;
    return this.create(fileInfo, fileContents);
  }

  static create(fileInfo: SsgFile, fileContents: string): HtmlSsgFile {
    const dom = new JSDOM(fileContents);
    let title: string | undefined;
    const doc = dom.window.document;
    let titleElem = doc.querySelector('title');
    if (titleElem) {
      const elemTitle = titleElem.textContent ? titleElem.textContent.trim() : '';
      const split = elemTitle.lastIndexOf(' - ');
      title = split > 0 ? elemTitle.substring(0, split) : elemTitle;
      title = title?.replace(/\s{2,}/g, ' ').replace(/[\n\t]/, ' ');
    }
    const url = HtmlSsgFile.getMeta('url', doc)[0];
    const author = HtmlSsgFile.getMeta('author', doc);
    const copyright = HtmlSsgFile.getMeta('copyright', doc)[0];
    const description = HtmlSsgFile.getMeta('description', doc)[0];
    const generator = HtmlSsgFile.getMeta('generator', doc)[0] || HtmlSsgFile.generator;
    const meta: HtmlMeta = {url, author, copyright, description, generator};
    const start = HtmlSsgFile.getLink(LinkType.start, doc);
    const contents = HtmlSsgFile.getLink(LinkType.contents, doc);
    const prev = HtmlSsgFile.getLink(LinkType.prev, doc);
    const next = HtmlSsgFile.getLink(LinkType.next, doc);
    const links: HtmlLinks = {start, contents, prev, next};
    return new HtmlSsgFile(fileInfo.name, fileInfo.encoding, fileInfo.contents, fileInfo.lastModified, fileInfo.lang,
      meta, links, title);
  }

  static getMeta(name: string, doc: Document): string[] {
    const metaElems = doc.querySelectorAll(`meta[name='${name}']`);
    return Array.from(metaElems).map(metaElem => (metaElem as HTMLMetaElement).content);
  }

  static getLink(rel: LinkType, doc: Document): Link | undefined {
    const linkElem = doc.querySelector(`link[rel='${rel}']`) as HTMLLinkElement;
    if (linkElem) {
      return {text: linkElem.title, url: linkElem.href, type: rel};
    }
  }
}
