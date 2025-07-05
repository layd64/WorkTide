import { Controller, Get, Post, Param, UseGuards, Request, Body } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {
    constructor(private readonly adminService: AdminService) { }

    @Get('users')
    async getAllUsers() {
        console.log('GET /admin/users hit');
        return this.adminService.getAllUsers();
    }

    @Post('users/:id/ban')
    async banUser(@Param('id') id: string, @Request() req) {
        return this.adminService.banUser(id, req.user.sub);
    }

    @Post('users/:id/unban')
    async unbanUser(@Param('id') id: string, @Request() req) {
        return this.adminService.unbanUser(id, req.user.sub);
    }

    @Get('analytics')
    async getAnalytics() {
        return this.adminService.getAnalytics();
    }

    @Get('logs')
    async getLogs() {
        return this.adminService.getLogs();
    }
}

