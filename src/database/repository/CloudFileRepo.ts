import Logger from '~/helpers/Logger';
import {CloudFile, CloudFileModel, NotifyType} from '../model/CloudFiles';
import {Types} from 'mongoose';
import {CloudConfig} from 'packunpackservice';
import {File} from '../model/Files';
export default class CloudFileRepo {
    static existingCloudFile = async (
        configId: Types.ObjectId,
        fileId: Types.ObjectId
    ) => {
        const filter = [{diskFileId: fileId}, {cloudConfig: configId}];
        const cloudFindData = await CloudFileModel.find({$and: filter}).exec();
        return cloudFindData.length > 0;
    };

    static create = async (cloudFile: CloudFile) => {
        const now = new Date();
        cloudFile.createdAt = cloudFile.updatedAt = now;
        const newCloudFile = await CloudFileModel.create(cloudFile);
        return newCloudFile;
    };

    static getCloudFileById = async (cloudFileId: Types.ObjectId) => {
        const cloudFileData = await CloudFileModel.findOne({
            _id: cloudFileId
        })
            .populate('cloudConfig')
            .exec();
        return cloudFileData;
    };

    static getCloudFileByDiskId = async (fileId: Types.ObjectId) => {
        const filter = {diskFileId: fileId};
        const cloudFindData = await CloudFileModel.find(filter).exec();
        return cloudFindData;
    };

    static createByNotify = async (notifyContent: any) => {
        const {type} = notifyContent;
        if (notifyContent.task.type != 'UPLOAD') {
            Logger.info(
                `No Update Cloud File Record With Notify with task type is ${notifyContent.task.type}`
            );
            return;
        }
        const {cloudConfig, metadata, cloudUploadInfo} = notifyContent.task;
        if (type != NotifyType.successTask && type != NotifyType.failureTask) {
            Logger.info(
                `No Update Cloud File Record With Notify type is ${type}`
            );
            return;
        }
        const existingCloudFile = await CloudFileRepo.existingCloudFile(
            cloudConfig._id,
            metadata.fileId
        );
        if (!existingCloudFile) {
            Logger.error(
                `The cloud file ${cloudConfig._id} was not existing for file ${metadata.fileId}`
            );
            throw new Error(
                `The cloud file ${cloudConfig._id} was not existing for file ${metadata.fileId}`
            );
        }
        console.log(
            `NOTIFY: JOB Uploading File ${metadata.fileId} to ${cloudConfig.type} ###${type}###`
        );
        const newCloudFile = {
            diskFileId: metadata.fileId,
            status: type,
            cloudConfig: cloudConfig,
            cloudInfo: cloudUploadInfo
        } as CloudFile;
        await CloudFileRepo.upsert(newCloudFile);
    };

    static deleteCloudFileByLocationCloud = async (location: string) => {
        const filter = {
            'cloudInfo.Location': location
        };
        const deleteResult = await CloudFileModel.deleteOne(filter).exec();
        return deleteResult;
    };

    static deleteByNotify = async (notifyContent: any) => {
        const {type} = notifyContent;
        if (notifyContent.task.type != 'DELETE') {
            Logger.info(
                `No Delete Cloud File Record With Notify with task type is ${notifyContent.task.type}`
            );
            return;
        }
        const {fileInfor} = notifyContent.task;
        if (type != NotifyType.successTask) {
            Logger.info(
                `No Delete Cloud File Record With Notify type is ${type}`
            );
            return;
        }
        await CloudFileRepo.deleteCloudFileByLocationCloud(fileInfor.Location);
        console.log(`NOTIFY: JOB Delete File ###${type}###`);
    };

    static upsert = async (cloudFile: CloudFile): Promise<any> => {
        const now = new Date();
        cloudFile.updatedAt = now;

        const filter = {
            $and: [
                {diskFileId: cloudFile.diskFileId},
                {cloudConfig: cloudFile.cloudConfig._id}
            ]
        };

        const update = {
            $set: {
                ...cloudFile,
                createdAt: now // Set createdAt if it's a new document
            }
        };

        // Set the options to upsert (insert if not found) and return the new document
        const options = {upsert: true, new: true};

        // Use findOneAndUpdate to perform the upsert operation
        const upsertCloudFile = await CloudFileModel.findOneAndUpdate(
            filter,
            update,
            options
        )
            .lean()
            .exec();
        return upsertCloudFile;
    };

    static createByCloudConfig = async (
        cloudConfig: CloudConfig,
        file: File
    ) => {
        if (!cloudConfig._id || !file._id) {
            throw new Error('CloudConfig or File missed id');
        }
        Logger.info(`Create new CloudFile record for CloudConfig ${file._id}`);
        const existingCloudFile = await CloudFileRepo.existingCloudFile(
            cloudConfig._id,
            file._id
        );
        if (existingCloudFile) {
            Logger.warn(
                `The cloud file ${cloudConfig._id} was existing for file ${file._id}`
            );
            return;
        }
        const newCloudFile = {
            diskFileId: file._id,
            status: NotifyType.newTask,
            cloudConfig: cloudConfig._id
        } as CloudFile;

        await CloudFileRepo.create(newCloudFile);
    };
}
