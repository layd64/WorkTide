import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { validateTextLength, validateNumberRange, validateStringArray, validateEnum } from '../utils/validation';

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
    // Validate input
    validateTextLength(data.title, 'Title', 3, 200);
    validateTextLength(data.description, 'Description', 10, 5000);
    validateNumberRange(data.budget, 'Budget', 1, 1000000);
    validateStringArray(data.skills, 'Skills', 1, 20);
    if (!data.imageUrl || typeof data.imageUrl !== 'string') {
      throw new BadRequestException('Image URL is required');
    }
    
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

  @Get(':id/recommendations')
  @UseGuards(JwtAuthGuard)
  async getRecommendedFreelancers(
    @Param('id') id: string,
    @Query('limit') limit?: string,
  ) {
    const parsedLimit = limit ? parseInt(limit, 10) : undefined;
    return this.tasksService.getRecommendedFreelancersForTask(
      id,
      parsedLimit && parsedLimit > 0 ? parsedLimit : 10,
    );
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
    // Validate input if provided
    if (data.title !== undefined) {
      validateTextLength(data.title, 'Title', 3, 200);
    }
    if (data.description !== undefined) {
      validateTextLength(data.description, 'Description', 10, 5000);
    }
    if (data.budget !== undefined) {
      validateNumberRange(data.budget, 'Budget', 1, 1000000);
    }
    if (data.skills !== undefined) {
      validateStringArray(data.skills, 'Skills', 1, 20);
    }
    if (data.status !== undefined) {
      validateEnum(data.status, 'Status', ['open', 'in_progress', 'completed', 'cancelled']);
    }
    
    return this.tasksService.updateTask(id, req.user.sub, data);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteTask(@Request() req, @Param('id') id: string) {
    return this.tasksService.deleteTask(id, req.user.sub);
  }
} 