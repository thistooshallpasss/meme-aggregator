import { applyCursorPagination } from '../../src/utils/pagination';
import { TokenData } from '../../src/types';

// Sample data (sorted by volume_sol descending)
const mockTokens: TokenData[] = [
    { token_address: 'A', token_ticker: 'A', volume_sol: 1000 } as TokenData,
    { token_address: 'B', token_ticker: 'B', volume_sol: 800 } as TokenData,
    { token_address: 'C', token_ticker: 'C', volume_sol: 600 } as TokenData,
    { token_address: 'D', token_ticker: 'D', volume_sol: 400 } as TokenData,
    { token_address: 'E', token_ticker: 'E', volume_sol: 200 } as TokenData,
];

describe('Cursor Pagination Utility Tests', () => {

    // Helper function to encode address to cursor
    const encode = (address: string) => Buffer.from(address).toString('base64');

    test('should return the first page correctly', () => {
        const result = applyCursorPagination(mockTokens, 2, undefined);

        expect(result.data.length).toBe(2);
        expect(result.data[0].token_ticker).toBe('A');
        expect(result.data[1].token_ticker).toBe('B');

        // Next cursor should point to the last element of the current page (B)
        expect(result.next_cursor).toBe(encode('B'));
    });

    test('should return the second page using cursor', () => {
        const cursorB = encode('B'); // Cursor is the address of token B

        const result = applyCursorPagination(mockTokens, 2, cursorB);

        expect(result.data.length).toBe(2);
        expect(result.data[0].token_ticker).toBe('C');
        expect(result.data[1].token_ticker).toBe('D');

        expect(result.next_cursor).toBe(encode('D'));
    });

    test('should handle the last page correctly', () => {
        const cursorD = encode('D');

        const result = applyCursorPagination(mockTokens, 2, cursorD);

        expect(result.data.length).toBe(1); // Only token E remains
        expect(result.data[0].token_ticker).toBe('E');

        expect(result.next_cursor).toBeNull(); // No next page
    });

    test('should handle limit larger than array size', () => {
        const result = applyCursorPagination(mockTokens, 50, undefined);
        expect(result.data.length).toBe(5);
        expect(result.next_cursor).toBeNull();
    });
});