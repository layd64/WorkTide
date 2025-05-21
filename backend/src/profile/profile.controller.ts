import { Controller, Get, Put, Post, Body, UseGuards, Request, Param, Query, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

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
    })
  }))
  async uploadAvatar(@Request() req, @UploadedFile() file: Express.Multer.File) {
    const baseUrl = process.env.API_URL || 'http://localhost:3000';
    const imageUrl = `${baseUrl}/uploads/${file.filename}`;
    return this.profileService.updateAvatar(req.user.sub, imageUrl);
  }
}