import { Controller, Post, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';

@Controller('upload')
export class UploadController {
    @Post()
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: (req, file, cb) => {
                const uploadPath = './uploads';
                if (!fs.existsSync(uploadPath)) {
                    fs.mkdirSync(uploadPath);
                }
                cb(null, uploadPath);
            },
            filename: (req, file, cb) => {
                const randomName = uuidv4();
                return cb(null, `${randomName}${extname(file.originalname)}`);
            },
        }),
    }))
    uploadFile(@UploadedFile() file: Express.Multer.File) {
        const baseUrl = process.env.API_URL || 'http://localhost:3000';
        const fullUrl = `${baseUrl}/uploads/${file.filename}`;
        return {
            url: fullUrl,
            name: file.originalname,
            type: file.mimetype,
        };
    }
}
