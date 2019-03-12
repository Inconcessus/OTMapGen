const ITEMS = require("../json/items");

function getMountainWallOuter(neighbours) {

  /* FUNCTION getMountainWallOuter
   * Returns appropriate outer mountain border
   * Use some random to appear natural
   */
  

  if(neighbours.N === ITEMS.MOUNTAIN_TILE_ID && neighbours.W === ITEMS.MOUNTAIN_TILE_ID && neighbours.SE === ITEMS.MOUNTAIN_TILE_ID) {
    return ITEMS.MOUNTAIN_WALL_INNER_NW_SE;
  }

  if(neighbours.S === ITEMS.MOUNTAIN_TILE_ID && neighbours.W === ITEMS.MOUNTAIN_TILE_ID && neighbours.E === ITEMS.MOUNTAIN_TILE_ID) {
    return ITEMS.MOUNTAIN_WALL_INNER_SW_E;
  }

  if(neighbours.W === ITEMS.MOUNTAIN_TILE_ID && neighbours.SE === ITEMS.MOUNTAIN_TILE_ID) {
    return ITEMS.MOUNTAIN_WALL_INNER_W_SE;
  }

  if(neighbours.S === ITEMS.MOUNTAIN_TILE_ID && neighbours.W === ITEMS.MOUNTAIN_TILE_ID) {
    if(Math.random() < 0.5) {
      return ITEMS.MOUNTAIN_WALL_INNER_NE;
    } else {
      return ITEMS.MOUNTAIN_WALL_N;
    }
  }

  if(neighbours.N === ITEMS.MOUNTAIN_TILE_ID & neighbours.S === ITEMS.MOUNTAIN_TILE_ID) {
    return ITEMS.MOUNTAIN_WALL_INNER_S_N;
  }

  if(neighbours.E === ITEMS.MOUNTAIN_TILE_ID & neighbours.W === ITEMS.MOUNTAIN_TILE_ID) {
    return ITEMS.MOUNTAIN_WALL_INNER_E_W;
  }

  if(neighbours.E === ITEMS.MOUNTAIN_TILE_ID && neighbours.S === ITEMS.MOUNTAIN_TILE_ID) {
    return ITEMS.MOUNTAIN_WALL_INNER_NW;
  }

  if(neighbours.E === ITEMS.MOUNTAIN_TILE_ID && neighbours.N === ITEMS.MOUNTAIN_TILE_ID) {
    if(Math.random() < 0.5) {
      return ITEMS.MOUNTAIN_WALL_INNER_SW;
    } else {
      return ITEMS.MOUNTAIN_WALL_W;
    }
  }

  if(neighbours.W === ITEMS.MOUNTAIN_TILE_ID && Math.random() < 0.5) {
    return ITEMS.MOUNTAIN_WALL_E;
  }

  if(neighbours.N === ITEMS.MOUNTAIN_TILE_ID && Math.random() < 0.5) {
    return ITEMS.MOUNTAIN_WALL_S;
  }

  if(neighbours.S === ITEMS.MOUNTAIN_TILE_ID) {
    return ITEMS.MOUNTAIN_WALL_N;
  }

  if(neighbours.E === ITEMS.MOUNTAIN_TILE_ID) {
    return ITEMS.MOUNTAIN_WALL_W;
  }

  if(neighbours.SE === ITEMS.MOUNTAIN_TILE_ID) { 
    return ITEMS.MOUNTAIN_WALL_SE;
  }

  if(neighbours.SW === ITEMS.MOUNTAIN_TILE_ID && neighbours.W !== ITEMS.MOUNTAIN_TILE_ID && neighbours.S !== ITEMS.MOUNTAIN_TILE_ID) {
    if(Math.random() < 0.33) {
      return ITEMS.MOUNTAIN_WALL_NE;
    }
  }

  return null;

}

