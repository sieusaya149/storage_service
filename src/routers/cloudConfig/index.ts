import express from 'express';
import {asyncHandler} from '../../helpers/asyncHandler';
import validator, {ValidationSource} from '../../middlewares/validator';
import {authentication} from '../../middlewares/authenticate';
import templateSchema from '../inputSchema';
import CloudConfigController from '../../controllers/cloudConfig.controller';
const cloudInforRoute = express.Router();

authentication;
validator(templateSchema.authenticate, ValidationSource.COOKIES);

cloudInforRoute.get(
    '/getMyConfig',
    asyncHandler(CloudConfigController.getMyConfig)
);

cloudInforRoute.post(
    '/addCloudConfig',
    validator(templateSchema.addCloudConfig, ValidationSource.BODY),
    asyncHandler(CloudConfigController.addCloudProvider)
);

cloudInforRoute.delete(
    '/deleteCloudConfig/:configId',
    validator(templateSchema.deleteCloudConfig, ValidationSource.PARAM),
    asyncHandler(CloudConfigController.deleteCloudConfig)
);

cloudInforRoute.delete(
    '/deleteAll',
    asyncHandler(CloudConfigController.deleteAllConfig)
);

export default cloudInforRoute;
