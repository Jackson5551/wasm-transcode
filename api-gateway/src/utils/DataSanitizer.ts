/**
 * Utility class for sanitizing and filtering incoming data objects.
 *
 * The DataSanitizer provides generic, type-safe methods for extracting only
 * the allowed fields from untrusted or loosely-typed sources like request bodies.
 */
class DataSanitizer {
    /**
     * Filters an object to only include keys specified in `allowedKeys`.
     *
     * @template T - The expected shape of the filtered result.
     * @param data - The raw input object (e.g., request body).
     * @param allowedKeys - An array of keys that should be preserved in the output.
     * @returns A new object containing only the allowed keys, typed as `T`.
     *
     * @example
     * ```ts
     * interface UserInput {
     *   email: string;
     *   role: string[];
     * }
     *
     * const raw = { email: 'test@example.com', role: ['admin'], extra: 'nope' };
     * const safe = DataSanitizer.filterAllowedKeys<UserInput>(raw, ['email', 'role']);
     * // safe = { email: 'test@example.com', role: ['admin'] }
     * ```
     */
    static filterAllowedKeys<T extends object>(
        data: Partial<Record<string, unknown>>,
        allowedKeys: (keyof T)[]
    ): T {
        return Object.fromEntries(
            Object.entries(data).filter(([key]) => allowedKeys.includes(key as keyof T))
        ) as T;
    }

    /**
     * Extracts the domain part from a valid email address.
     *
     * @param email - The email address to parse.
     * @returns The domain portion of the email (after the "@") in lowercase,
     *          or `null` if the email is not valid.
     *
     * @example
     * ```ts
     * getEmailDomain("janedoe@example.com"); // returns "example.com"
     * getEmailDomain("invalid-email"); // returns null
     * ```
     */
    static getEmailDomain(email: string): string | null {
        if (!/^[^@]+@[^@]+\.[^@]+$/.test(email)) return null;
        return email.split('@')[1].toLowerCase();
    }
}

export default DataSanitizer;