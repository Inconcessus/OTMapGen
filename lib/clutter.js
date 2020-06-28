const ITEMS = require("../json/items")

function getRandomBetween(min, max) {
  /* FUNCTION getRandomBetween
   * Returns an integer between min, max (inclusive)
   */

  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomSandstone() {
  /* FUNCTION randomSandstone
   * Returns a random sandstone
   */

  return getRandomBetween(ITEMS.SAND_STONE_START, ITEMS.SAND_STONE_END)
}

function randomShell() {
  /* FUNCTION randomShell
   * Returns a random shell
   */

  var weights = [
    { id: ITEMS.SHELL, weight: 0.3 },
    { id: ITEMS.SPIRAL_SHELL, weight: 0.3 },
    { id: ITEMS.PIECE_OF_SHELL, weight: 0.3 },
    { id: ITEMS.SOME_SHELLS, weight: 0.075 },
    { id: ITEMS.TORTOISE_EGGS, weight: 0.025 },
  ]

  return getWeightedRandom(weights)
}

function randomPebble() {
  /* FUNCTION randomPebble
   * Returns a random pebble
   */

  var value = Math.random()

  switch (true) {
    case value < 0.05:
      return getRandomBetween(3648, 3652)
    case value < 0.25:
      return getRandomBetween(3611, 3614)
    default:
      return getRandomBetween(3653, 3656)
  }
}

function randomTree() {
  /* FUNCTION randomTree
   * Returns a random shrub or tree
   */

  var value = Math.random()

  // Shrubs or trees
  switch (true) {
    case value < 0.1:
      return getRandomBetween(2700, 2708)
    case value < 0.3:
      return getRandomBetween(2767, 2768)
    case value < 0.95:
      return getRandomBetween(6216, 6219)
    case value < 0.96:
      return ITEMS.BLUEBERRY_BUSH
    default:
      if (Math.random() < 0.5) {
        return randomFlower()
      } else {
        return randomFlower2()
      }
  }
}

function randomWaterPlant(nNeighbours) {
  /* FUNCTION randomWaterPlant
   * Returns a random water plant
   */

  // "Swamp" plants
  if (nNeighbours > 2 && Math.random() < 0.2) {
    return getRandomBetween(ITEMS.SWAMP_PLANT_START, ITEMS.SWAMP_PLANT_END)
  }

  // Water lillies
  if (nNeighbours > 1 && Math.random() < 0.1) {
    return getRandomBetween(ITEMS.WATER_LILY_START, ITEMS.WATER_LILY_END)
  }

  return new Array()
}

function randomSandstoneMossy() {
  /* FUNCTION randomSandstoneMossy
   * Returns a random moss tile for stone tiles
   */

  return getRandomBetween(
    ITEMS.SMALL_MOSSY_STONE_START,
    ITEMS.SMALL_MOSSY_STONE_END
  )
}

function randomTileMoss() {
  /* FUNCTION randomTileMoss
   * Returns a random moss tile for stone tiles
   */

  return getRandomBetween(ITEMS.MOSS_TILE_START, ITEMS.MOSS_TILE_END)
}

function randomIces() {
  return getRandomBetween(ITEMS.ICE_DETAIL_START, ITEMS.ICE_DETAIL_END)
}

function randomSnows() {
  return getRandomBetween(ITEMS.SNOW_DETAIL_START, ITEMS.SNOW_DETAIL_END)
}

function randomCactus() {
  /* FUNCTION randomWaterPlant
   * Returns a random cactus
   */

  return getRandomBetween(ITEMS.CACTUS_START, ITEMS.CACTUS_END)
}

function randomPalmTree(neighbours) {
  /* FUNCTION randomWaterPlant
   * Returns a random water plant
   */

  if (Math.random() < 0.1) {
    return getRandomBetween(ITEMS.PALM_TREE, ITEMS.COCONUT_PALM_TREE)
  }

  return null
}

function randomFlower2() {
  /* FUNCTION countNeighbours
   * Return a random flower with different flower
   */

  return getRandomBetween(4152, 4158)
}

function getWeightedRandom(weights) {
  /* FUNCTION getWeightedRandom
   * Return a random element based on a weight
   */

  // Draw a random sample
  var value = Math.random()
  var sum = 0

  for (var i = 0; i < weights.length; i++) {
    sum += weights[i].weight
    if (value < sum) {
      return weights[i].id
    }
  }
}

function randomFlower() {
  /* FUNCTION randomFlower
   * Return a random flower with different weights
   */

  var weights = [
    { id: ITEMS.MOON_FLOWER, weight: 0.5 },
    { id: ITEMS.MOON_FLOWERS, weight: 0.2 },
    { id: ITEMS.WHITE_FLOWER, weight: 0.2 },
    { id: ITEMS.HEAVEN_BLOSSOM, weight: 0.1 },
  ]

  return getWeightedRandom(weights)
}

function randomizeTile(x) {
  /* FUNCTION randomizeTile
   * Randomizes a tile of given id (grass, water, mountain)
   * Some private functions that return random objects
   */

  function getRandomWaterTile() {
    return getRandomBetween(ITEMS.WATER_TILE_ID, ITEMS.WATER_TILE_END)
  }

  function getRandomMountainTile() {
    return getRandomBetween(ITEMS.STONE_TILE_ID, ITEMS.STONE_TILE_END)
  }

  function getRandomGrassTile() {
    return getRandomBetween(ITEMS.GRASS_TILE_ID, ITEMS.GRASS_TILE_END)
  }

  function getRandomGravel() {
    return getRandomBetween(ITEMS.GRAVEL_TILE_ID, ITEMS.GRAVEL_TILE_END)
  }

  switch (x) {
    case ITEMS.GRASS_TILE_ID:
      return getRandomGrassTile()
    case ITEMS.STONE_TILE_ID:
      return getRandomMountainTile()
    case ITEMS.WATER_TILE_ID:
      return getRandomWaterTile()
    case ITEMS.GRAVEL_TILE_ID:
      return getRandomGravel()

    case ITEMS.ICE_TILE_ID:
      return getRandomBetween(ITEMS.ICE_TILE_ID, ITEMS.ICE_TILE_END)
    default:
      return x
  }
}

module.exports.randomShell = randomShell
module.exports.randomPalmTree = randomPalmTree
module.exports.randomCactus = randomCactus
module.exports.randomTree = randomTree
module.exports.randomWaterPlant = randomWaterPlant
module.exports.randomTileMoss = randomTileMoss
module.exports.randomPebble = randomPebble
module.exports.randomizeTile = randomizeTile
module.exports.randomSandstone = randomSandstone
module.exports.randomSandstoneMossy = randomSandstoneMossy
module.exports.randomIces = randomIces
module.exports.randomSnows = randomSnows