function getFloatingBorder(neighbours) {

  /* FUNCTION getFloatingBorder
   * Returns floater border above mountains
   */

  var borders = new Array();

  if(neighbours.W === 0 && neighbours.N === 0) {
    borders.push(ITEMS.MOUNTAIN_BORDER_NW);
  }

  if(neighbours.W === 0 && neighbours.S === 0) {
    borders.push(ITEMS.MOUNTAIN_BORDER_SW);
  }

  if(neighbours.E === 0 && neighbours.S === 0 ) {
    borders.push(ITEMS.MOUNTAIN_BORDER_SE);
  }

  if(neighbours.E === 0 && neighbours.N === 0) {
    borders.push(ITEMS.MOUNTAIN_BORDER_NE);
  }

  if(neighbours.E === 0 && neighbours.S !== 0 && neighbours.N !== 0) {
    borders.push(ITEMS.MOUNTAIN_BORDER_EAST);
  }
  if(neighbours.N === 0 && neighbours.E !== 0 && neighbours.W !== 0) {
    borders.push(ITEMS.MOUNTAIN_BORDER_NORTH);
  }
  if(neighbours.S === 0 && neighbours.E !== 0 && neighbours.W !== 0) {
    borders.push(ITEMS.MOUNTAIN_BORDER_SOUTH);
  }
  if(neighbours.W === 0 && neighbours.S !== 0 && neighbours.N !== 0) {
    borders.push(ITEMS.MOUNTAIN_BORDER_WEST);
  }

  if(neighbours.NW === 0 && neighbours.N !== 0 && neighbours.W !== 0) {
    borders.push(ITEMS.MOUNTAIN_BORDER_INNER_NW);
  }
  if(neighbours.NE === 0 && neighbours.E !== 0 && neighbours.N !== 0) {
    borders.push(ITEMS.MOUNTAIN_BORDER_INNER_NE);
  }
  if(neighbours.SE === 0 && neighbours.E !== 0 && neighbours.S !== 0) {
    borders.push(ITEMS.MOUNTAIN_BORDER_INNER_SE);
  }
  if(neighbours.SW === 0 && neighbours.W !== 0 && neighbours.S !== 0) {
    borders.push(ITEMS.MOUNTAIN_BORDER_INNER_SW);
  }

  return borders.length ? borders : null;

}

function getSandBorder(neighbours) {

  var borders = new Array();

  if(neighbours.N === ITEMS.SAND_TILE_ID && neighbours.E === ITEMS.SAND_TILE_ID) {
    borders.push(ITEMS.SAND_BORDER_NE);
  }
  if(neighbours.E === ITEMS.SAND_TILE_ID && neighbours.S === ITEMS.SAND_TILE_ID) {
    borders.push(ITEMS.SAND_BORDER_SE);
  }
  if(neighbours.S === ITEMS.SAND_TILE_ID && neighbours.W === ITEMS.SAND_TILE_ID) {
    borders.push(ITEMS.SAND_BORDER_SW);
  }
  if(neighbours.W === ITEMS.SAND_TILE_ID && neighbours.N === ITEMS.SAND_TILE_ID) {
    borders.push(ITEMS.SAND_BORDER_NW);
  }

  if(neighbours.W === ITEMS.SAND_TILE_ID && neighbours.S !== ITEMS.SAND_TILE_ID && neighbours.N !== ITEMS.SAND_TILE_ID) {
    borders.push(ITEMS.SAND_BORDER_W);
  }
  if(neighbours.N === ITEMS.SAND_TILE_ID && neighbours.W !== ITEMS.SAND_TILE_ID && neighbours.E !== ITEMS.SAND_TILE_ID) {
    borders.push(ITEMS.SAND_BORDER_N);
  }
  if(neighbours.S === ITEMS.SAND_TILE_ID && neighbours.W !== ITEMS.SAND_TILE_ID && neighbours.E !== ITEMS.SAND_TILE_ID) {
    borders.push(ITEMS.SAND_BORDER_S);
  }
  if(neighbours.E === ITEMS.SAND_TILE_ID && neighbours.S !== ITEMS.SAND_TILE_ID && neighbours.N !== ITEMS.SAND_TILE_ID) {
    borders.push(ITEMS.SAND_BORDER_E);
  }

  if(neighbours.NE === ITEMS.SAND_TILE_ID && neighbours.N !== ITEMS.SAND_TILE_ID && neighbours.E !== ITEMS.SAND_TILE_ID) {
    borders.push(ITEMS.SAND_BORDER_INNER_NE);
  }
  if(neighbours.SE === ITEMS.SAND_TILE_ID && neighbours.S !== ITEMS.SAND_TILE_ID && neighbours.E !== ITEMS.SAND_TILE_ID) {
    borders.push(ITEMS.SAND_BORDER_INNER_SE);
  }
  if(neighbours.SW === ITEMS.SAND_TILE_ID && neighbours.S !== ITEMS.SAND_TILE_ID && neighbours.W !== ITEMS.SAND_TILE_ID) {
    borders.push(ITEMS.SAND_BORDER_INNER_SW);
  }
  if(neighbours.NW === ITEMS.SAND_TILE_ID && neighbours.N !== ITEMS.SAND_TILE_ID && neighbours.W !== ITEMS.SAND_TILE_ID) {
    borders.push(ITEMS.SAND_BORDER_INNER_NW);
  }

  return borders.length ? borders : null;

}

