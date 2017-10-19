export class ChunkMap<T> {
    chunkSide: number;
    chunks: T[][][] = [];

    constructor(chunkSide: number) {
        this.chunkSide = chunkSide;
    }

    getCloseEntries = function* (x: number, y: number, radius: number = 1): IterableIterator<T> {
        const cx = Math.floor(x / this.chunkSide);
        const cy = Math.floor(y / this.chunkSide);

        for (let dcx = -radius; dcx <= radius; dcx++) {
            for (let dcy = -radius; dcy <= radius; dcy++) {
                const chunk = (this.chunks[cx + dcx] || [])[cy + dcy] || [];
                for (let entry of chunk) {
                    yield entry;
                }
            }
        }
    }

    getAllEntries = function* (): IterableIterator<T> {
        for (let c1 of this.chunks) {
            for (let c2 of (c1 || [])) {
                for (let entry of (c2 || [])) {
                    yield entry;
                }
            }
        }
    }

    putEntry(x: number, y: number, entry: T) {
        const cx = Math.floor(x / this.chunkSide);
        const cy = Math.floor(y / this.chunkSide);
        const chunk = (this.chunks[cx] || (this.chunks[cx] = []))[cy] || (this.chunks[cx][cy] = []);
        chunk.push(entry);
    }
}
