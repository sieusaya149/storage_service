import {Request, Response, NextFunction} from 'express';
import {SuccessResponse} from '../core/ApiResponse';
import {FileService} from '../services/file.services';
import {PublishMessageService} from '../services/publishMessage.services';
class UploadController {
    static requestUpload = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response> => {
        const successRes = new SuccessResponse(
            'Request Upload Success!',
            await FileService.requestUpload(req, res)
        );
        return successRes.send(res);
    };

    static uploadBusBoy = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | undefined> => {
        const {fileData} = await FileService.uploadBusBoy(req, res);
        await PublishMessageService.pushUploadTask(fileData);
        const successRes = new SuccessResponse('Upload Success!', fileData);
        return successRes.send(res);
    };

    static downloadFile = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        await FileService.downloadFile(req, res);
    };

    static streamVideo = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        await FileService.streamVideo(req, res);
    };
}

export default UploadController;
