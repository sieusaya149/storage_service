import {Request, Response} from 'express';
import {Types} from 'mongoose';
import {BadRequestError} from '../core/ApiError';
import Logger from '../helpers/Logger';
import {secretKeyCipher} from '../config';
import Utils from '../utils/utils';
import fs from 'fs';
import Busboy from 'busboy';
import BusboyService from '../helpers/busboyHandler';
import StreamHandler from '../helpers/streamHandler';
import {File, FileMetaData} from '../database/model/Files';
import FileRepo from '../database/repository/FileRepo';
import CipherCrypto from '../helpers/cryptoAes';
import {videoChecker, imageChecker} from '../utils/fileChecker';
import Thumbnail from '~/database/model/Thumbnails';
import {DownloaderFactory} from '~/helpers/Dowloader';

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
                await BusboyService.getBusboyData(busboy);
            const parent = formData.get('parent') || 'root';
            const size = formData.get('size') || -1;

            const filePath = Utils.generateFilePath(fileId, fileName);

            const fileWriteStream = fs.createWriteStream(filePath);

            const listStream = [file, cipher, fileWriteStream];

            await StreamHandler.uploadGenFileStream(
                file.pipe(cipher),
                fileWriteStream,
                req,
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
                const newThumbnail =
                    (await StreamHandler.thumbnailsGenFileStream(
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
            const fileData = await FileRepo.getFileById(newFileData._id);
            if (!fileData) {
                throw new Error('No information about the file added');
            }
            return {fileData: fileData};
        } catch (error) {
            Logger.error(`Error happen in upload api :: ${error}`);
            req.destroy();
            throw new BadRequestError();
        }
    };

    static downloadFile = async (req: Request, res: Response) => {
        const {fileId} = req.params;
        const src = req.query.src as string;

        const fileData = await FileRepo.getFileById(new Types.ObjectId(fileId));
        // for dowloading file, we should write data to response stream
        // ReadFile => Decipher => Response
        // FIXME should be check more condition for downloading file
        if (!fileData) {
            throw new BadRequestError('The file does not exist');
        }
        try {
            const downloader = new DownloaderFactory(
                src || 'disk'
            ).createDowloader();
            if (!downloader) {
                throw new BadRequestError('Can not create downloader');
            }
            await downloader.download(res, fileData);
        } catch (error) {
            Logger.error(`Download File Error File Route: ${error}`);
            throw new BadRequestError('\nDownload File Error File Route');
        }
    };
}