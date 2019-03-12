const otbm2json = require("./OTBM2JSON/otbm2json");
const noise = require("./lib/noise").noise;
const fs = require("fs");
const border = require("./lib/border");
const clutter = require("./lib/clutter");
const ITEMS = require("./json/items");
const VERSIONS = require("./json/versions");

const __VERSION__ = "1.2.0";

var OTMapGenerator = function() {

  /* Class OTMapGenerator
   * Container for the OTMapGenerator class
   */

  // Check OTBM2JSON version
  if(otbm2json.__VERSION__ !== "1.0.0") {
    console.log("Incompatible version of otbm2json; please update.");
  }

  // Constant size of RME tile area (255x255)
  this.TILE_AREA_SIZE = 0xFF;

  // Default configuration to be overwritten
  this.CONFIGURATION = {
    "SEED": 0,
    "WIDTH": 256,
    "HEIGHT": 256,
    "VERSION": "10.98",
    "TERRAIN_ONLY": false,
    "GENERATION": {
      "A": 0.05,
      "B": 2.00,
      "C": 2.00,
      "CAVE_DEPTH": 12,
      "CAVE_ROUGHNESS": 0.45,
      "CAVE_CHANCE": 0.005,
      "SAND_BIOME": true,
      "EUCLIDEAN": true,
      "SMOOTH_COASTLINE": true,
      "ADD_CAVES": false,
      "WATER_LEVEL": 0.0,
      "EXPONENT": 1.00,
      "LINEAR": 8.0,
      "FREQUENCIES": [
        {"f": 1, "weight": 0.30 },
        {"f": 2, "weight": 0.20 },
        {"f": 4, "weight": 0.20 },
        {"f": 8, "weight": 0.10 },
        {"f": 16, "weight": 0.10 },
        {"f": 32, "weight": 0.05 },
        {"f": 64, "weight": 0.05 }
      ]
    },
  }

}