function getWaterBorderSand(neighbours) {

  if(neighbours.S === ITEMS.WATER_TILE_ID && neighbours.NW === ITEMS.WATER_TILE_ID) {
    return ITEMS.WATER_SAND_BORDER_SW;
  }
  if(neighbours.N === ITEMS.WATER_TILE_ID && neighbours.SE === ITEMS.WATER_TILE_ID) {
    return ITEMS.WATER_SAND_BORDER_NE;
  }
  if(neighbours.W === ITEMS.WATER_TILE_ID && neighbours.NE === ITEMS.WATER_TILE_ID) {
    return ITEMS.WATER_SAND_BORDER_NW;
  }
  if(neighbours.E === ITEMS.WATER_TILE_ID && neighbours.SW === ITEMS.WATER_TILE_ID) {
    return ITEMS.WATER_SAND_BORDER_SE;
  }

  if(neighbours.N === ITEMS.WATER_TILE_ID && neighbours.E === ITEMS.WATER_TILE_ID) {
    return ITEMS.WATER_SAND_BORDER_NE;
  }
  if(neighbours.E === ITEMS.WATER_TILE_ID && neighbours.S === ITEMS.WATER_TILE_ID) {
    return ITEMS.WATER_SAND_BORDER_SE;
  }
  if(neighbours.S === ITEMS.WATER_TILE_ID && neighbours.W === ITEMS.WATER_TILE_ID) {
    return ITEMS.WATER_SAND_BORDER_SW;
  }
  if(neighbours.W === ITEMS.WATER_TILE_ID && neighbours.N === ITEMS.WATER_TILE_ID) {
    return ITEMS.WATER_SAND_BORDER_NW;
  }

  if(neighbours.W === ITEMS.WATER_TILE_ID) {
    return ITEMS.WATER_SAND_BORDER_W;
  }
  if(neighbours.N === ITEMS.WATER_TILE_ID) {
    return ITEMS.WATER_SAND_BORDER_N;
  }
  if(neighbours.S === ITEMS.WATER_TILE_ID) {
    return ITEMS.WATER_SAND_BORDER_S;
  }
  if(neighbours.E === ITEMS.WATER_TILE_ID) {
    return ITEMS.WATER_SAND_BORDER_E;
  }

  if(neighbours.NE === ITEMS.WATER_TILE_ID) {
    return ITEMS.WATER_SAND_BORDER_INNER_NE;
  }
  if(neighbours.SE === ITEMS.WATER_TILE_ID) {
    return ITEMS.WATER_SAND_BORDER_INNER_SE;
  }
  if(neighbours.SW === ITEMS.WATER_TILE_ID) {
    return ITEMS.WATER_SAND_BORDER_INNER_SW;
  }
  if(neighbours.NW === ITEMS.WATER_TILE_ID) {
    return ITEMS.WATER_SAND_BORDER_INNER_NW;
  }

  return null;

}

