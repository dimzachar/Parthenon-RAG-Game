import * as Phaser from 'phaser';

export default class MapManager {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  preload() {
    // Load all your tilesets here
    this.scene.load.image('dungeon', 'assets/tileset/Dungeon_Tileset.png');
    this.scene.load.image('tilemap', 'assets/tileset/Tilemap.png');
    this.scene.load.image('overworld', 'assets/tileset/Overworld.png');
    this.scene.load.image('buildings', 'assets/tileset/buildings.png');
    this.scene.load.image('terrain', 'assets/tileset/terrain.png');
    this.scene.load.image('buildings_32px', 'assets/tileset/buildings_32px.png');
    this.scene.load.image('buildings_48px', 'assets/tileset/buildings_48px.png');
    this.scene.load.image('objects', 'assets/tileset/objects.png');
    this.scene.load.image('tf_B_ashlands_1', 'assets/tileset/tf_B_ashlands_1.png');
    this.scene.load.image('collision16', 'assets/tileset/collision16.png');


    // Load the tilemap JSON file
    this.scene.load.tilemapTiledJSON('map', 'assets/dungeon-map3.json');
  }

  createMap() {
    const map = this.scene.make.tilemap({ key: 'map' });
    const tilesets = [
        map.addTilesetImage('dungeon', 'dungeon'),
        map.addTilesetImage('Tilemap', 'tilemap'),
        map.addTilesetImage('Overworld', 'overworld'),
        map.addTilesetImage('buildings', 'buildings'),
        map.addTilesetImage('terrain', 'terrain'),
        map.addTilesetImage('buildings_32px', 'buildings_32px'),
        map.addTilesetImage('buildings_48px', 'buildings_48px'),
        map.addTilesetImage('objects', 'objects'),
        map.addTilesetImage('tf_B_ashlands_1', 'tf_B_ashlands_1'),
        map.addTilesetImage('collision16', 'collision16')
      ];
  
      // Filter out null tilesets
      const validTilesets = tilesets.filter(tileset => tileset !== null);
      
      // Create layers
      const floorLayer = map.createLayer('floor', validTilesets);
      const grassLayer = map.createLayer('grass', validTilesets);
      const treesLayer = map.createLayer('trees', validTilesets);
      const wallsLayer = map.createLayer('walls', validTilesets);
      const stageLayer = map.createLayer('stage', validTilesets);
      const templeLayer = map.createLayer('temple', validTilesets);
      const houseLayer = map.createLayer('house', validTilesets);
      const objectsLayer = map.createLayer('objects', validTilesets);
      const collisionsLayer = map.createLayer('collisions', validTilesets);
  
      // Set collisions for walls and objects layers
      // wallsLayer.setCollisionByProperty({ collides: true });
      collisionsLayer?.setCollisionByExclusion([-1]);
      collisionsLayer?.setVisible(false);

      return {
        map,
        collisionLayers: [collisionsLayer]
      };
  }
}