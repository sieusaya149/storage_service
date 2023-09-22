import {Types, ClientSession} from 'mongoose';
import User, {UserModel} from '../model/User';
import KeyStoreRepo from './KeyStoreRepo';
import KeyStore from '../model/KeyStore';
import {Logform} from 'winston';
import Logger from '../../helpers/Logger';

class UserRepo {
    static exist = async (id: Types.ObjectId): Promise<boolean> => {
        const user = await UserModel.exists({_id: id});
        return user !== null && user !== undefined;
    };

    static findById = async (id: Types.ObjectId): Promise<User | null> => {
        return UserModel.findOne({_id: id})
            .select('+email +password')
            .lean() // it will return js object rather than the document
            .exec();
    };

    static emailExist = async (email: string): Promise<User | null> => {
        return UserModel.findOne({email: email})
            .select('+email')
            .lean() // it will return js object
            .exec();
    };

    static userNameExist = async (userName: string): Promise<User | null> => {
        return UserModel.findOne({userName: userName})
            .lean() // it will return js object
            .exec();
    };

    static findByEmail = async (email: string): Promise<User | null> => {
        return UserModel.findOne({email: email})
            .select('+email +password +bio')
            .lean() // it will return js object
            .exec();
    };

    static findByUserName = async (userName: string): Promise<User | null> => {
        return UserModel.findOne({userName: userName})
            .select('+email +password +bio')
            .lean() // it will return js object
            .exec();
    };

    static create = async (user: User): Promise<User> => {
        const now = new Date();
        user.createdAt = user.updatedAt = now;
        const createdUser = await UserModel.create(user);
        Logger.info('New User Was Created ', createdUser.toObject());
        return {...createdUser.toObject()};
    };

    static deleteAll = async () => {
        Logger.debug('Delete all Users');
        await UserModel.deleteMany({}).exec();
    };
}

export default UserRepo;
