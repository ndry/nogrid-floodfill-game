module $safeprojectname$.Client {

    export class TreeColor {
        color: string;

        constructor(color: string) {
            this.color = color;
        }
    }

    export class TreeData {
        color: TreeColor;
        x: number;
        y: number;
        size: number;
    }

    export class Tree {

        game: Phaser.Game;
        data: TreeData;
        owner?: Player;
        neighbours: Tree[];

        highlightColor?: string;

        connectionSprite?: Phaser.Sprite;

        colorWaves: {
            step: number,
            start: number,
            color: string,
            justOwned: boolean
        }[];

        
        constructor(game: Phaser.Game, data: TreeData) {
            this.game = game;
            this.data = data;
            
            this.owner = null;
            this.neighbours = [];

            this.colorWaves = [];

            this.highlightColor = null;
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
            this.setTreeSpriteForColor(this.owner ? this.owner.color : this.data.color.color);
        }



        update() {
            this.setTreeHighlightTemp(this.highlightColor);

            const stepDurationMs = 25;

            
            while (this.colorWaves[0]
                && (Math.floor(this.game.time.elapsedSince(this.colorWaves[0].start) / stepDurationMs) - this.colorWaves[0].step > 50)) {
                this.colorWaves.shift();

            }

            for (let i = this.colorWaves.length - 1; i >= 0; i--) {
                const wave = this.colorWaves[i];

                const timeStep = Math.floor(this.game.time.elapsedSince(wave.start) / stepDurationMs) - wave.step;
                if (timeStep >= 0) {
                    if (wave.justOwned) {
                        this.setTreeSpriteForColor(this.owner.color);
                    }
                }
            }

            for (let i = this.colorWaves.length - 1; i >= 0; i--) {
                const wave = this.colorWaves[i];

                const timeStep = Math.floor(this.game.time.elapsedSince(wave.start) / stepDurationMs) - wave.step;
                if (timeStep >= 0) {
                    this.setTreeLightTemp(wave.color, (25 - timeStep) / 25);
                    break;
                }
            }


        }

        get score() { return this.data.size * this.data.size * Math.PI }
    }


    export class Tree_obs extends Phaser.Sprite {
        bitmapData: Phaser.BitmapData;
        color: TreeColor;
        size: number;
        owner?: $safeprojectname$.Client.Player_obs;
        neighbours: Tree_obs[];
        highlighted: boolean;
        score: number;

        switchOrder: number;
        blinkOrder: number;
        switchStart?: number;

        constructor(game: Phaser.Game, x: number, y: number, color: TreeColor, size: number) {
            let bitmapData = game.add.bitmapData(100, 100);
            super(game, x, y, bitmapData);

            this.bitmapData = bitmapData;
            this.color = color;
            this.size = size;
            this.owner = null;
            this.neighbours = [];
            this.highlighted = false;

            this.score = this.size * this.size * Math.PI;

            this.anchor.setTo(0.5);
            game.add.existing(this);

            this.switchOrder = -1;
            this.blinkOrder = -1;
            this.switchStart = null;
        }

        lastColor: string;

        update() {
            let color = this.owner ? this.owner.color : this.color.color;

            if (this.switchStart !== null) {
                const timeStep = Math.floor(this.game.time.elapsedSince(this.switchStart) / 50);
                if (timeStep >= this.blinkOrder && timeStep < this.blinkOrder + 5) {
                    color = this.color.color;
                } else if (timeStep < this.switchOrder) {
                    color = this.color.color;
                }
            }

            if (color === this.lastColor) {
                return;
            }
            this.lastColor = color;

            const centerX = this.bitmapData.width / 2;
            const centerY = this.bitmapData.height / 2;


            this.bitmapData.cls();

            this.bitmapData.context.beginPath();
            this.bitmapData.context.fillStyle = "rgba(0, 0, 0, .3)";
            this.bitmapData.context.arc(centerX + this.size / 2, centerY+ this.size / 2, this.size, 0, Math.PI * 2);
            this.bitmapData.context.fill();



            var gradient = this.bitmapData.context.createRadialGradient(
                centerX - this.size / 2,
                centerY - this.size / 2,
                0,
                centerX - this.size / 2,
                centerY - this.size / 2,
                this.size * 4);
            gradient.addColorStop(0, color);
            gradient.addColorStop(1, 'black');

            this.bitmapData.context.beginPath();
            this.bitmapData.context.fillStyle = gradient;
            this.bitmapData.context.arc(centerX, centerY, this.size, 0, Math.PI * 2);
            this.bitmapData.context.fill();

            if (this.owner) {
                this.bitmapData.context.beginPath();
                this.bitmapData.context.strokeStyle = this.owner.color;
                this.bitmapData.context.lineWidth = 3;
                this.bitmapData.context.arc(centerX, centerY, this.size, 0, Math.PI * 2);
                this.bitmapData.context.stroke();
            }

            this.bitmapData.context.beginPath();
            this.bitmapData.context.strokeStyle = "#000000";
            this.bitmapData.context.lineWidth = 1;
            this.bitmapData.context.arc(centerX, centerY, this.size, 0, Math.PI * 2);
            this.bitmapData.context.stroke();

            for (let i = 0; i < this.neighbours.length; i++) {
                const t = this.neighbours[i];

                this.bitmapData.context.beginPath();
                this.bitmapData.context.moveTo(centerX, centerY);
                this.bitmapData.context.lineTo(centerX + t.x - this.x, centerY + t.y - this.y);
                this.bitmapData.context.strokeStyle = "rgba(0, 0, 0, .2)";
                this.bitmapData.context.stroke();
            }



            this.bitmapData.dirty = true;
        }

    }

}