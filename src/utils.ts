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

export function stringFromException( e: any ): string {
    if (typeof e === "string") return e;
    else if (
        typeof e === "object"
        && e !== null
        && "message" in e
    ) return e.message;
    return "Unknown exception";
};