module $safeprojectname$.Client {

    export class Player_obs {
        game: Phaser.Game;
        color: string;
        baseTrees: $safeprojectname$.Client.Tree_obs[];

        constructor(game: Phaser.Game, color: string) {
            this.game = game;

            this.color = color;
            this.baseTrees = [];
        }

        walkTrees(fn: (tree: $safeprojectname$.Client.Tree_obs, step: number) => $safeprojectname$.Client.Tree_obs[]) {
            const visited = new Set<$safeprojectname$.Client.Tree_obs>();
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
                tree.switchStart = this.game.time.time;
                if (tree.owner === this) {
                    tree.switchOrder = -1;
                    tree.blinkOrder = step;
                } else {
                    tree.switchOrder = step;
                    tree.blinkOrder = -1;
                    tree.owner = this;
                }
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