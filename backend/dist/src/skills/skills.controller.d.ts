import { SkillsService } from './skills.service';
export declare class SkillsController {
    private readonly skillsService;
    constructor(skillsService: SkillsService);
    findAll(): Promise<{
        id: string;
        name: string;
    }[]>;
    search(query: string): Promise<{
        id: string;
        name: string;
    }[]>;
}
