import {model, Types, Schema} from 'mongoose';
export const DOCUMENT_NAME = 'Thumbnail';
export const COLLECTION_NAME = 'thumbnails';

export default interface Thumbnail {
    _id?: Types.ObjectId;
    name: string;
    owner: Types.ObjectId;
    path: string;
    IV: Buffer;
    createdAt: Date;
    updatedAt: Date;
}

const schemaThumbnail = new Schema<Thumbnail>({
    name: {
        type: Schema.Types.String,
        required: true
    },
    owner: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    path: {
        type: Schema.Types.String,
        required: true
    },
    IV: {
        type: Buffer,
        require: true
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

export const ThumbnailModel = model<Thumbnail>(
    DOCUMENT_NAME,
    schemaThumbnail,
    COLLECTION_NAME
);
