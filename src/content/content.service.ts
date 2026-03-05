import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import { CreateArticleDto } from "./dto/create-article.dto.js";

type CmsProvider = "payload" | "strapi";

@Injectable()
export class ContentService {
  constructor(private prisma: PrismaService) {}

  async createArticle(
    createArticleDto: CreateArticleDto,
    userId: string,
    cms?: string,
  ) {
    const provider = this.resolveProvider(cms);
    if (provider === "strapi") {
      return this.createArticleInStrapi(createArticleDto, userId);
    }

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

  async updateArticle(
    id: string,
    updateArticleDto: CreateArticleDto,
    cms?: string,
  ) {
    const provider = this.resolveProvider(cms);
    if (provider === "strapi") {
      return this.updateArticleInStrapi(id, updateArticleDto);
    }

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

  async deleteArticle(id: string, cms?: string) {
    const provider = this.resolveProvider(cms);
    if (provider === "strapi") {
      return this.deleteArticleInStrapi(id);
    }

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

  async getPublishedArticles(
    page: number = 1,
    limit: number = 10,
    cms?: string,
  ) {
    const provider = this.resolveProvider(cms);
    if (provider === "strapi") {
      return this.getPublishedArticlesFromStrapi(page, limit);
    }

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

      // Populate author data from Prisma
      const articlesWithAuthors = await this.populateAuthorData(articles.docs);

      return {
        ...articles,
        docs: articlesWithAuthors,
      };
    } catch (error) {
      throw new BadRequestException("Failed to fetch articles");
    }
  }

  private async populateAuthorData(articles: any[]) {
    // Fetch all authors from Prisma in one query
    const authorIds = articles.map((a) => a.author).filter((id) => id != null);
    const uniqueIds = [...new Set(authorIds)];

    const authors = await this.prisma.user.findMany({
      where: { id: { in: uniqueIds } },
      select: { id: true, email: true, name: true },
    });

    const authorMap = Object.fromEntries(authors.map((a) => [a.id, a]));

    // Enhance articles with author data
    return articles.map((article) => ({
      ...article,
      author: article.author ? authorMap[article.author] : null,
    }));
  }

  async getArticleBySlug(slug: string, cms?: string) {
    const provider = this.resolveProvider(cms);
    if (provider === "strapi") {
      return this.getArticleBySlugFromStrapi(slug);
    }

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

      // Populate author data from Prisma
      const articlesWithAuthors = await this.populateAuthorData(result.docs);

      return articlesWithAuthors[0];
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException("Failed to fetch article");
    }
  }

  async getUsers() {
    try {
      // Fetch all users from Prisma (NestJS users table)
      const users = await this.prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
        },
      });

