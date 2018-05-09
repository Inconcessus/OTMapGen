# OTMapGen

Simple prototype for a simplex noise seeded OpenTibia map generator. This generator uses 2D simplex noise to create releastic terrain. Automatic bordering is included.

<p align="center">
  <img src="images/generated.png">
</p>

# Dependencies

* OTBM2JSON (https://github.com/Inconcessus/OTBM2JSON)
* NodeJS

# Usage

Clone the `OTBM2JSON` library from GitHub. It is option to modify the noise seed and change some generation parameters inside generation script. Then call the `OTMapGen.js` and look for the created output: `map.otbm`.

    $ git clone https://github.com/Inconcessus/OTBM2JSON.git
    $ node OTMapGen.js 
    
# Version

Version 0.1.0. This is a work in progress.
