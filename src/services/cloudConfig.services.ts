import {Request, Response} from 'express';
import {Types} from 'mongoose';
import {
    AuthFailureError,
    InternalError,
    BadRequestError,
    NotFoundError,
    ForbiddenError,
    NoEntryError,
    BadTokenError,
    TokenExpiredError,
    NoDataError,
    AccessTokenError
} from '../core/ApiError';
import Logger from '../helpers/Logger';
import {CloudConfigFactory} from '../helpers/cloudConfigFactory';
import {CloudConfig} from '../database/model/CloudConfig';
import CloudConfigRepo from '../database/repository/CloudConfigRepo';
export class CloudConfigService {
    static addCloudProvider = async (req: Request, res: Response) => {
        const {type} = req.body;
        const userId = req.cookies.userId;

        const configFactory = new CloudConfigFactory(type);
        const credentialConfig = configFactory.createConfigCrendential(req);
        if (!credentialConfig) {
            throw new BadRequestError(`Can not create credential for ${type}`);
        }

        const newCloudConfig: CloudConfig = {
            type: type,
            owner: new Types.ObjectId(userId),
            metaData: credentialConfig
        };
        await CloudConfigRepo.create(newCloudConfig);
    };

    static deleteCloudConfig = async (req: Request, res: Response) => {
        const {configId} = req.params;
        await CloudConfigRepo.delete(configId);
    };

    static getMyConfig = async (req: Request, res: Response) => {
        const userId = req.cookies.userId;
        const result = await CloudConfigRepo.getConfigByUserId(userId);
        return result;
    };
}
