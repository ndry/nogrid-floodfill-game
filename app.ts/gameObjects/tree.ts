import model_all from "../model/_all";

export class Tree {

    game: Phaser.Game;
    data: model_all.Tree;
    
    
    connectionSprite?: Phaser.Sprite;

    // highlightColor?: string;
    // colorWaves: {
    //     step: number,
    //     start: number,
    //     color: string,
    //     justOwned: boolean
    // }[];

    
    constructor(game: Phaser.Game, data: model_all.Tree) {
        this.game = game;
        this.data = data;
        

        // this.colorWaves = [];
        // this.highlightColor = null;
    }

    treeSprite?: Phaser.Sprite;
    lastTreeLight;
    setTreeSpriteForColor(color: string) {
        if (color === this.lastTreeLight) {
            return;
        }

        if (this.treeSprite) {
            this.treeSprite.destroy(true);
        }
        this.treeSprite = this.game.add.sprite(
            this.data.x,
            this.data.y,
            this.game.cache.getBitmapData(`tree-${color}-${this.data.size}`));
        this.treeSprite.anchor.setTo(0.5);
        this.treeSprite.z = 200;

        this.lastTreeLight = color;
    }

    treeHighlightTempSpriteCache: { [id: string]: Phaser.Sprite };
    setTreeHighlightTemp(color: string) {
        if (!this.treeHighlightTempSpriteCache) {
            this.treeHighlightTempSpriteCache = {};
        }

        if (color) {
            if (!this.treeHighlightTempSpriteCache[color]) {
                this.treeHighlightTempSpriteCache[color] = this.game.add.sprite(this.data.x,
                    this.data.y,
                    this.game.cache.getBitmapData(`tree-highlight-${color}-${this.data.size}`));
                this.treeHighlightTempSpriteCache[color].anchor.setTo(0.5);
                this.treeHighlightTempSpriteCache[color].z = 1000;
            }
        }

        for (let key in this.treeHighlightTempSpriteCache) {
            if (this.treeHighlightTempSpriteCache.hasOwnProperty(key)) {
                const value = this.treeHighlightTempSpriteCache[key];

                value.visible = (key === color);
            }
        }
    }


    treeLightTempSpriteCache: { [id: string]: Phaser.Sprite };
    setTreeLightTemp(color: string, alpha: number) {
        if (!this.treeLightTempSpriteCache) {
            this.treeLightTempSpriteCache = {};
        }

        if (color) {
            if (!this.treeLightTempSpriteCache[color]) {
                this.treeLightTempSpriteCache[color] = this.game.add.sprite(this.data.x,
                    this.data.y,
                    this.game.cache.getBitmapData(`tree-${color}-${this.data.size}`));
                this.treeLightTempSpriteCache[color].anchor.setTo(0.5);
                this.treeLightTempSpriteCache[color].z = 300;
            }
        }

        for (let key in this.treeLightTempSpriteCache) {
            if (this.treeLightTempSpriteCache.hasOwnProperty(key)) {
                const value = this.treeLightTempSpriteCache[key];

                value.alpha = (key === color) ? alpha : 0;
            }
        }
    }

    fin() {
        this.setTreeSpriteForColor(this.data.color);
    }



    update() {
        // this.setTreeHighlightTemp(this.highlightColor);

        // const stepDurationMs = 25;

        
        // while (this.colorWaves[0]
        //     && (Math.floor(this.game.time.elapsedSince(this.colorWaves[0].start) / stepDurationMs) - this.colorWaves[0].step > 50)) {
        //     this.colorWaves.shift();

        // }

        // for (let i = this.colorWaves.length - 1; i >= 0; i--) {
        //     const wave = this.colorWaves[i];

        //     const timeStep = Math.floor(this.game.time.elapsedSince(wave.start) / stepDurationMs) - wave.step;
        //     if (timeStep >= 0) {
        //         if (wave.justOwned) {
                    this.setTreeSpriteForColor(this.data.color);
        //         }
        //     }
        // }

        // for (let i = this.colorWaves.length - 1; i >= 0; i--) {
        //     const wave = this.colorWaves[i];

        //     const timeStep = Math.floor(this.game.time.elapsedSince(wave.start) / stepDurationMs) - wave.step;
        //     if (timeStep >= 0) {
        //         this.setTreeLightTemp(wave.color, (25 - timeStep) / 25);
        //         break;
        //     }
        // }


    }

    get score() { return this.data.size * this.data.size * Math.PI }
}

