export class Color {
    red: number;
    green: number;
    blue: number;
    alpha: number;
    constructor(red: number, green: number, blue: number, alpha: number) {
        this.red = red;
        this.green = green;
        this.blue = blue;
        this.alpha = alpha;
    };
};

export class PriorityQueue {
    compareFn: any;
    heap: any;
    constructor(compareFn: any) {
        this.compareFn = compareFn;
        this.heap = [];
    };

    enqueue(element: import("@minecraft/server").Vector3) {
        this.heap.push(element);
        this.siftUp(this.heap.length - 1);
    };

    dequeue() {
        if (this.isEmpty())
            return undefined;
        if (this.heap.length === 1)
            return this.heap.pop();
        const removedValue = this.heap[0];
        this.heap[0] = this.heap.pop();
        this.siftDown(0);
        return removedValue;
    };

    isEmpty() {
        return this.heap.length === 0;
    };

    siftUp(index: number) {
        let parentIndex = this.getParentIndex(index);
        while (index > 0 && this.compareFn(this.heap[parentIndex], this.heap[index]) > 0) {
            [this.heap[parentIndex], this.heap[index]] = [this.heap[index], this.heap[parentIndex]];
            index = parentIndex;
            parentIndex = this.getParentIndex(index);
        };
    };

    siftDown(index: number) {
        let i = index;
        while (this.getLeftChildIndex(i) < this.heap.length) {
            const leftChildIndex = this.getLeftChildIndex(i);
            const rightChildIndex = this.getRightChildIndex(i);
            let smallestIndex = i;
            if (leftChildIndex < this.heap.length
                && this.compareFn(this.heap[leftChildIndex], this.heap[smallestIndex]) < 0)
                smallestIndex = leftChildIndex;
            if (rightChildIndex < this.heap.length
                && this.compareFn(this.heap[rightChildIndex], this.heap[smallestIndex]) < 0)
                smallestIndex = rightChildIndex;
            if (smallestIndex !== i) {
                [this.heap[i], this.heap[smallestIndex]] = [this.heap[smallestIndex], this.heap[i]];
                i = smallestIndex;
            }
            else
                break;
        };
    };

    getParentIndex(index: number) {
        return Math.floor((index - 1) / 2);
    };

    getLeftChildIndex(index: number) {
        return index * 2 + 1;
    };

    getRightChildIndex(index: number) {
        return index * 2 + 2;
    };
};