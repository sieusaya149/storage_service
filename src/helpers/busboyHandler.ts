import Busboy from 'busboy';
import {Stream} from 'stream';
export interface BusboyOutput {
    file: Stream;
    fileName: string;
    formData: Map<any, any>;
}
export default class BusboyHander {
    static getBusboyData = (busboy: Busboy.Busboy) => {
        return new Promise<BusboyOutput>((resolve, rejects) => {
            const formData = new Map();
            // NOTE the form field should be placed order for trigger event
            busboy.on('field', (field: any, val: any) => {
                console.log(`Upload Form ${field} : ${val}`);
                formData.set(field, val);
            });

            busboy.on('file', async (_, file, fileName) => {
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
