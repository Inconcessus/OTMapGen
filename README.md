# Try it!

An online version of this application can be found on http://inconcessus.github.io.

# OTMapGen

Simple prototype for a simplex noise seeded OpenTibia map generator. This generator uses 2D simplex noise to create releastic terrain. Automatic bordering and nature detailing is included.

<p align="center">
  <img src="images/banner.png">
</p>

# Dependencies

- OTBM2JSON (https://github.com/Inconcessus/OTBM2JSON)
- NodeJS

# Usage

1. Clone this. $ `git clone https://github.com/Inconcessus/OTMapGen.git`

2. Then call the `OTMapGen.js` and look for the created output: `map.otbm`.

- It is option to modify the noise seed and change some generation parameters inside generation script.
- $ `node OTMapGen.js`

# Version

Version 1.4.0. This is a work in progress.
