import { FileUtil } from "./FileUtil.js"
import { JSDOM } from "jsdom"

export class HtmlUtil {

  static getCharSet(html: HTMLElement): BufferEncoding | undefined {
    let charSet: BufferEncoding | undefined
    const charsetEl = html.querySelector("html[charset]")
    if (charsetEl) {
      const charSetValue = charsetEl.getAttribute("charset") || undefined
      charSet = FileUtil.toBufferEncoding(charSetValue)
    }
    return charSet
  }

  static getContentType(html: HTMLElement): BufferEncoding | undefined {
    let contentType: BufferEncoding | undefined
    const contentTypeEl = html.querySelector("meta[http-equiv='Content-Type']")
    if (contentTypeEl) {
      const content = contentTypeEl.getAttribute("content")
      if (content) {
        const values = content.split(";")
        if (values.length > 0) {
          let value = values[1]
          let key = "charset="
          let charsetPos = value.indexOf(key)
          if (charsetPos >= 0) {
            const charset = value.substring(charsetPos + key.length).toLowerCase().trim()
            contentType = FileUtil.toBufferEncoding(charset)
          }
        }
      }
    }
    return contentType
  }

  /**
   * Guess file declared encoding from file + HTML info if any.
   *
   * @param dom
   */
  static getHtmlDeclaredEncoding(dom: JSDOM): BufferEncoding | undefined {
    const html = dom.window.document.documentElement
    return HtmlUtil.getCharSet(html) || HtmlUtil.getContentType(html)
  }
}
