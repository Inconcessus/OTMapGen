const WATER_TILE_ID = 4615;
const GRASS_TILE_ID = 4526;
const STONE_TILE_ID = 4405;
const MOUNTAIN_TILE_ID = 919;

function getMountainWallOuter(neighbours) {

  /* FUNCTION getMountainWallOuter
   * Returns appropriate outer mountain border
   * Use some random to appear natural
   */

  if(neighbours.S === MOUNTAIN_TILE_ID && neighbours.W === MOUNTAIN_TILE_ID) {
    if(Math.random() < 0.5) {
      return [4477];
    } else {
      return [4469];
    }
  }

  if(neighbours.E === MOUNTAIN_TILE_ID && neighbours.S === MOUNTAIN_TILE_ID) {
    return [4479];
  }

  if(neighbours.E === MOUNTAIN_TILE_ID && neighbours.N === MOUNTAIN_TILE_ID) {
    if(Math.random() < 0.5) {
      return [4478];
    }
  }

  if(neighbours.W === MOUNTAIN_TILE_ID && Math.random() < 0.5) {
    return [4472];
  }

  if(neighbours.N === MOUNTAIN_TILE_ID && Math.random() < 0.5) {
    return [4471];
  }

  if(neighbours.S === MOUNTAIN_TILE_ID) {
    return [4469];
  }

  if(neighbours.E === MOUNTAIN_TILE_ID) {
    return [4468];
  }

  if(neighbours.SE === MOUNTAIN_TILE_ID) {
    return [4470];
  }

  if(neighbours.SW === MOUNTAIN_TILE_ID) {
    if(Math.random() < 0.33) {
      return [4473];
    }
  }

  return new Array();

}

function getFloatingBorder(neighbours) {

  /* FUNCTION getFloatingBorder
   * Returns floater border above mountains
   */

  const MOUNTAIN_BORDER_NORTH = 891;
  const MOUNTAIN_BORDER_EAST = 892;
  const MOUNTAIN_BORDER_SOUTH = 893;
  const MOUNTAIN_BORDER_WEST = 894;

  const MOUNTAIN_BORDER_NW = 899;
  const MOUNTAIN_BORDER_NE = 900;
  const MOUNTAIN_BORDER_SE = 901;
  const MOUNTAIN_BORDER_SW = 902;

  const MOUNTAIN_BORDER_INNER_NW = 895;
  const MOUNTAIN_BORDER_INNER_NE = 896;
  const MOUNTAIN_BORDER_INNER_SE = 897;
  const MOUNTAIN_BORDER_INNER_SW = 898;

  if(neighbours.W === 0 && neighbours.N === 0) {
    return [MOUNTAIN_BORDER_NW];
  }

  if(neighbours.W === 0 && neighbours.S === 0) {
    return [MOUNTAIN_BORDER_SW];
  }

  if(neighbours.E === 0 && neighbours.S === 0 ) {
    return [MOUNTAIN_BORDER_SE];
  }

  if(neighbours.E === 0 && neighbours.N === 0) {
    return [MOUNTAIN_BORDER_NE];
  }

  if(neighbours.E === 0) {
    return [MOUNTAIN_BORDER_EAST];
  }
  if(neighbours.N === 0) {
    return [MOUNTAIN_BORDER_NORTH];
  }
  if(neighbours.S === 0) {
    return [MOUNTAIN_BORDER_SOUTH];
  }
  if(neighbours.W === 0) {
    return [MOUNTAIN_BORDER_WEST];
  }

  if(neighbours.NW === 0) {
    return [MOUNTAIN_BORDER_INNER_NW];
  }
  if(neighbours.NE === 0) {
    return [MOUNTAIN_BORDER_INNER_NE];
  }
  if(neighbours.SE === 0) {
    return [MOUNTAIN_BORDER_INNER_SE];
  }
  if(neighbours.SW === 0) {
    return [MOUNTAIN_BORDER_INNER_SW];
  }

  return new Array();

}

