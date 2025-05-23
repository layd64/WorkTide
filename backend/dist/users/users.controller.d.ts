import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findOne(id: string): Promise<{
        id: string;
        fullName: string;
        userType: string;
        imageUrl: string | null;
    }>;
}
