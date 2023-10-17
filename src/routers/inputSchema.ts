import Joi from 'joi';
import {CloudProvider} from 'packunpackservice';

export default {
    signup: Joi.object().keys({
        userName: Joi.string().required().min(6),
        birthDay: Joi.string().required().isoDate(), //YYYY-MM-DD
        email: Joi.string().required().email(),
        password: Joi.string().required().min(4)
    }),

    login: Joi.object()
        .keys({
            userName: Joi.string().optional(),
            email: Joi.string().optional().email(),
            password: Joi.string().required()
        })
        .xor('userName', 'email'),

    authenticate: Joi.object().keys({
        'access-token': Joi.string().required(),
        'refresh-token': Joi.string().required(),
        userId: Joi.string().required()
    }),

    requestUploadBusboy: Joi.object().keys({
        fileName: Joi.string().required()
    }),

    uploadBusBoyHeader: Joi.object().keys({
        fileid: Joi.string().required(),
        'content-range': Joi.string()
            .required()
            .regex(/bytes=(\d+)-(\d+)\/(\d+)/)
    }),

    addCloudConfig: Joi.object().keys({
        type: Joi.string()
            .valid(
                CloudProvider.AWS,
                CloudProvider.GOOGLE,
                CloudProvider.AZURE,
                CloudProvider.IBM
            )
            .required(),
        metaData: Joi.alternatives().conditional('type', {
            is: CloudProvider.AWS,
            then: Joi.object({
                accessKey: Joi.string().required(),
                secretKey: Joi.string().required(),
                bucketName: Joi.string().required()
            }),
            otherwise: Joi.alternatives().conditional('type', {
                is: CloudProvider.AZURE,
                then: Joi.object({
                    azureKey: Joi.string().required(),
                    azureSecret: Joi.string().required(),
                    containerName: Joi.string().required()
                }),
                otherwise: Joi.alternatives().conditional('type', {
                    is: CloudProvider.GOOGLE,
                    then: Joi.object({
                        googleKey: Joi.string().required(),
                        googleSecret: Joi.string().required(),
                        bucketName: Joi.string().required()
                    }),
                    otherwise: Joi.alternatives().conditional('type', {
                        is: CloudProvider.IBM,
                        then: Joi.object({
                            endpoint: Joi.string().required(),
                            apiKeyId: Joi.string().required(),
                            serviceInstanceId: Joi.string().required(),
                            bucketName: Joi.string().required()
                        }),
                        otherwise: Joi.any() // Allow any data when 'type' is not recognized
                    })
                })
            })
        })
        // metaData: Joi.any()
    }),

    deleteCloudConfig: Joi.object().keys({
        configId: Joi.string().length(24).required()
    }),

    downloadFileQuery: Joi.object().keys({
        src: Joi.string().valid('aws', 'disk').required()
    }),

    downloadFileParam: Joi.object().keys({
        fileId: Joi.string()
            .length(24)
            .regex(/^[0-9A-Fa-f]+$/)
            .required()
    })
};
