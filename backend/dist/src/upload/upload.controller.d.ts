export declare class UploadController {
    uploadFile(file: Express.Multer.File): {
        url: string;
        name: string;
        type: string;
    };
}
