import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { CreateArticleDto } from "./dto/create-article.dto.js";

@Injectable()
export class ContentService {
  async createArticle(createArticleDto: CreateArticleDto, userId: string) {
    try {
      const { tags, ...rest } = createArticleDto;
      const mappedTags = Array.isArray(tags)
        ? tags.map((tag) => ({ tag }))
        : undefined;

      // Use Payload local API to create article
      const article = await globalThis.payload.create({
        collection: "articles",
        data: {
          ...rest,
          tags: mappedTags,
          status: createArticleDto.status || "draft",
        },
      });

      return article;
    } catch (error) {
      throw new BadRequestException(
        error.message || "Failed to create article",
      );
    }
  }

  async updateArticle(id: string, updateArticleDto: CreateArticleDto) {
    try {
      const { tags, ...rest } = updateArticleDto;
      const mappedTags = Array.isArray(tags)
        ? tags.map((tag) => ({ tag }))
        : undefined;

      const article = await globalThis.payload.update({
        collection: "articles",
        id,
        data: {
          ...rest,
          tags: mappedTags,
        },
      });

      return article;
    } catch (error) {
      if (error.message?.includes("not found") || error.status === 404) {
        throw new NotFoundException("Article not found");
      }
      throw new BadRequestException(
        error.message || "Failed to update article",
      );
    }
  }

  async deleteArticle(id: string) {
    try {
      await globalThis.payload.delete({
        collection: "articles",
        id,
      });

      return { message: "Article deleted successfully" };
    } catch (error) {
      if (error.message?.includes("not found") || error.status === 404) {
        throw new NotFoundException("Article not found");
      }
      throw new BadRequestException(
        error.message || "Failed to delete article",
      );
    }
  }

  async getPublishedArticles(page: number = 1, limit: number = 10) {
    try {
      const now = new Date().toISOString();
      // Use Payload local API to find published articles
      const articles = await globalThis.payload.find({
        collection: "articles",
        where: {
          and: [
            {
              status: {
                equals: "published",
              },
            },
            {
              or: [
                {
                  publishAt: {
                    less_than_equal: now,
                  },
                },
                {
                  publishAt: {
                    exists: false,
                  },
                },
              ],
            },
            {
              or: [
                {
                  unpublishAt: {
                    greater_than: now,
                  },
                },
                {
                  unpublishAt: {
                    exists: false,
                  },
                },
              ],
            },
          ],
        },
        page,
        limit,
        sort: "-createdAt",
      });

      return articles;
    } catch (error) {
      throw new BadRequestException("Failed to fetch articles");
    }
  }

  async getArticleBySlug(slug: string) {
    try {
      const now = new Date().toISOString();
      const result = await globalThis.payload.find({
        collection: "articles",
        where: {
          and: [
            {
              slug: {
                equals: slug,
              },
            },
            {
              status: {
                equals: "published",
              },
            },
            {
              or: [
                {
                  publishAt: {
                    less_than_equal: now,
                  },
                },
                {
                  publishAt: {
                    exists: false,
                  },
                },
              ],
            },
            {
              or: [
                {
                  unpublishAt: {
                    greater_than: now,
                  },
                },
                {
                  unpublishAt: {
                    exists: false,
                  },
                },
              ],
            },
          ],
        },
        limit: 1,
      });

      if (result.docs.length === 0) {
        throw new NotFoundException("Article not found");
      }

      return result.docs[0];
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException("Failed to fetch article");
    }
  }
}
