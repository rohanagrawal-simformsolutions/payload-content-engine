import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsOptional,
  IsArray,
  IsBoolean,
  IsISO8601,
  ValidateNested,
  IsUUID,
} from "class-validator";
import { Type } from "class-transformer";

class SeoDto {
  @IsOptional()
  @IsString()
  metaTitle?: string;

  @IsOptional()
  @IsString()
  metaDescription?: string;

  @IsOptional()
  @IsString()
  ogImage?: string;

  @IsOptional()
  @IsString()
  canonicalUrl?: string;

  @IsOptional()
  @IsBoolean()
  noIndex?: boolean;
}

class SitemapDto {
  @IsOptional()
  @IsEnum(["default", "included", "excluded"])
  inclusion?: "default" | "included" | "excluded";

  @IsOptional()
  @IsEnum(["always", "hourly", "daily", "weekly", "monthly", "yearly", "never"])
  changeFrequency?:
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never";
}

export class CreateArticleDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsOptional()
  content?: any;

  @IsOptional()
  @IsArray()
  blocks?: any[];

  @IsOptional()
  @IsString()
  featuredImage?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  dashboardUrl?: string;

  @IsOptional()
  @IsString()
  summaryTitle?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => SeoDto)
  seo?: SeoDto;

  @IsOptional()
  @IsBoolean()
  searchExclude?: boolean;

  @IsOptional()
  @ValidateNested()
  @Type(() => SitemapDto)
  sitemap?: SitemapDto;

  @IsOptional()
  @IsString()
  urlAlias?: string;

  @IsOptional()
  @IsISO8601()
  publishAt?: string;

  @IsOptional()
  @IsISO8601()
  unpublishAt?: string;

  @IsOptional()
  @IsString()
  @IsUUID()
  author?: string; // UUID reference to Users collection

  @IsOptional()
  @IsBoolean()
  promoted?: boolean;

  @IsEnum(["draft", "published"])
  @IsOptional()
  status?: "draft" | "published";
}
