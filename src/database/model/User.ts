import {model, Schema, Types} from 'mongoose';

export const DOCUMENT_NAME = 'User';
export const COLLECTION_NAME = 'users';

export default interface User {
    _id?: Types.ObjectId;
    userName: string;
    profilePicUrl?: string;
    email: string;
    birthDay: string;
    bio?: string;
    password: string;
    verified?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export class UserData implements User {
    _id?: Types.ObjectId;
    userName: string = '';
    profilePicUrl?: string;
    email: string = '';
    birthDay: string = '';
    bio?: string = '';
    password: string = '';
    verified?: boolean;
    createdAt?: Date;
    updatedAt?: Date;

    constructor(data: User) {
        // Initialize the user object with the provided data
        Object.assign(this, data);
    }
    // Add a method to sanitize the user object (remove password) before returning it to the client
    public sanitize(): User {
        // @ts-ignore
        delete this.password;
        delete this.bio;
        delete this.verified;
        return this;
    }
}

const schemaUser = new Schema<User>(
    {
        userName: {
            type: Schema.Types.String,
            trim: true,
            maxlength: 200
        },
        profilePicUrl: {
            type: Schema.Types.String,
            trim: true,
            default: null,
            select: false
        },
        email: {
            type: Schema.Types.String,
            unique: true,
            sparse: true,
            trim: true,
            select: false
        },
        birthDay: {
            type: Schema.Types.String,
            require: true
        },
        bio: {
            type: Schema.Types.String,
            select: false,
            default: null
        },
        password: {
            type: Schema.Types.String,
            select: false
        },
        verified: {
            type: Schema.Types.Boolean,
            default: false,
            select: false
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

export const UserModel = model<User>(DOCUMENT_NAME, schemaUser, COLLECTION_NAME);
