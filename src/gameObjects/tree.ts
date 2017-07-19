module $safeprojectname$.Client {

    export declare type Style = string | CanvasGradient | CanvasPattern;

    export class TreeColor {
        color: Style;

        constructor(color: Style) {
            this.color = color;
        }
    }

    export class Tree extends Phaser.Sprite {
        bitmapData: Phaser.BitmapData;
        color: TreeColor;
        size: number;
        owner?: Player;
        neighbours: Tree[];
        highlighted: boolean;

        constructor(game: Phaser.Game, x: number, y: number, color: TreeColor, size: number) {
            let bitmapData = game.add.bitmapData(200, 200);
            super(game, x, y, bitmapData);

            this.bitmapData = bitmapData;
            this.color = color;
            this.size = size;
            this.owner = null;
            this.neighbours = [];
            this.highlighted = false;

            this.anchor.setTo(0.5);
            game.add.existing(this);
        }

        update() {
            let centerX = this.bitmapData.width / 2;
            let centerY = this.bitmapData.height / 2;
            this.bitmapData.context.beginPath();
            this.bitmapData.context.fillStyle = this.color.color;
            this.bitmapData.context.strokeStyle = this.owner ? this.owner.color : "#000000";
            this.bitmapData.context.arc(centerX, centerY, this.size, 0, Math.PI * 2);
            this.bitmapData.context.fill();
            this.bitmapData.context.stroke();

            this.bitmapData.dirty = true;
        }

    }

}