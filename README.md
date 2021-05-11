# Try it!

An online version of this application can be found on http://inconcessus.github.io.

# OTMapGen

Simple prototype for a simplex noise seeded OpenTibia map generator. This generator uses 2D simplex noise to create releastic terrain. Automatic bordering and nature detailing is included.

<p align="center">
  <img src="images/banner.png">
</p>

# Dependencies

- NodeJS have to be installed in your machine for development mode. Install it using [NVM](https://github.com/nvm-sh/nvm)

# Usage

1. Run `git clone https://github.com/Inconcessus/OTMapGen.git` to clone the repository.

2. Go to `OTMapGen/` and run `npm install`

3. Run `npm run watch` to watch code changes, or simply run `node index.js` to generate the OTBM file.

4. Then look for the output: `map.otbm`.

- It is option to modify the noise seed and change some generation parameters inside generation script.

# Version

Version 1.5.5. This is a work in progress.
