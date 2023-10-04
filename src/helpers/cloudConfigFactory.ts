import {randomUUID} from 'crypto';
import {Request} from 'express';
import Logger from './Logger';
import {CloudProvider} from 'packunpackservice';

export class CloudConfigFactory {
    private type: string;
    constructor(type: string) {
        this.type = type;
    }

    createConfigCrendential(req: Request): CloudConfigBase | null {
        switch (this.type) {
            case CloudProvider.AWS: {
                Logger.info('the new credential for aws will be added');
                const {accessKey, secretKey, bucketName} = req.body.metaData;
                return new AwsConfig(accessKey, secretKey, bucketName);
            }
            default:
                Logger.error(`Can not create credentials for ${this.type}`);
                return null;
        }
    }
}

class CloudConfigBase {
    constructor() {}
}

class AwsConfig extends CloudConfigBase {
    private type: CloudProvider;
    private accessKey: string;
    private secretKey: string;
    private bucketName: string;
    constructor(accessKey: string, secretKey: string, bucketName: string) {
        super();
        this.type = CloudProvider.AWS;
        this.accessKey = accessKey;
        this.secretKey = secretKey;
        this.bucketName = bucketName;
    }
    getNameConfig() {
        return this.type;
    }
}
