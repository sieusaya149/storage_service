import {Request, Response} from 'express';
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
import {publicDirectory} from '../config';
import Utils from '../utils/utils';
import fs from 'fs';
import Busboy from 'busboy';
import {superCatchError} from '../helpers/catchError';
import {resolve} from 'path';
import {rejects} from 'assert';

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
        const busboy = Busboy({headers: req.headers});

        req.pipe(busboy);
        try {
            const output = await this.busboyProcessing(
                busboy,
                req,
                rangeStart,
                fileId
            );
            return output;
        } catch (error) {
            req.destroy();
            throw new BadRequestError('viethung');
        }
    };

    static busboyProcessing = (
        busboy: Busboy.Busboy,
        req: Request,
        rangeStart: number,
        fileId: string
    ) => {
        interface BusboyOutput {
            filePath: string;
        }
        return new Promise<BusboyOutput>((resolve, rejects) => {
            let filePath = '';
            busboy.on('file', (_, file, fileName) => {
                filePath = Utils.generateFilePath(fileId, fileName.filename);
                console.log('Busboy --> Writing to file: ', filePath);
                Utils.getFileDetails(filePath)
                    .then((stats) => {
                        if (stats.size !== rangeStart) {
                            throw new Error('Provided Chunk is Invalid');
                        }

                        const writeStream = file.pipe(
                            fs.createWriteStream(filePath, {flags: 'a'})
                        );
                        writeStream.on('error', (err) => {
                            throw new Error('Issue Happen When writing data');
                        });
                    })
                    .catch((err) => {
                        Logger.error('Busboy On ', err);
                        rejects(err);
                    });
            });

            busboy.on('error', (err) => {
                Logger.error('Error Event BusBoy', err);
                rejects(err);
            });

            busboy.on('finish', () => {
                Logger.info('Upload file by busboy finished');
                resolve({
                    filePath: filePath
                });
            });
        });
    };
}
