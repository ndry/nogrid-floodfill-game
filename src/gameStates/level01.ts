module $safeprojectname$.Client {
    export class Level01 extends Phaser.State {

        preload(): void {
            super.preload();

            this.load.image('map1', './assets/maps/map1.png');
            this.load.image('map1-mask', './assets/maps/map1-mask.png');
        }

        map: Phaser.Sprite;
        mapMaskBmd: Phaser.BitmapData;

        humanPlayer: Player;
        players: Player[];
        playerScores: Phaser.Text[];

        treeColors: TreeColor[];
        treeColorButtons: Phaser.Sprite[];
        trees: Tree[];

        fullScore: number;

        static generateTrees(game: Phaser.Game, map: Phaser.Sprite, mapMaskBmd: Phaser.BitmapData, treeColors: TreeColor[], players: Player[]) {
            const trees: Tree[] = [];

            const chunkSide = 100;
            const chunks: Tree[][][] = [];
            for (let cx = 0; cx < map.width / chunkSide; cx++) {
                chunks[cx] = [];
                for (let cy = 0; cy < map.height / chunkSide; cy++) {
                    chunks[cx][cy] = [];
                }
            }

            let failedCount = 0;
            while (failedCount < 500) {
                const x = Math.floor(map.x + map.width * Math.random());
                const y = Math.floor(map.y + map.height * Math.random());
                const size = 8 + 20 * Math.random() * Math.random() * Math.random();
                const color = getRandomElement(treeColors);

                const cx = Math.floor((x - map.x) / chunkSide);
                const cy = Math.floor((y - map.y) / chunkSide);

                let allowed = true;
                for (let dcx = -1; dcx <= 1; dcx++) {
                    for (let dcy = -1; dcy <= 1; dcy++) {
                        const chunk = (chunks[cx + dcx] || [])[cy + dcy] || [];
                        allowed = !chunk.find(t => t.position.distance(new Phaser.Point(x, y)) < (t.size + size));
                        if (!allowed) {
                            break;
                        }
                    }
                    if (!allowed) {
                        break;
                    }
                }

                allowed = allowed && mapMaskBmd.getPixel32(x, y) === 4278190080;

                if (allowed) {
                    failedCount = 0;
                    const tree = new Tree(game, x, y, color, size);

                    const chunk = chunks[cx][cy] = (chunks[cx] || [])[cy] || [];
                    chunk.push(tree);
                    trees.push(tree);
                } else {
                    failedCount++;
                }
            }

            players.forEach(player => {
                const tree = getRandomElement(trees);
                player.baseTrees.push(tree);
                tree.owner = player;
            });

            return trees;
        }

        static processTrees(trees: Tree[]) {
            trees.forEach(tree => {

                const closeTrees = trees
                    .filter(t => tree !== t && t.position.distance(tree.position) - (t.size + tree.size) < 24)
                    .sort((at, bt) => tree.position.distance(at.position) - tree.position.distance(bt.position));

                let hiddenTrees: Tree[] = [];

                for (let i = 0; i < closeTrees.length; i++) {
                    const t = closeTrees[i];

                    const dt = t.position.clone().subtract(tree.position.x, tree.position.y);
                    const at = Math.asin(t.size / dt.getMagnitude());

                    hiddenTrees = hiddenTrees.concat(
                        closeTrees
                        .slice(i + 1)
                        .filter(t2 => {

                            const dt2 = t2.position.clone().subtract(tree.position.x, tree.position.y);
                            const at2 = Math.asin(t2.size / dt2.getMagnitude());

                            const minAllowedAngle = at + at2;

                            var a = Math.acos(dt.dot(dt2) / (dt.getMagnitude() * dt2.getMagnitude()));

                            return a < minAllowedAngle;
                        }));
                }


                closeTrees
                    .filter(t => hiddenTrees.indexOf(t) < 0)
                    .forEach(t => {
                        tree.neighbours.push(t);
                        t.neighbours.push(tree);
                    });
            });
        }

        create() {
            this.physics.startSystem(Phaser.Physics.ARCADE);

            this.map = this.add.sprite(0, 0, 'map1');

            this.mapMaskBmd = this.game.make.bitmapData(this.map.width, this.map.height);
            this.mapMaskBmd.draw('map1-mask', 0, 0);
            this.mapMaskBmd.update();

            this.humanPlayer = new Player(this.game, "red");
            this.players = [this.humanPlayer, new Player(this.game, "blue")];

            this.treeColors = [
                new TreeColor("green"),
                new TreeColor("yellow"),
                new TreeColor("white"),
                new TreeColor("orange"),
                new TreeColor("pink")
            ];

            this.trees = Level01.generateTrees(this.game, this.map, this.mapMaskBmd, this.treeColors, this.players);
            Level01.processTrees(this.trees);
            

            this.fullScore = this.trees.map(t => t.score).reduce((p, c) => p + c, 0);

            this.players.forEach(player => {
                player.turn(player.baseTrees[0].color);
            });

            this.playerScores = this.players.map((player, i) =>
                this.game.add.text(
                    this.game.width - 80,
                    10 + i * 25,
                    (player.score(null) / this.fullScore * 100).toPrecision(2) + "%",
                    { font: "20px Tahoma", fill: player.color, align: "right" }));

            this.treeColorButtons = this.treeColors.map((color, i) => {
                const bitmapData = this.game.add.bitmapData(50, 50);

                bitmapData.context.beginPath();
                bitmapData.context.fillStyle = color.color;
                bitmapData.context.rect(0, 0, bitmapData.width, bitmapData.height);
                bitmapData.context.fill();

                this.game.cache.addBitmapData("btn" + i, bitmapData);

                const btn = this.game.add.sprite(this.game.width - 80,
                    100 + i * 70,
                    bitmapData);
                btn.inputEnabled = true;
                btn.events.onInputUp.add(() => { this.playerTurn(color); }, this);
               
                return btn;
            });


            this.game.input.keyboard.addKey(Phaser.Keyboard.ONE).onDown.add(() => this.playerTurn(this.treeColors[0]));
            this.game.input.keyboard.addKey(Phaser.Keyboard.TWO).onDown.add(() => this.playerTurn(this.treeColors[1]));
            this.game.input.keyboard.addKey(Phaser.Keyboard.THREE).onDown.add(() => this.playerTurn(this.treeColors[2]));
            this.game.input.keyboard.addKey(Phaser.Keyboard.FOUR).onDown.add(() => this.playerTurn(this.treeColors[3]));
            this.game.input.keyboard.addKey(Phaser.Keyboard.FIVE).onDown.add(() => this.playerTurn(this.treeColors[4]));
        }

        playerTurn(color: TreeColor) {
            this.humanPlayer.turn(color);
            this.players[1].turn(getRandomElement(this.treeColors));

            this.players.map((player, i) =>
                this.playerScores[i].text = (player.score(null) / this.fullScore * 100).toPrecision(2) + "%");
        }
    }

}