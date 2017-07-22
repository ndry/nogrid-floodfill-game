module $safeprojectname$.Client {
    export class JoinGame extends Phaser.State {

        preload(): void {
            super.preload();

            this.load.image('map1', './assets/maps/map1.png');
            this.load.image('map1-mask', './assets/maps/map1-mask.png');
        }

        map: Phaser.Sprite;
        mapMaskBmd: Phaser.BitmapData;

        currentPlayerIndex: number;
        thisPlayerIndex: number;
        players: Player[];
        playerScores: Phaser.Text[];

        treeColors: TreeColor[];
        treeColorButtons: Phaser.Sprite[];
        trees: Tree[];

        fullScore: number;

        gameId: string;

        create() {
            const gidEl = document.getElementById("game-id") as HTMLInputElement;
            this.gameId = gidEl.value;

            this.physics.startSystem(Phaser.Physics.ARCADE);

            this.map = this.add.sprite(0, 0, 'map1');

            this.mapMaskBmd = this.game.make.bitmapData(this.map.width, this.map.height);
            this.mapMaskBmd.draw('map1-mask', 0, 0);
            this.mapMaskBmd.update();

            this.players = [new Player(this.game, "red"), new Player(this.game, "blue")];
            this.currentPlayerIndex = 0;
            this.thisPlayerIndex = 0;

            this.treeColors = [
                new TreeColor("green"),
                new TreeColor("yellow"),
                new TreeColor("white"),
                new TreeColor("orange"),
                new TreeColor("pink")
            ];

            this.couch = nano({
                url: 'https://couchdb-6aa960.smileupps.com',
                cors: true
            });
            const db = this.couch.use("nogrid-floodfill-game");
            db.get(this.gameId,
                (err, body) => {
                    if (err) {
                        console.log(err);
                        return;
                    }

                    this.trees = body.trees.map(treeData => {
                        const color = this.treeColors.find(c => c.color === treeData.color);
                        const tree = new Tree(this.game, treeData.x, treeData.y, color, treeData.size);
                        if (treeData.owner) {
                            const player = this.players.find(p => p.color === treeData.owner);
                            tree.owner = player;
                            player.baseTrees.push(tree);
                        }
                        return tree;
                    });

                    Level01.processTrees(this.trees);


                    this.fullScore = this.trees.map(t => t.score).reduce((p, c) => p + c, 0);

                    this.players.forEach(player => {
                        player.turn(player.baseTrees[0].color);
                    });

                    this.playerScores = this.players.map((player, i) =>
                        this.game.add.text(
                            this.game.width - 80,
                            10 + i * 25,
                            (this.currentPlayerIndex === i ? "> " : "") +
                            (player.score(null) / this.fullScore * 100).toPrecision(2) +
                            "%",
                            { font: "20px Tahoma", fill: player.color, align: "right" }));
                });

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
            setTimeout(this.poll.bind(this));

            this.treeColorButtons.forEach(btn =>
                btn.visible = this.currentPlayerIndex === this.thisPlayerIndex);
        }

        lastSeq?: number;
        poll() {
            const db = this.couch.use("nogrid-floodfill-game");
            db.changes({
                    feed: "longpoll",
                    include_docs: true,
                    filter: "main/turns",
                    gameId: this.gameId,
                    since: this.lastSeq || 0
                },
                (err, body) => {
                    setTimeout(this.poll.bind(this));
                    if (err) {
                        console.log(err);
                        return;
                    }

                    body.results.forEach(result => {
                        this.applyTurn(result.doc.color);
                    });
                    this.lastSeq = body.last_seq;
                    
                    this.treeColorButtons.forEach(btn =>
                        btn.visible = this.currentPlayerIndex === this.thisPlayerIndex);
                });
        }

        applyTurn(colorData: string) {
            const color = this.treeColors.find(c => c.color === colorData);

            this.players[this.currentPlayerIndex].turn(color);
            this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;

            this.players.forEach((player, i) => {
                this.playerScores[i].text =
                    (this.currentPlayerIndex === i ? "> " : "") +
                    (player.score(null) / this.fullScore * 100).toFixed(2) +
                    "%";
            });
        }


        playerTurn(color: TreeColor) {
            if (this.currentPlayerIndex !== this.thisPlayerIndex) {
                return;
            }

            this.treeColorButtons.forEach(btn => btn.visible = false);

            const db = this.couch.use("nogrid-floodfill-game");
            db.insert({
                type: "turn",
                gameId: this.gameId,
                color: color.color
            });

        }

        couch;
    }

}