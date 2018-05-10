const otbm2json = require("./OTBM2JSON/otbm2json");
const noise = require("./lib/noise").noise;
const border = require("./lib/border");

const __VERSION__ = "0.1.0";

// Configuration
const MAP = {
  "SEED": 16,
  "WIDTH": 512,
  "HEIGHT": 512
}

// Some global identifiers
const WATER_TILE_ID = 4615;
const GRASS_TILE_ID = 4526;
const STONE_TILE_ID = 4405;
const MOUNTAIN_TILE_ID = 919;

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

function getRandomBetween(min, max) {

  /* FUNCTION getRandomBetween
   * Returns an integer between min, max (inclusive)
   */

  return Math.floor(Math.random() * (max - min + 1) ) + min;

}

function randomPebble() {

  var value = Math.random();

  switch(true) {
    case (value < 0.05):
      return getRandomBetween(3648, 3652);
    case (value < 0.25):
      return getRandomBetween(3611, 3614);
    default:
      return getRandomBetween(3653, 3656);
  }

}

function randomTree() {

  /* FUNCTION randomTree
   * Returns a random shrub or tree
   */

  const BLUEBERRY_BUSH = 2785;

  var value = Math.random();

  // Shrubs or trees
  switch(true) {
    case (value < 0.10):
      return getRandomBetween(2700, 2708);
    case (value < 0.30):
      return getRandomBetween(2767, 2768);
    case (value < 0.95):
      return getRandomBetween(6216, 6219);
    case (value < 0.96):
      return BLUEBERRY_BUSH;
    default:
      if(Math.random() < 0.5) {
        return randomFlower();
      } else {
        return randomFlower2();
      }
  }

}

function randomWaterPlant(neighbours) {

  /* FUNCTION randomWaterPlant
   * Returns a random water plant
   */

  const SWAMP_PLANT_START = 2771;
  const SWAMP_PLANT_END = 2780;
  const WATER_LILY_START = 2755;
  const WATER_LILY_END = 2758;

  var nNeighbours = countNeighbours(neighbours, GRASS_TILE_ID);

  // "Swamp" plants
  if(nNeighbours > 2 && Math.random() < 0.2) {
    return [getRandomBetween(SWAMP_PLANT_START, SWAMP_PLANT_END)];
  }

  // Water lillies
  if(nNeighbours > 1 && Math.random() < 0.25) {
    return [getRandomBetween(WATER_LILY_START, WATER_LILY_END)];
  }

  return new Array();

}

function countNeighbours(neighbours, id) {

  /* FUNCTION countNeighbours
   * Counts the number of neighbours with particular ID
   */

  return Object.keys(neighbours).filter(function(x) {
    return neighbours[x] === id;
  }).length;

}

function randomFlower2() {

  /* FUNCTION countNeighbours
   * Return a random flower with different flower
   */

  return getRandomBetween(4152, 4158);

}

function randomFlower() {

  /* FUNCTION randomFlower
   * Return a random flower with different weights
   */

  const MOON_FLOWERS = 2740;
  const MOON_FLOWER = 2741;
  const WHITE_FLOWER = 2742;
  const HEAVEN_BLOSSOM = 2743;

  var value = Math.random();

  switch(true) {
    case (value < 0.50):
      return MOON_FLOWER;
    case (value < 0.70):
      return WHITE_FLOWER;
    case (value < 0.90):
      return MOON_FLOWERS;
    default:
      return HEAVEN_BLOSSOM;
  }

}

function createLayer() {

  /* FUNCTION createLayer
   * Creates an empty layer of map size
   */

  return new Array(MAP.WIDTH * MAP.HEIGHT).fill(0);

}

