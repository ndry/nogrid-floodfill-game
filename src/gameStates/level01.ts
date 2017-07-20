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
        trees: Tree[];

        fullScore: number;

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

            this.trees = [];

            let failedCount = 0;
            while (failedCount < 500) {
                let x = Math.floor(this.map.x + this.map.width * Math.random());
                let y = Math.floor(this.map.y + this.map.height * Math.random());
                let size = 8 + 20 * Math.random() * Math.random() * Math.random();
                let color = getRandomElement(this.treeColors);

                let maskAllowed = this.mapMaskBmd.getPixel32(x, y) === 4278190080;
                let treesAllowed = this.trees
                    .filter(t => t.position.distance(new Phaser.Point(x, y)) < (t.size + size))
                    .length === 0;

                if (maskAllowed && treesAllowed) {
                    failedCount = 0;
                    const tree = new Tree(this.game, x, y, color, size);

                    this.trees.push(tree);
                } else {
                    failedCount++;
                }

            }

            this.trees.forEach(tree => {

                const closeTrees = this.trees
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

            this.fullScore = this.trees.map(t => t.score).reduce((p, c) => p + c, 0);

            this.players.forEach(player => {
                player.baseTrees.push(getRandomElement(this.trees));
                player.turn(player.baseTrees[0].color);
            });

            this.playerScores = this.players.map((player, i) =>
                this.game.add.text(
                    this.game.width - 80,
                    10 + i * 25,
                    (player.score(null) / this.fullScore * 100).toPrecision(2) + "%",
                    { font: "20px Tahoma", fill: player.color, align: "right" }));

            this.game.input.keyboard.addKey(Phaser.Keyboard.ONE).onDown.add(() => this.playerTurn(this.treeColors[0]));
            this.game.input.keyboard.addKey(Phaser.Keyboard.TWO).onDown.add(() => this.playerTurn(this.treeColors[1]));
            this.game.input.keyboard.addKey(Phaser.Keyboard.THREE).onDown.add(() => this.playerTurn(this.treeColors[2]));
            this.game.input.keyboard.addKey(Phaser.Keyboard.FOUR).onDown.add(() => this.playerTurn(this.treeColors[3]));
            this.game.input.keyboard.addKey(Phaser.Keyboard.FIVE).onDown.add(() => this.playerTurn(this.treeColors[4]));
        }

        playerTurn(color: TreeColor) {
            this.humanPlayer.turn(color);
            console.log(this.humanPlayer.score(null));

            this.players.map((player, i) =>
                this.playerScores[i].text = (player.score(null) / this.fullScore * 100).toPrecision(2) + "%");
        }
    }

}