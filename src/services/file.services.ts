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
import getNewIv from '~/helpers/getNewIV';
const CHUNK_SIZE = 5 * 1024 * 1024 ;
export class FileService {
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

    static streamVideo = async (req: Request, res: Response) => {
        const {fileId} = req.params;
        const fileData = await FileRepo.getFileById(new Types.ObjectId(fileId));
        if (!fileData) {
            throw new BadRequestError('The file does not exist');
        }
        if (!fileData.metadata.isVideo) {
            throw new BadRequestError('The file is not a video');
        }
        try {
            Logger.info('Starting stream video');
            const fileSize = fileData.metadata.size;
            const range = req.headers.range;
            // remove /bytes=/ in range header then split to part array by '-'
            const parts = range?.replace(/bytes=/, '').split('-');
            const start = parseInt(parts![0], 10);
            const end = parts![1] ? parseInt(parts![1], 10) : fileSize - 1;
            const chunksize = end - start + 1;
            const head = {
                'Content-Range': 'bytes ' + start + '-' + end + '/' + fileSize,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunksize,
                'Content-Type': 'video/mp4'
            };
            const fixedEnd = fileData.length;
            const readFileStream = fs.createReadStream(
                fileData.metadata.filePath,
                {
                    start: start,
                    end: fixedEnd
                }
            );
            let currentIV = null;
            if (start !== 0) {
                Logger.info(`The start is ${start} get new IV`);
                // If this isn't the first request, the way AES256 works is when you try to
                // Decrypt a certain part of the file that isn't the start, the IV will
                // Actually be the 16 bytes ahead of where you are trying to
                // Start the decryption.
                currentIV = (await getNewIv(
                    start - 16,
                    fileData.metadata.filePath!
                )) as Buffer;
                Logger.info(`new IV ${currentIV}`);
            }
            const decipherStream = CipherCrypto.generateDecipher(
                secretKeyCipher,
                currentIV || fileData.metadata.IV
            );
            decipherStream.setAutoPadding(false);

            res.writeHead(206, head);
            const allStreamsToErrorCatch = [readFileStream, decipherStream];
            readFileStream.pipe(decipherStream);
            await StreamHandler.streamVideoStream(
                readFileStream,
                decipherStream,
                req,
                res,
                allStreamsToErrorCatch
            );
            readFileStream.destroy();
        } catch (error) {
            Logger.error(`Stream File Error File Route: ${error}`);
            throw new BadRequestError('\nStream Video File Error');
        }
    };
}
