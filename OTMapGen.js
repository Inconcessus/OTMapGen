const otbm2json = require("../OTBM2JSON/otbm2json");
const noise = require("./lib/noise").noise;
const border = require("./lib/border");

const __VERSION__ = "0.1.0";

// Configuration
const MAP = {
  "SEED": 1,
  "WIDTH": 512,
  "HEIGHT": 512
}

// Some global identifiers
const WATER_TILE_ID = 4615;
const GRASS_TILE_ID = 4526;
const STONE_TILE_ID = 4405;
const MOUNTAIN_TILE_ID = 919;

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



function randomTree() {

  /* FUNCTION randomTree
   * Returns a random shrub or tree
   */

  // Shrubs or trees
  if(Math.random() < 0.25) {
    return getRandomBetween(2700, 2708);
  } else {
    return getRandomBetween(2767, 2768);
  }

}


function generateMapLayers() {

  /* FUNCTION generateMapLayers
   * Generates temporary layer with noise seeded tiles
   * Layers are later converted to area tiles for OTBM2JSON
   */

  var id;

  // Seed the noise function
  noise.seed(MAP.SEED);

  // Create zero filled layers
  var layers = new Array();
  for(var i = 0; i < 8; i++) {
    layers.push(new Array(MAP.WIDTH * MAP.HEIGHT).fill(0));
  }

  // Loop over the requested map width and height
  for(var x = 0; x < MAP.WIDTH; x++) {

    for(var y = 0; y < MAP.HEIGHT; y++) {
  
      // Get the elevation
      var z = zNoiseFunction(x, y);
  
      // Anything below is the water level
      if(z < 0) {
        id = WATER_TILE_ID;
      } else if(z > 3) {
        id = STONE_TILE_ID;
      } else {
        id = GRASS_TILE_ID; 
      }
 
      // Keep within bounds
      if(z <= 0) z = 0;
      if(z > 7) z = 7;

      // Get the index of the x, y in a 1D array
      var index = getIndex(x, y);

      // Save the tile identifier
      layers[z][index] = id;

      // Fill lower floors with mountain  
      for(var k = z - 1; k >= 0; k--) {
        layers[k][index] = MOUNTAIN_TILE_ID;
      }
  
    }

  }

  return layers;

}

function getIndex(x, y) {

  /* FUNCTION getIndex
   * Converts x, y to layer index
   */

  return y + x * MAP.HEIGHT;

}

function getAdjacentTiles(layer, coordinates) {

  /* FUNCTION getAdjacentTiles
   * Returns adjacent tiles of another tile
   */

  function getTile(layer, x, y) {

    /* FUNCTION getTile
     * Returns tile at layer & coordinates
     */

    return layer[getIndex(x, y)];

  }

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

function zNoiseFunction(x, y) {

  /* FUNCTION zNoiseFunction
   * Returns noise as a function of x, y
   *
   * MODIFY THESE PARAMETERS TO CREATE DIFFERENT MAPS!
   * I DON'T KNOW ABOUT THE SENSITIVITY OF THESE PARAMETERS: JUST PLAY!
   * See this: https://www.redblobgames.com/maps/terrain-from-noise/
   */

  // Island parameters
  const a = 0.01;
  const b = 1.25;
  const c = 0.75;
  const e = 1.00;
  const f = 64.0;

  // Scaled coordinates between -0.5 and 0.5
  var nx = x / (MAP.WIDTH - 1) - 0.5;
  var ny = y / (MAP.HEIGHT - 1) - 0.5;

  // Manhattan distance
  var d = 2 * Math.max(Math.abs(nx), Math.abs(ny));

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
  noise = Math.round(f * (noise + a) * (1 - b * Math.pow(d, c))) - 1;

  return noise;

}

function getCoordinates(index) {

  /* FUNCTION getCoordinates
   * Returns coordinates for a given layer index
   */

  return {
    "y": index % MAP.HEIGHT,
    "x": Math.floor(index / MAP.HEIGHT)
  }

}

function randomizeTile(x) {

  /* FUNCTION randomizeTile
   * Randomizes a tile of given id (grass, water, mountain)
   * Some private functions that return random objects
   */

  function getRandomWaterTile() {
    return getRandomBetween(4608, 4625);
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
  f = f * MAP.WIDTH / 255;

  return weight * noise.simplex2(f * nx, f * ny);

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
  
      // The tile identifier is NULL: skip
      if(x === 0) {
        return;
      }

      // Transform layer index to x, y coordinates
      var coordinates = getCoordinates(i);  
  
      // Convert global x, y coordinates to tile area coordinates (0, 255, 510, 765)
      var areaX = 255 * Math.floor(coordinates.x / 255);
      var areaY = 255 * Math.floor(coordinates.y / 255);
  
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
      if(x === GRASS_TILE_ID || x === STONE_TILE_ID) {
        items = items.concat(border.getMountainWallOuter(neighbours).map(createOTBMItem));
      }

      // Mountain tile: border inside  
      if(x === MOUNTAIN_TILE_ID) {
        items = items.concat(border.getMountainWall(neighbours).map(createOTBMItem));
      }

      // Border at foot of mountain
      if(x === GRASS_TILE_ID || x === STONE_TILE_ID) {
        items = items.concat(border.getMountainBorder(neighbours).map(createOTBMItem));
      }
  
      // Border on top of mountain
      if(x === GRASS_TILE_ID || x === STONE_TILE_ID) {
        items = items.concat(border.getFloatingBorder(neighbours).map(createOTBMItem));
      }
  
      // Border grass & water interface
      if(x === GRASS_TILE_ID) {
        items = items.concat(border.getWaterBorder(neighbours).map(createOTBMItem));
      }
  
      // Crappy noise map to put forests (FIXME)
      if(x === GRASS_TILE_ID) {
        n = (simplex2freq(16, 0.5, coordinates.x, coordinates.y) + simplex2freq(32, 0.5, coordinates.x, coordinates.y) + simplex2freq(64, 1.0, coordinates.x, coordinates.y)) / 2.0;
        if(n > 0.15) {
          items.push(createOTBMItem(randomTree()));
        }
      }
 
      // Randomize the tile
      x = randomizeTile(x);

      // Add the tile to the tile area
      // Make sure to give coordinates in RELATIVE tile area coordinates
      tileAreas[areaIdentifier].tiles.push({
        "type": "OTBM_TILE",
        "x": coordinates.x % 255,
        "y": coordinates.y % 255,
        "tileid": x,
        "items": items
      });
  
    });
  
  });

  return tileAreas;

}

if(require.main === module) {

  // Read default OTMapGen header
  var json = require("./header");

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
