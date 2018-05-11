const WATER_TILE_ID = 4615;
const GRASS_TILE_ID = 4526;
const STONE_TILE_ID = 4405;
const MOUNTAIN_TILE_ID = 919;
const SAND_TILE_ID = 231;

function getMountainWallOuter(neighbours) {

  /* FUNCTION getMountainWallOuter
   * Returns appropriate outer mountain border
   * Use some random to appear natural
   */
  
  const MOUNTAIN_WALL_W = 4468;
  const MOUNTAIN_WALL_N = 4469;
  const MOUNTAIN_WALL_S = 4471;
  const MOUNTAIN_WALL_E = 4472;

  const MOUNTAIN_WALL_SE = 4470;
  const MOUNTAIN_WALL_NE = 4473;
  const MOUNTAIN_WALL_SW = 4474;
  const MOUNTAIN_WALL_NW = 4475;

  const MOUNTAIN_WALL_INNER_SE = 4476;
  const MOUNTAIN_WALL_INNER_NE = 4477;
  const MOUNTAIN_WALL_INNER_SW = 4478;
  const MOUNTAIN_WALL_INNER_NW = 4479;
  
  const MOUNTAIN_WALL_INNER_NW_SE = 4506;
  const MOUNTAIN_WALL_INNER_SW_E = 4489;
  const MOUNTAIN_WALL_INNER_W_SE = 4496;
  const MOUNTAIN_WALL_INNER_S_N = 4494;
  const MOUNTAIN_WALL_INNER_E_W = 4501;

  if(neighbours.N === MOUNTAIN_TILE_ID && neighbours.W === MOUNTAIN_TILE_ID && neighbours.SE === MOUNTAIN_TILE_ID) {
    return [MOUNTAIN_WALL_INNER_NW_SE];
  }

  if(neighbours.S === MOUNTAIN_TILE_ID && neighbours.W === MOUNTAIN_TILE_ID && neighbours.E === MOUNTAIN_TILE_ID) {
    return [MOUNTAIN_WALL_INNER_SW_E];
  }

  if(neighbours.W === MOUNTAIN_TILE_ID && neighbours.SE === MOUNTAIN_TILE_ID) {
    return [MOUNTAIN_WALL_INNER_W_SE];
  }

  if(neighbours.S === MOUNTAIN_TILE_ID && neighbours.W === MOUNTAIN_TILE_ID) {
    if(Math.random() < 0.5) {
      return [MOUNTAIN_WALL_INNER_NE];
    } else {
      return [MOUNTAIN_WALL_N];
    }
  }

  if(neighbours.N === MOUNTAIN_TILE_ID & neighbours.S === MOUNTAIN_TILE_ID) {
    return [MOUNTAIN_WALL_INNER_S_N];
  }

  if(neighbours.E === MOUNTAIN_TILE_ID & neighbours.W === MOUNTAIN_TILE_ID) {
    return [MOUNTAIN_WALL_INNER_E_W];
  }

  if(neighbours.E === MOUNTAIN_TILE_ID && neighbours.S === MOUNTAIN_TILE_ID) {
    return [MOUNTAIN_WALL_INNER_NW];
  }

  if(neighbours.E === MOUNTAIN_TILE_ID && neighbours.N === MOUNTAIN_TILE_ID) {
    if(Math.random() < 0.5) {
      return [MOUNTAIN_WALL_INNER_SW];
    } else {
      return [MOUNTAIN_WALL_W];
    }
  }

  if(neighbours.W === MOUNTAIN_TILE_ID && Math.random() < 0.5) {
    return [MOUNTAIN_WALL_E];
  }

  if(neighbours.N === MOUNTAIN_TILE_ID && Math.random() < 0.5) {
    return [MOUNTAIN_WALL_S];
  }

  if(neighbours.S === MOUNTAIN_TILE_ID) {
    return [MOUNTAIN_WALL_N];
  }

  if(neighbours.E === MOUNTAIN_TILE_ID) {
    return [MOUNTAIN_WALL_W];
  }

  if(neighbours.SE === MOUNTAIN_TILE_ID) { 
    return [MOUNTAIN_WALL_SE];
  }

  if(neighbours.SW === MOUNTAIN_TILE_ID) {
    if(Math.random() < 0.33) {
      return [MOUNTAIN_WALL_NE];
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

  var borders = new Array();

  if(neighbours.W === 0 && neighbours.N === 0) {
    borders.push(MOUNTAIN_BORDER_NW);
  }

  if(neighbours.W === 0 && neighbours.S === 0) {
    borders.push(MOUNTAIN_BORDER_SW);
  }

  if(neighbours.E === 0 && neighbours.S === 0 ) {
    borders.push(MOUNTAIN_BORDER_SE);
  }

  if(neighbours.E === 0 && neighbours.N === 0) {
    borders.push(MOUNTAIN_BORDER_NE);
  }

  if(neighbours.E === 0 && neighbours.S !== 0 && neighbours.N !== 0) {
    borders.push(MOUNTAIN_BORDER_EAST);
  }
  if(neighbours.N === 0 && neighbours.E !== 0 && neighbours.W !== 0) {
    borders.push(MOUNTAIN_BORDER_NORTH);
  }
  if(neighbours.S === 0 && neighbours.E !== 0 && neighbours.W !== 0) {
    borders.push(MOUNTAIN_BORDER_SOUTH);
  }
  if(neighbours.W === 0 && neighbours.S !== 0 && neighbours.N !== 0) {
    borders.push(MOUNTAIN_BORDER_WEST);
  }

  if(neighbours.NW === 0 && neighbours.N !== 0 && neighbours.W !== 0) {
    borders.push(MOUNTAIN_BORDER_INNER_NW);
  }

  if(neighbours.NE === 0 && neighbours.E !== 0 && neighbours.N !== 0) {
    borders.push(MOUNTAIN_BORDER_INNER_NE);
  }

  if(neighbours.SE === 0 && neighbours.E !== 0 && neighbours.S !== 0) {
    borders.push(MOUNTAIN_BORDER_INNER_SE);
  }

  if(neighbours.SW === 0 && neighbours.W !== 0 && neighbours.S !== 0) {
    borders.push(MOUNTAIN_BORDER_INNER_SW);
  }

  return borders;

}

function getSandBorder(neighbours) {

  const BORDER_N = 4760;
  const BORDER_E = 4761;
  const BORDER_S = 4762;
  const BORDER_W = 4763;

  const BORDER_INNER_NW = 4764;
  const BORDER_INNER_NE = 4765;
  const BORDER_INNER_SW = 4766;
  const BORDER_INNER_SE = 4767;

  const BORDER_NW = 4768;
  const BORDER_NE = 4769;
  const BORDER_SW = 4770;
  const BORDER_SE = 4771;

  var borders = new Array();

  if(neighbours.N === SAND_TILE_ID && neighbours.E === SAND_TILE_ID) {
    borders.push(BORDER_NE);
  }
  if(neighbours.E === SAND_TILE_ID && neighbours.S === SAND_TILE_ID) {
    borders.push(BORDER_SE);
  }
  if(neighbours.S === SAND_TILE_ID && neighbours.W === SAND_TILE_ID) {
    borders.push(BORDER_SW);
  }
  if(neighbours.W === SAND_TILE_ID && neighbours.N === SAND_TILE_ID) {
    borders.push(BORDER_NW);
  }

  if(neighbours.W === SAND_TILE_ID && neighbours.S !== SAND_TILE_ID && neighbours.N !== SAND_TILE_ID) {
    borders.push(BORDER_W);
  }
  if(neighbours.N === SAND_TILE_ID && neighbours.W !== SAND_TILE_ID && neighbours.E !== SAND_TILE_ID) {
    borders.push(BORDER_N);
  }
  if(neighbours.S === SAND_TILE_ID && neighbours.W !== SAND_TILE_ID && neighbours.E !== SAND_TILE_ID) {
    borders.push(BORDER_S);
  }
  if(neighbours.E === SAND_TILE_ID && neighbours.S !== SAND_TILE_ID && neighbours.N !== SAND_TILE_ID) {
    borders.push(BORDER_E);
  }

  if(neighbours.NE === SAND_TILE_ID && neighbours.N !== SAND_TILE_ID && neighbours.E !== SAND_TILE_ID) {
    borders.push(BORDER_INNER_NE);
  }
  if(neighbours.SE === SAND_TILE_ID && neighbours.S !== SAND_TILE_ID && neighbours.E !== SAND_TILE_ID) {
    borders.push(BORDER_INNER_SE);
  }
  if(neighbours.SW === SAND_TILE_ID && neighbours.S !== SAND_TILE_ID && neighbours.W !== SAND_TILE_ID) {
    borders.push(BORDER_INNER_SW);
  }
  if(neighbours.NW === SAND_TILE_ID && neighbours.N !== SAND_TILE_ID && neighbours.W !== SAND_TILE_ID) {
    borders.push(BORDER_INNER_NW);
  }

  return borders;

}

function getWaterBorderSand(neighbours) {

  const BORDER_N = 4632;
  const BORDER_W = 4633;
  const BORDER_S = 4634;
  const BORDER_E = 4635;
  const BORDER_INNER_SW = 4641;
  const BORDER_INNER_SE = 4640;
  const BORDER_INNER_NE = 4642;
  const BORDER_INNER_NW = 4643;
  const BORDER_NW = 4639;
  const BORDER_NE = 4638;
  const BORDER_SE = 4636;
  const BORDER_SW = 4637;

  if(neighbours.S === WATER_TILE_ID && neighbours.NW === WATER_TILE_ID) {
    return [BORDER_SW];
  }
  if(neighbours.N === WATER_TILE_ID && neighbours.SE === WATER_TILE_ID) {
    return [BORDER_NE];
  }
  if(neighbours.W === WATER_TILE_ID && neighbours.NE === WATER_TILE_ID) {
    return [BORDER_NW];
  }
  if(neighbours.E === WATER_TILE_ID && neighbours.SW === WATER_TILE_ID) {
    return [BORDER_SE];
  }

  if(neighbours.N === WATER_TILE_ID && neighbours.E === WATER_TILE_ID) {
    return [BORDER_NE];
  }
  if(neighbours.E === WATER_TILE_ID && neighbours.S === WATER_TILE_ID) {
    return [BORDER_SE];
  }
  if(neighbours.S === WATER_TILE_ID && neighbours.W === WATER_TILE_ID) {
    return [BORDER_SW];
  }
  if(neighbours.W === WATER_TILE_ID && neighbours.N === WATER_TILE_ID) {
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

  const BORDER_EARTHSAND_N = 4656;
  const BORDER_EARTHSAND_S = 4657;
  const BORDER_EARTHSAND_W = 4658;
  const BORDER_EARTHSAND_E = 4659;
  const BORDER_SANDEARTH_N = 4660;
  const BORDER_SANDEARTH_S = 4661;
  const BORDER_SANDEARTH_W = 4662;
  const BORDER_SANDEARTH_E = 4663;

  // Edge cases
  if(neighbours.S === WATER_TILE_ID && neighbours.NW === WATER_TILE_ID) {
    return [BORDER_SW];
  }
  if(neighbours.N === WATER_TILE_ID && neighbours.SE === WATER_TILE_ID) {
    return [BORDER_NE];
  }
  if(neighbours.W === WATER_TILE_ID && neighbours.NE === WATER_TILE_ID) {
    return [BORDER_NW];
  }
  if(neighbours.E === WATER_TILE_ID && neighbours.SW === WATER_TILE_ID) {
    return [BORDER_SE];
  }

  if(neighbours.N === WATER_TILE_ID && neighbours.E === WATER_TILE_ID) {
    return [BORDER_NE];
  }
  if(neighbours.E === WATER_TILE_ID && neighbours.S === WATER_TILE_ID) {
    return [BORDER_SE];
  }
  if(neighbours.S === WATER_TILE_ID && neighbours.W === WATER_TILE_ID) {
    return [BORDER_SW];
  }
  if(neighbours.W === WATER_TILE_ID && neighbours.N === WATER_TILE_ID) {
    return [BORDER_NW];
  }

  if(neighbours.W === WATER_TILE_ID) {
    if(neighbours.N === SAND_TILE_ID) {
      return [BORDER_SANDEARTH_W];
    } else if(neighbours.S === SAND_TILE_ID) {
      return [BORDER_EARTHSAND_W];
    } else {
      return [BORDER_W];
    }
  }
  if(neighbours.N === WATER_TILE_ID) {
    if(neighbours.E === SAND_TILE_ID) {
      return [BORDER_EARTHSAND_N];
    } else if(neighbours.W === SAND_TILE_ID) {
      return [BORDER_SANDEARTH_N];
    } else {
      return [BORDER_N];
    }
  }
  if(neighbours.S === WATER_TILE_ID) {
    if(neighbours.E === SAND_TILE_ID) {
      return [BORDER_EARTHSAND_S];
    } else if(neighbours.W === SAND_TILE_ID) {
      return [BORDER_SANDEARTH_S];
    } else {
      return [BORDER_S];
    }
  }
  if(neighbours.E === WATER_TILE_ID) {
    if(neighbours.N === SAND_TILE_ID) {
      return [BORDER_SANDEARTH_E];
    } else if(neighbours.S === SAND_TILE_ID) {
      return [BORDER_EARTHSAND_E];
    } else {
      return [BORDER_E];
    }
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

  if(neighbours.SW === MOUNTAIN_TILE_ID) {
    return [MOUNTAIN_BORDER_SW];
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
module.exports.getMountainWall = getMountainWall;
module.exports.getWaterBorderSand = getWaterBorderSand;
module.exports.getSandBorder = getSandBorder;