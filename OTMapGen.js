// OTBM2JSON lib
const otbm2json = require("otbm2json/otbm2json")

//  Noise funcion
const noise = require("./lib/noise").noise

// Supplementary functions
const useBorders = require("./lib/border")

const clutter = require("./lib/clutter")

// JSON constants
const ITEMS = require("./json/items")
const mountains = require("./json/items/mountains")
const VERSIONS = require("./json/versions")

const OTMapGenerator = function () {
  /*
   * Class OTMapGenerator
   * Container for the OTMapGenerator class
   */

  // Confirm the OTBM2JSON major version
  if (otbm2json.__VERSION__.split(".").shift() !== "1") {
    return console.log("Incompatible version of otbm2json; please update.")
  }

  // Constant size of RME tile area (255x255)
  this.TILE_AREA_SIZE = 0xff

  // Default configuration to be overwritten
  this.CONFIGURATION = {
    SEED: "-2199324167357100",
    WIDTH: 1024,
    HEIGHT: 1024,
    VERSION: "10.98",
    TERRAIN_ONLY: false,
    GENERATION: {
      A: 1,
      B: 0.92,
      C: 0.25,
      CAVE_DEPTH: 20,
      CAVE_ROUGHNESS: 0.45,
      CAVE_CHANCE: 0.009,
      SAND_BIOME: true,
      EUCLIDEAN: false,
      SMOOTH_COASTLINE: true,
      ADD_CAVES: true,
      WATER_LEVEL: 2,
      EXPONENT: 1.4,
      LINEAR: 6,
      MOUNTAIN_TYPE: "ICY_MOUNTAIN",
      FREQUENCIES: [
        { f: 1, weight: 0.3 },
        { f: 2, weight: 0.2 },
        { f: 4, weight: 0.2 },
        { f: 8, weight: 0.125 },
        { f: 16, weight: 0.1 },
        { f: 32, weight: 0.05 },
        { f: 64, weight: 0.0025 },
      ],
    },
  }
}

OTMapGenerator.prototype.createRGBALayer = function (layer) {
  /*
   * Function OTMapGenerator::createRGBALayer
   * Creates a RGBA layer
   */

  function getMinimapColor(id, configuration) {
    /*
     * Function OTMapGenerator::createRGBALayer::getMinimapColor
     * Maps tile identifier to minimap color
     */

    // Color constants (Tibia)
    const WATER_COLOR = 0x0148c2
    const GRASS_COLOR = 0x00ff00
    const SAND_COLOR = 0xffcc99
    const MOUNTAIN_COLOR = 0x666666
    const GRAVEL_COLOR = 0x999999
    const SNOW_COLOR = 0xffffff

    // Map tile to minimap color
    // default to black
    switch (id) {
      case ITEMS.WATER_TILE_ID:
        return WATER_COLOR
      case ITEMS.GRASS_TILE_ID:
        return GRASS_COLOR
      case ITEMS.SAND_TILE_ID:
        return SAND_COLOR
      case mountains[configuration.GENERATION.MOUNTAIN_TYPE + "_TILE_ID"]:
        return MOUNTAIN_COLOR
      case ITEMS.GRAVEL_TILE_ID:
      case ITEMS.STONE_TILE_ID:
        return GRAVEL_COLOR
      case ITEMS.SNOW_TILE_ID:
        return SNOW_COLOR
      default:
        return 0x000000
    }
  }

  function shouldOutline(layer, j, width) {
    /*
     * Function OTMapGenerator::createRGBALayer::shouldOutline
     * Determines whether the pixel is an outline by checking
     * is any of the 8 neighbouring pixels is filled
     */

    return (
      layer[j - 1] ||
      layer[j + 1] ||
      layer[j + width] ||
      layer[j - width] ||
      layer[j - 1 - width] ||
      layer[j + 1 - width] ||
      layer[j + 1 + width] ||
      layer[j - 1 + width]
    )
  }

  const OUTLINE_COLOR = 0x80

  // Image will occupy four bytes per tile (pixel; RGBA)
  var byteArray = new Uint8ClampedArray(
    4 * this.CONFIGURATION.WIDTH * this.CONFIGURATION.HEIGHT
  )

  layer.forEach(function (value, i) {
    // Indices per color
    var R = 4 * i
    var G = R + 1
    var B = G + 1
    var A = B + 1

    // Set alpha value to 0xFF
    byteArray[A] = 0xff

    // No tile: skip or outline
    if (value === 0) {
      if (shouldOutline(layer, i, this.CONFIGURATION.WIDTH)) {
        byteArray[R] = OUTLINE_COLOR
        byteArray[G] = OUTLINE_COLOR
        byteArray[B] = OUTLINE_COLOR
      }
      return
    }

    // Color is the 6 byte hex RGB representation
    hexColor = getMinimapColor(value, this.CONFIGURATION)

    // Bitshift to extract component and write RGBA in the buffer (always 0xFF for A)
    byteArray[R] = (hexColor >> 16) & 0xff
    byteArray[G] = (hexColor >> 8) & 0xff
    byteArray[B] = (hexColor >> 0) & 0xff
  }, this)

  return byteArray
}

