"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../prisma/prisma.service");
const bcrypt = require("bcrypt");
const logging_service_1 = require("../logging/logging.service");
let AuthService = class AuthService {
    prisma;
    jwtService;
    loggingService;
    constructor(prisma, jwtService, loggingService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.loggingService = loggingService;
    }
    async validateUser(email, password) {
        const user = await this.prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (user.isBanned) {
            throw new common_1.UnauthorizedException('Your account has been suspended');
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const { password: _, ...result } = user;
        return result;
    }
    async register(userData) {
        const { email, password, fullName, userType } = userData;
        const existingUser = await this.prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            throw new common_1.BadRequestException('User already exists');
        }
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = await this.prisma.user.create({
            data: {
                email: userData.email,
                password: hashedPassword,
                fullName: userData.fullName,
                userType: userData.userType,
                isHidden: userData.isHidden,
            },
        });
        await this.loggingService.logAction(newUser.id, 'USER_REGISTER', newUser.id, `User registered: ${newUser.email}`);
        const token = this.jwtService.sign({ email: newUser.email, sub: newUser.id, userType: newUser.userType });
        const { password: _, ...user } = newUser;
        return { user, token };
    }
    async login(user) {
        const payload = { email: user.email, sub: user.id, userType: user.userType };
        await this.loggingService.logAction(user.id, 'USER_LOGIN', user.id, `User logged in: ${user.email}`);
        return {
            access_token: this.jwtService.sign(payload),
            token: this.jwtService.sign(payload),
            user: user
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        logging_service_1.LoggingService])
], AuthService);
//# sourceMappingURL=auth.service.js.map