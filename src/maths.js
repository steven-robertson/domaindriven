/**
 * @param num {number}
 * @param precision {number}
 * @return {number}
 */
export function roundUp(num, precision) {
    // https://stackoverflow.com/a/5191133
    precision = Math.pow(10, precision)
    return Math.ceil(num * precision) / precision
}
