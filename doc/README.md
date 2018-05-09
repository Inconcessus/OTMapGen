# Procedural Generation of Open Tibia maps

This contribution describes the in-depth design of OTMapGen: a tool for the procedural generation of Open Tibia maps.

Mapping is a term that describes level editing for the previously popular isometric MMORPG Tibia (http://www.tibia.com). Open Tibia is an open-source project that emulates an official Tibia server. Developers can design a server with custom areas, monsters, quests, and other types of game content.

In Tibia, the world is built from 32x32 pixel sprites. Historically, areas used to be designed by hand, with each tile of the tile set deliberately placed. In recent years, tools (e.g. Remere's Map Editor) introduced automatic features: e.g. tile brushing and automated bordering between adjacent tiles.

World maps are saved in the OTBM format. To create world maps we must begin with an application that can read & write from and to this binary file format.

## OTBM Format

The Open Tibia Binary Mapping (OTBM) format is the prevalent format for creating, sharing, and using world maps. The byte order of this format is little endian. Each file is initialized by four magic bytes:

    0x00 0x00 0x00 0x00
    0x4D 0x42 0x54 0x4F (OTBM in ASCII)

Following the file identifier is an nodal tree structure. Each node may have a type, required & optional properties, and multiple children. A new node is initialized by the magic byte `0xFE` and terminated by `0xFF`. Characters followed by `0xFD` are escaped and interpreted as literal.

When a new node is initialized before the current node is terminated, it becomes a child of its parent node. The first byte after the initialization byte determines the type of the node:

    0x00 OTBM_MAP_HEADER
    0x02 OTBM_MAP_DATA
    0x04 OTBM_TILE_AREA
    0x05 OTBM_TILE
    0x06 OTBM_ITEM
    
### OTBM Nodes
##### `0x00` OTBM_MAP_HEADER
The map header contains map metadata that describes the version, height, and width. Given is an example value and the number of bytes for each field.

    0xFE 0x00
    0x02 0x00 0x00 0x00 VERSION (4 Bytes) = 2
    0x00 0x08 MAP WIDTH (2 Bytes) = 2048
    0x00 0x08 MAP HEIGHT (2 Bytes) = 2048
    0x03 0x00 0x00 0x00 ITEM MAJOR VERSION (4 Bytes) = 3
    0x39 0x00 0x00 0x00 ITEM MINOR VERSION (4 Bytes) = 57
    ...
    0xFD
 
##### `0x02` OTBM_MAP_HEADER
This node type has no required attributes but only additional properties. See the header on additional properties for more information.

    0xFE 0x02
    ... additional properties
    ... children
    0xFD
    
##### `0x04` OTBM_TILE_AREA
The OTBM tile area is a parent node for tiles within its area. The size of this area is always 256x256. By using a parent-child structure the format saves space because each child tile only requires a single byte for both its coordinates in relative tile area coordinates. The tile area itself has its position defined in global coordinates and uses two bytes per coordinate. Level height in the OTBM format is limited to a single byte.

    0xFE 0x04
    0x00 0x00 X-COORDINATE (2 Bytes) = 0
    0x00 0x00 Y-COORDINATE (2 Bytes) = 0
    0x07 Z-COORDINATE (1 Byte) = 7
    ... children
    0xFD

##### `0x05` OTBM_TILE
OTBM tiles define singular squares on the map.The tile position is given in relative coordinates to its parent tile area node. Besides the position the tile may have more properties until the node is terminated.

    0xFE 0x05
    0x00 X-COORDINATE (1 Bytes) = 0
    0x00 Y-COORDINATE (1 Bytes) = 0
    ... additional properties
    ... children
    0xFD

##### `0x06` OTBM_ITEM
Items are always inherently children of tiles and have a single required entity. There may be multiple additional properties that need to be read.

    0xFE 0x06
    0x64 0x00 ITEM-IDENTIFIER (2 Bytes) = 100
    ... additional properties
    ... children
    0xFD

### Additional Properties
Additional properties are strings of bytes following the fixed header of a node that define extra optional information.

    0x01 OTBM_ATTR_DESCRIPTION
    0x02 OTBM_ATTR_EXT_FILE
    0x03 OTBM_ATTR_TILE_FLAGS
    0x04 OTBM_ATTR_ACTION_ID
    0x05 OTBM_ATTR_UNIQUE_ID

#### `0x01` OTBM_ATTR_DESCRIPTION
#### `0x02` OTBM_ATTR_EXT_FILE
#### `0x03` OTBM_ATTR_TILE_FLAGS
Following this identifier we expect four bytes that act as a bit flag for certain tile zones. Each bit of the string indicates whether one particular flag is set.

    0x03
    0x00 0x00 0x00 0x1D TILE-FLAG-SETTINGS (4 Bytes) = 29
 
The flags correspond to the following bits:
    
    0x00 0x00 0x00 0x01 TILESTATE_PROTECTIONZONE (first bit)
    0x00 0x00 0x00 0x04 TILESTATE_NOPVP (third bit)
    0x00 0x00 0x00 0x08 TILESTATE_NOLOGOUT (fourth bit)
    0x00 0x00 0x00 0x10 TILESTATE_PVPZONE (fifth bit)

Any combination of these flags may be set. In this example all flags were set.
    
#### `0x04` OTBM_ATTR_ACTION_ID
Following this identifier we expect two bytes that give the item action identifier:

    0x04
    0x64 0x00 ACTION-ID (2 Bytes) = 100

#### `0x05` OTBM_ATTR_UNIQUE_ID
Following this identifier we expect two bytes that give the item unique identifier:

    0x05
    0x64 0x00 UNIQUE-ID (2 Bytes) = 100
    
## OTBM2JSON
