import {BadRequestError} from '~/core/ApiError';
import {CloudConfigModel} from '../model/CloudConfig';
import {Types} from 'mongoose';
import {CloudConfig} from 'packunpackservice';

export default class CloudConfigRepo {
    static create = async (newConfig: CloudConfig) => {
        const now = new Date();
        newConfig.createdAt = newConfig.updatedAt = now;
        const newConfigAdded = await CloudConfigModel.create(newConfig);
        return newConfigAdded;
    };

    static isExistById = async (cloudConfigId: string) => {
        const foundResult = await CloudConfigModel.findOne({
            _id: cloudConfigId
        });
        return foundResult;
    };

    static delete = async (cloudConfigId: string) => {
        const idObject = new Types.ObjectId(cloudConfigId);
        if (await this.isExistById(cloudConfigId)) {
            await CloudConfigModel.deleteOne({
                _id: idObject
            });
        } else {
            throw new BadRequestError('No Config to be delete');
        }
    };

    static deleteAll = async () => {
        await CloudConfigModel.deleteMany({});
    };

    static getConfigByUserId = async (userId: string) => {
        const listUser = await CloudConfigModel.find({owner: userId});
        return listUser;
    };
}
