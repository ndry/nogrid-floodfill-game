module $safeprojectname$.Client {
    export class Level01 extends Phaser.State {

        preload(): void {
            super.preload();

            this.load.image('map1', './assets/maps/map1.png');
            this.load.image('map1-mask', './assets/maps/map1-mask.png');
        }

        map: Phaser.Sprite;
        mapMaskBmd: Phaser.BitmapData;

        player: Player;

        treeColors: TreeColor[];
        trees: Tree[];

        create() {
            this.physics.startSystem(Phaser.Physics.ARCADE);

            this.map = this.add.sprite(0, 0, 'map1');
            
            this.mapMaskBmd = this.game.make.bitmapData(this.map.width, this.map.height);
            this.mapMaskBmd.draw('map1-mask', 0, 0);
            this.mapMaskBmd.update();

            this.player = new Player(this.game, this.world.centerX, this.world.centerX);
            this.player.anchor.setTo(0, 5);

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
                let size = 4 + 10 * Math.random();
                let color = getRandomElement(this.treeColors);

                let maskAllowed = this.mapMaskBmd.getPixel32(x, y) === 4278190080;
                let treesAllowed = this.trees
                    .filter(t => t.position.distance(new Phaser.Point(x, y)) < (t.size + size))
                    .length === 0;

                if (maskAllowed && treesAllowed) {
                    failedCount = 0;
                    let tree = new Tree(this.game, x, y, color, size);

                    this.trees.push(tree);
                } else {
                    failedCount++;
                }

            }
            this.trees[0].owner = this.player;


            this.game.debug.text("Use Right and Left arrow keys to move the bat", 0, this.world.height, "red");
        }
    }

}