import express from 'express';
import {asyncHandler} from '../../helpers/asyncHandler';
import AccessController from '../../controllers/access.controller';
import templateSchema from './inputSchema';
import validator from '../../middlewares/validator';
const accessRoute = express.Router();
accessRoute.post('/signup', validator(templateSchema.signup), asyncHandler(AccessController.signUp));
// //login
// accessRoute.post('/login', asyncHandler(accessController.login));
// // forgot password
// accessRoute.post('/forgot-password/:verifyCode', asyncHandler(accessController.forgotPasswordVerify));
// accessRoute.post('/forgot-password', asyncHandler(accessController.forgotPassword));
// accessRoute.post('/reset-password', verifyResetPassword, asyncHandler(accessController.resetPassword));

// accessRoute.use(authentication);
// // logout
// accessRoute.get('/ping', asyncHandler(accessController.ping));
// accessRoute.post('/logout', asyncHandler(accessController.logout));

export default accessRoute;