OTMapGenerator.prototype.generateMinimap = function (configuration) {
  /*
   * OTMapGenerator.generateMinimapmap
   * Generates clamped UInt8 buffer with RGBA values to be sent to canvas
   */

  // Set the configuration
  this.CONFIGURATION = configuration

  // Create temporary layers
  var pngLayers = this.generateMapLayers().map(this.createRGBALayer, this)

  return {
    data: pngLayers,
    metadata: this.CONFIGURATION,
  }
}

OTMapGenerator.prototype.generate = function (configuration) {
  /*
   * Function OTMapGenerator.generate
   * Generates OTBM map and returns OTBMJSON representation
   */

  this._initialized = Date.now()

  if (configuration !== undefined) {
    this.CONFIGURATION = configuration
  }

  // Default blueprint for OTBMJSON
  // Create a deep copy in memory using the JSON module
  var json = JSON.parse(JSON.stringify(require("./json/header")))

  // Create temporary layers
  var layers = this.generateMapLayers()

  // Convert layers to tile areas
  var tileAreas = this.generateTileAreas(layers)

  // Add all tile areas to the JSON2OTBM structure
  Object.keys(tileAreas).forEach(function (area) {
    json.data.nodes[0].features.push(tileAreas[area])
  })

  // Write the map header
  this.setMapHeader(json.data)

  // Serialize the JSON using the OTBM2JSON lib
  return otbm2json.serialize(json)
}

OTMapGenerator.prototype.setMapHeader = function (data) {
  /*
   * Function OTMapGenerator::setMapHeader
   * Writes RME map header OTBM_MAP_DATA
   */

  if (!VERSIONS.hasOwnProperty(this.CONFIGURATION.VERSION)) {
    throw "The requested map version is not supported."
  }

  data.mapWidth = this.CONFIGURATION.WIDTH
  data.mapHeight = this.CONFIGURATION.HEIGHT

  var versionAttributes = VERSIONS[this.CONFIGURATION.VERSION]

  data.version = versionAttributes.version
  data.itemsMajorVersion = versionAttributes.itemsMajorVersion
  data.itemsMinorVersion = versionAttributes.itemsMinorVersion

  // Save the time & seed
  data.nodes[0].description +=
    new Date().toISOString() + " (" + this.CONFIGURATION.SEED + ")"
}

