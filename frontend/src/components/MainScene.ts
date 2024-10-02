import * as Phaser from 'phaser';
import MapManager from '@/components/MapManager';
import NPCManager from '@/components/NPCManager';

export default class MainScene extends Phaser.Scene {
  private mapManager: MapManager;
  private npcManager: NPCManager;
  private player!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private interactKey!: Phaser.Input.Keyboard.Key;
  private promptText!: Phaser.GameObjects.Text;
  private debugText!: Phaser.GameObjects.Text;
  private debugGraphics!: Phaser.GameObjects.Graphics;
  private inputEnabled: boolean = true;
  private music!: Phaser.Sound.BaseSound;

  // Add this line to control debug visibility
  private static debugVisible: boolean = false;

  constructor() {
    super('MainScene');
    this.mapManager = new MapManager(this);
    this.npcManager = new NPCManager(this);
  }

  preload(): void {
    this.load.audio('background_music', '/assets/audio/dark-fantasy-nostalgia.mp3');
    this.mapManager.preload();

    this.load.spritesheet('player-idle', 'assets/Idle.png', { 
      frameWidth: 128, 
      frameHeight: 128 
    });
    this.load.spritesheet('player-walk', 'assets/Walk.png', { 
      frameWidth: 128, 
      frameHeight: 128 
    });
    this.load.spritesheet('npc', 'assets/frame5.png', { 
      frameWidth: 64, 
      frameHeight: 64 
    });
  }

  create(): void {
    this.music = this.sound.add('background_music', { loop: true, volume: 0.5 });
    this.music.play();

    const { map, collisionLayers } = this.mapManager.createMap();
    
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    this.player = this.physics.add.sprite(400, 600, 'player-idle');
    this.player.setCollideWorldBounds(true);
    this.player.setScale(0.5);

    this.player.body?.setSize(32, 64);
    this.player.body?.setOffset(16, 64);

    this.anims.create({
      key: 'idle',
      frames: this.anims.generateFrameNumbers('player-idle', { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1
    });
    this.anims.create({
      key: 'walk',
      frames: this.anims.generateFrameNumbers('player-walk', { start: 0, end: 6 }),
      frameRate: 10,
      repeat: -1
    });

    this.player.play('idle');

    this.npcManager.createNPCs();

    collisionLayers.forEach(layer => {
      if (layer) {
        this.physics.add.collider(this.player, layer);
        const npcs = this.npcManager.getNPCs();
        if (npcs) {
          this.physics.add.collider(npcs, layer);
        }
      }
    });
    
    const npcs = this.npcManager.getNPCs();
    if (npcs) {
      this.physics.add.collider(this.player, npcs);
    }

    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.startFollow(this.player, true, 0.05, 0.05);
    this.cameras.main.setZoom(1);

    this.cursors = this.input.keyboard!.createCursorKeys();
    this.interactKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.input.keyboard!.addCapture('E');

    const textStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 }
    };

    this.promptText = this.add.text(400, 300, 'Press E to interact', textStyle);
    this.promptText.setOrigin(0.5);
    this.promptText.setScrollFactor(0);
    this.promptText.setVisible(false);

    this.debugText = this.add.text(10, 10, '', { 
      ...textStyle,
      color: '#00ff00'
    });
    this.debugText.setScrollFactor(0);
    this.debugText.setDepth(1000);

    this.debugGraphics = this.add.graphics();
    this.debugGraphics.setScrollFactor(0);
    this.debugGraphics.setDepth(999);

    // Set initial visibility
    this.setDebugVisibility(MainScene.debugVisible);
  }

  update(): void {
    if (this.inputEnabled) {
      if (!this.player.anims.isPlaying || this.player.anims.currentAnim?.key !== 'run') {
        this.handlePlayerMovement();
      }
      this.checkNPCInteraction();
    } else {
      this.player.setVelocity(0);
      this.player.play('idle', true);
    }
    if (MainScene.debugVisible) {
      this.updateDebugInfo();
      this.drawDebugBox();
    }
  }

  setMusicVolume(volume: number) {
    this.music.setVolume(volume);
  }

  toggleMusic(play: boolean) {
    if (play) {
      this.music.resume();
    } else {
      this.music.pause();
    }
  }

  setInputEnabled(enabled: boolean): void {
    this.inputEnabled = enabled;
    if (enabled) {
      this.input.keyboard?.addCapture('E');
    } else {
      this.input.keyboard?.removeCapture('E');
    }
  }

  private handlePlayerMovement(): void {
    const speed = 80;
    this.player.setVelocity(0);

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-speed);
      this.player.flipX = true;
      this.player.body?.setOffset(68, 64);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(speed);
      this.player.flipX = false;
      this.player.body?.setOffset(32, 64);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-speed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(speed);
    }

    if (this.player.body) {
      this.player.body.velocity.normalize().scale(speed);

      if (this.player.body.velocity.length() > 0) {
        this.player.play('walk', true);
      } else {
        this.player.play('idle', true);
      }
    }
  }

  private checkNPCInteraction(): void {
    const nearNPC = this.npcManager.checkProximity(this.player);
    this.promptText.setVisible(nearNPC);

    if (nearNPC && Phaser.Input.Keyboard.JustDown(this.interactKey)) {
      const npcId = this.npcManager.getNearestNPCId(this.player);
      if (npcId) {
        const npcInfo = this.npcManager.getNPCInfo(npcId);
        this.events.emit('npcInteraction', { npcId, npcInfo });
        this.scene.pause();
      }
    }
  }

  private updateDebugInfo(): void {
    this.debugText.setText([
      `Player x: ${this.player.x.toFixed(0)}`,
      `Player y: ${this.player.y.toFixed(0)}`,
      `Velocity: ${this.player.body?.velocity.length().toFixed(2) ?? 'N/A'}`,
      `Facing: ${this.player.flipX ? 'Left' : 'Right'}`,
      `Animation: ${this.player.anims.currentAnim ? this.player.anims.currentAnim.key : 'None'}`,
      `Body x: ${this.player.body?.x.toFixed(0) ?? 'N/A'}`,
      `Body y: ${this.player.body?.y.toFixed(0) ?? 'N/A'}`,
      `Body width: ${this.player.body?.width ?? 'N/A'}`,
      `Body height: ${this.player.body?.height ?? 'N/A'}`,
      `Input Enabled: ${this.inputEnabled}`,
    ]);
  }

  private drawDebugBox(): void {
    this.debugGraphics.clear();
    if (this.player.body) {
      const bodyPos = this.player.body.position;
      const cameraPos = this.cameras.main.scrollX;
      const zoom = this.cameras.main.zoom;
      const x = (bodyPos.x - cameraPos) * zoom;
      const y = (bodyPos.y - this.cameras.main.scrollY) * zoom;
      const width = this.player.body.width * zoom;
      const height = this.player.body.height * zoom;
      this.debugGraphics.strokeRect(x, y, width, height);
    }
  }

  // Add these methods to control debug visibility
  static toggleDebug(): void {
    MainScene.debugVisible = !MainScene.debugVisible;
    const scene = this.scene.scenes.find(s => s instanceof MainScene) as MainScene;
    if (scene) {
      scene.setDebugVisibility(MainScene.debugVisible);
    }
  }

  private setDebugVisibility(visible: boolean): void {
    this.debugText.setVisible(visible);
    this.debugGraphics.setVisible(visible);
  }
}