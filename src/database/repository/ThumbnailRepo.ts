import Thumbnail, {ThumbnailModel} from '../model/Thumbnails';

export class ThumbnailRepo {
    static create = async (thumbnail: Thumbnail) => {
        const newThumbnail = await ThumbnailModel.create(thumbnail);
        return newThumbnail;
    };
}