OTMapGenerator.prototype.generateMapLayers = function () {
  /*
   * Function OTMapGenerator::generateMapLayers
   * Generates temporary layer with noise seeded tiles
   * The layers can be later converted to area tiles for OTBM2JSON
   */

  function createLayer() {
    /* FUNCTION createLayer
     * Creates an empty layer of map size (WIDTH x HEIGHT)
     */

    return new Array(this.CONFIGURATION.WIDTH * this.CONFIGURATION.HEIGHT).fill(
      0
    )
  }

  var z, id

  // Seed the noise function
  noise.seed(this.CONFIGURATION.SEED)

  // Create 8 zero filled layers
  var layers = new Array(8).fill(0).map(createLayer.bind(this))

  // Loop over the requested map width and height
  for (var y = 0; y < this.CONFIGURATION.HEIGHT; y++) {
    for (var x = 0; x < this.CONFIGURATION.WIDTH; x++) {
      // Get the elevation
      z = this.zNoiseFunction(x, y)
      b = this.CONFIGURATION.GENERATION.SAND_BIOME
        ? 5 * this.zNoiseFunction(y, x)
        : 0

      id = this.mapElevation(z, b)

      // Clamp the value
      z = Math.max(Math.min(z, 7), 0)

      // Fill the column with mountain tiles
      this.fillColumn(layers, x, y, z, id)
    }
  }

  // Option to smooth coast line
  if (this.CONFIGURATION.GENERATION.SMOOTH_COASTLINE) {
    layers = this.smoothCoastline(layers)
  }

  // Options to add caves
  if (this.CONFIGURATION.GENERATION.ADD_CAVES) {
    layers = this.digCaves(layers)
  }

  return layers
}

OTMapGenerator.prototype.smoothCoastline = function (layers) {
  /*
   * Function OTMapGenerator::smoothCoastline
   * Algorithm that smoothes the coast line to get rid of "impossible" water borders
   */

  var iterate = 1
  var c = 0

  // Constant iteration to remove impossible coastline tiles
  while (iterate) {
    iterate = 0

    layers = layers.map(function (layer, i) {
      // Coastline is only on the lowest floor
      if (i !== 0) {
        return layer
      }

      return layer.map(function (x, i) {
        // Skip anything that is not a grass or sand tile
        if (x !== ITEMS.GRASS_TILE_ID && x !== ITEMS.SAND_TILE_ID) {
          return x
        }

        // Get the coordinate and the neighbours
        var neighbours = this.getAdjacentTiles(layer, this.getCoordinates(i))

        // If the tile needs to be eroded, we are required to reiterate
        if (this.tileShouldErode(neighbours)) {
          x = ITEMS.WATER_TILE_ID
          iterate++
        }

        return x
      }, this)
    }, this)

    console.log(
      "Smoothing coastline <iteration " +
        c++ +
        ">" +
        " <" +
        iterate +
        " tiles eroded>"
    )
  }

  return layers
}

OTMapGenerator.prototype.countNeighboursNegative = function (neighbours, id) {
  /*
   * Function OTMapGenerator::countNeighboursNegative
   * Counts the number of neighbours that do not have a particular ID
   */

  return Object.keys(neighbours).filter(function (x) {
    return neighbours[x] !== ITEMS.GRAVEL_TILE_ID && neighbours[x] !== id
  }).length
}

OTMapGenerator.prototype.countNeighbours = function (neighbours, id) {
  /*
   * Function OTMapGenerator::countNeighbours
   * Counts the number of neighbours with particular ID
   */

  return Object.keys(neighbours).filter(function (x) {
    return neighbours[x] === id
  }).length
}

OTMapGenerator.prototype.mapElevation = function (z, b) {
  /*
   * Function OTMapGenerator::mapElevation
   * Maps particular elevation to tile id
   */

  switch (true) {
    case z < 0:
      return ITEMS.WATER_TILE_ID

    case z > 3:
      if (b > -1.5) {
        return ITEMS.STONE_TILE_ID
      } else {
        return ITEMS.SNOW_TILE_ID
      }

    default:
      switch (this.CONFIGURATION.GENERATION.MOUNTAIN_TYPE) {
        case "ICY_MOUNTAIN":
          if (z > 0) {
            return ITEMS.ICE_TILE_ID
          } else {
            return ITEMS.SNOW_TILE_ID
          }

        default:
          if (b < -5) {
            return ITEMS.SAND_TILE_ID
          } else {
            return ITEMS.GRASS_TILE_ID
          }
      }
  }
}

