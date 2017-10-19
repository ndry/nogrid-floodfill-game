import { getRandomElement } from "../utils/utils"
import { Tree } from "../gameObjects/tree";
import * as model_all from "../model/_all";

export class Level01 extends Phaser.State {

    loadTreeBitmapData(size: number, color: string): void {
        const radius = size;
        const treeBitmapData = this.game.add.bitmapData(radius * 3, radius * 3);

        const centerX = treeBitmapData.width / 2;
        const centerY = treeBitmapData.height / 2;

        treeBitmapData.context.beginPath();
        treeBitmapData.context.fillStyle = "rgba(0, 0, 0, .3)";
        treeBitmapData.context.arc(centerX + radius / 2, centerY + radius / 2, radius, 0, Math.PI * 2);
        treeBitmapData.context.fill();

        var gradient = treeBitmapData.context.createRadialGradient(
            centerX - radius / 2,
            centerY - radius / 2,
            0,
            centerX - radius / 2,
            centerY - radius / 2,
            radius * 4);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, 'black');

        treeBitmapData.context.beginPath();
        treeBitmapData.context.fillStyle = gradient;
        treeBitmapData.context.arc(centerX, centerY, radius, 0, Math.PI * 2);
        treeBitmapData.context.fill();

        treeBitmapData.context.beginPath();
        treeBitmapData.context.strokeStyle = "#000000";
        treeBitmapData.context.lineWidth = 1;
        treeBitmapData.context.arc(centerX, centerY, radius, 0, Math.PI * 2);
        treeBitmapData.context.stroke();

