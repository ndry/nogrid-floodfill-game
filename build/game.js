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
                this.state.start('Level01');
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
        class Boot extends Phaser.State {
            preload() {
            }
            create() {
                this.stage.setBackgroundColor(0xFFFFFF);
                this.input.maxPointers = 1;
                this.stage.disableVisibilityChange = true;
                if (this.game.device.desktop) {
                    this.scale.pageAlignHorizontally = true;
                }
                else {
                    this.scale.minWidth = 480;
                    this.scale.minHeight = 260;
                    this.scale.maxWidth = 1024;
                    this.scale.maxHeight = 768;
                    this.scale.forceLandscape = true;
                    this.scale.pageAlignHorizontally = true;
                    this.scale.refresh();
                }
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
                this.trees = [];
                let failedCount = 0;
                while (failedCount < 500) {
                    let x = Math.floor(this.map.x + this.map.width * Math.random());
                    let y = Math.floor(this.map.y + this.map.height * Math.random());
                    let size = 8 + 20 * Math.random() * Math.random() * Math.random();
                    let color = Client.getRandomElement(this.treeColors);
                    let maskAllowed = this.mapMaskBmd.getPixel32(x, y) === 4278190080;
                    let treesAllowed = this.trees
                        .filter(t => t.position.distance(new Phaser.Point(x, y)) < (t.size + size))
                        .length ===
                        0;
                    if (maskAllowed && treesAllowed) {
                        failedCount = 0;
                        const tree = new Client.Tree(this.game, x, y, color, size);
                        this.trees.push(tree);
                    }
                    else {
                        failedCount++;
                    }
                }
                this.trees.forEach(tree => {
                    const closeTrees = this.trees
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
                this.fullScore = this.trees.map(t => t.score).reduce((p, c) => p + c, 0);
                this.players.forEach(player => {
                    player.baseTrees.push(Client.getRandomElement(this.trees));
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
            create() {
                this.background = this.add.sprite(0, 0, 'titlepage');
                this.background.alpha = 0;
                this.logo = this.add.sprite(this.world.centerX, -300, 'logo');
                this.logo.anchor.setTo(0.5);
                this.add.tween(this.background).to({ alpha: 1 }, 500, Phaser.Easing.Linear.None, true);
                this.add.tween(this.logo).to({ y: 220 }, 2000, Phaser.Easing.Elastic.Out, true, 500);
                this.game.debug.text("Click the logo to start the game", 0, this.world.height, "red");
                this.input.onDown.addOnce(this.fadeOut, this);
            }
            fadeOut() {
                this.add.audio('click', 1, false).play();
                this.add.tween(this.background).to({ alpha: 0 }, 2000, Phaser.Easing.Linear.None, true);
                var tween = this.add.tween(this.logo).to({ y: 800 }, 2000, Phaser.Easing.Linear.None, true);
                tween.onComplete.add(this.startGame, this);
            }
            startGame() {
                this.game.state.start('Level01', true, false);
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
                this.loaderText = this.game.add.text(this.world.centerX, 200, "Loading...", { font: "18px Arial", fill: "#A9A91111", align: "center" });
                this.loaderText.anchor.setTo(0.5);
                this.load.image('titlepage', './assets/ui/titlePage.png');
                this.load.image('logo', './assets/ui/gameLogo.png');
                this.load.audio('click', './assets/sounds/click.ogg', true);
                this.load.atlasJSONHash('level01-sprites', './assets/sprites/level01-sprites.png', './assets/sprites/level01-sprites.json');
            }
            create() {
                var tween = this.add.tween(this.loaderText).to({ alpha: 0 }, 2000, Phaser.Easing.Linear.None, true);
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
//# sourceMappingURL=game.js.map