function getWaterBorder(neighbours) {

  /* FUNCTION getWaterBorder
   * Returns appropriate water on grass border
   */

  const BORDER_N = 4644;
  const BORDER_E = 4645;
  const BORDER_S = 4646;
  const BORDER_W = 4647;
  const BORDER_NW = 4648;
  const BORDER_NE = 4649;
  const BORDER_SW = 4650;
  const BORDER_SE = 4651;
  const BORDER_INNER_NW = 4652;
  const BORDER_INNER_NE = 4653;
  const BORDER_INNER_SW = 4654;
  const BORDER_INNER_SE = 4655;

  if(neighbours.N === WATER_TILE_ID && neighbours.NE === WATER_TILE_ID && neighbours.E === WATER_TILE_ID) {
    return [BORDER_NE];
  }
  if(neighbours.E === WATER_TILE_ID && neighbours.SE === WATER_TILE_ID && neighbours.S === WATER_TILE_ID) {
    return [BORDER_SE];
  }
  if(neighbours.S === WATER_TILE_ID && neighbours.SW === WATER_TILE_ID && neighbours.W === WATER_TILE_ID) {
    return [BORDER_SW];
  }
  if(neighbours.W === WATER_TILE_ID && neighbours.NW === WATER_TILE_ID && neighbours.N === WATER_TILE_ID) {
    return [BORDER_NW];
  }

  if(neighbours.W === WATER_TILE_ID) {
    return [BORDER_W];
  }
  if(neighbours.N === WATER_TILE_ID) {
    return [BORDER_N];
  }
  if(neighbours.S === WATER_TILE_ID) {
    return [BORDER_S];
  }
  if(neighbours.E === WATER_TILE_ID) {
    return [BORDER_E];
  }

  if(neighbours.NE === WATER_TILE_ID) {
    return [BORDER_INNER_NE];
  }
  if(neighbours.SE === WATER_TILE_ID) {
    return [BORDER_INNER_SE];
  }
  if(neighbours.SW === WATER_TILE_ID) {
    return [BORDER_INNER_SW];
  }
  if(neighbours.NW === WATER_TILE_ID) {
    return [BORDER_INNER_NW];
  }

  return new Array();

}

function getMountainBorder(neighbours) {

  /* FUNCTION getMountainBorder
   * Returns appropriate border at mountain foot
   */

  const MOUNTAIN_BORDER_NORTH = 4456;
  const MOUNTAIN_BORDER_EAST  = 4457;
  const MOUNTAIN_BORDER_SOUTH  = 4458;
  const MOUNTAIN_BORDER_WEST  = 4459;
  const MOUNTAIN_BORDER_NW = 4460;
  const MOUNTAIN_BORDER_NE = 4461;
  const MOUNTAIN_BORDER_SE = 4462;
  const MOUNTAIN_BORDER_SW = 4463;
  const MOUNTAIN_BORDER_INNER_NW = 4464;
  const MOUNTAIN_BORDER_INNER_NE = 4465;
  const MOUNTAIN_BORDER_INNER_SE = 4466;
  const MOUNTAIN_BORDER_INNER_SW = 4467;

  if(neighbours.W === MOUNTAIN_TILE_ID && neighbours.N === MOUNTAIN_TILE_ID) {
    return [MOUNTAIN_BORDER_INNER_NW];
  }

  if(neighbours.N === MOUNTAIN_TILE_ID && neighbours.E === MOUNTAIN_TILE_ID) {
    return [MOUNTAIN_BORDER_INNER_NE];
  }

  if(neighbours.N === MOUNTAIN_TILE_ID) {
    return [MOUNTAIN_BORDER_NORTH];
  }

  if(neighbours.W === MOUNTAIN_TILE_ID) {
    return [MOUNTAIN_BORDER_WEST];
  }

  if(neighbours.NE === MOUNTAIN_TILE_ID) {
    return [MOUNTAIN_BORDER_NE];
  }

  if(neighbours.NW === MOUNTAIN_TILE_ID) {
    return [MOUNTAIN_BORDER_NW];
  }

  return new Array();

}

function getMountainWall(neighbours) {

  /* FUNCTION getMountainWall
   * Returns appropriate outer mountain wall
   */

  const MOUNTAIN_WALL_Y = 873;
  const MOUNTAIN_WALL_X = 874;
  const MOUNTAIN_WALL_XY = 877;

  if(neighbours.E !== MOUNTAIN_TILE_ID && neighbours.S !== MOUNTAIN_TILE_ID) {
    return [MOUNTAIN_WALL_XY];
  }

  if(neighbours.E !== MOUNTAIN_TILE_ID) {
    return [MOUNTAIN_WALL_Y];
  }

  if(neighbours.S !== MOUNTAIN_TILE_ID) {
    return [MOUNTAIN_WALL_X];
  }

  return new Array();

}

module.exports.getMountainWallOuter = getMountainWallOuter;
module.exports.getFloatingBorder = getFloatingBorder;
module.exports.getWaterBorder = getWaterBorder;
module.exports.getMountainBorder = getMountainBorder;
module.exports.getMountainBorder = getMountainBorder;
module.exports.getMountainWall = getMountainWall;