function getWaterBorder(neighbours) {

  /* FUNCTION getWaterBorder
   * Returns appropriate water on grass border
   */

  // Edge cases
  if(neighbours.S === ITEMS.WATER_TILE_ID && neighbours.NW === ITEMS.WATER_TILE_ID) {
    return ITEMS.WATER_GRASS_BORDER_SW;
  }
  if(neighbours.N === ITEMS.WATER_TILE_ID && neighbours.SE === ITEMS.WATER_TILE_ID) {
    return ITEMS.WATER_GRASS_BORDER_NE;
  }
  if(neighbours.W === ITEMS.WATER_TILE_ID && neighbours.NE === ITEMS.WATER_TILE_ID) {
    return ITEMS.WATER_GRASS_BORDER_NW;
  }
  if(neighbours.E === ITEMS.WATER_TILE_ID && neighbours.SW === ITEMS.WATER_TILE_ID) {
    return ITEMS.WATER_GRASS_BORDER_SE;
  }

  if(neighbours.N === ITEMS.WATER_TILE_ID && neighbours.E === ITEMS.WATER_TILE_ID) {
    return ITEMS.WATER_GRASS_BORDER_NE;
  }
  if(neighbours.E === ITEMS.WATER_TILE_ID && neighbours.S === ITEMS.WATER_TILE_ID) {
    return ITEMS.WATER_GRASS_BORDER_SE;
  }
  if(neighbours.S === ITEMS.WATER_TILE_ID && neighbours.W === ITEMS.WATER_TILE_ID) {
    return ITEMS.WATER_GRASS_BORDER_SW;
  }
  if(neighbours.W === ITEMS.WATER_TILE_ID && neighbours.N === ITEMS.WATER_TILE_ID) {
    return ITEMS.WATER_GRASS_BORDER_NW;
  }

  if(neighbours.W === ITEMS.WATER_TILE_ID) {
    if(neighbours.N === ITEMS.SAND_TILE_ID) {
      return ITEMS.BORDER_SANDEARTH_W;
    } else if(neighbours.S === ITEMS.SAND_TILE_ID) {
      return ITEMS.BORDER_EARTHSAND_W;
    } else {
      return ITEMS.WATER_GRASS_BORDER_W;
    }
  }
  if(neighbours.N === ITEMS.WATER_TILE_ID) {
    if(neighbours.E === ITEMS.SAND_TILE_ID) {
      return ITEMS.BORDER_EARTHSAND_N;
    } else if(neighbours.W === ITEMS.SAND_TILE_ID) {
      return ITEMS.BORDER_SANDEARTH_N;
    } else {
      return ITEMS.WATER_GRASS_BORDER_N;
    }
  }
  if(neighbours.S === ITEMS.WATER_TILE_ID) {
    if(neighbours.E === ITEMS.SAND_TILE_ID) {
      return ITEMS.BORDER_EARTHSAND_S;
    } else if(neighbours.W === ITEMS.SAND_TILE_ID) {
      return ITEMS.BORDER_SANDEARTH_S;
    } else {
      return ITEMS.WATER_GRASS_BORDER_S;
    }
  }
  if(neighbours.E === ITEMS.WATER_TILE_ID) {
    if(neighbours.N === ITEMS.SAND_TILE_ID) {
      return ITEMS.BORDER_SANDEARTH_E;
    } else if(neighbours.S === ITEMS.SAND_TILE_ID) {
      return ITEMS.BORDER_EARTHSAND_E;
    } else {
      return ITEMS.WATER_GRASS_BORDER_E;
    }
  }

  if(neighbours.NE === ITEMS.WATER_TILE_ID) {
    return ITEMS.WATER_GRASS_BORDER_INNER_NE;
  }
  if(neighbours.SE === ITEMS.WATER_TILE_ID) {
    return ITEMS.WATER_GRASS_BORDER_INNER_SE;
  }
  if(neighbours.SW === ITEMS.WATER_TILE_ID) {
    return ITEMS.WATER_GRASS_BORDER_INNER_SW;
  }
  if(neighbours.NW === ITEMS.WATER_TILE_ID) {
    return ITEMS.WATER_GRASS_BORDER_INNER_NW;
  }

  return null;

}


