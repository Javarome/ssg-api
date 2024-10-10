import { FileContents } from "./FileContents.js"
import { describe, expect, test } from "@javarome/testscript"

describe("FileContents", () => {

  test('lang', () => {
    const langDefault = FileContents.getLang("test/test.html")
    expect(langDefault).toEqual({lang: '', variants: ['en', 'fr']});

    const langFr = FileContents.getLang("test/test_fr.html")
    expect(langFr).toEqual({lang: 'fr', variants: ['', 'en']});
  });

  test('lang with no path', () => {
    const langNoDir = FileContents.getLang("LICENSE")
    expect(langNoDir).toEqual({lang: undefined, variants: []});
  });

  test('files', () => {
    const langFr = FileContents.getLang("test/test_fr.html")
    expect(langFr).toEqual({lang: 'fr', variants: ['', 'en']});

    const fileDefault = FileContents.read("test/test.html")
    expect(fileDefault.lang).toEqual({lang: '', variants: ['en', 'fr']});

    const langEn = FileContents.read("test/test_en.html")
    expect(langEn.lang).toEqual({lang: 'en', variants: ['', 'fr']});
  });
});
