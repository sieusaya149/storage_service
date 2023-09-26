import {Request} from 'express';
import {FileMetaData} from '../database/model/Files';
import Utils from '../utils/utils';
// import removeChunksFS from "./removeChunksFS";
import fs from 'fs';
import CipherCrypto from './cryptoAes';
import {secretKeyCipher} from '../config';
import Thumbnail from '../database/model/Thumbnails';
import {ThumbnailRepo} from '../database/repository/ThumbnailRepo';

export const executeUploadStream = <T>(
    inputSteam: any,
    outputStream: any,
    req: Request,
    filePath: string,
    allStreamsToCatchError: any[]
) => {
    return new Promise<T>((resolve, reject) => {
        allStreamsToCatchError.forEach((currentStream: any) => {
            currentStream.on('error', (e: Error) => {
                // TODO should remove file if upload failure

                reject({
                    message: 'Await Stream Input Error',
                    code: 500,
                    error: e
                });
            });
        });

        req.on('aborted', () => {
            // TODO should remove file if upload failure
        });

        inputSteam.pipe(outputStream).on('finish', (data: T) => {
            resolve(data);
        });
    });
};

export const generateThumbnailStream = (
    fileName: string,
    metaData: FileMetaData
) => {
    return new Promise((resolve, reject) => {
        // create thumbnail
        const thumbnailFileId = Utils.generateRandomId(10);
        const thumbnailFilePath = Utils.generateFilePath(
            thumbnailFileId,
            fileName,
            'thumbnail'
        );
        const readStream = fs.createReadStream(metaData.filePath);
        const decipher = CipherCrypto.generateDecipher(
            secretKeyCipher,
            metaData.IV
        );
        const writeThumbnailStream = fs.createWriteStream(thumbnailFilePath);
        readStream.on('error', (e: Error) => {
            console.log('read thumbnail error', e);
            reject('read thumbnail error');
        });

        decipher.on('error', (e: Error) => {
            console.log('Get thumbnail decipher error', e);
            reject('Get thumbnail decipher error');
        });

        writeThumbnailStream.on('error', (e: Error) => {
            console.log('write thumbnail error', e);
            reject('write thumbnail error');
        });

        try {
            const {IV, cipher} = CipherCrypto.generateCipher(secretKeyCipher);
            writeThumbnailStream.on('finish', async () => {
                const now = new Date();
                const thumbnail: Thumbnail = {
                    name: Utils.getFileNameFromFilePath(thumbnailFilePath),
                    owner: metaData.owner,
                    path: thumbnailFilePath,
                    IV: IV,
                    createdAt: now,
                    updatedAt: now
                };
                const newThumbnail = await ThumbnailRepo.create(thumbnail);
                return resolve(newThumbnail);
            });
            readStream.pipe(decipher).pipe(cipher).pipe(writeThumbnailStream);
        } catch (error) {
            reject('Issue Happen When Getting');
        }
    });
};