OTMapGenerator.prototype.digCaves = function (layers) {
  /*
   * Function OTMapGenerator::digCaves
   * Slow and pretty crappy algorithm to dig caves (FIXME)
   */

  // Keep a reference to cave entrances
  var entrances = new Array()
  var self = this

  for (var k = 0; k < this.CONFIGURATION.GENERATION.CAVE_DEPTH; k++) {
    console.log("Eroding caves <iteration " + k + ">")

    layers = layers.map(function (layer, z) {
      return layer.map(function (x, i) {
        if (
          x !==
          mountains[self.CONFIGURATION.GENERATION.MOUNTAIN_TYPE + "_TILE_ID"]
        ) {
          return x
        }

        var coordinates = self.getCoordinates(i)
        var neighbours = self.getAdjacentTiles(layer, coordinates)

        if (
          self.countNeighbours(neighbours, ITEMS.GRAVEL_TILE_ID) > 0 &&
          self.countNeighboursNegative(
            neighbours,
            mountains[self.CONFIGURATION.GENERATION.MOUNTAIN_TYPE + "_TILE_ID"]
          ) === 0 &&
          Math.random() < self.CONFIGURATION.GENERATION.CAVE_ROUGHNESS
        ) {
          return ITEMS.GRAVEL_TILE_ID
        }

        // Get neighbouring neighbours ;)
        var NL = self.getAdjacentTiles(layer, {
          x: coordinates.x - 1,
          y: coordinates.y,
        })
        var NR = self.getAdjacentTiles(layer, {
          x: coordinates.x + 1,
          y: coordinates.y,
        })
        var NN = self.getAdjacentTiles(layer, {
          x: coordinates.x,
          y: coordinates.y - 1,
        })
        var NS = self.getAdjacentTiles(layer, {
          x: coordinates.x,
          y: coordinates.y + 1,
        })

        if (
          Math.random() < self.CONFIGURATION.GENERATION.CAVE_CHANCE &&
          NR.E ===
            mountains[
              self.CONFIGURATION.GENERATION.MOUNTAIN_TYPE + "_TILE_ID"
            ] &&
          NL.W ===
            mountains[
              self.CONFIGURATION.GENERATION.MOUNTAIN_TYPE + "_TILE_ID"
            ] &&
          x ===
            mountains[
              self.CONFIGURATION.GENERATION.MOUNTAIN_TYPE + "_TILE_ID"
            ] &&
          self.countNeighbours(
            neighbours,
            mountains[self.CONFIGURATION.GENERATION.MOUNTAIN_TYPE + "_TILE_ID"]
          ) === 5 &&
          neighbours.W ===
            mountains[
              self.CONFIGURATION.GENERATION.MOUNTAIN_TYPE + "_TILE_ID"
            ] &&
          neighbours.E ===
            mountains[self.CONFIGURATION.GENERATION.MOUNTAIN_TYPE + "_TILE_ID"]
        ) {
          entrances.push({ z: z, c: coordinates })
          return ITEMS.GRAVEL_TILE_ID
        } else if (
          Math.random() < self.CONFIGURATION.GENERATION.CAVE_CHANCE &&
          NS.S ===
            mountains[
              self.CONFIGURATION.GENERATION.MOUNTAIN_TYPE + "_TILE_ID"
            ] &&
          NN.N ===
            mountains[
              self.CONFIGURATION.GENERATION.MOUNTAIN_TYPE + "_TILE_ID"
            ] &&
          x ===
            mountains[
              self.CONFIGURATION.GENERATION.MOUNTAIN_TYPE + "_TILE_ID"
            ] &&
          self.countNeighbours(
            neighbours,
            mountains[self.CONFIGURATION.GENERATION.MOUNTAIN_TYPE + "_TILE_ID"]
          ) === 5 &&
          neighbours.S ===
            mountains[
              self.CONFIGURATION.GENERATION.MOUNTAIN_TYPE + "_TILE_ID"
            ] &&
          neighbours.N ===
            mountains[self.CONFIGURATION.GENERATION.MOUNTAIN_TYPE + "_TILE_ID"]
        ) {
          entrances.push({ z: z, c: coordinates })
          return ITEMS.GRAVEL_TILE_ID
        }

        return x
      })
    })
  }

  // Open 3x3 around the cave entrance
  entrances.forEach(function (x) {
    self.fillNeighbours(layers[x.z], x.c, ITEMS.GRAVEL_TILE_ID)
  })

  return layers
}

