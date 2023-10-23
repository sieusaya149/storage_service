import {model, Types, Schema} from 'mongoose';
export const DOCUMENT_NAME = 'CloudFile';
export const COLLECTION_NAME = 'cloudFiles';

export enum NotifyType {
    newTask = 'newTask',
    successTask = 'successTask',
    failureTask = 'failureTask'
}

export interface CloudFile {
    _id?: Types.ObjectId;
    diskFileId: Types.ObjectId; // reference to file
    status?: NotifyType;
    cloudConfig: Types.ObjectId;
    cloudInfo?: any;
    createdAt?: Date;
    updatedAt?: Date;
}

const schemaCloudFile = new Schema<CloudFile>({
    diskFileId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'File'
    },
    status: {
        type: Schema.Types.String,
        enum: NotifyType,
        default: NotifyType.newTask
    },
    cloudConfig: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'CloudConfig'
    },
    cloudInfo: {
        type: Schema.Types.Mixed,
        required: true,
        default: {}
    },
    createdAt: {
        type: Schema.Types.Date,
        required: true
    },
    updatedAt: {
        type: Schema.Types.Date,
        required: true
    }
});

export const CloudFileModel = model<CloudFile>(
    DOCUMENT_NAME,
    schemaCloudFile,
    COLLECTION_NAME
);
