import express from 'express';
const routers = express.Router();
import accessRouter from './access/index';
// router.use('/', (req, res, next) => {
//     res.status(200).json('hello world test');
// });

routers.use('/v1/api/', accessRouter);
export default routers;