OTMapGenerator.prototype.fillNeighbours = function (layer, coordinates, id) {
  /* FUNCTION fillNeighbours
   * Fills all neighbouring tiles with particular ID
   */

  layer[this.getIndex(coordinates.x - 1, coordinates.y)] = id
  layer[this.getIndex(coordinates.x + 1, coordinates.y)] = id
  layer[this.getIndex(coordinates.x, coordinates.y - 1)] = id
  layer[this.getIndex(coordinates.x, coordinates.y + 1)] = id

  layer[this.getIndex(coordinates.x + 1, coordinates.y + 1)] = id
  layer[this.getIndex(coordinates.x + 1, coordinates.y - 1)] = id
  layer[this.getIndex(coordinates.x - 1, coordinates.y + 1)] = id
  layer[this.getIndex(coordinates.x - 1, coordinates.y - 1)] = id
}

OTMapGenerator.prototype.tileShouldErode = function (neighbours) {
  /* FUNCTION tileShouldErode
   * Returns whether a tile should be eroded by the coastline
   */

  return (
    (neighbours.N === ITEMS.WATER_TILE_ID &&
      neighbours.S === ITEMS.WATER_TILE_ID) ||
    (neighbours.E === ITEMS.WATER_TILE_ID &&
      neighbours.W === ITEMS.WATER_TILE_ID) ||
    ((neighbours.E !== ITEMS.WATER_TILE_ID ||
      neighbours.S !== ITEMS.WATER_TILE_ID) &&
      neighbours.NE === ITEMS.WATER_TILE_ID &&
      neighbours.SW === ITEMS.WATER_TILE_ID) ||
    ((neighbours.W !== ITEMS.WATER_TILE_ID ||
      neighbours.N !== ITEMS.WATER_TILE_ID) &&
      neighbours.SE === ITEMS.WATER_TILE_ID &&
      neighbours.NW === ITEMS.WATER_TILE_ID) ||
    (neighbours.N === ITEMS.WATER_TILE_ID &&
      neighbours.E === ITEMS.WATER_TILE_ID &&
      neighbours.S === ITEMS.WATER_TILE_ID) ||
    (neighbours.E === ITEMS.WATER_TILE_ID &&
      neighbours.S === ITEMS.WATER_TILE_ID &&
      neighbours.W === ITEMS.WATER_TILE_ID) ||
    (neighbours.S === ITEMS.WATER_TILE_ID &&
      neighbours.W === ITEMS.WATER_TILE_ID &&
      neighbours.N === ITEMS.WATER_TILE_ID) ||
    (neighbours.W === ITEMS.WATER_TILE_ID &&
      neighbours.N === ITEMS.WATER_TILE_ID &&
      neighbours.E === ITEMS.WATER_TILE_ID)
  )
}

OTMapGenerator.prototype.fillColumn = function (layers, x, y, z, id) {
  /* FUNCTION fillColumn
   * Fills a column at x, y until z, with id on top
   */

  // Get the index of the tile
  var index = this.getIndex(x, y)

  // Set top item
  layers[z][index] = id

  // Fill downwards with mountain
  for (var i = 0; i < z; i++) {
    layers[i][index] =
      mountains[this.CONFIGURATION.GENERATION.MOUNTAIN_TYPE + "_TILE_ID"]
  }
}

OTMapGenerator.prototype.getIndex = function (x, y) {
  /* FUNCTION getIndex
   * Converts x, y to layer index
   */

  return x + y * this.CONFIGURATION.WIDTH
}

