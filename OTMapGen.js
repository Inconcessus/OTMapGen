const otbm2json = require("./OTBM2JSON/otbm2json");
const noise = require("./lib/noise").noise;
const border = require("./lib/border");
const clutter = require("./lib/clutter");
const ITEMS = require("./json/items");

const __VERSION__ = "0.2.0";

// Configuration
const MAP = {
  "SEED": 0,
  "GENERATION": {
    "SAND_BIOME": true,
    "EUCLIDEAN": true,
    "SMOOTH_COASTLINE": true,
    "WATER_LEVEL": 2.0,
    "EXPONENT": 1.00,
    "LINEAR": 8.0
  },
  "WIDTH": 255,
  "HEIGHT": 255
}

const TILE_AREA_SIZE = 0xFF;

function setMapHeader(data) {

  /* FUNCTION setMapHeader
   * Writes RME map header OTBM_MAP_DATA
   */

  data.mapWidth = MAP.WIDTH;
  data.mapHeight = MAP.HEIGHT;

  // Save the time & seed
  data.nodes[0].description += new Date().toISOString() + " (" + MAP.SEED + ")";

}

function countNeighbours(neighbours, id) {

  /* FUNCTION countNeighbours
   * Counts the number of neighbours with particular ID
   */

  return Object.keys(neighbours).filter(function(x) {
    return neighbours[x] === id;
  }).length;

}

function createLayer() {

  /* FUNCTION createLayer
   * Creates an empty layer of map size
   */

  return new Array(MAP.WIDTH * MAP.HEIGHT).fill(0);

}

function mapElevation(z, b) {

  /* FUNCTION mapElevation 
   * Maps particular elevation to tile id 
   */

  switch(true) {
    case (z < 0):
      return ITEMS.WATER_TILE_ID;
    case (z > 3):
      return ITEMS.STONE_TILE_ID;
    default:
      if(b < -1.5) {
        return ITEMS.SAND_TILE_ID;
      } else {
        return ITEMS.GRASS_TILE_ID;
      }
  }

}

function generateMapLayers() {

  /* FUNCTION generateMapLayers
   * Generates temporary layer with noise seeded tiles
   * Layers are later converted to area tiles for OTBM2JSON
   */

  var z, id;

  // Seed the noise function
  noise.seed(MAP.SEED);

  // Create 8 zero filled layers
  var layers = new Array(8).fill(0).map(createLayer);

  console.log("Creating map layers.");

  // Loop over the requested map width and height
  for(var y = 0; y < MAP.HEIGHT; y++) {
    for(var x = 0; x < MAP.WIDTH; x++) {
  
      // Get the elevation
      z = zNoiseFunction(x, y);
      b = MAP.GENERATION.SAND_BIOME ? 5 * zNoiseFunction(y, x) : 0;

      id = mapElevation(z, b);

      // Clamp the value
      z = Math.max(Math.min(z, 7), 0);
 
      // Fill the column with tiles
      fillColumn(layers, x, y, z, id);
  
    }
  }

  // Option to smooth coast line
  if(MAP.GENERATION.SMOOTH_COASTLINE) {
    layers = smoothCoastline(layers);
  }

  return layers;

}

