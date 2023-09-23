import crypto from 'crypto';
import {publicDirectory} from '../config';
import {promisify} from 'util';
import fs from 'fs';
export default class Utils {
    // Function to generate a random ID
    static generateRandomId = (length: number) => {
        return crypto.randomBytes(length).toString('hex');
    };

    static generateFilePath = (fileId: string, fileName: string) => {
        return `${publicDirectory}/${fileId}-${fileName}`;
    };

    static getFileDetails = promisify(fs.stat);
}
