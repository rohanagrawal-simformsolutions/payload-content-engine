import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
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

  // Protected route - update an article by ID
  @Put("admin/articles/:id")
  @UseGuards(JwtAuthGuard)
  async updateArticle(
    @Param("id") id: string,
    @Body() updateArticleDto: CreateArticleDto,
    @Request() req,
  ) {
    return this.contentService.updateArticle(id, updateArticleDto);
  }

  // Protected route - get all articles (draft + published) for authenticated users
  @Get("admin/articles")
  @UseGuards(JwtAuthGuard)
  async getAllArticles(
    @Query("page") page: string = "1",
    @Query("limit") limit: string = "10",
    @Query("status") status?: string, // Filter by status: "draft", "published", or omit for all
  ) {
    return this.contentService.getAllArticles(
      parseInt(page),
      parseInt(limit),
      status,
    );
  }

  // Protected route - publish a draft article (change status to published)
  @Put("admin/articles/:id/publish")
  @UseGuards(JwtAuthGuard)
  async publishArticle(@Param("id") id: string) {
    return this.contentService.publishArticle(id);
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

  // Public route - get all users for author dropdown
  @Get("users")
  async getUsers() {
    return this.contentService.getUsers();
  }
}
