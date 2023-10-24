import {File, FileData} from '../database/model/Files';
import CloudConfigRepo from '../database/repository/CloudConfigRepo';
import {
    CloudUploadMsg,
    DeleteCloudMsg,
    DeleteFileInfor
} from 'packunpackservice';
import {PackingMessage} from 'packunpackservice';
import RabbitMqServices from './rabbitmq.services';
import {exchangeCloud, queueCloud} from '../config';
import Logger from '../helpers/Logger';
import {PackUnPackType} from 'packunpackservice';
import CloudFileRepo from '~/database/repository/CloudFileRepo';
import {CloudFile, NotifyType} from '~/database/model/CloudFiles';
import {BadRequestError} from '~/core/ApiError';

export class PublishMessageService {
    static pushUploadTask = async (file: File) => {
        try {
            const packingObj = new PackingMessage<CloudUploadMsg>();
            const fileData = new FileData(file).getInforToPublish();
            // only get the config that was enabled
            const listConfig = await CloudConfigRepo.getConfigByUserId(
                fileData.owner.toString()
            );
            if (listConfig.length == 0) {
                Logger.warn('Store on disk only');
                return;
            }
            const cloudUploadMsg: CloudUploadMsg = {
                typeMsg: PackUnPackType.CLOUD_UPLOAD,
                cloudConfigs: listConfig,
                fileData: new FileData(file).getInforToPublish(),
                createdAt: new Date()
            };
            console.log(listConfig);
            for (let i = 0; i < listConfig.length; i++) {
                CloudFileRepo.createByCloudConfig(listConfig[i], file);
            }
            const packedData = packingObj.packData(cloudUploadMsg);
            await RabbitMqServices.publishMessage(
                packedData,
                exchangeCloud,
                queueCloud
            );
        } catch (error) {
            Logger.error(error);
            throw new Error(
                `There is something wrong when pushlish message uploadtask`
            );
        }
    };

    static pushDeleteTask = async (cloudFileData: any) => {
        try {
            const packingObj = new PackingMessage<DeleteCloudMsg>();
            if (cloudFileData.status != NotifyType.successTask) {
                throw new BadRequestError(
                    'The cloud file does not upload to cloud success'
                );
            }
            const deleteFileInfor = {
                cloudConfig: cloudFileData.cloudConfig,
                fileInfor: cloudFileData.cloudInfo
            } as DeleteFileInfor;

            const deleteCloudMsg: DeleteCloudMsg = {
                typeMsg: PackUnPackType.DELETE_CLOUD_FILE,
                fileData: deleteFileInfor,
                createdAt: new Date()
            };

            const packedData = packingObj.packData(deleteCloudMsg);
            await RabbitMqServices.publishMessage(
                packedData,
                exchangeCloud,
                queueCloud
            );
        } catch (error) {
            Logger.error(error);
            throw new Error(
                `There is something wrong when pushlish message delete`
            );
        }
    };
}
