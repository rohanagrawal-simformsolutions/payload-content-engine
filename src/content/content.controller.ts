import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  Query,
  Param,
} from "@nestjs/common";
import { ContentService } from "./content.service.js";
import { CreateArticleDto } from "./dto/create-article.dto.js";
import { JwtAuthGuard } from "../auth/jwt-auth.guard.js";

@Controller()
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  // Protected route - only authenticated users can create articles
  @Post("admin/articles")
  @UseGuards(JwtAuthGuard)
  async createArticle(
    @Body() createArticleDto: CreateArticleDto,
    @Request() req,
  ) {
    return this.contentService.createArticle(createArticleDto, req.user.id);
  }

  // Public route - get all published articles
  @Get("articles")
  async getArticles(
    @Query("page") page: string = "1",
    @Query("limit") limit: string = "10",
  ) {
    return this.contentService.getPublishedArticles(
      parseInt(page),
      parseInt(limit),
    );
  }

  // Public route - get single published article by slug
  @Get("articles/:slug")
  async getArticleBySlug(@Param("slug") slug: string) {
    return this.contentService.getArticleBySlug(slug);
  }
}