function smoothCoastline(layers) {

  /* FUNCTION smoothCoastline
   * Algorithm that smoothes the coast line
   * to get rid of impossible water borders
   */

  var iterate = 1;
  var c = 0;

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
        var coordinates = getCoordinates(i);
        var neighbours = getAdjacentTiles(layer, coordinates);

        // If the tile needs to be eroded, we will need to reiterate
        if(tileShouldErode(neighbours)) {
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

function tileShouldErode(neighbours) {

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

function fillColumn(layers, x, y, z, id) {

  /* FUNCTION fillColumn 
   * Fills a column at x, y until z, with id on top 
   */

  // Get the index of the tile
  var index = getIndex(x, y);

  // Set top item
  layers[z][index] = id;

  // Fill downwards with mountain
  for(var i = 0; i < z; i++) {
    layers[i][index] = ITEMS.MOUNTAIN_TILE_ID;
  }

}

function getIndex(x, y) {

  /* FUNCTION getIndex
   * Converts x, y to layer index
   */

  return x + y * MAP.WIDTH;

}

function getAdjacentTiles(layer, coordinates) {

  /* FUNCTION getAdjacentTiles
   * Returns adjacent tiles of another tile
   */

  var x = coordinates.x;
  var y = coordinates.y;

  return {
    "N": getTile(layer, x, y - 1),
    "NE": getTile(layer, x + 1, y - 1),
    "E": getTile(layer, x + 1, y),
    "SE": getTile(layer, x + 1, y + 1),
    "S": getTile(layer, x, y + 1),
    "SW": getTile(layer, x - 1, y + 1),
    "W": getTile(layer, x - 1, y),
    "NW": getTile(layer, x - 1, y - 1)
  }

}

function getTile(layer, x, y) {

  /* FUNCTION getTile
   * Returns tile at layer & coordinates
   */

  return layer[getIndex(x, y)];

}

function zNoiseFunction(x, y) {

  /* FUNCTION zNoiseFunction
   * Returns noise as a function of x, y
   *
   * MODIFY THESE PARAMETERS TO CREATE DIFFERENT MAPS!
   * I DON'T KNOW ABOUT THE SENSITIVITY OF THESE PARAMETERS: JUST PLAY!
   * See this: https://www.redblobgames.com/maps/terrain-from-noise/
   */

  // Island parameters
  const a = 0.1;
  const b = 2.00;
  const c = 1.60;
  const e = MAP.GENERATION.EXPONENT;
  const f = MAP.GENERATION.LINEAR;
  const w = MAP.GENERATION.WATER_LEVEL;

  // Scaled coordinates between -0.5 and 0.5
  var nx = x / (MAP.WIDTH - 1) - 0.5;
  var ny = y / (MAP.HEIGHT - 1) - 0.5;

  // Manhattan distance
  if(MAP.GENERATION.EUCLIDEAN) {
    var d = Math.sqrt(nx * nx + ny * ny);
  } else {
    var d = 2 * Math.max(Math.abs(nx), Math.abs(ny));
  }

  // Noise frequencies and weights
  var noise = (
    simplex2freq(1, 1.00, nx, ny) + 
    simplex2freq(2, 0.5, nx, ny) +
    simplex2freq(4, 0.5, nx, ny) +
    simplex2freq(8, 0.5, nx, ny) +
    simplex2freq(16, 0.25, nx, ny) +
    simplex2freq(32, 0.1, nx, ny)
  ) / (1.00 + 0.5 +  0.5 + 0.25 + 0.25 + 0.1);

  // Some exponent for mountains?
  noise = Math.pow(noise, e);

  // Use distance from center to create an island
  return Math.round(f * (noise + a) * (1 - b * Math.pow(d, c))) - (w | 0);

}

function getCoordinates(index) {

  /* FUNCTION getCoordinates
   * Returns coordinates for a given layer index
   */

  return {
    "x": index % MAP.WIDTH,
    "y": Math.floor(index / MAP.WIDTH)
  }

}

function simplex2freq(f, weight, nx, ny) {

  /* FUNCTION simplex2freq
   * Returns simplex noise on position nx, ny scaled between -0.5 and 0.5
   * at a given frequency
   */

  // Scale the frequency to the map size
  fWidth = f * MAP.WIDTH / TILE_AREA_SIZE;
  fHeight = f * MAP.HEIGHT / TILE_AREA_SIZE;

  return weight * noise.simplex2(fWidth * nx, fHeight * ny);

}

function createOTBMItem(id) {

  /* FUNCTION createOTBMItem
   * Creates OTBM_ITEM object for OTBM2JSON
   */

  return {
    "type": "OTBM_ITEM",
    "id": id
  }

}

function generateTileAreas(layers) {

  /* FUNCTION generateTileAreas
   * Converts layers to OTBM tile areas
   */

  console.log("Creating OTBM tile areas and adding clutter.");

  // Create hashmap for the tile areas
  var tileAreas = new Object();

  // Convert layers to OTBM tile areas
  layers.forEach(function(layer, z) {
  
    // For all tiles on each layer
    layer.forEach(function(x, i) {

      // Transform layer index to x, y coordinates
      var coordinates = getCoordinates(i);  
  
      // Convert global x, y coordinates to tile area coordinates (0, 255, 510, 765)
      var areaX = TILE_AREA_SIZE * Math.floor(coordinates.x / TILE_AREA_SIZE);
      var areaY = TILE_AREA_SIZE * Math.floor(coordinates.y / TILE_AREA_SIZE);
  
      // Invert the depth
      var areaZ = 7 - z;
  
      // Create a tile area identifier for use in a hashmap
      var areaIdentifier = areaX + "." + areaY + "." + areaZ;
  
      // If the tile area does not exist create it
      if(!tileAreas.hasOwnProperty(areaIdentifier)) {
        tileAreas[areaIdentifier] = {
          "type": "OTBM_TILE_AREA",
          "x": areaX,
          "y": areaY,
          "z": areaZ,
          "tiles": new Array()
        }
      }
  
      // Items to be placed on a tile (e.g. borders)
      var items = new Array();

      // Get the tile neighbours and determine bordering logic
      var neighbours = getAdjacentTiles(layer, coordinates);
  
      // Mountain tile: border outside 
      if(x !== ITEMS.MOUNTAIN_TILE_ID) {
        items = items.concat(border.getMountainWallOuter(neighbours).map(createOTBMItem));
      }

      // Empty tiles can be skipped now
      if(x === 0) {
        return;
      }

      // Mountain tile: border inside  
      if(x === ITEMS.MOUNTAIN_TILE_ID) {
        items = items.concat(border.getMountainWall(neighbours).map(createOTBMItem));
      }

      n = (simplex2freq(8, 3, coordinates.x, coordinates.y) + simplex2freq(16, 0.5, coordinates.x, coordinates.y) + simplex2freq(32, 0.5, coordinates.x, coordinates.y)) / 4;

      // Crappy noise map to put forests (FIXME)
      // Check if the tile is occupied
      if(!items.length && x === ITEMS.GRASS_TILE_ID) {
        if(n > 0) {
          items.push(createOTBMItem(clutter.randomTree()));
        }
      }

      // Add a random water plant
      if(!items.length && x === ITEMS.WATER_TILE_ID) {
        items.push(createOTBMItem(clutter.randomWaterPlant(countNeighbours(neighbours, ITEMS.GRASS_TILE_ID))));
      }

      if(!items.length && (x === ITEMS.GRASS_TILE_ID || x === ITEMS.SAND_TILE_ID) && countNeighbours(neighbours, ITEMS.WATER_TILE_ID)) {
        if(n > 0 && Math.random() < 0.075) {
          items.push(createOTBMItem(clutter.randomSandstoneMossy()));
        }
      }

      if(!items.length && x === ITEMS.SAND_TILE_ID) {
        if(n > 0 && Math.random() < 0.25 && countNeighbours(neighbours, ITEMS.WATER_TILE_ID) === 0) {
          items.push(createOTBMItem(clutter.randomPebble()));
        } else if(n > 0.33 && Math.random() < 0.25) {
          items.push(createOTBMItem(clutter.randomCactus()));
        } else if(Math.random() < 0.45) {
          items.push(createOTBMItem(clutter.randomPalmTree(neighbours)));
         } else if(z === 0 && Math.random() < 0.075) {
          items.push(createOTBMItem(clutter.randomShell()));
         } else if(Math.random() < 0.015) {
          items.push(createOTBMItem(clutter.randomSandstone()));
         }
       }

      // Add a random water plant
      if(x === ITEMS.STONE_TILE_ID) {
        if(n > 0.25) {
          items.push(createOTBMItem(clutter.randomTileMoss()));
        }
        if(n > 0 && Math.random() < 0.5) {
          items.push(createOTBMItem(clutter.randomPebble()));
        }
      }

      if(x === ITEMS.SAND_TILE_ID) {
        items = items.concat(border.getWaterBorderSand(neighbours).map(createOTBMItem));
      }
      // Border grass & water interface
      if(x === ITEMS.GRASS_TILE_ID) {
        items = items.concat(border.getSandBorder(neighbours).map(createOTBMItem));
        items = items.concat(border.getWaterBorder(neighbours).map(createOTBMItem));
      }

      // Border on top of mountain
      if(x === ITEMS.GRASS_TILE_ID || x === ITEMS.STONE_TILE_ID || x === ITEMS.SAND_TILE_ID) {
        items = items.concat(border.getFloatingBorder(neighbours).map(createOTBMItem));
      }

      // Border at foot of mountain
      if(x !== ITEMS.MOUNTAIN_TILE_ID) {
        items = items.concat(border.getMountainBorder(neighbours).map(createOTBMItem));
      }

      // Randomize the tile
      x = clutter.randomizeTile(x);

      // Add the tile to the tile area
      // Make sure to give coordinates in RELATIVE tile area coordinates
      tileAreas[areaIdentifier].tiles.push({
        "type": "OTBM_TILE",
        "x": coordinates.x % TILE_AREA_SIZE,
        "y": coordinates.y % TILE_AREA_SIZE,
        "tileid": x,
        "items": items
      });
  
    });
  
  });

  return tileAreas;

}

if(require.main === module) {

  var start = Date.now();

  console.log("Creating map of size " + MAP.WIDTH + "x" + MAP.HEIGHT + " using seed " + MAP.SEED + ".");

  // Read default OTMapGen header
  var json = require("./json/header");

  // Create temporary layers followed by tile areas
  var layers = generateMapLayers();
  var tileAreas = generateTileAreas(layers);

  // Add all tile areas to the JSON2OTBM structure
  Object.keys(tileAreas).forEach(function(area) {
    json.data.nodes[0].features.push(tileAreas[area]);
  });

  // Write the map header
  setMapHeader(json.data);

  console.log("Finished generation in " + (Date.now()  - start) + "ms. Writing output to map.otbm");

  // Write the JSON using the OTBM2JSON lib
  otbm2json.write("map.otbm", json);

}
