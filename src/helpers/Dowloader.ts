import {Response} from 'express';
import {Types} from 'mongoose';
import {File} from '../database/model/Files';
import fs from 'fs';
import CipherCrypto from './cryptoAes';
import {secretKeyCipher} from '../config';
import StreamHandler from './streamHandler';

enum DownloadSource {
    DISK = 'disk',
    AWS = 'aws'
}
export class DownloaderFactory {
    private src: string;
    constructor(src: string) {
        this.src = src;
    }

    createDowloader() {
        switch (this.src) {
            case DownloadSource.DISK:
                return new DiskDownloader();
                break;

            default:
                return null;
                break;
        }
    }
}

class DownloaderBase {
    constructor() {}
}

class DiskDownloader extends DownloaderBase {
    constructor() {
        super();
    }

    async download(res: Response, fileData: File) {
        const filePath = fileData.metadata.filePath;
        const readFileStream = fs.createReadStream(filePath);
        const decipherStream = CipherCrypto.generateDecipher(
            secretKeyCipher,
            fileData.metadata.IV
        );
        res.set('Content-Type', 'binary/octet-stream');
        res.set(
            'Content-Disposition',
            'attachment; filename="' + fileData.fileName + '"'
        );
        res.set('Content-Length', fileData.metadata.size.toString());
        const allStreamsToErrorCatch = [readFileStream, decipherStream];
        await StreamHandler.downloadFileStream(
            readFileStream.pipe(decipherStream),
            res,
            allStreamsToErrorCatch
        );
    }
}
