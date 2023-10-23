import {File, FileData} from '../database/model/Files';
import CloudConfigRepo from '../database/repository/CloudConfigRepo';
import {CloudUploadMsg} from 'packunpackservice';
import {PackingMessage} from 'packunpackservice';
import RabbitMqServices from './rabbitmq.services';
import {exchangeCloud, queueCloud} from '../config';
import Logger from '../helpers/Logger';
import {PackUnPackType} from 'packunpackservice';
import CloudFileRepo from '~/database/repository/CloudFileRepo';

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
}
