import {File, FileModel} from '../model/Files';
import {Types} from 'mongoose';
export default class FileRepo {
    static create = async (file: File) => {
        const now = new Date();
        file.createdAt = file.updatedAt = now;
        const newFile = await FileModel.create(file);
        return newFile;
    };

    static getFileById = async (fileId: Types.ObjectId) => {
        const fileData = await FileModel.findOne({_id: fileId})
            .populate('metadata.thumbnailID')
            .exec();
        return fileData;
    };
}
