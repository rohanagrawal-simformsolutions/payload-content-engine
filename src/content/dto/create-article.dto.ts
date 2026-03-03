import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsOptional,
  IsArray,
  IsBoolean,
  IsISO8601,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

class MetaDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  image?: string;
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
  @Type(() => MetaDto)
  meta?: MetaDto;

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
  author?: string;

  @IsOptional()
  @IsBoolean()
  promoted?: boolean;

  @IsEnum(["draft", "published"])
  @IsOptional()
  status?: "draft" | "published";
}
