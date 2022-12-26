import {roundUp} from "../maths";

describe('Test the roundUp function', () => {
    test('Round float to int', () => {
        const num = roundUp(1.2, 0);
        expect(num).toEqual(2);
    });
    test('Round money [up] to 2 decimal places', () => {
        const num = roundUp(1.12345, 2);
        expect(num).toEqual(1.13);
    });
});
