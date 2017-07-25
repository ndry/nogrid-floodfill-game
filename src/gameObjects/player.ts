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

        walkTrees(fn: (tree: Tree, step: number) => Tree[]) {
            const visited = new Set<Tree>();
            const queue = this.baseTrees.map(tree => ({ tree, step: 0 }));

            while (queue.length > 0) {
                const entry = queue.shift();

                if (visited.has(entry.tree)) {
                    continue;
                }

                visited.add(entry.tree);

                fn(entry.tree, entry.step)
                    .forEach(t => queue.push({ tree: t, step: entry.step + 1 }));
            }
        }

        turn(color: TreeColor) {
            this.walkTrees((tree, step) => {
                tree.colorWaves.push({
                    start: this.game.time.time,
                    step: step,
                    color: color.color, 
                    justOwned: tree.owner !== this
                });
                if (tree.owner !== this) {
                    tree.owner = this;
                    tree.highlightColor = this.color;
                }
                tree.data.color = color;

                return tree.neighbours
                    .filter(t => (t.data.color === color && t.owner === null) || (t.owner === this));
            });
        }

        score(color: TreeColor) {
            let score = 0;
            this.walkTrees(tree => {
                score += tree.score;

                return tree.neighbours
                    .filter(t => (t.data.color === color && t.owner === null) || (t.owner === this));
            });
            return score;
        }
    }

}