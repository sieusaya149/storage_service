import {Request, Response, NextFunction} from 'express';
import {SuccessMsgResponse, SuccessResponse} from '../core/ApiResponse';
import {AccessService} from '../services/access.services';
class AccessController {
    static signUp = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        const successRes = new SuccessResponse('Registered Success!', await AccessService.signUp(req, res));
        return successRes.send(res);
    };
}

export default AccessController;
