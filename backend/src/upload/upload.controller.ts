import { Controller, Post, Get, Param, Query, UseInterceptors, UploadedFile, BadRequestException, Header, Res, NotFoundException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import { Response } from 'express';
import { validateFileType, validateFileSize, validateFileExtension } from '../utils/validation';

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
        limits: {
            fileSize: 10 * 1024 * 1024,
        },
    }))
    @Header('Content-Type', 'application/json; charset=utf-8')
    uploadFile(@UploadedFile() file: Express.Multer.File) {
        if (!file) {
            throw new BadRequestException('File is required');
        }
        
        validateFileExtension(file.originalname);
        
        const allowedTypes = [
            'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
            'application/pdf',
            'application/zip', 'application/x-zip-compressed',
            'application/msword', // .doc
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
            'application/vnd.ms-excel', // .xls
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
        ];
        validateFileType(file.mimetype, allowedTypes);
        
        const maxSize = file.mimetype.startsWith('image/') ? 5 * 1024 * 1024 : 10 * 1024 * 1024;
        validateFileSize(file.size, maxSize);
        
        const baseUrl = process.env.API_URL || 'http://localhost:3000';
        const fullUrl = `${baseUrl}/uploads/${file.filename}`;
        
        // fix filename encoding: convert latin-1 to utf-8 for cyrillic/non-ascii
        let originalName = file.originalname;
        try {
            const hasMisencodedPattern = /Ð[^\x00-\x7F]|Ñ[^\x00-\x7F]/.test(originalName);
            if (hasMisencodedPattern || originalName !== encodeURIComponent(decodeURIComponent(originalName))) {
                const fixed = Buffer.from(originalName, 'latin1').toString('utf8');
                const hasCyrillic = /[\u0400-\u04FF]/.test(fixed);
                const hadCyrillicPattern = /Ð|Ñ/.test(originalName);
                if (hasCyrillic || (hadCyrillicPattern && fixed.length > 0)) {
                    originalName = fixed;
                }
            }
        } catch (e) {
            console.warn('Could not fix filename encoding:', e);
        }
        if (originalName.includes('%')) {
            try {
                const decoded = decodeURIComponent(originalName);
                if (decoded !== originalName && !decoded.includes('%')) {
                    originalName = decoded;
                }
            } catch (e) {
            }
        }
        
        return {
            url: fullUrl,
            name: originalName,
            type: file.mimetype,
        };
    }

    @Get('download/:filename')
    downloadFile(
        @Param('filename') filename: string,
        @Query('originalName') originalName: string | undefined,
        @Res() res: Response
    ) {
        const filePath = join(process.cwd(), 'uploads', filename);
        
        if (!fs.existsSync(filePath)) {
            throw new NotFoundException('File not found');
        }

        const ext = extname(filename).toLowerCase();
        const contentTypes: Record<string, string> = {
            '.pdf': 'application/pdf',
            '.doc': 'application/msword',
            '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            '.xls': 'application/vnd.ms-excel',
            '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            '.zip': 'application/zip',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.webp': 'image/webp',
        };

        const contentType = contentTypes[ext] || 'application/octet-stream';
        
        const downloadFilename = originalName || filename;
        
        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(downloadFilename)}`);
        res.setHeader('X-Content-Type-Options', 'nosniff');
        
        return res.sendFile(filePath);
    }
}
