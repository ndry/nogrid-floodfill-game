module $safeprojectname$.Client {

    export class Player {
        game: Phaser.Game;
        color: string;
        baseTrees: Tree[];

        constructor(game: Phaser.Game) {
            this.game = game;
            this.color = "red";

            this.baseTrees = [];
        }

        turn(color: TreeColor) {
            let visited = new Set<Tree>();
            let queue = this.baseTrees.slice();

            while (queue.length > 0) {
                const tree = queue.shift();

                if (visited.has(tree)) {
                    continue;
                }

                visited.add(tree);

                tree.owner = this;
                tree.color = color;

                tree.neighbours
                    .filter(t => (t.color === color && t.owner === null) || (t.owner === this))
                    .forEach(t => queue.push(t));
            }
        }
    }

}