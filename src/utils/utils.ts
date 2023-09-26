import crypto from 'crypto';
import {publicDirectory} from '../config';
import {promisify} from 'util';
import fs from 'fs';
import Logger from '../helpers/Logger';
export default class Utils {
    // Function to generate a random ID
    static generateRandomId = (length: number) => {
        return crypto.randomBytes(length).toString('hex');
    };

    static generateFilePath = (
        fileId: string,
        fileName: string,
        prefix = ''
    ) => {
        return `${publicDirectory}/${fileId}-${prefix + fileName}`;
    };

    static getFileNameFromFilePath(filePath: string) {
        const splits = filePath.split('/');
        return splits[splits.length - 1];
    }

    static removeFile = async (filePath: string) => {
        try {
            if (fs.existsSync(filePath)) {
                fs.unlink(filePath, () => {});
                console.log('File deleted successfully:', filePath);
            } else {
                console.log('File does not exist', filePath);
            }
        } catch (error) {
            console.log('Issue happen when delete file', filePath);
        }
    };

    static getFileDetails = promisify(fs.stat);
}
