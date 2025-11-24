import { Controller, Get, Put, Post, Body, UseGuards, Request, Param, Query, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { validateTextLength, validateNumberRange, validateStringArray, validateFileType, validateFileSize, validateFileExtension } from '../utils/validation';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) { }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getMyProfile(@Request() req) {
    return this.profileService.getProfile(req.user.sub);
  }

  @Get('freelancers')
  async getAllFreelancers(@Query('search') search?: string, @Query('skills') skills?: string) {
    const skillsArray = skills ? skills.split(',') : [];
    return this.profileService.getAllFreelancers(search, skillsArray);
  }

  @Get(':id')
  async getPublicProfile(@Param('id') id: string) {
    return this.profileService.getPublicProfile(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('update')
  async updateProfile(@Request() req, @Body() profileData: any) {
    // Validate input if provided
    if (profileData.title !== undefined && profileData.title !== null) {
      validateTextLength(profileData.title, 'Title', 0, 200);
    }
    if (profileData.bio !== undefined && profileData.bio !== null) {
      validateTextLength(profileData.bio, 'Bio', 0, 2000);
    }
    if (profileData.location !== undefined && profileData.location !== null) {
      validateTextLength(profileData.location, 'Location', 0, 200);
    }
    if (profileData.hourlyRate !== undefined && profileData.hourlyRate !== null) {
      validateNumberRange(profileData.hourlyRate, 'Hourly rate', 0, 10000);
    }
    if (profileData.skills !== undefined && profileData.skills !== null) {
      validateStringArray(profileData.skills, 'Skills', 0, 50);
    }
    if (profileData.languages !== undefined && profileData.languages !== null) {
      validateStringArray(profileData.languages, 'Languages', 0, 20);
    }
    
    return this.profileService.updateProfile(req.user.sub, profileData);
  }

  @UseGuards(JwtAuthGuard)
  @Post('upload-avatar')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
        return cb(null, `${randomName}${extname(file.originalname)}`);
      }
    }),
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
    },
  }))
  async uploadAvatar(@Request() req, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    
    // Validate file extension to block executable files
    validateFileExtension(file.originalname);
    
    // Validate file type (images only)
    const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    validateFileType(file.mimetype, allowedImageTypes);
    
    // Validate file size (5MB max)
    validateFileSize(file.size, 5 * 1024 * 1024);
    
    const baseUrl = process.env.API_URL || 'http://localhost:3000';
    const imageUrl = `${baseUrl}/uploads/${file.filename}`;
    return this.profileService.updateAvatar(req.user.sub, imageUrl);
  }
}