import { readFile, readdir, writeFile } from 'node:fs/promises'

const files = await readdir('data')
const data = await Promise.all(files
  .filter(f => !f.startsWith('package') && f.endsWith('.json'))
  .map(async f => [f, JSON.parse(await readFile(`data/${f}`, 'utf8'))]))

const ignore = () => []

const text = el => typeof el === 'string' ? [
  el === '\n\n' ? ' \n' :
  el.startsWith('<svg') ? '' : el] : children(el).flatMap(text)

const toImgLink = path => `img/` + new URL(path)
  .pathname
  .slice(1)
  .toLowerCase()
  .replace(/[^a-z0-1]+/g, '_')
  .replace(/(_)([^_]+)$/, (_,__,ext) => '.'+ext)

const textContent = el => children(el)
  .flatMap(parse)
  .join(' ')

const endsWith = suffix => el => [
  ...children(el).flatMap(parse),
  suffix,
]
const maybe = fn => el => {
  try { return fn(el) }
  catch { return ignore() }
}

const startsWith = prefix => el => [`${prefix}${textContent(el)}`]
const wrap = value => el => {
  const content = textContent(el)
  const trimmed = content.trim()
  const prefixed = trimmed[0] === content[0]
    ? `${value}${trimmed}`
    : ` ${value}${trimmed}`
  const suffixed = trimmed.at(-1) === content.at(-1)
    ? `${prefixed}${value}`
    : `${prefixed}${value} `
  return [suffixed]
}

const collapse = el => children(el).flatMap(parse)

const tags = new Set
const parse = (el, tag) => TAGS[el.tag] ? TAGS[el.tag](el) : text(el)
const newLines = endsWith('\n\n')
const children = el => el?.children || []
const isH3 = el => el.tag === 'H3'
const TAGS = {
  A: a => [`[${textContent(a).trim()}](${a.href})`],
  MAIN: collapse,
  ARTICLE: collapse,
  BUTTON: ignore,
  DIV: (div => {
    const c = div.className || ''
    const h3 = text(children(div).find(isH3))
    if (h3.includes('mais populares')) {
      return ignore()
    }
    const podem = text(children(div).flatMap(children).find(isH3))
    if (podem.includes('Também lhe poderá interessar')) {
      return ignore()
    }
    if (c.includes('ngart__read-more')) return ignore()
    return collapse(div)
  }),
  EM: wrap('_'),
  FOOTER: ignore,
  H1: startsWith('\n# '),
  H2: startsWith('\n## '),
  H3: startsWith('\n### '),
  H4: startsWith('\n#### '),
  H5: startsWith('\n##### '),
  HR: () => ['--------'],
  IMG: maybe(img => [`\n![${img.alt||''}](${toImgLink(img.src)})\n`]),
  INPUT: ignore,
  KBD: kbd => [`<kbd>${textContent(kbd).trim()}</kbd>`],
  LABEL: ignore,
  LI: startsWith('\n  - '),
  LINK: ignore,
  NAV: ignore,
  NOSCRIPT: ignore,
  OPTION: ignore,
  P: newLines,
  PICTURE: collapse,
  SCRIPT: ignore,
  SECTION: collapse,
  SELECT: ignore,
  SOURCE: ignore, // maybe(src => [`\n![](${toImgLink(src.srcset)})\n`]),
  SPAN: collapse,
  STRONG: wrap('**'),
  STYLE: ignore,
  UL: ul => {
    const out = textContent(newLines(ul))
    if (out.includes('https://www.natgeo.pt/a-nossa-causa)')) {
      return ignore()
    }
    return out
  },
  VIDEO: ({children, ...src}) => [`<code>${JSON.stringify(src)}</code>`],
}

for (const [filename, content] of data) {
  const flatten = textContent(content)
    .replaceAll(' ', ' ')
    .replace(/[ ]+/g, ' ')
    .replaceAll('\n ', '\n')
    .replace(/\n[\n]+/g, '\n\n')

  await writeFile('article/'+filename.slice(0, -4) + 'md', flatten, 'utf8')
}

