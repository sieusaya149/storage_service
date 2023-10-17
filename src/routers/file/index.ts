import express from 'express';
import {asyncHandler} from '../../helpers/asyncHandler';
import UploadController from '../../controllers/upload.controller';
import validator, {ValidationSource} from '../../middlewares/validator';
import {authentication} from '../../middlewares/authenticate';
import templateSchema from '../inputSchema';
const fileRoute = express.Router();
// uploadRoute.use();
fileRoute.post(
    '/file/upload/request-upload',
    authentication,
    validator(templateSchema.requestUploadBusboy),
    asyncHandler(UploadController.requestUpload)
);

fileRoute.post(
    '/file/upload',
    validator(templateSchema.authenticate, ValidationSource.COOKIES),
    authentication,
    validator(templateSchema.uploadBusBoyHeader, ValidationSource.HEADER),
    asyncHandler(UploadController.uploadBusBoy)
);

fileRoute.get(
    '/file/download/:fileId',
    authentication,
    validator(templateSchema.downloadFileParam, ValidationSource.PARAM),
    validator(templateSchema.downloadFileQuery, ValidationSource.QUERY),
    asyncHandler(UploadController.downloadFile)
);

fileRoute.get(
    '/file/stream-video/:fileId',
    asyncHandler(UploadController.streamVideo)
);

export default fileRoute;