function mapElevation(z) {

  /* FUNCTION mapElevation 
   * Maps particular elevation to tile id 
   */

  switch(true) {
    case (z < 0):
      return WATER_TILE_ID;
    case (z > 3):
      return STONE_TILE_ID;
    default:
      return GRASS_TILE_ID;
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

  // Loop over the requested map width and height
  for(var y = 0; y < MAP.HEIGHT; y++) {
    for(var x = 0; x < MAP.WIDTH; x++) {
  
      // Get the elevation
      z = zNoiseFunction(x, y);
      id = mapElevation(z);

      // Clamp the value
      z = Math.max(Math.min(z, 7), 0);
 
      // Fill the column with tiles
      fillColumn(layers, x, y, z, id);
  
    }
  }

  return layers;

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
    layers[i][index] = MOUNTAIN_TILE_ID;
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
  const b = 1.00;
  const c = 1.00;
  const e = 1.00;
  const f = 32.0;

  // Scaled coordinates between -0.5 and 0.5
  var nx = x / (MAP.WIDTH - 1) - 0.5;
  var ny = y / (MAP.HEIGHT - 1) - 0.5;

  // Manhattan distance
  if(false) {
    var d = 2 * Math.max(Math.abs(nx), Math.abs(ny));
  } else {
    var d = Math.sqrt(nx * nx + ny * ny);
  }

  // Noise frequencies and weights
  var noise = (
    simplex2freq(1, 1.00, nx, ny) + 
    simplex2freq(2, 0.75, nx, ny) +
    simplex2freq(4, 0.5, nx, ny) +
    simplex2freq(8, 0.5, nx, ny) +
    simplex2freq(16, 0.25, nx, ny) +
    simplex2freq(32, 0.1, nx, ny)
  ) / (1.00 + 0.75 + 0.5 + 0.25 + 0.25 + 0.1);

  // Some exponent for mountains?
  noise = Math.pow(noise, e);

  // Use distance from center to create an island
  return Math.round(f * (noise + a) * (1 - b * Math.pow(d, c))) - 1;

}

function randomTileMoss() {

  /* FUNCTION randomTileMoss
   * Returns a random moss tile for stone tiles
   */

  const MOSS_TILE_START = 4580;
  const MOSS_TILE_END = 4594;

  return getRandomBetween(MOSS_TILE_START, MOSS_TILE_END);

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

function randomizeTile(x) {

  /* FUNCTION randomizeTile
   * Randomizes a tile of given id (grass, water, mountain)
   * Some private functions that return random objects
   */

  function getRandomWaterTile() {
    return getRandomBetween(WATER_TILE_ID, 4625);
  }
  
  function getRandomMountainTile() {
    return getRandomBetween(STONE_TILE_ID, 4421);
  }
  
  function getRandomGrassTile() {
    return getRandomBetween(GRASS_TILE_ID, 4541);
  }

  switch(x) {
    case GRASS_TILE_ID:
      return getRandomGrassTile();
    case STONE_TILE_ID:
      return getRandomMountainTile();
    case WATER_TILE_ID:
      return getRandomWaterTile();
	default:
      return x;
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
      if(x !== MOUNTAIN_TILE_ID) {
        items = items.concat(border.getMountainWallOuter(neighbours).map(createOTBMItem));
      }

      // Mountain tile: border inside  
      if(x === MOUNTAIN_TILE_ID) {
        items = items.concat(border.getMountainWall(neighbours).map(createOTBMItem));
      }

      n = (simplex2freq(8, 3, coordinates.x, coordinates.y) + simplex2freq(16, 0.5, coordinates.x, coordinates.y) + simplex2freq(32, 0.5, coordinates.x, coordinates.y)) / 4;

      // Crappy noise map to put forests (FIXME)
      // Check if the tile is occupied
      if(!items.length && x === GRASS_TILE_ID) {
        if(n > 0) {
          items.push(createOTBMItem(randomTree()));
        }
      }

      // Add a random water plant
      if(!items.length && x === WATER_TILE_ID) {
        items.push(createOTBMItem(randomWaterPlant(neighbours)));
      }

      // Add a random water plant
      if(x === STONE_TILE_ID) {
        if(n > 0.25) {
          items.push(createOTBMItem(randomTileMoss()));
        }
        if(n > 0 && Math.random() < 0.5) {
          items.push(createOTBMItem(randomPebble()));
        }
      }

      // Border on top of mountain
      if(x === GRASS_TILE_ID || x === STONE_TILE_ID) {
        items = items.concat(border.getFloatingBorder(neighbours).map(createOTBMItem));
      }

      // Border grass & water interface
      if(x === GRASS_TILE_ID) {
        items = items.concat(border.getWaterBorder(neighbours).map(createOTBMItem));
      }

      // Border at foot of mountain
      if(x !== MOUNTAIN_TILE_ID) {
        items = items.concat(border.getMountainBorder(neighbours).map(createOTBMItem));
      }
 
      if(x === 0 && items.length === 0) {
        return;
      }

      // Randomize the tile
      x = randomizeTile(x);

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

  // Write the JSON using the OTBM2JSON lib
  otbm2json.write("map.otbm", json);

}
