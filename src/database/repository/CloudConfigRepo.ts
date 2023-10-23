import {BadRequestError} from '~/core/ApiError';
import {CloudConfigModel} from '../model/CloudConfig';
import {Types} from 'mongoose';
import {CloudConfig, CloudConfigStatus} from 'packunpackservice';

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

    // TODO SHOUlD api get config, it should be provide query rather hardcode for finding
    // status = ENABLE like this
    static getConfigByUserId = async (userId: string) => {
        const conditions = [
            {owner: userId},
            {status: CloudConfigStatus.ENABLE}
        ];
        const listUser = await CloudConfigModel.find({$and: conditions});
        return listUser;
    };
}
