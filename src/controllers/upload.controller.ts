import {Request, Response, NextFunction} from 'express';
import {SuccessResponse} from '../core/ApiResponse';
import {UploadService} from '../services/file.services';
import {PublishMessageService} from '../services/publishMessage.services';
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
        const {fileData} = await UploadService.uploadBusBoy(req, res);
        await PublishMessageService.pushUploadTask(fileData);
        const successRes = new SuccessResponse('Upload Success!', fileData);
        return successRes.send(res);
    };

    static downloadFile = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        await UploadService.downloadFile(req, res);
    };
}

export default UploadController;