      return users;
    } catch (error) {
      throw new BadRequestException("Failed to fetch users");
    }
  }

  async getAllArticles(
    page: number = 1,
    limit: number = 10,
    status?: string,
    cms?: string,
  ) {
    const provider = this.resolveProvider(cms);
    if (provider === "strapi") {
      return this.getAllArticlesFromStrapi(page, limit, status);
    }

    try {
      // Filter by status if provided, otherwise return all articles
      const where = status ? { status: { equals: status } } : {};

      const articles = await globalThis.payload.find({
        collection: "articles",
        where,
        page,
        limit,
        sort: "-createdAt",
      });

      // Populate author data from Prisma
      const articlesWithAuthors = await this.populateAuthorData(articles.docs);

      return {
        ...articles,
        docs: articlesWithAuthors,
      };
    } catch (error) {
      throw new BadRequestException("Failed to fetch articles");
    }
  }

  async publishArticle(id: string, cms?: string) {
    const provider = this.resolveProvider(cms);
    if (provider === "strapi") {
      return this.publishArticleInStrapi(id);
    }

    try {
      // Update article status from draft to published
      const article = await globalThis.payload.update({
        collection: "articles",
        id,
        data: {
          status: "published",
        },
      });

      // Populate author data from Prisma
      const articlesWithAuthors = await this.populateAuthorData([article]);

      return articlesWithAuthors[0];
    } catch (error) {
      if (error.message?.includes("not found") || error.status === 404) {
        throw new NotFoundException("Article not found");
      }
      throw new BadRequestException(
        error.message || "Failed to publish article",
      );
    }
  }

  private resolveProvider(cms?: string): CmsProvider {
    return cms === "strapi" ? "strapi" : "payload";
  }

  private getStrapiBaseUrl(): string {
    return process.env.STRAPI_URL || "http://localhost:1337";
  }

  private getStrapiAdminToken(): string | undefined {
    return process.env.STRAPI_API_TOKEN;
  }

  private async strapiRequest<T>(
    path: string,
    options: {
      method?: string;
      params?: Record<string, string | number | undefined>;
      body?: unknown;
      isAdmin?: boolean;
    } = {},
  ): Promise<T> {
    const baseUrl = this.getStrapiBaseUrl();
    const url = new URL(path, baseUrl);
    if (options.params) {
      Object.entries(options.params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.set(key, String(value));
        }
      });
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (options.isAdmin) {
      const token = this.getStrapiAdminToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }

    const response = await fetch(url.toString(), {
      method: options.method || "GET",
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    if (!response.ok) {
      const errorText = await response.text();
      if (response.status === 404) {
        throw new NotFoundException("Article not found");
      }
      throw new BadRequestException(
        errorText || `Strapi request failed (${response.status})`,
      );
    }

    // Handle empty responses (e.g., 204 No Content for DELETE)
    const contentType = response.headers.get("content-type");
    if (response.status === 204 || !contentType?.includes("application/json")) {
      return {} as T;
    }

    // Check if response has content before parsing
    const text = await response.text();
    if (!text || text.trim() === "") {
      return {} as T;
    }

    return JSON.parse(text) as T;
  }

  private mapStrapiArticle(item: any) {
    if (!item) return null;

    // Strapi v5 flattened the response structure - fields are directly on item, not item.attributes
    const data = item.attributes || item;

    const tags = Array.isArray(data.tags)
      ? data.tags
      : Array.isArray(data.tags?.data)
        ? data.tags.data.map((t: any) => t.attributes?.tag || t.name || t)
        : undefined;

    return {
      id: String(item.documentId || item.id),
      title: data.title || "Untitled",
      slug: data.slug || "",
      summaryTitle: data.summaryTitle || "",
      content: data.content || "",
      featuredImage: data.featuredImage || "",
      tags: tags || [],
      dashboardUrl: data.dashboardUrl,
      meta: data.meta,
      searchExclude: data.searchExclude,
      sitemap: data.sitemap,
      urlAlias: data.urlAlias,
      publishAt: data.publishAt,
      unpublishAt: data.unpublishAt,
      author: data.author,
      promoted: data.promoted,
      status: data.publishedAt ? "published" : "draft",
      createdAt: data.createdAt || data.publishedAt || new Date().toISOString(),
      updatedAt: data.updatedAt || data.publishedAt || new Date().toISOString(),
    };
  }

  private mapStrapiCollectionResponse(response: any) {
    const docs = Array.isArray(response?.data)
      ? response.data.map((item: any) => this.mapStrapiArticle(item))
      : [];
    const pagination = response?.meta?.pagination || {};

    return {
      docs,
      totalDocs: pagination.total ?? docs.length,
      totalPages: pagination.pageCount ?? 1,
      page: pagination.page ?? 1,
      limit: pagination.pageSize ?? docs.length,
      hasNextPage:
        pagination.pageCount && pagination.page
          ? pagination.page < pagination.pageCount
          : false,
      hasPrevPage: pagination.page ? pagination.page > 1 : false,
      nextPage:
        pagination.pageCount &&
        pagination.page &&
        pagination.page < pagination.pageCount
          ? pagination.page + 1
          : null,
      prevPage:
        pagination.page && pagination.page > 1 ? pagination.page - 1 : null,
    };
  }

  private convertRichTextToString(content: any): string {
    // If content is already a string, return it
    if (typeof content === "string") {
      return content;
    }

    // If content is null or undefined, return empty string
    if (!content) {
      return "";
    }

    // If content is a Lexical/Payload rich text object, convert to JSON string
    if (typeof content === "object") {
      // Try to extract plain text from the rich text structure
      const extractText = (node: any): string => {
        if (!node) return "";

        if (typeof node === "string") return node;

        if (node.text) return node.text;

        if (Array.isArray(node)) {
          return node.map(extractText).join("");
        }

        if (node.children) {
          return extractText(node.children);
        }

        if (node.root) {
          return extractText(node.root);
        }

        return "";
      };

      const plainText = extractText(content);
      // Return plain text if we extracted any, otherwise stringify the object
      return plainText || JSON.stringify(content);
    }

    return String(content);
  }

  private async createArticleInStrapi(
    createArticleDto: CreateArticleDto,
    userId: string,
  ) {
    // Extract only fields that exist in Strapi's Article schema
    const { title, slug, summaryTitle, content, featuredImage, tags, author } =
      createArticleDto;

    const payload = {
      data: {
        title,
        slug,
        summaryTitle,
        content: this.convertRichTextToString(content),
        featuredImage,
        tags,
        author: author || userId,
      },
    };

    // In Strapi v5, we need to publish separately if status is 'published'
    const shouldPublish = createArticleDto.status === "published";

    const response = await this.strapiRequest<any>("/api/articles", {
      method: "POST",
      body: payload,
      isAdmin: true,
    });

    let article = response.data;

    // If status is published, publish the document
    if (shouldPublish && article?.documentId) {
      try {
        await this.strapiRequest<any>(
          `/api/articles/${article.documentId}/actions/publish`,
          {
            method: "POST",
            isAdmin: true,
          },
        );

        // Fetch the updated article to get the publishedAt timestamp
        const updatedResponse = await this.strapiRequest<any>(
          `/api/articles/${article.documentId}`,
          {
            isAdmin: true,
          },
        );
        article = updatedResponse.data;
      } catch (error) {
        // If publish action fails, log but don't throw - article was created successfully
        console.error("Failed to publish article:", error.message);
      }
    }

    return this.mapStrapiArticle(article);
  }

  private async updateArticleInStrapi(
    id: string,
    updateArticleDto: CreateArticleDto,
  ) {
    // Extract only fields that exist in Strapi's Article schema
    const {
      title,
      slug,
      summaryTitle,
      content,
      featuredImage,
      tags,
      author,
      status,
    } = updateArticleDto;

    const payload = {
      data: {
        title,
        slug,
        summaryTitle,
        content: this.convertRichTextToString(content),
        featuredImage,
        tags,
        author,
      },
    };

    // In Strapi v5, use documentId for updates
    const response = await this.strapiRequest<any>(`/api/articles/${id}`, {
      method: "PUT",
      body: payload,
      isAdmin: true,
    });

    let article = response.data;

    // Handle publish/unpublish actions
    if (status === "published" && article?.documentId) {
      try {
        await this.strapiRequest<any>(
          `/api/articles/${article.documentId}/actions/publish`,
          {
            method: "POST",
            isAdmin: true,
          },
        );

        // Fetch the updated article to get the publishedAt timestamp
        const updatedResponse = await this.strapiRequest<any>(
          `/api/articles/${article.documentId}`,
          {
            isAdmin: true,
          },
        );
        article = updatedResponse.data;
      } catch (error) {
        // If publish action fails, log but don't throw - article was updated successfully
        console.error("Failed to publish article:", error.message);
      }
    } else if (status === "draft" && article?.documentId) {
      try {
        await this.strapiRequest<any>(
          `/api/articles/${article.documentId}/actions/unpublish`,
          {
            method: "POST",
            isAdmin: true,
          },
        );

        // Fetch the updated article to get the correct state
        const updatedResponse = await this.strapiRequest<any>(
          `/api/articles/${article.documentId}`,
          {
            isAdmin: true,
          },
        );
        article = updatedResponse.data;
      } catch (error) {
        // If unpublish action fails, log but don't throw - article was updated successfully
        console.error("Failed to unpublish article:", error.message);
      }
    }

    return this.mapStrapiArticle(article);
  }

  private async deleteArticleInStrapi(id: string) {
    await this.strapiRequest<any>(`/api/articles/${id}`, {
      method: "DELETE",
      isAdmin: true,
    });

    return { message: "Article deleted successfully" };
  }

  private async getPublishedArticlesFromStrapi(page: number, limit: number) {
    const params = {
      "pagination[page]": page,
      "pagination[pageSize]": limit,
      sort: "createdAt:desc",
      "filters[publishedAt][$notNull]": "true",
    } as Record<string, string | number>;

    const response = await this.strapiRequest<any>("/api/articles", {
      params,
      isAdmin: true,
    });

    const mapped = this.mapStrapiCollectionResponse(response);
    const articlesWithAuthors = await this.populateAuthorData(mapped.docs);

    return {
      ...mapped,
      docs: articlesWithAuthors,
    };
  }

  private async getAllArticlesFromStrapi(
    page: number,
    limit: number,
    status?: string,
  ) {
    const params: Record<string, string | number> = {
      "pagination[page]": page,
      "pagination[pageSize]": limit,
      sort: "createdAt:desc",
      publicationState: "preview",
    };

    if (status === "published") {
      params["filters[publishedAt][$notNull]"] = "true";
    }
    if (status === "draft") {
      params["filters[publishedAt][$null]"] = "true";
    }

    const response = await this.strapiRequest<any>("/api/articles", {
      params,
      isAdmin: true,
    });

    const mapped = this.mapStrapiCollectionResponse(response);
    const articlesWithAuthors = await this.populateAuthorData(mapped.docs);

    return {
      ...mapped,
      docs: articlesWithAuthors,
    };
  }

  private async publishArticleInStrapi(id: string) {
    const payload = {
      data: {
        publishedAt: new Date().toISOString(),
      },
    };

    const response = await this.strapiRequest<any>(`/api/articles/${id}`, {
      method: "PUT",
      body: payload,
      isAdmin: true,
    });

    const article = this.mapStrapiArticle(response.data);
    const articlesWithAuthors = await this.populateAuthorData([article]);
    return articlesWithAuthors[0];
  }

  private async getArticleBySlugFromStrapi(slug: string) {
    const params = {
      "filters[slug][$eq]": slug,
      "pagination[page]": 1,
      "pagination[pageSize]": 1,
    } as Record<string, string | number>;

    console.log("Fetching article by slug from Strapi:", slug);

    const response = await this.strapiRequest<any>("/api/articles", {
      params,
      isAdmin: true,
    });

    console.log("Strapi response:", JSON.stringify(response, null, 2));

    const mapped = this.mapStrapiCollectionResponse(response);
    console.log("Mapped docs count:", mapped.docs.length);

    if (!mapped.docs.length) {
      throw new NotFoundException("Article not found");
    }

    const articlesWithAuthors = await this.populateAuthorData(mapped.docs);
    return articlesWithAuthors[0];
  }
}
