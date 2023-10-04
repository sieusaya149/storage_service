import {model, Types, Schema} from 'mongoose';
export const DOCUMENT_NAME = 'CloudConfig';
export const COLLECTION_NAME = 'cloudconfigs';
import {CloudConfig, CloudProvider} from 'packunpackservice';

const schemaCloudConfig = new Schema<CloudConfig>({
    type: {
        type: Schema.Types.String,
        enum: CloudProvider,
        required: true
    },
    owner: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    metaData: {
        type: Schema.Types.Mixed,
        required: true
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

export const CloudConfigModel = model<CloudConfig>(
    DOCUMENT_NAME,
    schemaCloudConfig,
    COLLECTION_NAME
);
