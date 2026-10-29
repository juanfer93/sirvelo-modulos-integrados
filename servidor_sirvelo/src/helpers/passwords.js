import crypto from "node:crypto";

const KEY_LENGTH = 64;
const SCRYPT_OPTIONS = { N: 16384, r: 8, p: 1 };

export function hashPassword(password, salt) {
    return crypto.scryptSync(password, salt, KEY_LENGTH, SCRYPT_OPTIONS).toString("hex");
}

export function verifyPassword(password, storedHash, salt) {
    if (!storedHash) return false;

    const expected = Buffer.from(storedHash, "hex");
    const received = Buffer.from(hashPassword(password, salt), "hex");
    return expected.length === received.length && crypto.timingSafeEqual(expected, received);
}
