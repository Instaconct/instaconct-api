export declare class Hash {
    hashPassword(password: string): Promise<string>;
    comparePassword(password: string, hash: string): Promise<boolean>;
    generateRandomString(length?: number): Promise<string>;
}
