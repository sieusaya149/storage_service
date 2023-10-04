import {Request, Response, NextFunction} from 'express';
import {SuccessResponse} from '../core/ApiResponse';
import {CloudConfigService} from '../services/cloudConfig.services';
class CloudConfigController {
    static addCloudProvider = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response> => {
        const successRes = new SuccessResponse(
            'Add new Cloud Provider success!',
            await CloudConfigService.addCloudProvider(req, res)
        );
        return successRes.send(res);
    };

    static deleteCloudConfig = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response> => {
        const successRes = new SuccessResponse(
            'Delete Cloud Provider success!',
            await CloudConfigService.deleteCloudConfig(req, res)
        );
        return successRes.send(res);
    };

    static deleteAllConfig = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response> => {
        const successRes = new SuccessResponse(
            'Delete Cloud Provider success!',
            await CloudConfigService.deleteCloudConfig(req, res, true)
        );
        return successRes.send(res);
    };

    static getMyConfig = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response> => {
        const successRes = new SuccessResponse(
            'Get List Cloud Provider success!',
            await CloudConfigService.getMyConfig(req, res)
        );
        return successRes.send(res);
    };
}

export default CloudConfigController;
