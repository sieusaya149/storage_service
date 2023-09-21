import {Schema, model, Types} from 'mongoose';
import User from './User';

export const DOCUMENT_NAME = 'Keystore';
export const COLLECTION_NAME = 'keystores';

export default interface KeyStore {
    _id: Types.ObjectId;
    userId: User;
    publicKey: string;
    privateKey: string;
    accessToken: string;
    refreshToken: string;
    refreshTokenUsed?: Array<string>;
    createdAt?: Date;
    updatedAt?: Date;
}

export class KeyStoreData implements KeyStore {
    _id!: Types.ObjectId;
    userId!: User;
    publicKey!: string;
    privateKey!: string;
    accessToken!: string;
    refreshToken!: string;
    refreshTokenUsed?: Array<string>;
    createdAt?: Date;
    updatedAt?: Date;

    constructor(data: KeyStore) {
        // Initialize the user object with the provided data
        Object.assign(this, data);
    }
    // Add a method to sanitize the user object (remove password) before returning it to the client
    public sanitize(): KeyStore {
        // @ts-ignore
        delete this.publicKey;
        // @ts-ignore
        delete this.privateKey;
        // @ts-ignore
        delete this._id;
        // @ts-ignore
        delete this.userId;
        delete this.createdAt;
        delete this.updatedAt;
        delete this.refreshTokenUsed;
        return this;
    }
}

const schemaKeyStore = new Schema<KeyStore>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'User'
        },
        publicKey: {
            type: Schema.Types.String,
            required: true,
            trim: true
        },
        privateKey: {
            type: Schema.Types.String,
            required: true,
            trim: true
        },
        accessToken: {
            type: Schema.Types.String,
            required: true,
            trim: true
        },
        refreshToken: {
            type: Schema.Types.String,
            required: true,
            trim: true
        },
        refreshTokenUsed: {
            type: Schema.Types.Array,
            default: []
        },
        createdAt: {
            type: Schema.Types.Date,
            required: true,
            select: false
        },
        updatedAt: {
            type: Schema.Types.Date,
            required: true,
            select: false
        }
    },
    {
        versionKey: false
    }
);

export const KeystoreModel = model<KeyStore>(DOCUMENT_NAME, schemaKeyStore, COLLECTION_NAME);
