import {model, Types, Schema} from 'mongoose';

export const DOCUMENT_NAME = 'File';
export const COLLECTION_NAME = 'files';
export interface FileMetaData {
    owner: Types.ObjectId;
    parent: string;
    hasThumbnail?: boolean;
    isVideo?: boolean;
    duration?: number | undefined;
    thumbnailID?: Types.ObjectId;
    size: number;
    IV: Buffer;
    filePath: string;
    isShared?: boolean;
    isDeleted?: boolean;
    isClouded?: boolean;
    isOnDisk?: boolean;
}
export interface File {
    _id?: Types.ObjectId;
    fileName: string;
    length: number;
    metadata: FileMetaData;
    openedAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}

const schemaFile = new Schema<File>({
    fileName: {
        type: Schema.Types.String,
        required: true
    },
    length: {
        type: Schema.Types.Number,
        required: true
    },
    metadata: {
        type: {
            owner: {
                type: Schema.Types.ObjectId,
                required: true,
                ref: 'User'
            },
            parent: {
                type: String,
                default: 'root'
            },
            hasThumbnail: {
                type: Boolean,
                default: false
            },
            isVideo: {
                type: Boolean,
                default: false
            },
            duration: {
                type: Number,
                default: -1
            },
            thumbnailID: {
                type: Schema.Types.ObjectId,
                default: undefined,
                ref: 'Thumbnail'
            },
            size: {
                type: Number,
                required: true
            },
            IV: {
                type: Buffer,
                required: true
            },
            filePath: {
                type: Schema.Types.String,
                required: true
            },
            isShared: {
                type: Schema.Types.Boolean,
                default: false
            },
            isDeleted: {
                type: Schema.Types.Boolean,
                default: false
            },
            isClouded: {
                type: Schema.Types.Boolean,
                default: false
            },
            isOnDisk: {
                type: Schema.Types.Boolean,
                default: true
            }
        },
        required: true
    },
    openedAt: {
        type: Schema.Types.Date,
        default: undefined
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

export const FileModel = model<File>(
    DOCUMENT_NAME,
    schemaFile,
    COLLECTION_NAME
);
