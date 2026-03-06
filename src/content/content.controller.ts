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
import {
  CreateAccordionBlockDto,
  CreateTabsBlockDto,
  CreateTwoColumnBlockDto,
  CreateDownloadsBlockDto,
  CreateGalleryBlockDto,
  CreateMediaVideoBlockDto,
  CreateCardBoxBlockDto,
  CreateCTASectionBlockDto,
  CreateCarouselBlockDto,
  CreatePullQuoteBlockDto,
  CreateLogoWallBlockDto,
  CreateCodeSnippetBlockDto,
} from "./dto/blocks.dto.js";
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
    @Query("status") status?: string,
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

  // ===== COMPONENT BLOCKS - ADMIN ROUTES =====

  // Accordion Block
  @Post("admin/blocks/accordion")
  @UseGuards(JwtAuthGuard)
  async createAccordionBlock(@Body() dto: CreateAccordionBlockDto) {
    return this.contentService.createAccordionBlock(dto);
  }

  @Get("blocks/accordion")
  async getAccordionBlocks(
    @Query("page") page: string = "1",
    @Query("limit") limit: string = "10",
  ) {
    return this.contentService.getAccordionBlocks(
      parseInt(page),
      parseInt(limit),
    );
  }

  @Put("admin/blocks/accordion/:id")
  @UseGuards(JwtAuthGuard)
  async updateAccordionBlock(
    @Param("id") id: string,
    @Body() dto: CreateAccordionBlockDto,
  ) {
    return this.contentService.updateBlock("accordion-blocks", id, dto);
  }

  @Delete("admin/blocks/accordion/:id")
  @UseGuards(JwtAuthGuard)
  async deleteAccordionBlock(@Param("id") id: string) {
    return this.contentService.deleteBlock("accordion-blocks", id);
  }

  // Tabs Block
  @Post("admin/blocks/tabs")
  @UseGuards(JwtAuthGuard)
  async createTabsBlock(@Body() dto: CreateTabsBlockDto) {
    return this.contentService.createTabsBlock(dto);
  }

  @Get("blocks/tabs")
  async getTabsBlocks(
    @Query("page") page: string = "1",
    @Query("limit") limit: string = "10",
  ) {
    return this.contentService.getTabsBlocks(parseInt(page), parseInt(limit));
  }

  @Put("admin/blocks/tabs/:id")
  @UseGuards(JwtAuthGuard)
  async updateTabsBlock(
    @Param("id") id: string,
    @Body() dto: CreateTabsBlockDto,
  ) {
    return this.contentService.updateBlock("tabs-blocks", id, dto);
  }

  @Delete("admin/blocks/tabs/:id")
  @UseGuards(JwtAuthGuard)
  async deleteTabsBlock(@Param("id") id: string) {
    return this.contentService.deleteBlock("tabs-blocks", id);
  }

  // Two-Column Block
  @Post("admin/blocks/two-column")
  @UseGuards(JwtAuthGuard)
  async createTwoColumnBlock(@Body() dto: CreateTwoColumnBlockDto) {
    return this.contentService.createTwoColumnBlock(dto);
  }

  @Get("blocks/two-column")
  async getTwoColumnBlocks(
    @Query("page") page: string = "1",
    @Query("limit") limit: string = "10",
  ) {
    return this.contentService.getTwoColumnBlocks(
      parseInt(page),
      parseInt(limit),
    );
  }

  @Put("admin/blocks/two-column/:id")
  @UseGuards(JwtAuthGuard)
  async updateTwoColumnBlock(
    @Param("id") id: string,
    @Body() dto: CreateTwoColumnBlockDto,
  ) {
    return this.contentService.updateBlock("two-column-blocks", id, dto);
  }

  @Delete("admin/blocks/two-column/:id")
  @UseGuards(JwtAuthGuard)
  async deleteTwoColumnBlock(@Param("id") id: string) {
    return this.contentService.deleteBlock("two-column-blocks", id);
  }

  // Downloads Block
  @Post("admin/blocks/downloads")
  @UseGuards(JwtAuthGuard)
  async createDownloadsBlock(@Body() dto: CreateDownloadsBlockDto) {
    return this.contentService.createDownloadsBlock(dto);
  }

  @Get("blocks/downloads")
  async getDownloadsBlocks(
    @Query("page") page: string = "1",
    @Query("limit") limit: string = "10",
  ) {
    return this.contentService.getDownloadsBlocks(
      parseInt(page),
      parseInt(limit),
    );
  }

  @Put("admin/blocks/downloads/:id")
  @UseGuards(JwtAuthGuard)
  async updateDownloadsBlock(
    @Param("id") id: string,
    @Body() dto: CreateDownloadsBlockDto,
  ) {
    return this.contentService.updateBlock("downloads-blocks", id, dto);
  }

  @Delete("admin/blocks/downloads/:id")
  @UseGuards(JwtAuthGuard)
  async deleteDownloadsBlock(@Param("id") id: string) {
    return this.contentService.deleteBlock("downloads-blocks", id);
  }

  // Gallery Block
  @Post("admin/blocks/gallery")
  @UseGuards(JwtAuthGuard)
  async createGalleryBlock(@Body() dto: CreateGalleryBlockDto) {
    return this.contentService.createGalleryBlock(dto);
  }

  @Get("blocks/gallery")
  async getGalleryBlocks(
    @Query("page") page: string = "1",
    @Query("limit") limit: string = "10",
  ) {
    return this.contentService.getGalleryBlocks(
      parseInt(page),
      parseInt(limit),
    );
  }

  @Put("admin/blocks/gallery/:id")
  @UseGuards(JwtAuthGuard)
  async updateGalleryBlock(
    @Param("id") id: string,
    @Body() dto: CreateGalleryBlockDto,
  ) {
    return this.contentService.updateBlock("gallery-blocks", id, dto);
  }

  @Delete("admin/blocks/gallery/:id")
  @UseGuards(JwtAuthGuard)
  async deleteGalleryBlock(@Param("id") id: string) {
    return this.contentService.deleteBlock("gallery-blocks", id);
  }

  // Media/Video Block
  @Post("admin/blocks/media-video")
  @UseGuards(JwtAuthGuard)
  async createMediaVideoBlock(@Body() dto: CreateMediaVideoBlockDto) {
    return this.contentService.createMediaVideoBlock(dto);
  }

  @Get("blocks/media-video")
  async getMediaVideoBlocks(
    @Query("page") page: string = "1",
    @Query("limit") limit: string = "10",
  ) {
    return this.contentService.getMediaVideoBlocks(
      parseInt(page),
      parseInt(limit),
    );
  }

  @Put("admin/blocks/media-video/:id")
  @UseGuards(JwtAuthGuard)
  async updateMediaVideoBlock(
    @Param("id") id: string,
    @Body() dto: CreateMediaVideoBlockDto,
  ) {
    return this.contentService.updateBlock("media-video-blocks", id, dto);
  }

  @Delete("admin/blocks/media-video/:id")
  @UseGuards(JwtAuthGuard)
  async deleteMediaVideoBlock(@Param("id") id: string) {
    return this.contentService.deleteBlock("media-video-blocks", id);
  }

  // Card Box Block
  @Post("admin/blocks/card-box")
  @UseGuards(JwtAuthGuard)
  async createCardBoxBlock(@Body() dto: CreateCardBoxBlockDto) {
    return this.contentService.createCardBoxBlock(dto);
  }

  @Get("blocks/card-box")
  async getCardBoxBlocks(
    @Query("page") page: string = "1",
    @Query("limit") limit: string = "10",
  ) {
    return this.contentService.getCardBoxBlocks(
      parseInt(page),
      parseInt(limit),
    );
  }

  @Put("admin/blocks/card-box/:id")
  @UseGuards(JwtAuthGuard)
  async updateCardBoxBlock(
    @Param("id") id: string,
    @Body() dto: CreateCardBoxBlockDto,
  ) {
    return this.contentService.updateBlock("card-box-blocks", id, dto);
  }

  @Delete("admin/blocks/card-box/:id")
  @UseGuards(JwtAuthGuard)
  async deleteCardBoxBlock(@Param("id") id: string) {
    return this.contentService.deleteBlock("card-box-blocks", id);
  }

  // CTA Section Block
  @Post("admin/blocks/cta-section")
  @UseGuards(JwtAuthGuard)
  async createCTASectionBlock(@Body() dto: CreateCTASectionBlockDto) {
    return this.contentService.createCTASectionBlock(dto);
  }

  @Get("blocks/cta-section")
  async getCTASectionBlocks(
    @Query("page") page: string = "1",
    @Query("limit") limit: string = "10",
  ) {
    return this.contentService.getCTASectionBlocks(
      parseInt(page),
      parseInt(limit),
    );
  }

  @Put("admin/blocks/cta-section/:id")
  @UseGuards(JwtAuthGuard)
  async updateCTASectionBlock(
    @Param("id") id: string,
    @Body() dto: CreateCTASectionBlockDto,
  ) {
    return this.contentService.updateBlock("cta-section-blocks", id, dto);
  }

  @Delete("admin/blocks/cta-section/:id")
  @UseGuards(JwtAuthGuard)
  async deleteCTASectionBlock(@Param("id") id: string) {
    return this.contentService.deleteBlock("cta-section-blocks", id);
  }

  // Carousel Block
  @Post("admin/blocks/carousel")
  @UseGuards(JwtAuthGuard)
  async createCarouselBlock(@Body() dto: CreateCarouselBlockDto) {
    return this.contentService.createCarouselBlock(dto);
  }

  @Get("blocks/carousel")
  async getCarouselBlocks(
    @Query("page") page: string = "1",
    @Query("limit") limit: string = "10",
  ) {
    return this.contentService.getCarouselBlocks(
      parseInt(page),
      parseInt(limit),
    );
  }

  @Put("admin/blocks/carousel/:id")
  @UseGuards(JwtAuthGuard)
  async updateCarouselBlock(
    @Param("id") id: string,
    @Body() dto: CreateCarouselBlockDto,
  ) {
    return this.contentService.updateBlock("carousel-blocks", id, dto);
  }

  @Delete("admin/blocks/carousel/:id")
  @UseGuards(JwtAuthGuard)
  async deleteCarouselBlock(@Param("id") id: string) {
    return this.contentService.deleteBlock("carousel-blocks", id);
  }

  // Pull Quote Block
  @Post("admin/blocks/pull-quote")
  @UseGuards(JwtAuthGuard)
  async createPullQuoteBlock(@Body() dto: CreatePullQuoteBlockDto) {
    return this.contentService.createPullQuoteBlock(dto);
  }

  @Get("blocks/pull-quote")
  async getPullQuoteBlocks(
    @Query("page") page: string = "1",
    @Query("limit") limit: string = "10",
  ) {
    return this.contentService.getPullQuoteBlocks(
      parseInt(page),
      parseInt(limit),
    );
  }

  @Put("admin/blocks/pull-quote/:id")
  @UseGuards(JwtAuthGuard)
  async updatePullQuoteBlock(
    @Param("id") id: string,
    @Body() dto: CreatePullQuoteBlockDto,
  ) {
    return this.contentService.updateBlock("pull-quote-blocks", id, dto);
  }

  @Delete("admin/blocks/pull-quote/:id")
  @UseGuards(JwtAuthGuard)
  async deletePullQuoteBlock(@Param("id") id: string) {
    return this.contentService.deleteBlock("pull-quote-blocks", id);
  }

  // Logo Wall Block
  @Post("admin/blocks/logo-wall")
  @UseGuards(JwtAuthGuard)
  async createLogoWallBlock(@Body() dto: CreateLogoWallBlockDto) {
    return this.contentService.createLogoWallBlock(dto);
  }

  @Get("blocks/logo-wall")
  async getLogoWallBlocks(
    @Query("page") page: string = "1",
    @Query("limit") limit: string = "10",
  ) {
    return this.contentService.getLogoWallBlocks(
      parseInt(page),
      parseInt(limit),
    );
  }

  @Put("admin/blocks/logo-wall/:id")
  @UseGuards(JwtAuthGuard)
  async updateLogoWallBlock(
    @Param("id") id: string,
    @Body() dto: CreateLogoWallBlockDto,
  ) {
    return this.contentService.updateBlock("logo-wall-blocks", id, dto);
  }

  @Delete("admin/blocks/logo-wall/:id")
  @UseGuards(JwtAuthGuard)
  async deleteLogoWallBlock(@Param("id") id: string) {
    return this.contentService.deleteBlock("logo-wall-blocks", id);
  }

  // Code Snippet Block
  @Post("admin/blocks/code-snippet")
  @UseGuards(JwtAuthGuard)
  async createCodeSnippetBlock(@Body() dto: CreateCodeSnippetBlockDto) {
    return this.contentService.createCodeSnippetBlock(dto);
  }

  @Get("blocks/code-snippet")
  async getCodeSnippetBlocks(
    @Query("page") page: string = "1",
    @Query("limit") limit: string = "10",
  ) {
    return this.contentService.getCodeSnippetBlocks(
      parseInt(page),
      parseInt(limit),
    );
  }

  @Put("admin/blocks/code-snippet/:id")
  @UseGuards(JwtAuthGuard)
  async updateCodeSnippetBlock(
    @Param("id") id: string,
    @Body() dto: CreateCodeSnippetBlockDto,
  ) {
    return this.contentService.updateBlock("code-snippet-blocks", id, dto);
  }

  @Delete("admin/blocks/code-snippet/:id")
  @UseGuards(JwtAuthGuard)
  async deleteCodeSnippetBlock(@Param("id") id: string) {
    return this.contentService.deleteBlock("code-snippet-blocks", id);
  }
}
