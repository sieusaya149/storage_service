import express from 'express';
const routers = express.Router();
import accessRouter from './access/index';
import uploadRouter from './upload/index';

// router.use('/', (req, res, next) => {
//     res.status(200).json('hello world test');
// });
const API_ENDPOINT = '/v1/api/';
routers.use(API_ENDPOINT, uploadRouter);
export default routers;
