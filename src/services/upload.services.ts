import {Request, Response} from 'express';
import {Types} from 'mongoose';
import {
    AuthFailureError,
    InternalError,
    BadRequestError,
    NotFoundError,
    ForbiddenError,
    NoEntryError,
    BadTokenError,
    TokenExpiredError,
    NoDataError,
    AccessTokenError
} from '../core/ApiError';
import Logger from '../helpers/Logger';
import {secretKeyCipher} from '../config';
import Utils from '../utils/utils';
import fs from 'fs';
import Busboy from 'busboy';
import BusboyService from '../helpers/busboyHandler';
import {
    executeUploadStream,
    generateThumbnailStream
} from '../helpers/streamHandler';
import {File, FileMetaData} from '../database/model/Files';
import FileRepo from '../database/repository/FileRepo';
import CipherCrypto from '../helpers/cryptoAes';
import {videoChecker, imageChecker} from '../utils/fileChecker';
import Thumbnail from '~/database/model/Thumbnails';

export class UploadService {
    static requestUpload = async (req: Request, res: Response) => {
        // generate file first then return to client
        const {fileName} = req.body;
        const fileId = Utils.generateRandomId(10);
        const filePath = Utils.generateFilePath(fileId, fileName);
        fs.createWriteStream(filePath, {flags: 'w'});
        return {
            fileId: fileId,
            filePath: filePath
        };
    };

    static uploadBusBoy = async (req: Request, res: Response) => {
        const contentRange = req.headers['content-range'] as string;
        const fileId = req.headers['fileid'] as string;
        const userId = req.cookies.userId;

        const match = contentRange.match(/bytes=(\d+)-(\d+)\/(\d+)/);
        if (!match) {
            throw new BadRequestError('Invalid Content Range');
        }
        const rangeStart = Number(match[1]);
        const rangeEnd = Number(match[2]);
        const fileSize = Number(match[3]);

        if (
            rangeStart >= fileSize ||
            rangeStart >= rangeEnd ||
            rangeEnd > fileSize
        ) {
            throw new BadRequestError('Invalid Content Range');
        }

        try {
            const busboy = Busboy({headers: req.headers});
            req.pipe(busboy);

            const {IV, cipher} = CipherCrypto.generateCipher(secretKeyCipher);
            const {file, formData, fileName} =
                await BusboyService.execute(busboy);

            const parent = formData.get('parent') || 'root';
            const size = formData.get('size') || 1234;

            const filePath = Utils.generateFilePath(fileId, fileName);

            const fileWriteStream = fs.createWriteStream(filePath);

            const listStream = [file, cipher, fileWriteStream];

            await executeUploadStream(
                file.pipe(cipher),
                fileWriteStream,
                req,
                filePath,
                listStream
            );

            const fileStat = await Utils.getFileDetails(filePath);
            const encryptedFileSize = fileStat.size;
            let metaData: FileMetaData = {
                owner: new Types.ObjectId(userId),
                parent: parent,
                size: size,
                IV: IV,
                filePath: filePath
            };
            const {isVideo, duration} = videoChecker(fileName, filePath);
            if (isVideo) {
                metaData = {...metaData, isVideo};
            }
            if (duration != -1) {
                metaData = {...metaData, duration};
            }
            const isImage = imageChecker(fileName);
            if (encryptedFileSize < 500 * 1024 * 1024 && isImage) {
                //create thumbnail
                const newThumbnail = (await generateThumbnailStream(
                    fileName,
                    metaData
                )) as Thumbnail;
                metaData = {
                    ...metaData,
                    hasThumbnail: true,
                    thumbnailID: newThumbnail._id
                };
            }

            const fileObj: File = {
                fileName: fileName,
                length: encryptedFileSize,
                metadata: metaData
            };
            const newFileData = await FileRepo.create(fileObj);
            const fileDataFull = await FileRepo.getFileById(newFileData._id);
            return {fileDataFull};
        } catch (error) {
            console.log(error);
            req.destroy();
            Logger.error(error);
            throw new BadRequestError();
        }
    };
}