OTMapGenerator.prototype.getAdjacentTiles = function (layer, coordinates) {
  /* FUNCTION getAdjacentTiles
   * Returns adjacent tiles of another tile
   */

  var x = coordinates.x
  var y = coordinates.y

  return {
    N: this.getTile(layer, x, y - 1),
    NE: this.getTile(layer, x + 1, y - 1),
    E: this.getTile(layer, x + 1, y),
    SE: this.getTile(layer, x + 1, y + 1),
    S: this.getTile(layer, x, y + 1),
    SW: this.getTile(layer, x - 1, y + 1),
    W: this.getTile(layer, x - 1, y),
    NW: this.getTile(layer, x - 1, y - 1),
  }
}

OTMapGenerator.prototype.getTile = function (layer, x, y) {
  /* FUNCTION getTile
   * Returns tile at layer & coordinates
   */

  return layer[this.getIndex(x, y)]
}

OTMapGenerator.prototype.zNoiseFunction = function (x, y) {
  /* FUNCTION zNoiseFunction
   * Returns noise as a function of x, y
   *
   * MODIFY THESE PARAMETERS TO CREATE DIFFERENT MAPS!
   * I DON'T KNOW ABOUT THE SENSITIVITY OF THESE PARAMETERS: JUST PLAY!
   * See this: https://www.redblobgames.com/maps/terrain-from-noise/
   */

  // Island parameters
  const a = this.CONFIGURATION.GENERATION.A
  const b = this.CONFIGURATION.GENERATION.B
  const c = this.CONFIGURATION.GENERATION.C
  const e = this.CONFIGURATION.GENERATION.EXPONENT
  const f = this.CONFIGURATION.GENERATION.LINEAR
  const w = this.CONFIGURATION.GENERATION.WATER_LEVEL

  // Scaled coordinates between -0.5 and 0.5
  var nx = x / (this.CONFIGURATION.WIDTH - 1) - 0.5
  var ny = y / (this.CONFIGURATION.HEIGHT - 1) - 0.5

  // Manhattan distance
  if (this.CONFIGURATION.GENERATION.EUCLIDEAN) {
    var d = Math.sqrt(nx * nx + ny * ny)
  } else {
    var d = 2 * Math.max(Math.abs(nx), Math.abs(ny))
  }

  // Get the noise value
  var noise = this.sumFrequencies(nx, ny)

  // Some exponent for mountains?
  noise = Math.pow(noise, e | 0)

  // Use distance from center to create an island
  return Math.round(f * (noise + a) * (1 - b * Math.pow(d, c))) - (w | 0)
}

OTMapGenerator.prototype.sumFrequencies = function (nx, ny) {
  /* FUNCTION OTMapGenerator.sumFrequencies
   * Sums all the noise frequencies
   */

  return this.CONFIGURATION.GENERATION.FREQUENCIES.reduce(
    function (total, x) {
      return total + this.simplex2freq(x.f, x.weight, nx, ny)
    }.bind(this),
    0
  )
}

OTMapGenerator.prototype.getCoordinates = function (index) {
  /* FUNCTION getCoordinates
   * Returns coordinates for a given layer index
   */

  return {
    x: index % this.CONFIGURATION.WIDTH,
    y: Math.floor(index / this.CONFIGURATION.WIDTH),
  }
}

OTMapGenerator.prototype.simplex2freq = function (f, weight, nx, ny) {
  /* FUNCTION simplex2freq
   * Returns simplex noise on position nx, ny scaled between -0.5 and 0.5
   * at a given frequency
   */

  // Scale the frequency to the map size
  fWidth = (f * this.CONFIGURATION.WIDTH) / this.TILE_AREA_SIZE
  fHeight = (f * this.CONFIGURATION.HEIGHT) / this.TILE_AREA_SIZE

  return weight * noise.simplex2(fWidth * nx, fHeight * ny)
}

