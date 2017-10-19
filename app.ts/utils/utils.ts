export function getRandomElement<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
}

export const flood = function* <TElement extends { neighbours: Set<TElement> }>(baseElements: TElement[], neighbourSelector: (element: TElement) => boolean)
    : IterableIterator<{ element: TElement, step: number }> {

    const queue = new Array<{ element: TElement, step: number }>();
    const everQueued = new Set<TElement>();

    function enqueueUnique(element: TElement, step: number) {
        if (!everQueued.has(element)) {
            queue.push({element, step});
            everQueued.add(element);
        }
    }

    baseElements
        .forEach(t => enqueueUnique(t, 0));
    
    while (queue.length > 0) {
        const entry = queue.shift();

        yield entry;

        const {element, step} = entry;
        for (const t of element.neighbours) {
            if (neighbourSelector(t)) {
                 enqueueUnique(t, step + 1);
            }
        }
    }
} 