function getGrassBorder(neighbours) {

  /* FUNCTION getGrassBorder
   * Returns the appropriate grass border
   */

  if(neighbours.N === ITEMS.GRASS_TILE_ID && neighbours.E === ITEMS.GRASS_TILE_ID) {
    return ITEMS.GRASS_BORDER_INNER_NE;
  }
  if(neighbours.E === ITEMS.GRASS_TILE_ID && neighbours.S === ITEMS.GRASS_TILE_ID) {
    return ITEMS.GRASS_BORDER_INNER_SE;
  }
  if(neighbours.S === ITEMS.GRASS_TILE_ID && neighbours.W === ITEMS.GRASS_TILE_ID) {
    return ITEMS.GRASS_BORDER_INNER_SW;
  }
  if(neighbours.W === ITEMS.GRASS_TILE_ID && neighbours.N === ITEMS.GRASS_TILE_ID) {
    return ITEMS.GRASS_BORDER_INNER_NW;
  }

  if(neighbours.W === ITEMS.GRASS_TILE_ID) {
    return ITEMS.GRASS_BORDER_W;
  }
  if(neighbours.N === ITEMS.GRASS_TILE_ID) {
    return ITEMS.GRASS_BORDER_N;
  }
  if(neighbours.S === ITEMS.GRASS_TILE_ID) {
    return ITEMS.GRASS_BORDER_S;
  }
  if(neighbours.E === ITEMS.GRASS_TILE_ID) {
    return ITEMS.GRASS_BORDER_E;
  }

  if(neighbours.NE === ITEMS.GRASS_TILE_ID) {
    return ITEMS.GRASS_BORDER_NE;
  }
  if(neighbours.SE === ITEMS.GRASS_TILE_ID) {
    return ITEMS.GRASS_BORDER_SE;
  }
  if(neighbours.SW === ITEMS.GRASS_TILE_ID) {
    return ITEMS.GRASS_BORDER_SW;
  }
  if(neighbours.NW === ITEMS.GRASS_TILE_ID) {
    return ITEMS.GRASS_BORDER_NW;
  }

  return null;

}

function getMountainBorder(neighbours) {

  /* FUNCTION getMountainBorder
   * Returns appropriate border at mountain foot
   */

  if(neighbours.W === ITEMS.MOUNTAIN_TILE_ID && neighbours.N === ITEMS.MOUNTAIN_TILE_ID) {
    return ITEMS.MOUNTAIN_FOOT_BORDER_INNER_NW;
  }

  if(neighbours.N === ITEMS.MOUNTAIN_TILE_ID && neighbours.E === ITEMS.MOUNTAIN_TILE_ID) {
    return ITEMS.MOUNTAIN_FOOT_BORDER_INNER_NE;
  }

  if(neighbours.N === ITEMS.MOUNTAIN_TILE_ID) {
    return ITEMS.MOUNTAIN_FOOT_BORDER_NORTH;
  }

  if(neighbours.S === ITEMS.MOUNTAIN_TILE_ID) {
    return ITEMS.MOUNTAIN_FOOT_BORDER_SOUTH;
  }

  if(neighbours.W === ITEMS.MOUNTAIN_TILE_ID) {
    return ITEMS.MOUNTAIN_FOOT_BORDER_WEST;
  }

  if(neighbours.NE === ITEMS.MOUNTAIN_TILE_ID) {
    return ITEMS.MOUNTAIN_FOOT_BORDER_NE;
  }

  if(neighbours.NW === ITEMS.MOUNTAIN_TILE_ID) {
    return ITEMS.MOUNTAIN_FOOT_BORDER_NW;
  }

  if(neighbours.SW === ITEMS.MOUNTAIN_TILE_ID) {
    return ITEMS.MOUNTAIN_FOOT_BORDER_SW;
  }

  return null;

}

function getMountainWall(neighbours) {

  /* FUNCTION getMountainWall
   * Returns appropriate outer mountain wall
   */

  if(neighbours.E !== ITEMS.MOUNTAIN_TILE_ID && neighbours.S !== ITEMS.MOUNTAIN_TILE_ID) {
    return ITEMS.MOUNTAIN_WALL_OUTER_XY;
  }
  if(neighbours.E !== ITEMS.MOUNTAIN_TILE_ID) {
    return ITEMS.MOUNTAIN_WALL_OUTER_Y;
  }
  if(neighbours.S !== ITEMS.MOUNTAIN_TILE_ID) {
    return ITEMS.MOUNTAIN_WALL_OUTER_X;
  }

  return null;

}

module.exports.getMountainWallOuter = getMountainWallOuter;
module.exports.getFloatingBorder = getFloatingBorder;
module.exports.getWaterBorder = getWaterBorder;
module.exports.getMountainBorder = getMountainBorder;
module.exports.getMountainWall = getMountainWall;
module.exports.getWaterBorderSand = getWaterBorderSand;
module.exports.getSandBorder = getSandBorder;
module.exports.getGrassBorder = getGrassBorder;