OTMapGenerator.prototype.generateTileAreas = function (layers) {
  /* FUNCTION generateTileAreas
   * Converts layers to OTBM tile areas
   */

  const {
    getMountainWallOuter,
    getFloatingBorder,
    getWaterBorder,
    getMountainBorders,
    getMountainWall,
    getWaterBorderSand,
    getSandBorder,
    getGrassBorder,
  } = useBorders(this.CONFIGURATION)

  function createOTBMItem(id) {
    /* FUNCTION createOTBMItem
     * Creates OTBM_ITEM object for OTBM2JSON
     */

    return {
      type: otbm2json.HEADERS.OTBM_ITEM,
      id: id,
    }
  }

  // Create hashmap for the tile areas
  var tileAreas = new Object()
  var self = this
  let createdWaypoints = []

  // Convert layers to OTBM tile areas
  layers.forEach(function (layer, z) {
    // Invert the depth
    var areaZ = 7 - z

    // For all tiles on each layer
    layer.forEach(function (x, i) {
      // Transform layer index to x, y coordinates
      var coordinates = self.getCoordinates(i)

      // Convert global x, y coordinates to tile area coordinates (0, 255, 510, 765)
      var areaX =
        self.TILE_AREA_SIZE * Math.floor(coordinates.x / self.TILE_AREA_SIZE)
      var areaY =
        self.TILE_AREA_SIZE * Math.floor(coordinates.y / self.TILE_AREA_SIZE)

      // Create a tile area identifier for use in a hashmap
      var areaIdentifier = areaX + "." + areaY + "." + areaZ

      // If the tile area does not exist create it
      if (!tileAreas.hasOwnProperty(areaIdentifier)) {
        tileAreas[areaIdentifier] = {
          type: otbm2json.HEADERS.OTBM_TILE_AREA,
          x: areaX,
          y: areaY,
          z: areaZ,
          tiles: new Array(),
        }
      }

      // Items to be placed on a tile (e.g. borders)
      var items = new Array()

      if (!self.CONFIGURATION.TERRAIN_ONLY) {
        // Get the tile neighbours and determine bordering logic
        var neighbours = self.getAdjacentTiles(layer, coordinates)

        // Mountain tile: border outside
        if (
          x !==
          mountains[self.CONFIGURATION.GENERATION.MOUNTAIN_TYPE + "_TILE_ID"]
        ) {
          items.add(getMountainWallOuter(neighbours))
        }

        // All empty tiles can be skipped
        if (x === 0) {
          return
        }

        // Mountain tile: border inside
        if (
          !items.length &&
          x ===
            mountains[self.CONFIGURATION.GENERATION.MOUNTAIN_TYPE + "_TILE_ID"]
        ) {
          items.add(getMountainWall(neighbours))
        }

        n =
          (self.simplex2freq(8, 3, coordinates.x, coordinates.y) +
            self.simplex2freq(16, 0.5, coordinates.x, coordinates.y) +
            self.simplex2freq(32, 0.5, coordinates.x, coordinates.y)) /
          4

        // Crappy noise map to put forests (FIXME)
        // Check if the tile is occupied
        if (!items.length && x === ITEMS.GRASS_TILE_ID) {
          if (n > 0 && Math.random() < 0.4) {
            items.add(clutter.randomTree())
          }
        }

        var nWaterNeighbours = self.countNeighbours(
          neighbours,
          ITEMS.WATER_TILE_ID
        )

        // Add a random water plant
        if (!items.length && x === ITEMS.WATER_TILE_ID) {
          items.add(
            clutter.randomWaterPlant(
              self.countNeighbours(neighbours, ITEMS.GRASS_TILE_ID)
            )
          )
        }
        if (
          !items.length &&
          (x === ITEMS.GRASS_TILE_ID || x === ITEMS.SAND_TILE_ID) &&
          nWaterNeighbours !== 0
        ) {
          if (n > 0 && Math.random() < 0.075) {
            items.add(clutter.randomSandstoneMossy())
          }
        }

        // Clutter to be added to a sand tile
        if (!items.length && x === ITEMS.SAND_TILE_ID) {
          if (n > 0 && Math.random() < 0.25 && nWaterNeighbours === 0) {
            items.add(clutter.randomPebble())
          } else if (n > 0.33 && Math.random() < 0.25) {
            items.add(clutter.randomCactus())
          } else if (Math.random() < 0.45) {
            items.add(clutter.randomPalmTree(neighbours))
          } else if (z === 0 && Math.random() < 0.075) {
            items.add(clutter.randomShell())
          } else if (Math.random() < 0.015) {
            items.add(clutter.randomSandstone())
          }
        }

        // clutter to be added to ice tile
        if (x === ITEMS.ICE_TILE_ID || x === ITEMS.SNOW_TILE_ID) {
          if (n > 0.25) {
            items.push(clutter.randomIces())
          }

          if (n > 0 && Math.random() < 0.2) {
            items.push(clutter.randomSnows())
          }

          if (n > 0 && Math.random() < 0.1) {
            items.push(clutter.randomPebble())
          }

          if (n > 0 && Math.random() < 0.05) {
            items.push(6966)
          }
        }

        // Add a random water plant
        if (x === ITEMS.STONE_TILE_ID) {
          if (n > 0.25) {
            items.push(clutter.randomTileMoss())
          }
          if (n > 0 && Math.random() < 0.5) {
            items.push(clutter.randomPebble())
          }
        }

        // Add grass border to gravel tile
        if (x === ITEMS.GRAVEL_TILE_ID) {
          items.add(getGrassBorder(neighbours))
        }

        // Add water border for sand tile
        if (x === ITEMS.SAND_TILE_ID) {
          items.add(getWaterBorderSand(neighbours))
        }

        // Add sand border to gravel and grass
        if (x === ITEMS.GRAVEL_TILE_ID || x === ITEMS.GRASS_TILE_ID) {
          Array.prototype.push.apply(items, getSandBorder(neighbours))
        }

        // Border grass & water interface
        if (x === ITEMS.GRASS_TILE_ID || x === ITEMS.SNOW_TILE_ID) {
          items.add(getWaterBorder(neighbours))
        }

        // Add wide border on top of mountain (multiple)
        if (
          x === ITEMS.GRASS_TILE_ID ||
          x === ITEMS.STONE_TILE_ID ||
          x === ITEMS.SAND_TILE_ID ||
          x === ITEMS.ICE_TILE_ID ||
          x === ITEMS.SNOW_TILE_ID
        ) {
          Array.prototype.push.apply(items, getFloatingBorder(neighbours))
        }

        // Border at foot of mountain
        if (
          x !==
          mountains[self.CONFIGURATION.GENERATION.MOUNTAIN_TYPE + "_TILE_ID"]
        ) {
          const borders = getMountainBorders(neighbours)

          if (borders.length) {
            borders.map((item) => items.add(item))
          }
        }

        /** add dimensional portals */
        // if (
        //   (!items.length && x === ITEMS.GRASS_TILE_ID) ||
        //   x === ITEMS.SAND_TILE_ID ||
        //   x === ITEMS.ICE_TILE_ID
        // ) {
        //   if (n > 0.56 && Math.random() < 0.007) {
        //     // if (!createdWaypoints >= 7) {
        //     createdWaypoints.push({
        //       position: { ...coordinates, z },
        //     })
        //     items.add(11796)
        //     // }
        //   }
        // }

        // Version filter remove anything below a certain ID
        items = items.filter(function (id) {
          return id !== 0 && id < VERSIONS[self.CONFIGURATION.VERSION].maxId
        })
      }

      // Add the tile to the tile area
      // Make sure to give coordinates in RELATIVE tile area coordinates
      tileAreas[areaIdentifier].tiles.push({
        type: otbm2json.HEADERS.OTBM_TILE,
        x: coordinates.x % self.TILE_AREA_SIZE,
        y: coordinates.y % self.TILE_AREA_SIZE,
        tileid: clutter.randomizeTile(x),
        items: items.map(createOTBMItem),
      })
    })
  })

  // console.log("generated " + createdWaypoints.length + " waypoints")
  // fs.writeFileSync("waypoints.json", JSON.stringify(createdWaypoints))

  return tileAreas
}

Array.prototype.add = function (id) {
  /* Array.prototype.add
   * Pushes item to array if it is not null
   */
  if (id && id !== null) {
    this.push(id)
  }
}

module.exports.OTMapGenerator = OTMapGenerator
