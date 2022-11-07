import { readFile, readdir, stat } from 'node:fs/promises'
import { createWriteStream } from 'node:fs'
import { pipeline } from 'node:stream/promises'

const files = await readdir('.')
const data = await Promise.all(files
  .filter(f => !f.startsWith('package') && f.endsWith('.json'))
  .map(async f => JSON.parse(await readFile(f, 'utf8'))))

const getSource = el => {
  const source = el.srcset || el.src
  return source ? [source] : []
}

const toImgPath = path => `img/` + path
  .slice(1)
  .toLowerCase()
  .replace(/[^a-z0-1]+/g, '_')
  .replace(/(_)([^_]+)$/, (_,__,ext) => '.'+ext)

const allLinks = el => [...getSource(el), ...(el.children || []).flatMap(allLinks)]
const images = [...new Map(data
  .flatMap(allLinks)
  .filter(s => s !== '/images/transparent.png')
  .filter(s => !s.includes('svg+xml'))
  .filter(s => !s.includes('audio/mpeg'))
  .map(url => new URL(url))
  .map(url => [toImgPath(url.pathname), `${url.origin}${url.pathname}`])).entries()]

const downloadNext = async () => {
  if (!images.length) return console.log('done')
  const [filename, url] = images.pop()
  const filestat = await stat(filename).catch(err => err)
  if (filestat?.code !== 'ENOENT') {
    if (filestat instanceof Error) throw filestat
    console.log(filename, 'present')
  } else {
    console.log('downloading', filename)
    await pipeline(
      (await fetch(url)).body,
      createWriteStream(filename)
    )
  }
  return downloadNext()
}

await Promise.all([...Array(10).keys()].map(downloadNext))
console.log('all done')
