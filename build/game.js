var $safeprojectname$;
(function ($safeprojectname$) {
    var Client;
    (function (Client) {
        class GameEngine extends Phaser.Game {
            constructor() {
                super(888 + 100, 804, Phaser.AUTO, 'content', null);
                this.state.add('Boot', Client.Boot, false);
                this.state.add('Preloader', Client.Preloader, false);
                this.state.add('MainMenu', Client.MainMenu, false);
                this.state.add('Level01', Client.Level01, false);
                this.state.add('HostGame', Client.HostGame, false);
                this.state.add('JoinGame', Client.JoinGame, false);
                this.state.start('Boot');
            }
        }
        Client.GameEngine = GameEngine;
    })(Client = $safeprojectname$.Client || ($safeprojectname$.Client = {}));
})($safeprojectname$ || ($safeprojectname$ = {}));
window.onload = () => {
    new $safeprojectname$.Client.GameEngine();
};
var $safeprojectname$;
(function ($safeprojectname$) {
    var Client;
    (function (Client) {
        class Player {
            constructor(game, color) {
                this.game = game;
                this.color = color;
                this.baseTrees = [];
            }
            walkTrees(fn) {
                const visited = new Set();
                const queue = this.baseTrees.slice();
                while (queue.length > 0) {
                    const tree = queue.shift();
                    if (visited.has(tree)) {
                        continue;
                    }
                    visited.add(tree);
                    fn(tree)
                        .forEach(t => queue.push(t));
                }
            }
            turn(color) {
                this.walkTrees(tree => {
                    tree.owner = this;
                    tree.color = color;
                    return tree.neighbours
                        .filter(t => (t.color === color && t.owner === null) || (t.owner === this));
                });
            }
            score(color) {
                let score = 0;
                this.walkTrees(tree => {
                    score += tree.score;
                    return tree.neighbours
                        .filter(t => (t.color === color && t.owner === null) || (t.owner === this));
                });
                return score;
            }
        }
        Client.Player = Player;
    })(Client = $safeprojectname$.Client || ($safeprojectname$.Client = {}));
})($safeprojectname$ || ($safeprojectname$ = {}));
var $safeprojectname$;
(function ($safeprojectname$) {
    var Client;
    (function (Client) {
        class TreeColor {
            constructor(color) {
                this.color = color;
            }
        }
        Client.TreeColor = TreeColor;
        class Tree extends Phaser.Sprite {
            constructor(game, x, y, color, size) {
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
                this.bitmapData.context.arc(centerX + this.size / 2, centerY + this.size / 2, this.size, 0, Math.PI * 2);
                this.bitmapData.context.fill();
                var gradient = this.bitmapData.context.createRadialGradient(centerX - this.size / 2, centerY - this.size / 2, 0, centerX - this.size / 2, centerY - this.size / 2, this.size * 4);
                gradient.addColorStop(0, this.color.color);
                gradient.addColorStop(1, 'black');
                this.bitmapData.context.beginPath();
                this.bitmapData.context.fillStyle = gradient;
                this.bitmapData.context.strokeStyle = this.owner ? this.owner.color : "#000000";
                this.bitmapData.context.lineWidth = this.owner ? 2 : 1;
                this.bitmapData.context.arc(centerX, centerY, this.size, 0, Math.PI * 2);
                this.bitmapData.context.fill();
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
        Client.Tree = Tree;
    })(Client = $safeprojectname$.Client || ($safeprojectname$.Client = {}));
})($safeprojectname$ || ($safeprojectname$ = {}));
var $safeprojectname$;
(function ($safeprojectname$) {
    var Client;
    (function (Client) {
        class Boot extends Phaser.State {
            preload() {
            }
            create() {
                this.stage.setBackgroundColor(0x000000);
                this.input.maxPointers = 1;
                this.stage.disableVisibilityChange = true;
                this.game.state.start('Preloader', true, false);
            }
        }
        Client.Boot = Boot;
    })(Client = $safeprojectname$.Client || ($safeprojectname$.Client = {}));
})($safeprojectname$ || ($safeprojectname$ = {}));
var $safeprojectname$;
(function ($safeprojectname$) {
    var Client;
    (function (Client) {
        class Level01 extends Phaser.State {
            preload() {
                super.preload();
                this.load.image('map1', './assets/maps/map1.png');
                this.load.image('map1-mask', './assets/maps/map1-mask.png');
            }
            static generateTrees(game, map, mapMaskBmd, treeColors, players) {
                const trees = [];
                let failedCount = 0;
                while (failedCount < 500) {
                    const x = Math.floor(map.x + map.width * Math.random());
                    const y = Math.floor(map.y + map.height * Math.random());
                    const size = 8 + 20 * Math.random() * Math.random() * Math.random();
                    const color = Client.getRandomElement(treeColors);
                    const maskAllowed = mapMaskBmd.getPixel32(x, y) === 4278190080;
                    const treesAllowed = trees
                        .filter(t => t.position.distance(new Phaser.Point(x, y)) < (t.size + size))
                        .length ===
                        0;
                    if (maskAllowed && treesAllowed) {
                        failedCount = 0;
                        const tree = new Client.Tree(game, x, y, color, size);
                        trees.push(tree);
                    }
                    else {
                        failedCount++;
                    }
                }
                players.forEach(player => {
                    const tree = Client.getRandomElement(trees);
                    player.baseTrees.push(tree);
                    tree.owner = player;
                });
                return trees;
            }
            static processTrees(trees) {
                trees.forEach(tree => {
                    const closeTrees = trees
                        .filter(t => tree !== t && t.position.distance(tree.position) - (t.size + tree.size) < 24)
                        .sort((at, bt) => tree.position.distance(at.position) - tree.position.distance(bt.position));
                    let hiddenTrees = [];
                    for (let i = 0; i < closeTrees.length; i++) {
                        const t = closeTrees[i];
                        const dt = t.position.clone().subtract(tree.position.x, tree.position.y);
                        const at = Math.asin(t.size / dt.getMagnitude());
                        hiddenTrees = hiddenTrees.concat(closeTrees
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
                this.humanPlayer = new Client.Player(this.game, "red");
                this.players = [this.humanPlayer, new Client.Player(this.game, "blue")];
                this.treeColors = [
                    new Client.TreeColor("green"),
                    new Client.TreeColor("yellow"),
                    new Client.TreeColor("white"),
                    new Client.TreeColor("orange"),
                    new Client.TreeColor("pink")
                ];
                this.trees = Level01.generateTrees(this.game, this.map, this.mapMaskBmd, this.treeColors, this.players);
                Level01.processTrees(this.trees);
                this.fullScore = this.trees.map(t => t.score).reduce((p, c) => p + c, 0);
                this.players.forEach(player => {
                    player.turn(player.baseTrees[0].color);
                });
                this.playerScores = this.players.map((player, i) => this.game.add.text(this.game.width - 80, 10 + i * 25, (player.score(null) / this.fullScore * 100).toPrecision(2) + "%", { font: "20px Tahoma", fill: player.color, align: "right" }));
                this.treeColorButtons = this.treeColors.map((color, i) => {
                    const bitmapData = this.game.add.bitmapData(50, 50);
                    bitmapData.context.beginPath();
                    bitmapData.context.fillStyle = color.color;
                    bitmapData.context.rect(0, 0, bitmapData.width, bitmapData.height);
                    bitmapData.context.fill();
                    this.game.cache.addBitmapData("btn" + i, bitmapData);
                    const btn = this.game.add.sprite(this.game.width - 80, 100 + i * 70, bitmapData);
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
            playerTurn(color) {
                this.humanPlayer.turn(color);
                this.players[1].turn(Client.getRandomElement(this.treeColors));
                this.players.map((player, i) => this.playerScores[i].text = (player.score(null) / this.fullScore * 100).toPrecision(2) + "%");
            }
        }
        Client.Level01 = Level01;
    })(Client = $safeprojectname$.Client || ($safeprojectname$.Client = {}));
})($safeprojectname$ || ($safeprojectname$ = {}));
var $safeprojectname$;
(function ($safeprojectname$) {
    var Client;
    (function (Client) {
        class MainMenu extends Phaser.State {
            preload() {
                super.preload();
                this.load.image('singlePlayerBtn', './assets/ui/singlePlayerBtn.png');
                this.load.image('hostGameBtn', './assets/ui/hostGameBtn.png');
                this.load.image('joinGameBtn', './assets/ui/joinGameBtn.png');
            }
            create() {
                this.singlePlayerBtn = this.add.button(this.world.centerX, this.world.centerY - 70, "singlePlayerBtn", () => this.game.state.start('Level01', true, false));
                this.singlePlayerBtn.anchor.set(0.5);
                this.hostGameBtn = this.add.button(this.world.centerX, this.world.centerY - 0, "hostGameBtn", () => this.game.state.start('HostGame', true, false));
                this.hostGameBtn.anchor.set(0.5);
                this.joinGameBtn = this.add.button(this.world.centerX, this.world.centerY + 70, "joinGameBtn", () => this.game.state.start('JoinGame', true, false));
                this.joinGameBtn.anchor.set(0.5);
            }
        }
        Client.MainMenu = MainMenu;
    })(Client = $safeprojectname$.Client || ($safeprojectname$.Client = {}));
})($safeprojectname$ || ($safeprojectname$ = {}));
var $safeprojectname$;
(function ($safeprojectname$) {
    var Client;
    (function (Client) {
        class Preloader extends Phaser.State {
            preload() {
                this.loaderText = this.game.add.text(this.world.centerX, 200, "Loading...", { font: "18px Arial", fill: "#FFFFFF", align: "center" });
                this.loaderText.anchor.setTo(0.5);
                this.load.image('titlepage', './assets/ui/titlePage.png');
                this.load.image('logo', './assets/ui/gameLogo.png');
                this.load.audio('click', './assets/sounds/click.ogg', true);
                this.load.atlasJSONHash('level01-sprites', './assets/sprites/level01-sprites.png', './assets/sprites/level01-sprites.json');
            }
            create() {
                var tween = this.add.tween(this.loaderText).to({ alpha: 0 }, 20, Phaser.Easing.Linear.None, true);
                tween.onComplete.add(this.startMainMenu, this);
            }
            startMainMenu() {
                this.game.state.start('MainMenu', true, false);
            }
        }
        Client.Preloader = Preloader;
    })(Client = $safeprojectname$.Client || ($safeprojectname$.Client = {}));
})($safeprojectname$ || ($safeprojectname$ = {}));
var $safeprojectname$;
(function ($safeprojectname$) {
    var Client;
    (function (Client) {
        function getRandomElement(array) {
            return array[Math.floor(Math.random() * array.length)];
        }
        Client.getRandomElement = getRandomElement;
    })(Client = $safeprojectname$.Client || ($safeprojectname$.Client = {}));
})($safeprojectname$ || ($safeprojectname$ = {}));
var $safeprojectname$;
(function ($safeprojectname$) {
    var Client;
    (function (Client) {
        class HostGame extends Phaser.State {
            preload() {
                super.preload();
                this.load.image('map1', './assets/maps/map1.png');
                this.load.image('map1-mask', './assets/maps/map1-mask.png');
            }
            create() {
                this.gameId = uuidv4();
                const gidEl = document.getElementById("game-id");
                gidEl.value = this.gameId;
                this.physics.startSystem(Phaser.Physics.ARCADE);
                this.map = this.add.sprite(0, 0, 'map1');
                this.mapMaskBmd = this.game.make.bitmapData(this.map.width, this.map.height);
                this.mapMaskBmd.draw('map1-mask', 0, 0);
                this.mapMaskBmd.update();
                this.players = [new Client.Player(this.game, "red"), new Client.Player(this.game, "blue")];
                this.currentPlayerIndex = 0;
                this.thisPlayerIndex = 1;
                this.treeColors = [
                    new Client.TreeColor("green"),
                    new Client.TreeColor("yellow"),
                    new Client.TreeColor("white"),
                    new Client.TreeColor("orange"),
                    new Client.TreeColor("pink")
                ];
                this.trees = Client.Level01.generateTrees(this.game, this.map, this.mapMaskBmd, this.treeColors, this.players);
                this.couch = nano({
                    url: 'https://couchdb-6aa960.smileupps.com',
                    cors: true
                });
                const db = this.couch.use("nogrid-floodfill-game");
                db.insert({
                    _id: this.gameId,
                    type: "game",
                    trees: this.trees.map(tree => ({
                        x: tree.x,
                        y: tree.y,
                        size: tree.size,
                        color: tree.color.color,
                        owner: tree.owner ? tree.owner.color : null
                    }))
                });
                Client.Level01.processTrees(this.trees);
                this.fullScore = this.trees.map(t => t.score).reduce((p, c) => p + c, 0);
                this.players.forEach(player => {
                    player.turn(player.baseTrees[0].color);
                });
                this.playerScores = this.players.map((player, i) => this.game.add.text(this.game.width - 90, 10 + i * 25, (this.currentPlayerIndex === i ? "> " : "") +
                    (player.score(null) / this.fullScore * 100).toFixed(2) +
                    "%", { font: "20px Tahoma", fill: player.color, align: "right" }));
                this.treeColorButtons = this.treeColors.map((color, i) => {
                    const bitmapData = this.game.add.bitmapData(50, 50);
                    bitmapData.context.beginPath();
                    bitmapData.context.fillStyle = color.color;
                    bitmapData.context.rect(0, 0, bitmapData.width, bitmapData.height);
                    bitmapData.context.fill();
                    this.game.cache.addBitmapData("btn" + i, bitmapData);
                    const btn = this.game.add.sprite(this.game.width - 80, 100 + i * 70, bitmapData);
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
                this.treeColorButtons.forEach(btn => btn.visible = this.currentPlayerIndex === this.thisPlayerIndex);
            }
            poll() {
                const db = this.couch.use("nogrid-floodfill-game");
                db.changes({
                    feed: "longpoll",
                    include_docs: true,
                    filter: "main/turns",
                    gameId: this.gameId,
                    since: this.lastSeq || 0
                }, (err, body) => {
                    setTimeout(this.poll.bind(this));
                    if (err) {
                        console.log(err);
                        return;
                    }
                    body.results.forEach(result => {
                        this.applyTurn(result.doc.color);
                    });
                    this.lastSeq = body.last_seq;
                    this.treeColorButtons.forEach(btn => btn.visible = this.currentPlayerIndex === this.thisPlayerIndex);
                });
            }
            applyTurn(colorData) {
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
            playerTurn(color) {
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
        }
        Client.HostGame = HostGame;
    })(Client = $safeprojectname$.Client || ($safeprojectname$.Client = {}));
})($safeprojectname$ || ($safeprojectname$ = {}));
var $safeprojectname$;
(function ($safeprojectname$) {
    var Client;
    (function (Client) {
        class JoinGame extends Phaser.State {
            preload() {
                super.preload();
                this.load.image('map1', './assets/maps/map1.png');
                this.load.image('map1-mask', './assets/maps/map1-mask.png');
            }
            create() {
                const gidEl = document.getElementById("game-id");
                this.gameId = gidEl.value;
                this.physics.startSystem(Phaser.Physics.ARCADE);
                this.map = this.add.sprite(0, 0, 'map1');
                this.mapMaskBmd = this.game.make.bitmapData(this.map.width, this.map.height);
                this.mapMaskBmd.draw('map1-mask', 0, 0);
                this.mapMaskBmd.update();
                this.players = [new Client.Player(this.game, "red"), new Client.Player(this.game, "blue")];
                this.currentPlayerIndex = 0;
                this.thisPlayerIndex = 0;
                this.treeColors = [
                    new Client.TreeColor("green"),
                    new Client.TreeColor("yellow"),
                    new Client.TreeColor("white"),
                    new Client.TreeColor("orange"),
                    new Client.TreeColor("pink")
                ];
                this.couch = nano({
                    url: 'https://couchdb-6aa960.smileupps.com',
                    cors: true
                });
                const db = this.couch.use("nogrid-floodfill-game");
                db.get(this.gameId, (err, body) => {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    this.trees = body.trees.map(treeData => {
                        const color = this.treeColors.find(c => c.color === treeData.color);
                        const tree = new Client.Tree(this.game, treeData.x, treeData.y, color, treeData.size);
                        if (treeData.owner) {
                            const player = this.players.find(p => p.color === treeData.owner);
                            tree.owner = player;
                            player.baseTrees.push(tree);
                        }
                        return tree;
                    });
                    Client.Level01.processTrees(this.trees);
                    this.fullScore = this.trees.map(t => t.score).reduce((p, c) => p + c, 0);
                    this.players.forEach(player => {
                        player.turn(player.baseTrees[0].color);
                    });
                    this.playerScores = this.players.map((player, i) => this.game.add.text(this.game.width - 80, 10 + i * 25, (this.currentPlayerIndex === i ? "> " : "") +
                        (player.score(null) / this.fullScore * 100).toPrecision(2) +
                        "%", { font: "20px Tahoma", fill: player.color, align: "right" }));
                });
                this.treeColorButtons = this.treeColors.map((color, i) => {
                    const bitmapData = this.game.add.bitmapData(50, 50);
                    bitmapData.context.beginPath();
                    bitmapData.context.fillStyle = color.color;
                    bitmapData.context.rect(0, 0, bitmapData.width, bitmapData.height);
                    bitmapData.context.fill();
                    this.game.cache.addBitmapData("btn" + i, bitmapData);
                    const btn = this.game.add.sprite(this.game.width - 80, 100 + i * 70, bitmapData);
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
                this.treeColorButtons.forEach(btn => btn.visible = this.currentPlayerIndex === this.thisPlayerIndex);
            }
            poll() {
                const db = this.couch.use("nogrid-floodfill-game");
                db.changes({
                    feed: "longpoll",
                    include_docs: true,
                    filter: "main/turns",
                    gameId: this.gameId,
                    since: this.lastSeq || 0
                }, (err, body) => {
                    setTimeout(this.poll.bind(this));
                    if (err) {
                        console.log(err);
                        return;
                    }
                    body.results.forEach(result => {
                        this.applyTurn(result.doc.color);
                    });
                    this.lastSeq = body.last_seq;
                    this.treeColorButtons.forEach(btn => btn.visible = this.currentPlayerIndex === this.thisPlayerIndex);
                });
            }
            applyTurn(colorData) {
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
            playerTurn(color) {
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
        }
        Client.JoinGame = JoinGame;
    })(Client = $safeprojectname$.Client || ($safeprojectname$.Client = {}));
})($safeprojectname$ || ($safeprojectname$ = {}));
//# sourceMappingURL=game.js.map