import { launch } from "puppeteer"
import { stat, writeFile } from 'node:fs/promises'
import { articleLinks } from "./articles.js"

const browser = await launch({
  //headless: false,
  defaultViewport: {
    height: 16000,
    width: 1920,
  }
})

const page = (await browser.pages())[0] || (await browser.newPage())
function jsonify(el) {
  if (el instanceof Text) return el.data
  const result = { tag: el.tagName?.toUpperCase() }
  if (result.tag === 'BR') return '\n\n'
  if (result.tag === 'SVG') return el.outerHTML
  for (const key of ['src', 'href', 'alt', 'className', 'ariaLabel', 'media', 'srcset', 'type']) {
    const value = el[key]
    value == null || value == '' || (result[key] = value)
  }
  el.childNodes.length && (result.children = [...el.childNodes].map(jsonify))
  return result
}
let cookieRejected = false
for (const link of articleLinks) {
  const filename = link.toLowerCase().replace(/[^a-z0-1]+/g, '_') + '.json'
  const filestat = await stat(filename).catch(err => err)
  if (filestat?.code !== 'ENOENT') {
    if (filestat instanceof Error) throw filestat
    console.log(filename, 'present')
    continue
  }
  await page.goto(`https://www.natgeo.pt/${link}`, {
    waitUntil: "networkidle2"
  })

  if (!cookieRejected) {
    await page.waitForSelector('#onetrust-reject-all-handler')
    await page.click('#onetrust-reject-all-handler')
    cookieRejected = true
  }

  // find the article element:
  const article = await page.$('#main-content')

  const data = await article.evaluate(jsonify)

  await writeFile(filename, JSON.stringify(data), 'utf8')
  console.log(filename, 'done')
}
