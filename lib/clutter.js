const WATER_TILE_ID = 4615;
const GRASS_TILE_ID = 4526;
const STONE_TILE_ID = 4405;
const MOUNTAIN_TILE_ID = 919;
const SAND_TILE_ID = 231;

function getRandomBetween(min, max) {

  /* FUNCTION getRandomBetween
   * Returns an integer between min, max (inclusive)
   */

  return Math.floor(Math.random() * (max - min + 1) ) + min;

}

function randomShell() {

  /* FUNCTION randomShell
   * Returns a random shell
   */

  const SHELL = 5679;
  const SPIRAL_SHELL = 5680;
  const SOME_SHELLS = 5681;
  const PIECE_OF_SHELL = 5682;
  const TORTOISE_EGGS = 5677;

  var weights = [
    {"id": SHELL, "weight": 0.3},
    {"id": SPIRAL_SHELL, "weight": 0.30},
    {"id": PIECE_OF_SHELL, "weight": 0.30},
    {"id": SOME_SHELLS, "weight": 0.075},
    {"id": TORTOISE_EGGS, "weight": 0.025}
  ];

  return getWeightedRandom(weights);

}

function randomPebble() {

  /* FUNCTION randomPebble
   * Returns a random pebble
   */

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

function randomWaterPlant(nNeighbours) {

  /* FUNCTION randomWaterPlant
   * Returns a random water plant
   */

  const SWAMP_PLANT_START = 2771;
  const SWAMP_PLANT_END = 2780;
  const WATER_LILY_START = 2755;
  const WATER_LILY_END = 2758;

  // "Swamp" plants
  if(nNeighbours > 2 && Math.random() < 0.2) {
    return [getRandomBetween(SWAMP_PLANT_START, SWAMP_PLANT_END)];
  }

  // Water lillies
  if(nNeighbours > 1 && Math.random() < 0.1) {
    return [getRandomBetween(WATER_LILY_START, WATER_LILY_END)];
  }

  return new Array();

}

function randomTileMoss() {

  /* FUNCTION randomTileMoss
   * Returns a random moss tile for stone tiles
   */

  const MOSS_TILE_START = 4580;
  const MOSS_TILE_END = 4594;

  return getRandomBetween(MOSS_TILE_START, MOSS_TILE_END);

}


function randomCactus() {

  /* FUNCTION randomWaterPlant
   * Returns a random cactus
   */

  const CACTUS_START = 2728;
  const CACTUS_END = 2736;

  return getRandomBetween(CACTUS_START, CACTUS_END);

}

function randomPalmTree(neighbours) {

  /* FUNCTION randomWaterPlant
   * Returns a random water plant
   */

  const PALM_TREE = 2725;
  const COCONUT_PALM_TREE = 2726;

  if(Math.random() < 0.1) {
    return [getRandomBetween(2725, 2726)];
  }

  return new Array();

}


function randomFlower2() {

  /* FUNCTION countNeighbours
   * Return a random flower with different flower
   */

  return getRandomBetween(4152, 4158);

}

function getWeightedRandom(weights) {

  /* FUNCTION getWeightedRandom
   * Return a random element based on a weight
   */

  // Draw a random sample
  var value = Math.random();
  var sum = 0;

  for(var i = 0; i < weights.length; i++) {
    sum += weights[i].weight;
    if(value < sum) {
      return weights[i].id;
    }
  }

}

function randomFlower() {

  /* FUNCTION randomFlower
   * Return a random flower with different weights
   */

  const MOON_FLOWERS = 2740;
  const MOON_FLOWER = 2741;
  const WHITE_FLOWER = 2742;
  const HEAVEN_BLOSSOM = 2743;

  var weights = [
    {"id": MOON_FLOWER, "weight": 0.5},
    {"id": MOON_FLOWERS, "weight": 0.20},
    {"id": WHITE_FLOWER, "weight": 0.20},
    {"id": HEAVEN_BLOSSOM, "weight": 0.10}
  ];

  return getWeightedRandom(weights);

}

function randomizeTile(x) {

  /* FUNCTION randomizeTile
   * Randomizes a tile of given id (grass, water, mountain)
   * Some private functions that return random objects
   */

  function getRandomWaterTile() {
    return getRandomBetween(WATER_TILE_ID, 4619);
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

module.exports.randomShell = randomShell;
module.exports.randomPalmTree = randomPalmTree;
module.exports.randomCactus = randomCactus;
module.exports.randomTree = randomTree;
module.exports.randomWaterPlant = randomWaterPlant;
module.exports.randomTileMoss = randomTileMoss;
module.exports.randomPebble = randomPebble;
module.exports.randomizeTile = randomizeTile;