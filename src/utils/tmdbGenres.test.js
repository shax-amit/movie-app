/**
 * TMDB Genres Unit Test (L10 Enhancement)
 * This file demonstrates unit testing as taught in Lecture 10.
 * It verifies that the genre mapping utility correctly converts IDs to names.
 */

import { getGenreName } from './tmdbGenres';

// Mocking a simple test runner behavior if Vitest/Jest isn't running
const describe = (name, fn) => {
    console.log(`\nTesting: ${name}`);
    fn();
};

const it = (name, fn) => {
    try {
        fn();
        console.log(`  ✓ ${name}`);
    } catch (err) {
        console.error(`  ✗ ${name}`);
        console.error(`    ${err.message}`);
    }
};

const expect = (actual) => ({
    toBe: (expected) => {
        if (actual !== expected) {
            throw new Error(`Expected "${expected}" but got "${actual}"`);
        }
    }
});

describe('TMDB Genre Mapping', () => {
    it('should return "Action" for ID 28', () => {
        expect(getGenreName(28)).toBe('Action');
    });

    it('should return "Comedy" for ID 35', () => {
        expect(getGenreName(35)).toBe('Comedy');
    });

    it('should return "Unknown" for non-existent IDs', () => {
        expect(getGenreName(9999)).toBe('Unknown');
    });

    it('should return "Unknown" when no ID is provided', () => {
        expect(getGenreName()).toBe('Unknown');
    });
});
