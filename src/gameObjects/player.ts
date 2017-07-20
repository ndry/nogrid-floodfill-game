module $safeprojectname$.Client {

    export class Player {
        game: Phaser.Game;
        color: string;
        baseTrees: Tree[];

        constructor(game: Phaser.Game, color: string) {
            this.game = game;

            this.color = color;
            this.baseTrees = [];
        }

        walkTrees(fn: (tree: Tree) => Tree[]) {
            const visited = new Set<Tree>();
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

        turn(color: TreeColor) {
            this.walkTrees(tree => {
                tree.owner = this;
                tree.color = color;

                return tree.neighbours
                    .filter(t => (t.color === color && t.owner === null) || (t.owner === this));
            });
        }

        score(color: TreeColor) {
            let score = 0;
            this.walkTrees(tree => {
                score += tree.score;
                
                return tree.neighbours
                    .filter(t => (t.color === color && t.owner === null) || (t.owner === this));
            });
            return score;
        }
    }

}