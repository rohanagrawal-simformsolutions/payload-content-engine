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
    @Query("cms") cms?: string,
  ) {
    return this.contentService.createArticle(
      createArticleDto,
      req.user.id,
      cms,
    );
  }

  // Protected route - update an article by ID
  @Put("admin/articles/:id")
  @UseGuards(JwtAuthGuard)
  async updateArticle(
    @Param("id") id: string,
    @Body() updateArticleDto: CreateArticleDto,
    @Request() req,
    @Query("cms") cms?: string,
  ) {
    return this.contentService.updateArticle(id, updateArticleDto, cms);
  }

  // Protected route - get all articles (draft + published) for authenticated users
  @Get("admin/articles")
  @UseGuards(JwtAuthGuard)
  async getAllArticles(
    @Query("page") page: string = "1",
    @Query("limit") limit: string = "10",
    @Query("status") status?: string, // Filter by status: "draft", "published", or omit for all
    @Query("cms") cms?: string,
  ) {
    return this.contentService.getAllArticles(
      parseInt(page),
      parseInt(limit),
      status,
      cms,
    );
  }

  // Protected route - publish a draft article (change status to published)
  @Put("admin/articles/:id/publish")
  @UseGuards(JwtAuthGuard)
  async publishArticle(@Param("id") id: string, @Query("cms") cms?: string) {
    return this.contentService.publishArticle(id, cms);
  }

  // Protected route - delete an article by ID
  @Delete("admin/articles/:id")
  @UseGuards(JwtAuthGuard)
  async deleteArticle(@Param("id") id: string, @Query("cms") cms?: string) {
    return this.contentService.deleteArticle(id, cms);
  }

  // Public route - get all published articles
  @Get("articles")
  async getArticles(
    @Query("page") page: string = "1",
    @Query("limit") limit: string = "10",
    @Query("cms") cms?: string,
  ) {
    return this.contentService.getPublishedArticles(
      parseInt(page),
      parseInt(limit),
      cms,
    );
  }

  // Public route - get single published article by slug
  @Get("articles/:slug")
  async getArticleBySlug(
    @Param("slug") slug: string,
    @Query("cms") cms?: string,
  ) {
    return this.contentService.getArticleBySlug(slug, cms);
  }

  // Public route - get all users for author dropdown
  @Get("users")
  async getUsers() {
    return this.contentService.getUsers();
  }
}
