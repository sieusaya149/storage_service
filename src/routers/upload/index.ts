import express from 'express';
import {asyncHandler} from '../../helpers/asyncHandler';
import UploadController from '../../controllers/upload.controller';
import validator, {ValidationSource} from '../../middlewares/validator';
import {authentication} from '../../middlewares/authenticate';
import templateSchema from '../inputSchema';
const uploadRoute = express.Router();
// uploadRoute.use();
uploadRoute.post(
    '/busboy/request-upload',
    authentication,
    validator(templateSchema.requestUploadBusboy),
    asyncHandler(UploadController.requestUpload)
);
uploadRoute.post(
    '/busboy/upload',
    validator(templateSchema.authenticate, ValidationSource.COOKIES),
    authentication,
    validator(templateSchema.uploadBusBoyHeader, ValidationSource.HEADER),
    asyncHandler(UploadController.uploadBusBoy)
);

export default uploadRoute;
