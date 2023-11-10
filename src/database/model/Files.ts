import {model, Types, Schema} from 'mongoose';
import {PublishFileData} from 'packunpackservice';
import {BadRequestError} from '~/core/ApiError';

export const DOCUMENT_NAME = 'File';
export const COLLECTION_NAME = 'files';

enum DeleteType {
    NONE = 'NONE',
    TEMPORARY = 'TEMPORARY',
    PERMANENTLY = 'PERMANENTLY'
}
type DeleteInfor = {
    type: DeleteType;
    previosParent?: Types.ObjectId;
    triggerTime?: Date;
};

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
    deleteInfo?: DeleteInfor;
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

export class FileData implements File {
    _id!: Types.ObjectId;
    fileName!: string;
    length!: number;
    metadata!: FileMetaData;
    openedAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
    constructor(file: File) {
        if (!file._id) {
            throw new BadRequestError('The file missing Id');
        }
        this._id = file._id;
        this.fileName = file.fileName;
        this.length = file.length;
        this.createdAt = file.createdAt;
        this.updatedAt = file.updatedAt;
        this.metadata = file.metadata;
    }

    // Add a method to sanitize the user object (remove password) before returning it to the client
    public getInforToPublish(): PublishFileData {
        const publishFileData: PublishFileData = {
            fileId: this._id,
            owner: this.metadata.owner,
            fileName: this.fileName,
            filePath: this.metadata.filePath,
            size: this.metadata.size
        };
        return publishFileData;
    }
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
            deleteInfo: {
                type: Schema.Types.Mixed,
                default: {
                    type: DeleteType.NONE
                }
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
