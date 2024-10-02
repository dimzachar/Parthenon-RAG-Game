import * as Phaser from 'phaser';

export default class NPCManager {
  private scene: Phaser.Scene;
  private npcs!: Phaser.Physics.Arcade.Group;
  private player: Phaser.Physics.Arcade.Sprite | null = null;
  private debugText: Phaser.GameObjects.Text | null = null;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  initialize(): void {
    if (!this.npcs) {
      this.npcs = this.scene.physics.add.group();
    }
  }

  createNPCs(): void {
    if (!this.npcs) {
      this.initialize();
    }

    const npc1 = this.npcs.create(550, 650, 'npc') as Phaser.Physics.Arcade.Sprite;
    npc1.setImmovable(true);
    npc1.setCollideWorldBounds(true);
    // Adjust the hitbox size for the NPC
    npc1.setData('id', 'npc1');
    npc1.setData('state', 'walking');
    npc1.setCollideWorldBounds(true);
    npc1.setScale(0.5);
    npc1.body?.setSize(32, 64);
    npc1.body?.setOffset(16, 16);
    
    this.startNPCMovement(npc1);

    // Collision handling
    if (this.player) {
      this.scene.physics.add.collider(npc1, this.player, this.handleCollision.bind(this));
    }
  }

  // Custom collision handler
  handleCollision(object1: Phaser.GameObjects.GameObject, object2: Phaser.GameObjects.GameObject) {
    const npcSprite = object1 as Phaser.Physics.Arcade.Sprite;
    const playerSprite = object2 as Phaser.Physics.Arcade.Sprite;
  
    // Ensure both objects are indeed Sprites
    if (!(npcSprite instanceof Phaser.Physics.Arcade.Sprite) || !(playerSprite instanceof Phaser.Physics.Arcade.Sprite)) {
      return;
    }
  
    // Forces the player's velocity to zero to prevent pushing
    playerSprite.setVelocity(0);
  
    // Optional: Set the player to immovable if needed
    // playerSprite.setImmovable(true);
  
    // Optional: Set the NPC to not affect player movement
    // if (npcSprite.body) {
    //   npcSprite.body.immovable = true;
    // }
  
    // Create debug text
    if (!this.debugText) {
      this.debugText = this.scene.add.text(10, 50, '', { 
        font: '16px Courier', 
        color: '#00ff00',
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: { x: 5, y: 5 }
      });
      this.debugText.setScrollFactor(0);
      this.debugText.setDepth(1000);
    }
  }

  setPlayer(player: Phaser.Physics.Arcade.Sprite): void {
    this.player = player;
  }

  startNPCMovement(npc: Phaser.Physics.Arcade.Sprite): void {
    this.scene.time.addEvent({
      delay: Phaser.Math.Between(2000, 5000),
      callback: () => this.moveNPC(npc),
      loop: true
    });
  }

  moveNPC(npc: Phaser.Physics.Arcade.Sprite): void {
    if (npc.getData('state') !== 'walking') return;

    const speed = 30;
    const direction = Phaser.Math.Between(0, 3);
    switch(direction) {
      case 0: npc.setVelocity(0, -speed); break; // Up
      case 1: npc.setVelocity(0, speed); break;  // Down
      case 2: npc.setVelocity(-speed, 0); npc.flipX = true; break; // Left
      case 3: npc.setVelocity(speed, 0); npc.flipX = false; break; // Right
    }

    this.scene.time.delayedCall(Phaser.Math.Between(1000, 3000), () => {
      if (npc.getData('state') === 'walking') {
        npc.setVelocity(0);
      }
    });
  }

  update(): void {
    if (!this.player || !this.npcs) return;

    const npc = this.npcs.children.entries[0] as Phaser.Physics.Arcade.Sprite; // Assuming we only have one NPC
    if (npc) {
      const distance = Phaser.Math.Distance.Between(
        this.player.x, this.player.y, npc.x, npc.y
      );

      if (distance < 100) {
        npc.setVelocity(0);
        npc.setData('state', 'idle');
      } else if (npc.getData('state') === 'idle') {
        npc.setData('state', 'walking');
      }

      // Update debug text
      if (this.debugText) {
        this.debugText.setText([
          `NPC x: ${npc.x.toFixed(0)}`,
          `NPC y: ${npc.y.toFixed(0)}`,
          `Distance to player: ${distance.toFixed(0)}`,
          `NPC state: ${npc.getData('state')}`,
        ]);
      }
    }
  }

  getNPCs(): Phaser.Physics.Arcade.Group {
    return this.npcs;
  }

  checkProximity(player: Phaser.Physics.Arcade.Sprite): boolean {
    if (!this.npcs) return false;
    
    let nearNPC = false;
    this.npcs.children.entries.forEach((npc: Phaser.GameObjects.GameObject) => {
      if (npc instanceof Phaser.Physics.Arcade.Sprite) {
        const distance = Phaser.Math.Distance.Between(player.x, player.y, npc.x, npc.y);
        if (distance < 100) {
          nearNPC = true;
        }
      }
    });
    return nearNPC;
  }

  getNearestNPCId(player: Phaser.Physics.Arcade.Sprite): string | null {
    if (!this.npcs || this.npcs.children.entries.length === 0) return null;
    const npc = this.npcs.children.entries[0] as Phaser.Physics.Arcade.Sprite;
    return npc.getData('id');
  }

  interactWithNPC(npcId: string): void {
    const npc = this.npcs.children.entries.find(
      (npc: Phaser.GameObjects.GameObject) => 
        npc instanceof Phaser.Physics.Arcade.Sprite && npc.getData('id') === npcId
    ) as Phaser.Physics.Arcade.Sprite | undefined;

    if (npc) {
      npc.setData('state', 'interacting');
      npc.setVelocity(0);
      console.log(`Interacting with NPC: ${npcId}`);
    }
  }

  resumeNPCWalking(npcId: string): void {
    const npc = this.npcs.children.entries.find(
      (npc: Phaser.GameObjects.GameObject) => 
        npc instanceof Phaser.Physics.Arcade.Sprite && npc.getData('id') === npcId
    ) as Phaser.Physics.Arcade.Sprite | undefined;

    if (npc) {
      npc.setData('state', 'walking');
      console.log(`NPC ${npcId} resumed walking state`);
    }
  }

  getNPCInfo(npcId: string): { name: string; description: string } {
    // This is a placeholder. Replace with actual NPC data retrieval logic.
    return {
      name: `NPC ${npcId}`,
      description: `This is NPC ${npcId}`
    };
  }
}