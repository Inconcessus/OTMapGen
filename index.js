const fs = require("fs")

const OTMapGenerator = require("./OTMapGen").OTMapGenerator

const __VERSION__ = "1.3.0"

// Expose the class
module.exports.OTMapGenerator = new OTMapGenerator()
module.exports.__VERSION__ = __VERSION__

if (require.main === module) {
  // Run from main
  fs.writeFileSync("map.otbm", module.exports.OTMapGenerator.generate())
}
