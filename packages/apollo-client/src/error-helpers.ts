export function getErrorString(error: any): string | undefined {
    if (error) {
        if (Array.isArray(error)) {
            let s = "";
            for (let i of (error as [])) {
                if (s) s += "\n";
                s += getErrorString(i);
            }
            return s;
        }

        if (typeof error !== 'string') {
            error = error.message;
        }

        return error;
    }
    return undefined;
}