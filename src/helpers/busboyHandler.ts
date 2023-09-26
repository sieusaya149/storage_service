import Busboy from 'busboy';
import {Stream} from 'stream';
export interface BusboyOutput {
    file: Stream;
    fileName: string;
    formData: Map<any, any>;
}
export default class BusboyHander {
    static execute = (busboy: Busboy.Busboy) => {
        return new Promise<BusboyOutput>((resolve, rejects) => {
            const formData = new Map();
            busboy.on('field', (field: any, val: any) => {
                formData.set(field, val);
            });
            busboy.on('file', (_, file, fileName) => {
                resolve({
                    file: file, // stream data
                    fileName: fileName.filename,
                    formData: formData
                });
            });

            busboy.on('error', (err) => {
                rejects(err);
            });

            // busboy.on('finish', () => {
            //     Logger.info('Upload file by busboy finished');

            // });
        });
    };
}
