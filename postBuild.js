
const FS = require("fs")
const path = require("path")
const cheerio = require("cheerio")
const fs = FS.promises
// add tracker during build not during dev
async function init() {
  const htmlPath = path.join(".", "dist", "spa", "index.html")
  const $ = cheerio.load(await fs.readFile(htmlPath))
  $("<script async src=\"https://umami.boid.com/script.js\" data-website-id=\"59623f2f-bed4-4cb6-8e92-393f5a6df2e2\"></script>").appendTo("head")
  fs.writeFile(htmlPath, $.html())
}
init().catch(console.error)
