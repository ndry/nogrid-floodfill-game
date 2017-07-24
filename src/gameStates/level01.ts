module $safeprojectname$.Client {
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
                this.loadTreeBitmapData(size, "green");
                this.loadTreeBitmapData(size, "yellow");
                this.loadTreeBitmapData(size, "white");
                this.loadTreeBitmapData(size, "orange");
                this.loadTreeBitmapData(size, "pink");
                this.loadTreeBitmapData(size, "red");
                this.loadTreeBitmapData(size, "blue");
                this.loadTreeHighlightBitmapData(size, "green");
                this.loadTreeHighlightBitmapData(size, "yellow");
                this.loadTreeHighlightBitmapData(size, "white");
                this.loadTreeHighlightBitmapData(size, "orange");
                this.loadTreeHighlightBitmapData(size, "pink");
                this.loadTreeHighlightBitmapData(size, "red");
                this.loadTreeHighlightBitmapData(size, "blue");
            }

            this.load.image('map1', './assets/maps/map1.png');
            this.load.image('map1-mask', './assets/maps/map1-mask.png');
        }

        map: Phaser.Sprite;
        mapMaskBmd: Phaser.BitmapData;
        connectionLinesBmd: Phaser.BitmapData;
        connectionLines: Phaser.Sprite;

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
            while (failedCount < 750) {
                const treeData: TreeData = {
                    x: Math.floor(map.x + map.width * Math.random()),
                    y: Math.floor(map.y + map.height * Math.random()),
                    size: Math.floor(8 + 30 * Math.random() * Math.random() * Math.random() * Math.random()),
                    color: getRandomElement(treeColors),
                }

                const cx = Math.floor((treeData.x - map.x) / chunkSide);
                const cy = Math.floor((treeData.y - map.y) / chunkSide);

                function dist(a: TreeData, b: TreeData) {
                    return Math.sqrt((b.x - a.x) * (b.x - a.x) + (b.y - a.y) * (b.y - a.y));
                }

                let allowed = true;
                for (let dcx = -1; dcx <= 1; dcx++) {
                    for (let dcy = -1; dcy <= 1; dcy++) {
                        const chunk = (chunks[cx + dcx] || [])[cy + dcy] || [];
                        allowed = !chunk.find(t => dist(treeData, t.data) < (t.data.size + treeData.size));
                        if (!allowed) {
                            break;
                        }
                    }
                    if (!allowed) {
                        break;
                    }
                }

                allowed = allowed && mapMaskBmd.getPixel32(treeData.x, treeData.y) === 4278190080;

                if (allowed) {
                    failedCount = 0;
                    const tree = new Tree(game, treeData);

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

                function dist(a: TreeData, b: TreeData) {
                    return Math.sqrt((b.x - a.x) * (b.x - a.x) + (b.y - a.y) * (b.y - a.y));
                }

                const closeTrees = trees
                    .filter(t => tree !== t && dist(t.data, tree.data) < 2.5 * (t.data.size + tree.data.size))
                    .sort((at, bt) => dist(tree.data, at.data) - dist(tree.data, bt.data));

                let hiddenTrees: Tree[] = [];

                for (let i = 0; i < closeTrees.length; i++) {
                    const t = closeTrees[i];

                    const dt = new Phaser.Point(t.data.x - tree.data.x, t.data.y - tree.data.y);
                    const at = Math.asin(t.data.size / dt.getMagnitude());

                    hiddenTrees = hiddenTrees.concat(
                        closeTrees
                        .slice(i + 1)
                        .filter(t2 => {

                            const dt2 = new Phaser.Point(t2.data.x - tree.data.x, t2.data.y - tree.data.y);
                            const at2 = Math.asin(t2.data.size / dt2.getMagnitude());

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
            this.time.advancedTiming = true;

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

            this.connectionLinesBmd = this.game.make.bitmapData(this.map.width, this.map.height);
            this.trees.forEach(tree => {
                tree.neighbours.forEach(t => {
                    this.connectionLinesBmd.context.beginPath();
                    this.connectionLinesBmd.context.moveTo(tree.data.x, tree.data.y);
                    this.connectionLinesBmd.context.lineTo(t.data.x, t.data.y);
                    this.connectionLinesBmd.context.strokeStyle = "rgba(0, 0, 0, .2)";
                    this.connectionLinesBmd.context.stroke();
                });
            });
            this.connectionLinesBmd.update();
            this.connectionLines = this.add.sprite(0, 0, this.connectionLinesBmd);
            this.connectionLines.z = 1000;


            this.fullScore = this.trees.map(t => t.score).reduce((p, c) => p + c, 0);

            this.players.forEach(player => {
                player.turn(player.baseTrees[0].data.color);
            });

            this.trees.forEach(tree => tree.fin());


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
                btn.events.onInputOver.add(() => {
                    this.humanPlayer.walkTrees(tree => {
                        if (tree.owner !== this.humanPlayer) {
                            tree.highlightColor = this.humanPlayer.color;
                        }

                        return tree.neighbours
                            .filter(t => (t.data.color === color && t.owner === null) || (t.owner === this.humanPlayer));
                    });
                }, this);
                btn.events.onInputOut.add(() => {
                    this.humanPlayer.walkTrees(tree => {
                        if (tree.owner !== this.humanPlayer) {
                            tree.highlightColor = null;
                        }

                        return tree.neighbours
                            .filter(t => (t.data.color === color && t.owner === null) || (t.owner === this.humanPlayer));
                    });
                }, this);
               
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


            this.players[1].turn(
                this.treeColors
                .reduce((a, b) =>
                    (this.players[1].score(a) > this.players[1].score(b)) ? a : b));

            this.players.map((player, i) =>
                this.playerScores[i].text = (player.score(null) / this.fullScore * 100).toPrecision(2) + "%");
        }

        render() {
            this.game.debug.text("fps" + this.game.time.fps.toFixed(2), 2, 14, "white");
        }

        update() {
            this.trees.forEach(tree => tree.update());
        }
    }

}