        this.game.cache.addBitmapData(`tree-${color}-${size}`, treeBitmapData);
    }

    loadTreeHighlightBitmapData(size: number, color: string): void {
        const radius = size;
        const treeBitmapData = this.game.add.bitmapData(radius * 3, radius * 3);

        const centerX = treeBitmapData.width / 2;
        const centerY = treeBitmapData.height / 2;

        treeBitmapData.context.beginPath();
        treeBitmapData.context.strokeStyle = color;
        treeBitmapData.context.lineWidth = 2;
        treeBitmapData.context.arc(centerX, centerY, radius - 2, 0, Math.PI * 2);
        treeBitmapData.context.stroke();

        this.game.cache.addBitmapData(`tree-highlight-${color}-${size}`, treeBitmapData);
    }

    preload(): void {
        super.preload();

        for (let size = 8; size < 5 + 30; size++) {
            for (const color of ["green", "yellow", "white", "orange", "pink", "red", "blue"]) {
                this.loadTreeBitmapData(size, color);
                this.loadTreeHighlightBitmapData(size, color);
            }
        }

        this.load.image('map1', './assets/maps/map1.png');
        this.load.image('map1-mask', './assets/maps/map1-mask.png');
    }

    map: Phaser.Sprite;
    mapMaskBmd: Phaser.BitmapData;
    connectionLinesBmd: Phaser.BitmapData;
    connectionLines: Phaser.Sprite;

    playerScores: Phaser.Text[];

    treeColors: model_all.Color[];
    treeColorButtons: Phaser.Sprite[];
    trees: Tree[];

    fullScore: number;

    board: model_all.Board;

    create() {

        this.time.advancedTiming = true;

        this.scale.pageAlignVertically = true;
        this.scale.pageAlignHorizontally = true;
        this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;

        this.map = this.add.sprite(0, 0, 'map1');

        this.mapMaskBmd = this.game.make.bitmapData(this.map.width, this.map.height);
        this.mapMaskBmd.draw('map1-mask', 0, 0);
        this.mapMaskBmd.update();

        this.board = model_all.createBoard(
            this.map.width, 
            this.map.height, 
            (x, y) => this.mapMaskBmd.getPixel32(x, y) === 4278190080,
            new Set<model_all.Color>(["green", "yellow", "white", "orange", "pink"]),
            ["red", "blue"]);

        this.treeColors = [...this.board.neutralColors];

        this.trees = this.board.trees.map(t => new Tree(this.game, t));

        this.connectionLinesBmd = this.game.make.bitmapData(this.map.width, this.map.height);
        this.trees.forEach(tree => {
            tree.data.neighbours.forEach(t => {
                this.connectionLinesBmd.context.beginPath();
                this.connectionLinesBmd.context.moveTo(tree.data.x, tree.data.y);
                this.connectionLinesBmd.context.lineTo(t.x, t.y);
                this.connectionLinesBmd.context.strokeStyle = "rgba(0, 0, 0, .2)";
                this.connectionLinesBmd.context.stroke();
            });
        });
        this.connectionLinesBmd.update();
        this.connectionLines = this.add.sprite(0, 0, this.connectionLinesBmd);
        this.connectionLines.z = 1000;


        this.fullScore = this.trees.map(t => t.score).reduce((p, c) => p + c, 0);

        this.trees.forEach(tree => tree.fin());


        // this.playerScores = this.players.map((player, i) =>
        //     this.game.add.text(
        //         this.game.width - 80,
        //         10 + i * 25,
        //         (player.score(null) / this.fullScore * 100).toPrecision(2) + "%",
        //         { font: "20px Tahoma", fill: player.color, align: "right" }));

        this.treeColorButtons = this.treeColors.map((color, i) => {
            const bitmapData = this.game.add.bitmapData(50, 50);

            bitmapData.context.beginPath();
            bitmapData.context.fillStyle = color;
            bitmapData.context.rect(0, 0, bitmapData.width, bitmapData.height);
            bitmapData.context.fill();

            this.game.cache.addBitmapData("btn" + i, bitmapData);

            const btn = this.game.add.sprite(this.game.width - 80,
                100 + i * 70,
                bitmapData);
            btn.inputEnabled = true;
            btn.events.onInputUp.add(() => { this.playerTurn(color); }, this);
            // btn.events.onInputOver.add(() => {
            //     this.humanPlayer.walkTrees(tree => {
            //         if (tree.owner !== this.humanPlayer) {
            //             tree.highlightColor = this.humanPlayer.color;
            //         }

            //         return tree.neighbours
            //             .filter(t => (t.data.color === color && t.owner === null) || (t.owner === this.humanPlayer));
            //     });
            // }, this);
            // btn.events.onInputOut.add(() => {
            //     this.humanPlayer.walkTrees(tree => {
            //         if (tree.owner !== this.humanPlayer) {
            //             tree.highlightColor = null;
            //         }

            //         return tree.neighbours
            //             .filter(t => (t.data.color === color && t.owner === null) || (t.owner === this.humanPlayer));
            //     });
            // }, this);
            
            return btn;
        });


        this.game.input.keyboard.addKey(Phaser.Keyboard.ONE).onDown.add(() => this.playerTurn(this.treeColors[0]));
        this.game.input.keyboard.addKey(Phaser.Keyboard.TWO).onDown.add(() => this.playerTurn(this.treeColors[1]));
        this.game.input.keyboard.addKey(Phaser.Keyboard.THREE).onDown.add(() => this.playerTurn(this.treeColors[2]));
        this.game.input.keyboard.addKey(Phaser.Keyboard.FOUR).onDown.add(() => this.playerTurn(this.treeColors[3]));
        this.game.input.keyboard.addKey(Phaser.Keyboard.FIVE).onDown.add(() => this.playerTurn(this.treeColors[4]));


        const btnWidth = 50;
        const btnHeight = 50;

        const bmd = this.game.add.bitmapData(this.game.width, this.game.height);

        bmd.context.beginPath();
        bmd.context.fillStyle = "red";
        bmd.context.rect(0, 0, bmd.width, bmd.height);
        bmd.context.fill();

        const sprt = this.game.add.sprite(0, 0, bmd);
         
    }

    playerTurn(color: model_all.Color) {
        model_all.applyTurn(this.board, color);

        model_all.applyTurn(this.board,  [...this.board.neutralColors]
            .reduce((a, b) => 
                (model_all.getPlayerScore(this.board, this.board.players[this.board.currentPlayerIndex], a)
                    > model_all.getPlayerScore(this.board, this.board.players[this.board.currentPlayerIndex], b))
                        ? a : b));

        // this.players.map((player, i) =>
        //     this.playerScores[i].text = (player.score(null) / this.fullScore * 100).toPrecision(2) + "%");
    }

    render() {
        this.game.debug.text("fps" + this.game.time.fps.toFixed(2), 2, 14, "white");
    }

    update() {
        this.trees.forEach(tree => tree.update());
    }
}
