import { Body, Controller, Get, Param, Post, UseGuards, Request } from '@nestjs/common';
import { RatingsService } from './ratings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { validateId, validateNumberRange, validateTextLength } from '../utils/validation';

class CreateRatingDto {
  freelancerId: string;
  score: number;
  comment?: string;
}

@Controller('ratings')
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createRating(@Request() req, @Body() createRatingDto: CreateRatingDto) {
    // Validate input
    validateId(createRatingDto.freelancerId, 'Freelancer ID');
    validateNumberRange(createRatingDto.score, 'Score', 1, 5);
    if (createRatingDto.comment !== undefined && createRatingDto.comment !== null) {
      validateTextLength(createRatingDto.comment, 'Comment', 0, 1000);
    }
    
    return this.ratingsService.createRating({
      clientId: req.user.sub, // Get client ID from JWT token
      freelancerId: createRatingDto.freelancerId,
      score: createRatingDto.score,
      comment: createRatingDto.comment,
    });
  }

  @Get('freelancer/:id')
  async getFreelancerRatings(@Param('id') freelancerId: string) {
    return this.ratingsService.getFreelancerRatings(freelancerId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('check/:freelancerId')
  async checkRatingExists(
    @Request() req, 
    @Param('freelancerId') freelancerId: string
  ) {
    return this.ratingsService.checkRatingExists(req.user.sub, freelancerId);
  }
}
