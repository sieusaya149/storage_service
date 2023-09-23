import {Request, Response, NextFunction} from 'express';
import {SuccessResponse} from '../core/ApiResponse';
import {UploadService} from '../services/upload.services';
class UploadController {
    static requestUpload = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response> => {
        const successRes = new SuccessResponse(
            'Request Upload Success!',
            await UploadService.requestUpload(req, res)
        );
        return successRes.send(res);
    };

    static uploadBusBoy = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | undefined> => {
        const successRes = new SuccessResponse(
            'Upload Success!',
            await UploadService.uploadBusBoy(req, res)
        );
        return successRes.send(res);
    };
}

export default UploadController;
