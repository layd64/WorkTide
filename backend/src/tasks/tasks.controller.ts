import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('tasks')
export class TasksController {
  constructor(private tasksService: TasksService) { }

  @Post()
  @UseGuards(JwtAuthGuard)
  async createTask(
    @Request() req,
    @Body() data: {
      title: string;
      description: string;
      budget: number;
      skills: string[];
      imageUrl: string;
    },
  ) {
    return this.tasksService.createTask(req.user.sub, data);
  }

  @Get()
  async getAllTasks(
    @Query('search') search?: string,
    @Query('skills') skills?: string,
    @Query('status') status?: string,
  ) {
    const filters: any = {};

    if (search) {
      filters.search = search;
    }

    if (skills) {
      filters.skills = skills.split(',');
    }

    if (status) {
      filters.status = status;
    }

    return this.tasksService.getAllTasks(filters);
  }

  @Get(':id')
  async getTaskById(@Param('id') id: string) {
    return this.tasksService.getTaskById(id);
  }

  @Get('client/:clientId')
  async getClientTasks(@Param('clientId') clientId: string) {
    return this.tasksService.getClientTasks(clientId);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async updateTask(
    @Request() req,
    @Param('id') id: string,
    @Body() data: {
      title?: string;
      description?: string;
      budget?: number;
      skills?: string[];
      status?: string;
      imageUrl?: string;
    },
  ) {
    return this.tasksService.updateTask(id, req.user.sub, data);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteTask(@Request() req, @Param('id') id: string) {
    return this.tasksService.deleteTask(id, req.user.sub);
  }
} 