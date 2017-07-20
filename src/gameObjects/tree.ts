module $safeprojectname$.Client {

    export class TreeColor {
        color: string;

        constructor(color: string) {
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
        score: number;

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
        }

        update() {
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
            gradient.addColorStop(0, this.color.color);
            gradient.addColorStop(1, 'black');

            this.bitmapData.context.beginPath();
            this.bitmapData.context.fillStyle = gradient;
            this.bitmapData.context.strokeStyle = this.owner ? this.owner.color : "#000000";
            this.bitmapData.context.arc(centerX, centerY, this.size, 0, Math.PI * 2);
            this.bitmapData.context.fill();
            this.bitmapData.context.stroke();

            for (let i = 0; i < this.neighbours.length; i++) {
                const t = this.neighbours[i];

                this.bitmapData.context.beginPath();
                this.bitmapData.context.moveTo(centerX, centerY);
                this.bitmapData.context.lineTo(centerX + t.x - this.x, centerY + t.y - this.y);
                this.bitmapData.context.strokeStyle = "black";
                this.bitmapData.context.stroke();
            }



            this.bitmapData.dirty = true;
        }

    }

}