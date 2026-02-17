import CryptoJS from 'crypto-js';

const SECRET_KEY = 'YOUR_SECURE_KEY_32_CHARS_LONG!!'; // Must match mobile app

export const decryptMessage = (encryptedBody, iv) => {
    if (!iv || !encryptedBody) return encryptedBody;

    try {
        const key = CryptoJS.enc.Utf8.parse(SECRET_KEY);
        const ivParsed = CryptoJS.enc.Base64.parse(iv);

        const decrypted = CryptoJS.AES.decrypt(encryptedBody, key, {
            iv: ivParsed,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });

        const result = decrypted.toString(CryptoJS.enc.Utf8);
        return result || encryptedBody;
    } catch (error) {
        console.error("Decryption error:", error);
        return encryptedBody;
    }
};
