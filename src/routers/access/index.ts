import express from 'express';
import {asyncHandler} from '../../helpers/asyncHandler';
import AccessController from '../../controllers/access.controller';
import templateSchema from './inputSchema';
import validator, {ValidationSource} from '../../middlewares/validator';
import {authentication} from '../../auth/authenticate';
const accessRoute = express.Router();
accessRoute.post('/signup', validator(templateSchema.signup), asyncHandler(AccessController.signUp));
accessRoute.post('/login', validator(templateSchema.login), asyncHandler(AccessController.logIn));

// //login
// accessRoute.post('/login', asyncHandler(accessController.login));
// // forgot password
// accessRoute.post('/forgot-password/:verifyCode', asyncHandler(accessController.forgotPasswordVerify));
// accessRoute.post('/forgot-password', asyncHandler(accessController.forgotPassword));
// accessRoute.post('/reset-password', verifyResetPassword, asyncHandler(accessController.resetPassword));

accessRoute.use(validator(templateSchema.authenticate, ValidationSource.COOKIES), authentication);
// // logout
// accessRoute.get('/ping', asyncHandler(accessController.ping));
accessRoute.delete('/logout', asyncHandler(AccessController.logOut));

export default accessRoute;