OTMapGenerator.prototype.generateMinimap = function(configuration) {

  /* OTMapGenerator.generateMinimapmap
   * Generates clamped UInt8 buffer with RGBA values to be sent to canvas
   */

  function shouldOutline(layer, j, width) {

    /* function shouldOutline
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
    );

  }

  const OUTLINE_COLOR = 0x80;

  var color, byteArray;

  // Set the configuration
  this.CONFIGURATION = configuration;

  // Create temporary layers
  var layers = this.generateMapLayers();

  var pngLayers = new Array();

  // Only go over the base layer for now
  for(var i = 0; i < layers.length; i++) {

    // Create a buffer the size of w * h * 4 bytes
    byteArray = new Uint8ClampedArray(4 * this.CONFIGURATION.WIDTH * this.CONFIGURATION.HEIGHT);

    for(var j = 0; j < layers[i].length; j++) {

      // Set alpha value to 0xFF
      byteArray[4 * j + 3] = 0xFF;

      // No tile: skip or outline
      if(layers[i][j] === 0) {
        if(shouldOutline(layers[i], j, this.CONFIGURATION.WIDTH)) {
          byteArray[4 * j + 0] = OUTLINE_COLOR;
          byteArray[4 * j + 1] = OUTLINE_COLOR;
          byteArray[4 * j + 2] = OUTLINE_COLOR;
        }
        continue;
      }

      // Color is the 6 byte hex RGB representation
      hexColor = this.getMinimapColor(layers[i][j]);

      // Write RGBA in the buffer (always 0xFF for A)
      byteArray[4 * j + 0] = (hexColor >> 16) & 0xFF;
      byteArray[4 * j + 1] = (hexColor >> 8) & 0xFF;
      byteArray[4 * j + 2] = (hexColor >> 0) & 0xFF;

    }

    pngLayers.push(byteArray);

  }

  return {
    "data": pngLayers,
    "metadata": this.CONFIGURATION
  }

}

OTMapGenerator.prototype.getMinimapColor = function(id) {

  /* OTMapGenerator.getMinimapColor
   * Maps tile identifier to minimap color
   */

  // Color constants
  const WATER_COLOR = 0x0148C2;
  const GRASS_COLOR = 0x00FF00;
  const SAND_COLOR = 0xFFCC99;
  const MOUNTAIN_COLOR = 0x666666;
  const GRAVEL_COLOR = 0x999999;
  const SNOW_COLOR = 0xFFFFFF;

  // Map tile to minimap color
  // default to black
  switch(id) {
    case ITEMS.WATER_TILE_ID:
      return WATER_COLOR;
    case ITEMS.GRASS_TILE_ID:
      return GRASS_COLOR;
    case ITEMS.SAND_TILE_ID:
      return SAND_COLOR;
    case ITEMS.MOUNTAIN_TILE_ID:
      return MOUNTAIN_COLOR;
    case ITEMS.GRAVEL_TILE_ID:
    case ITEMS.STONE_TILE_ID:
      return GRAVEL_COLOR;
    case ITEMS.SNOW_TILE_ID:
      return SNOW_COLOR;
    default:
      return 0x000000;
  }

}

OTMapGenerator.prototype.generate = function(configuration) {

  /* FUNCTION OTMapGenerator.generate
   * Generates OTBM map and returns OTBMJSON representation
   */

  this._initialized = Date.now();

  if(configuration !== undefined) {
    this.CONFIGURATION = configuration;
  }

  // Default blueprint for OTBMJSON
  // Create a deep copy in memory using the JSON module
  var json = JSON.parse(JSON.stringify(require("./json/header")));

  // Create temporary layers
  var layers = this.generateMapLayers();

  // Convert layers to tile areas
  var tileAreas = this.generateTileAreas(layers);

  // Add all tile areas to the JSON2OTBM structure
  Object.keys(tileAreas).forEach(function(area) {
    json.data.nodes[0].features.push(tileAreas[area]);
  });

  // Write the map header
  this.setMapHeader(json.data);

  // Write the JSON using the OTBM2JSON lib
  return otbm2json.serialize(json);

}

OTMapGenerator.prototype.setMapHeader = function(data) {

  /* FUNCTION setMapHeader
   * Writes RME map header OTBM_MAP_DATA
   */

  if(!VERSIONS.hasOwnProperty(this.CONFIGURATION.VERSION)) {
    throw("Map version not supported.");
  }

  data.mapWidth = this.CONFIGURATION.WIDTH;
  data.mapHeight = this.CONFIGURATION.HEIGHT;

  var versionAttributes = VERSIONS[this.CONFIGURATION.VERSION];

  data.version = versionAttributes.version;
  data.itemsMajorVersion = versionAttributes.itemsMajorVersion;
  data.itemsMinorVersion = versionAttributes.itemsMinorVersion;

  // Save the time & seed
  data.nodes[0].description += new Date().toISOString() + " (" + this.CONFIGURATION.SEED + ")";

}

OTMapGenerator.prototype.generateMapLayers = function() {

  /* FUNCTION generateMapLayers
   * Generates temporary layer with noise seeded tiles
   * Layers are later converted to area tiles for OTBM2JSON
   */

  function createLayer() {
  
    /* FUNCTION createLayer
     * Creates an empty layer of map size (WIDTH x HEIGHT)
     */
  
    return new Array(this.CONFIGURATION.WIDTH * this.CONFIGURATION.HEIGHT).fill(0);
  
  }

  var z, id;

  // Seed the noise function
  noise.seed(this.CONFIGURATION.SEED);

  // Create 8 zero filled layers
  var layers = new Array(8).fill(0).map(createLayer.bind(this));

  // Loop over the requested map width and height
  for(var y = 0; y < this.CONFIGURATION.HEIGHT; y++) {
    for(var x = 0; x < this.CONFIGURATION.WIDTH; x++) {

      // Get the elevation
      z = this.zNoiseFunction(x, y);
      b = this.CONFIGURATION.GENERATION.SAND_BIOME ? 5 * this.zNoiseFunction(y, x) : 0;

      id = this.mapElevation(z, b);

      // Clamp the value
      z = Math.max(Math.min(z, 7), 0);

      // Fill the column with tiles
      this.fillColumn(layers, x, y, z, id);

    }
  }

  // Option to smooth coast line
  if(this.CONFIGURATION.GENERATION.SMOOTH_COASTLINE) {
    layers = this.smoothCoastline(layers);
  }

  if(this.CONFIGURATION.GENERATION.ADD_CAVES) {
    layers = this.digCaves(layers);
  }

  return layers;

}

OTMapGenerator.prototype.smoothCoastline = function(layers) {

  /* FUNCTION smoothCoastline
   * Algorithm that smoothes the coast line
   * to get rid of impossible water borders
   */

  var iterate = 1;
  var c = 0;
  var self = this;

  // Constant iteration to remove impossible coastline tiles
  while(iterate) {

    iterate = 0;

    layers = layers.map(function(layer, i) {

      // Coastline only on the lowest floor
      if(i !== 0) {
        return layer;
      }

      return layer.map(function(x, i) {

        // Skip anything that is not a grass tile
        if(x !== ITEMS.GRASS_TILE_ID && x !== ITEMS.SAND_TILE_ID) {
          return x;
        }

        // Get the coordinate and the neighbours
        var coordinates = self.getCoordinates(i);
        var neighbours = self.getAdjacentTiles(layer, coordinates);

        // If the tile needs to be eroded, we will need to reiterate
        if(self.tileShouldErode(neighbours)) {
          x = ITEMS.WATER_TILE_ID;
          iterate++;
        }

        return x;

      });

    });

    console.log("Smoothing coastline <iteration " + c++ + ">" + " <" + iterate + " tiles eroded>");

  }

  return layers;

}

OTMapGenerator.prototype.countNeighboursNegative = function(neighbours, id) {

  /* FUNCTION countNeighboursNegative
   * Counts the number of neighbours that do not have a particular ID 
   */

  return Object.keys(neighbours).filter(function(x) {
    return neighbours[x] !== ITEMS.GRAVEL_TILE_ID && neighbours[x] !== id;
  }).length;

}

OTMapGenerator.prototype.countNeighbours = function(neighbours, id) {

  /* FUNCTION countNeighbours
   * Counts the number of neighbours with particular ID
   */

  return Object.keys(neighbours).filter(function(x) {
    return neighbours[x] === id;
  }).length;

}

OTMapGenerator.prototype.mapElevation = function(z, b) {

  /* FUNCTION mapElevation 
   * Maps particular elevation to tile id 
   */

  switch(true) {
    case (z < 0):
      return ITEMS.WATER_TILE_ID;
    case (z > 3):
      if(b > -1.5) {
        return ITEMS.STONE_TILE_ID;
      } else {
        return ITEMS.SNOW_TILE_ID;
      }
    default:
      if(b < -1.5) {
        return ITEMS.SAND_TILE_ID;
      } else {
        return ITEMS.GRASS_TILE_ID;
      }
  }

}

OTMapGenerator.prototype.digCaves = function(layers) {

  /* FUNCTION digCaves
   * Slow and pretty crappy algorithm to dig caves (FIXME)
   */

  // Keep a reference to cave entrances
  var entrances = new Array();
  var self = this;

  for(var k = 0; k < this.CONFIGURATION.GENERATION.CAVE_DEPTH; k++) { 

    console.log("Eroding caves <iteration " + k + ">");

    layers = layers.map(function(layer, z) {
    
      return layer.map(function(x, i) {
    
        if(x !== ITEMS.MOUNTAIN_TILE_ID) {
          return x;
        }
    
        var coordinates = self.getCoordinates(i);
        var neighbours = self.getAdjacentTiles(layer, coordinates);
    
        if(self.countNeighbours(neighbours, ITEMS.GRAVEL_TILE_ID) > 0 && self.countNeighboursNegative(neighbours, ITEMS.MOUNTAIN_TILE_ID) === 0 && Math.random() < self.CONFIGURATION.GENERATION.CAVE_ROUGHNESS) {
          return ITEMS.GRAVEL_TILE_ID;
        }

        // Get neighbouring neighbours ;)
        var NL = self.getAdjacentTiles(layer, {"x": coordinates.x - 1, "y": coordinates.y});
        var NR = self.getAdjacentTiles(layer, {"x": coordinates.x + 1, "y": coordinates.y});
        var NN = self.getAdjacentTiles(layer, {"x": coordinates.x, "y": coordinates.y - 1});
        var NS = self.getAdjacentTiles(layer, {"x": coordinates.x, "y": coordinates.y + 1});
    
        if(Math.random() < self.CONFIGURATION.GENERATION.CAVE_CHANCE && NR.E === ITEMS.MOUNTAIN_TILE_ID && NL.W === ITEMS.MOUNTAIN_TILE_ID && x === ITEMS.MOUNTAIN_TILE_ID && self.countNeighbours(neighbours, ITEMS.MOUNTAIN_TILE_ID) === 5 && neighbours.W === ITEMS.MOUNTAIN_TILE_ID && neighbours.E === ITEMS.MOUNTAIN_TILE_ID) {
          entrances.push({"z": z, "c": coordinates});
          return ITEMS.GRAVEL_TILE_ID;
        } else if(Math.random() < self.CONFIGURATION.GENERATION.CAVE_CHANCE && NS.S === ITEMS.MOUNTAIN_TILE_ID && NN.N === ITEMS.MOUNTAIN_TILE_ID && x === ITEMS.MOUNTAIN_TILE_ID && self.countNeighbours(neighbours, ITEMS.MOUNTAIN_TILE_ID) === 5 && neighbours.S === ITEMS.MOUNTAIN_TILE_ID && neighbours.N === ITEMS.MOUNTAIN_TILE_ID) {
          entrances.push({"z": z, "c": coordinates});
          return ITEMS.GRAVEL_TILE_ID;
        }
    
        return x;
    
      });
    
    });

  }

  // Open 3x3 around the cave entrance
  entrances.forEach(function(x) {
    self.fillNeighbours(layers[x.z], x.c, ITEMS.GRAVEL_TILE_ID);
  });

  return layers;

}

OTMapGenerator.prototype.fillNeighbours = function(layer, coordinates, id) {

  /* FUNCTION fillNeighbours
   * Fills all neighbouring tiles with particular ID
   */

  layer[this.getIndex(coordinates.x - 1, coordinates.y)] = id;
  layer[this.getIndex(coordinates.x + 1, coordinates.y)] = id;
  layer[this.getIndex(coordinates.x, coordinates.y - 1)] = id;
  layer[this.getIndex(coordinates.x, coordinates.y + 1)] = id;

  layer[this.getIndex(coordinates.x + 1, coordinates.y + 1)] = id;
  layer[this.getIndex(coordinates.x + 1, coordinates.y - 1)] = id;
  layer[this.getIndex(coordinates.x - 1, coordinates.y + 1)] = id;
  layer[this.getIndex(coordinates.x - 1, coordinates.y - 1)] = id;

}

OTMapGenerator.prototype.tileShouldErode = function(neighbours) {

  /* FUNCTION tileShouldErode
   * Returns whether a tile should be eroded by the coastline
   */

  return (
   (neighbours.N === ITEMS.WATER_TILE_ID && neighbours.S === ITEMS.WATER_TILE_ID) ||
   (neighbours.E === ITEMS.WATER_TILE_ID && neighbours.W === ITEMS.WATER_TILE_ID) ||
   ((neighbours.E !== ITEMS.WATER_TILE_ID || neighbours.S !== ITEMS.WATER_TILE_ID) && neighbours.NE === ITEMS.WATER_TILE_ID && neighbours.SW === ITEMS.WATER_TILE_ID) ||
   ((neighbours.W !== ITEMS.WATER_TILE_ID || neighbours.N !== ITEMS.WATER_TILE_ID) && neighbours.SE === ITEMS.WATER_TILE_ID && neighbours.NW === ITEMS.WATER_TILE_ID) ||
   (neighbours.N === ITEMS.WATER_TILE_ID && neighbours.E === ITEMS.WATER_TILE_ID && neighbours.S === ITEMS.WATER_TILE_ID) ||
   (neighbours.E === ITEMS.WATER_TILE_ID && neighbours.S === ITEMS.WATER_TILE_ID && neighbours.W === ITEMS.WATER_TILE_ID) ||
   (neighbours.S === ITEMS.WATER_TILE_ID && neighbours.W === ITEMS.WATER_TILE_ID && neighbours.N === ITEMS.WATER_TILE_ID) ||
   (neighbours.W === ITEMS.WATER_TILE_ID && neighbours.N === ITEMS.WATER_TILE_ID && neighbours.E === ITEMS.WATER_TILE_ID)
  );

}

OTMapGenerator.prototype.fillColumn = function(layers, x, y, z, id) {

  /* FUNCTION fillColumn 
   * Fills a column at x, y until z, with id on top 
   */

  // Get the index of the tile
  var index = this.getIndex(x, y);

  // Set top item
  layers[z][index] = id;

  // Fill downwards with mountain
  for(var i = 0; i < z; i++) {
    layers[i][index] = ITEMS.MOUNTAIN_TILE_ID;
  }

}

OTMapGenerator.prototype.getIndex = function(x, y) {

  /* FUNCTION getIndex
   * Converts x, y to layer index
   */

  return x + (y * this.CONFIGURATION.WIDTH);

}

OTMapGenerator.prototype.getAdjacentTiles = function(layer, coordinates) {

  /* FUNCTION getAdjacentTiles
   * Returns adjacent tiles of another tile
   */

  var x = coordinates.x;
  var y = coordinates.y;

  return {
    "N": this.getTile(layer, x, y - 1),
    "NE": this.getTile(layer, x + 1, y - 1),
    "E": this.getTile(layer, x + 1, y),
    "SE": this.getTile(layer, x + 1, y + 1),
    "S": this.getTile(layer, x, y + 1),
    "SW": this.getTile(layer, x - 1, y + 1),
    "W": this.getTile(layer, x - 1, y),
    "NW": this.getTile(layer, x - 1, y - 1)
  }

}

OTMapGenerator.prototype.getTile = function(layer, x, y) {

  /* FUNCTION getTile
   * Returns tile at layer & coordinates
   */

  return layer[this.getIndex(x, y)];

}

OTMapGenerator.prototype.zNoiseFunction = function(x, y) {

  /* FUNCTION zNoiseFunction
   * Returns noise as a function of x, y
   *
   * MODIFY THESE PARAMETERS TO CREATE DIFFERENT MAPS!
   * I DON'T KNOW ABOUT THE SENSITIVITY OF THESE PARAMETERS: JUST PLAY!
   * See this: https://www.redblobgames.com/maps/terrain-from-noise/
   */

  // Island parameters
  const a = this.CONFIGURATION.GENERATION.A;
  const b = this.CONFIGURATION.GENERATION.B;
  const c = this.CONFIGURATION.GENERATION.C;
  const e = this.CONFIGURATION.GENERATION.EXPONENT;
  const f = this.CONFIGURATION.GENERATION.LINEAR;
  const w = this.CONFIGURATION.GENERATION.WATER_LEVEL;

  // Scaled coordinates between -0.5 and 0.5
  var nx = x / (this.CONFIGURATION.WIDTH - 1) - 0.5;
  var ny = y / (this.CONFIGURATION.HEIGHT - 1) - 0.5;

  // Manhattan distance
  if(this.CONFIGURATION.GENERATION.EUCLIDEAN) {
    var d = Math.sqrt(nx * nx + ny * ny);
  } else {
    var d = 2 * Math.max(Math.abs(nx), Math.abs(ny));
  }

  // Get the noise value
  var noise = this.sumFrequencies(nx, ny);

  // Some exponent for mountains?
  noise = Math.pow(noise, e | 0);

  // Use distance from center to create an island
  return Math.round(f * (noise + a) * (1 - b * Math.pow(d, c))) - (w | 0);

}

OTMapGenerator.prototype.sumFrequencies = function(nx, ny) {

  /* FUNCTION OTMapGenerator.sumFrequencies
   * Sums all the noise frequencies
   */

  return this.CONFIGURATION.GENERATION.FREQUENCIES.reduce(function(total, x) {
    return total + this.simplex2freq(x.f, x.weight, nx, ny);
  }.bind(this), 0);

}

OTMapGenerator.prototype.getCoordinates = function(index) {

  /* FUNCTION getCoordinates
   * Returns coordinates for a given layer index
   */

  return {
    "x": index % this.CONFIGURATION.WIDTH,
    "y": Math.floor(index / this.CONFIGURATION.WIDTH)
  }

}

OTMapGenerator.prototype.simplex2freq = function(f, weight, nx, ny) {

  /* FUNCTION simplex2freq
   * Returns simplex noise on position nx, ny scaled between -0.5 and 0.5
   * at a given frequency
   */

  // Scale the frequency to the map size
  fWidth = f * this.CONFIGURATION.WIDTH / this.TILE_AREA_SIZE;
  fHeight = f * this.CONFIGURATION.HEIGHT / this.TILE_AREA_SIZE;

  return weight * noise.simplex2(fWidth * nx, fHeight * ny);

}

OTMapGenerator.prototype.generateTileAreas = function(layers) {

  /* FUNCTION generateTileAreas
   * Converts layers to OTBM tile areas
   */

  function createOTBMItem(id) {
  
    /* FUNCTION createOTBMItem
     * Creates OTBM_ITEM object for OTBM2JSON
     */
  
    return {
      "type": otbm2json.HEADERS.OTBM_ITEM,
      "id": id
    }
  
  }

  // Create hashmap for the tile areas
  var tileAreas = new Object();
  var self = this;

  // Convert layers to OTBM tile areas
  layers.forEach(function(layer, z) {
  
    // Invert the depth
    var areaZ = 7 - z;

    // For all tiles on each layer
    layer.forEach(function(x, i) {

      // Transform layer index to x, y coordinates
      var coordinates = self.getCoordinates(i);  
  
      // Convert global x, y coordinates to tile area coordinates (0, 255, 510, 765)
      var areaX = self.TILE_AREA_SIZE * Math.floor(coordinates.x / self.TILE_AREA_SIZE);
      var areaY = self.TILE_AREA_SIZE * Math.floor(coordinates.y / self.TILE_AREA_SIZE);
  
      // Create a tile area identifier for use in a hashmap
      var areaIdentifier = areaX + "." + areaY + "." + areaZ;
  
      // If the tile area does not exist create it
      if(!tileAreas.hasOwnProperty(areaIdentifier)) {
        tileAreas[areaIdentifier] = {
          "type": otbm2json.HEADERS.OTBM_TILE_AREA,
          "x": areaX,
          "y": areaY,
          "z": areaZ,
          "tiles": new Array()
        }
      }
  
      // Items to be placed on a tile (e.g. borders)
      var items = new Array();

      if(!self.CONFIGURATION.TERRAIN_ONLY) {

        // Get the tile neighbours and determine bordering logic
        var neighbours = self.getAdjacentTiles(layer, coordinates);
        
        // Mountain tile: border outside 
        if(x !== ITEMS.MOUNTAIN_TILE_ID) {
          items.add(border.getMountainWallOuter(neighbours));
        }
        
        // All empty tiles can be skipped
        if(x === 0) {
          return;
        }
        
        // Mountain tile: border inside  
        if(!items.length && x === ITEMS.MOUNTAIN_TILE_ID) {
          items.add(border.getMountainWall(neighbours));
        }
        
        n = (self.simplex2freq(8, 3, coordinates.x, coordinates.y) + self.simplex2freq(16, 0.5, coordinates.x, coordinates.y) + self.simplex2freq(32, 0.5, coordinates.x, coordinates.y)) / 4;
        
        // Crappy noise map to put forests (FIXME)
        // Check if the tile is occupied
        if(!items.length && x === ITEMS.GRASS_TILE_ID) {
          if(n > 0) {
            items.add(clutter.randomTree());
          }
        }

        var nWaterNeighbours = self.countNeighbours(neighbours, ITEMS.WATER_TILE_ID);
        
        // Add a random water plant
        if(!items.length && x === ITEMS.WATER_TILE_ID) {
          items.add(clutter.randomWaterPlant(self.countNeighbours(neighbours, ITEMS.GRASS_TILE_ID)));
        }
        if(!items.length && (x === ITEMS.GRASS_TILE_ID || x === ITEMS.SAND_TILE_ID) && nWaterNeighbours !== 0) {
          if(n > 0 && Math.random() < 0.075) {
            items.add(clutter.randomSandstoneMossy());
          }
        }
        
        // Clutter to be added to a sand tile
        if(!items.length && x === ITEMS.SAND_TILE_ID) {
          if(n > 0 && Math.random() < 0.25 && nWaterNeighbours === 0) {
            items.add(clutter.randomPebble());
          } else if(n > 0.33 && Math.random() < 0.25) {
            items.add(clutter.randomCactus());
          } else if(Math.random() < 0.45) {
            items.add(clutter.randomPalmTree(neighbours));
          } else if(z === 0 && Math.random() < 0.075) {
           items.add(clutter.randomShell());
          } else if(Math.random() < 0.015) {
           items.add(clutter.randomSandstone());
          }
        }
        
        // Add a random water plant
        if(x === ITEMS.STONE_TILE_ID) {
          if(n > 0.25) {
            items.push(clutter.randomTileMoss());
          }
          if(n > 0 && Math.random() < 0.5) {
            items.push(clutter.randomPebble());
          }
        }

        // Add grass border to gravel tile
        if(x === ITEMS.GRAVEL_TILE_ID) {
          items.add(border.getGrassBorder(neighbours));
        }
        
        // Add water border for sand tile
        if(x === ITEMS.SAND_TILE_ID) {
          items.add(border.getWaterBorderSand(neighbours));
        }
        
        // Add sand border to gravel and grass
        if(x === ITEMS.GRAVEL_TILE_ID || x === ITEMS.GRASS_TILE_ID) {
          Array.prototype.push.apply(items, border.getSandBorder(neighbours));
        }
        
        // Border grass & water interface
        if(x === ITEMS.GRASS_TILE_ID) {
          items.add(border.getWaterBorder(neighbours));
        }
        
        // Add wide border on top of mountain (multiple)
        if(x === ITEMS.GRASS_TILE_ID || x === ITEMS.STONE_TILE_ID || x === ITEMS.SAND_TILE_ID) {
          Array.prototype.push.apply(items, border.getFloatingBorder(neighbours));
        }
        
        // Border at foot of mountain
        if(x !== ITEMS.MOUNTAIN_TILE_ID) {
          items.add(border.getMountainBorder(neighbours));
        }

        // Version filter remove anything below a certain ID
        items = items.filter(function(id) {
          return id !== 0 && id < VERSIONS[self.CONFIGURATION.VERSION].maxId;
        });

      }

      // Add the tile to the tile area
      // Make sure to give coordinates in RELATIVE tile area coordinates
      tileAreas[areaIdentifier].tiles.push({
        "type": otbm2json.HEADERS.OTBM_TILE,
        "x": coordinates.x % self.TILE_AREA_SIZE,
        "y": coordinates.y % self.TILE_AREA_SIZE,
        "tileid": clutter.randomizeTile(x),
        "items": items.map(createOTBMItem)
      });
  
    });
  
  });

  return tileAreas;

}

Array.prototype.add = function(id) {

  /* Array.prototype.add
   * Pushes item to array if it is not null
   */

  if(id !== null) {
    this.push(id);
  }

}

// Expose the class
module.exports.OTMapGenerator = new OTMapGenerator();
module.exports.__VERSION__ = __VERSION__;

if(require.main === module) {

  fs.writeFileSync("map.otbm", module.exports.OTMapGenerator.generate());

}
