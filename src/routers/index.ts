import express from 'express';
const routers = express.Router();
import accessRouter from './access/index';
import fileRoute from './file/index';
import cloudInforRoute from './cloudConfig/index';

// router.use('/', (req, res, next) => {
//     res.status(200).json('hello world test');
// });
const API_ENDPOINT = '/v1/api/';
routers.use(API_ENDPOINT, accessRouter);
routers.use(API_ENDPOINT, fileRoute);
routers.use(API_ENDPOINT, cloudInforRoute);
export default routers;
