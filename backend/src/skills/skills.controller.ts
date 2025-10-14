import { Controller, Get, Query } from '@nestjs/common';
import { SkillsService } from './skills.service';

@Controller('skills')
export class SkillsController {
    constructor(private readonly skillsService: SkillsService) { }

    @Get()
    async findAll() {
        return this.skillsService.findAll();
    }

    @Get('search')
    async search(@Query('q') query: string) {
        return this.skillsService.search(query);
    }
}
