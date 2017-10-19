import _ from 'lodash';

import { getRandomElement, flood } from '../utils/utils';
import { ChunkMap } from '../utils/chunkMap';

import Point = Phaser.Point;

export type Color = string;

export interface Tree {
    x: number;
    y: number;
    size: number;
    color: Color;
    neighbours: Set<Tree>;
}

export interface Player {
    color: Color
    baseTrees: Tree[];
}

export interface Board {
    neutralColors: Set<Color>;
    trees: Tree[];
    players: Player[];
    currentPlayerIndex: number;
    lastColors: Color[];
}




export function getTreeScore(tree: Tree): number {
    return Math.PI * Math.pow(tree.size, 2);
}

export function distCenter(a: Tree, b: Tree) {
    return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
}

export function distBorder(a: Tree, b: Tree) {
    return distCenter(a, b) - a.size - b.size;
}

export function areOverlapped(a: Tree, b: Tree) {
    return distBorder(a, b) < 0;
}



export function createBoard(
    width: number,
    height: number,
    isForestable: (x: number, y: number) => boolean,
    neutralColors: Set<Color>,
    playerColors: Color[],
    options = {
        chunkSide: 100,
        sizeMin: 8,
        sizeMax: 38,
        failedMax: 750,
        connectionDistanceFactor: 2.5
    }): Board {

    const trees = (() => {
        const trees = new ChunkMap<Tree>(options.chunkSide);

        let failedCount = 0;
        while (failedCount < options.failedMax) {
            const tree: Tree = {
                x: Math.floor(width * Math.random()),
                y: Math.floor(height * Math.random()),
                size: Math.floor(
                    options.sizeMin + 
                    (options.sizeMax - options.sizeMin)
                    * Math.random() * Math.random() * Math.random() * Math.random()),
                color: getRandomElement([...neutralColors]),
                neighbours: new Set<Tree>()
            };

            const freeSpot = _([...trees.getCloseEntries(tree.x, tree.y)])
                .every(t => !areOverlapped(tree, t));

            if (freeSpot && isForestable(tree.x, tree.y)) {
                failedCount = 0;
                trees.putEntry(tree.x, tree.y, tree);
            } else {
                failedCount++;
            }
        }

        return [...trees.getAllEntries()];
    })();

    for (const tree of trees) {
        const closeTrees = trees
            .filter(t => tree !== t && distCenter(t, tree) < options.connectionDistanceFactor * (t.size + tree.size))
            .sort((at, bt) => distCenter(tree, at) - distCenter(tree, bt));

        let hiddenTrees = new Set<Tree>();

        for (let i = 0; i < closeTrees.length; i++) {
            const t = closeTrees[i];

            const dt = new Point(t.x - tree.x, t.y - tree.y);
            const at = Math.asin(t.size / dt.getMagnitude());

            closeTrees
                .slice(i + 1)
                .filter(t2 => {

                    const dt2 = new Point(t2.x - tree.x, t2.y - tree.y);
                    const at2 = Math.asin(t2.size / dt2.getMagnitude());

                    const minAllowedAngle = at + at2;

                    var a = Math.acos(dt.dot(dt2) / (dt.getMagnitude() * dt2.getMagnitude()));

                    return a < minAllowedAngle;
                })
                .forEach(t2 => hiddenTrees.add(t2));
        }


        closeTrees
            .filter(t => !hiddenTrees.has(t))
            .forEach(t => {
                tree.neighbours.add(t);
                t.neighbours.add(tree);
            });
    }
    
    const players = playerColors.map(c => ({ color: c, baseTrees: [] }));
    players.forEach(player => {
        const tree = getRandomElement(trees.filter(t => players.every(p => p.color !== t.color)));
        tree.color = player.color;
        player.baseTrees.push(tree);
    });


    return {
        neutralColors: neutralColors,
        trees: trees,
        players: players,
        currentPlayerIndex: 0,
        lastColors: []
    };
}

export function applyTurn(board: Board, color: Color) {
    const player = board.players[board.currentPlayerIndex];

    for (const { element: tree, step } of flood(
        player.baseTrees,
        t => (t.color === color || t.color === player.color)
    )) {  
        // tree.colorWaves.push({
        //     start: this.game.time.time,
        //     step: step,
        //     color: color, 
        //     justOwned: tree.color !== player.color
        // });
        if (tree.color !== player.color) {
            tree.color = player.color;
            //tree.highlightColor = player.color;
        }
    }

    const reachable = new Set<Tree>();
    for (const p of board.players) {
        if (p === player) {
            continue;
        }
        for (const { element: tree } of flood(p.baseTrees, t => (board.neutralColors.has(t.color)) || (t.color === p.color))) {
            reachable.add(tree);
        }
    }

    for (const { element: tree, step } of flood(
        player.baseTrees,
        t => !reachable.has(t)
    )) {  
        // tree.colorWaves.push({
        //     start: this.game.time.time,
        //     step: step,
        //     color: color, 
        //     justOwned: tree.color !== player.color
        // });
        if (tree.color !== player.color) {
            tree.color = player.color;
            //tree.highlightColor = player.color;
        }
    }

    board.currentPlayerIndex = (board.currentPlayerIndex + 1) % board.players.length;
    board.lastColors.push(color);
    while (board.lastColors.length > board.players.length) {
        board.lastColors.shift();
    }
}

export function highlightTurn(board: Board, color: Color) {
    // todo
}

export function getPlayerScore(board: Board, player: Player, color: Color) {
    return _([...flood(
        player.baseTrees,
        t => (t.color === color || t.color === player.color))])
    .map(({ element: tree }) => getTreeScore(tree))    
    .sum();
}
