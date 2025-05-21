import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        console.log('UsersController: Fetching user with ID:', id);
        const user = await this.usersService.findOne(id);
        console.log('UsersController: User found:', user);
        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
        return user;
    }
}
