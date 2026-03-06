import {
  IsNotEmpty,
  IsString,
  IsArray,
  IsOptional,
  IsUrl,
  IsBoolean,
  IsNumber,
  ValidateNested,
  IsEnum,
  Min,
  Max,
  ValidateIf,
} from "class-validator";
import { Type } from "class-transformer";

// ===== ACCORDION BLOCK =====
export class AccordionItemDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsArray()
  nestedBlocks?: any[];

  @IsOptional()
  @IsBoolean()
  isExpanded?: boolean;
}

export class CreateAccordionBlockDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  anchorId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AccordionItemDto)
  items: AccordionItemDto[];

  @IsOptional()
  @IsBoolean()
  allowMultipleOpen?: boolean;
}

// ===== TABS BLOCK =====
export class TabContentBlockDto {
  @IsEnum(["richText", "accordion", "media", "downloads", "cta"])
  blockType: string;

  @IsOptional()
  @IsString()
  content?: string;

  @ValidateIf((o) => o.mediaUrl != null && o.mediaUrl !== "")
  @IsUrl()
  mediaUrl?: string;

  @IsOptional()
  @IsString()
  ctaText?: string;

  @IsOptional()
  @IsString()
  ctaUrl?: string;

  @IsOptional()
  @IsArray()
  nestedBlocks?: any[];
}

export class TabDto {
  @IsString()
  @IsNotEmpty()
  tabTitle: string;

  @IsString()
  @IsNotEmpty()
  tabId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TabContentBlockDto)
  blocks: TabContentBlockDto[];
}

export class CreateTabsBlockDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  anchorId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TabDto)
  tabs: TabDto[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  activeTabIndex?: number;
}

// ===== TWO-COLUMN BLOCK =====
export class ColumnContentDto {
  @IsEnum(["richText", "media", "blocks"])
  contentType: string;

  @IsOptional()
  @IsString()
  richText?: string;

  @ValidateIf((o) => o.mediaUrl != null && o.mediaUrl !== "")
  @IsUrl()
  mediaUrl?: string;

  @IsOptional()
  @IsString()
  mediaAlt?: string;

  @IsOptional()
  @IsArray()
  nestedBlocks?: any[];
}

export class CreateTwoColumnBlockDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsEnum(["imageText", "textImage", "textText"])
  layout: string;

  @ValidateNested()
  @Type(() => ColumnContentDto)
  leftColumn: ColumnContentDto;

  @ValidateNested()
  @Type(() => ColumnContentDto)
  rightColumn: ColumnContentDto;

  @IsOptional()
  @IsEnum(["50-50", "60-40", "40-60", "70-30", "30-70"])
  columnRatio?: string;

  @IsOptional()
  @IsBoolean()
  reverseOnMobile?: boolean;
}

// ===== DOWNLOADS BLOCK =====
export class DownloadFileDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsUrl()
  @IsNotEmpty()
  fileUrl: string;

  @IsOptional()
  @IsString()
  fileSize?: string;

  @IsEnum(["pdf", "docx", "xlsx", "pptx", "zip", "image", "other"])
  fileType: string;

  @IsEnum(["public", "members", "premium"])
  accessLevel: string;
}

export class CreateDownloadsBlockDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DownloadFileDto)
  files: DownloadFileDto[];

  @IsOptional()
  @IsBoolean()
  trackAnalytics?: boolean;
}

// ===== GALLERY BLOCK =====
export class GalleryImageDto {
  @IsUrl()
  @IsNotEmpty()
  imageUrl: string;

  @IsString()
  @IsNotEmpty()
  altText: string;

  @IsOptional()
  @IsString()
  caption?: string;

  @IsOptional()
  @IsEnum(["1-1", "3-4", "16-9", "21-9"])
  aspectRatio?: string;
}

export class CreateGalleryBlockDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GalleryImageDto)
  images: GalleryImageDto[];

  @IsEnum(["grid-3", "grid-4", "masonry", "carousel"])
  layout: string;

  @IsOptional()
  @IsBoolean()
  enableLightbox?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(6)
  columnsOnDesktop?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(3)
  columnsOnMobile?: number;
}

// ===== MEDIA VIDEO BLOCK =====
export class CreateMediaVideoBlockDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(["youtube", "vimeo", "selfHosted", "embed"])
  sourceType: string;

  @ValidateIf((o) => o.youtubeUrl != null && o.youtubeUrl !== "")
  @IsUrl()
  youtubeUrl?: string;

  @ValidateIf((o) => o.vimeoUrl != null && o.vimeoUrl !== "")
  @IsUrl()
  vimeoUrl?: string;

  @ValidateIf((o) => o.videoUrl != null && o.videoUrl !== "")
  @IsUrl()
  videoUrl?: string;

  @ValidateIf((o) => o.thumbnailUrl != null && o.thumbnailUrl !== "")
  @IsUrl()
  thumbnailUrl?: string;

  @IsOptional()
  @IsString()
  embedCode?: string;

  @IsOptional()
  @IsEnum(["16-9", "4-3", "1-1", "9-16"])
  aspectRatio?: string;

  @IsOptional()
  @IsBoolean()
  autoplay?: boolean;

  @IsOptional()
  @IsBoolean()
  controls?: boolean;

  @IsOptional()
  @IsBoolean()
  trackAnalytics?: boolean;
}

// ===== CARD BOX BLOCK =====
export class CardCtaDto {
  @IsString()
  @IsNotEmpty()
  text: string;

  @IsString()
  @IsNotEmpty()
  url: string;

  @IsEnum(["primary", "secondary", "tertiary"])
  style: string;
}

export class CardDto {
  @IsString()
  @IsNotEmpty()
  cardTitle: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @ValidateIf((o) => o.imageUrl != null && o.imageUrl !== "")
  @IsUrl()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  imageAlt?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => CardCtaDto)
  cta?: CardCtaDto;
}

export class CreateCardBoxBlockDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CardDto)
  cards: CardDto[];

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(4)
  columnsDesktop?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(2)
  columnsMobile?: number;

  @IsOptional()
  @IsEnum(["auto", "small", "medium", "large"])
  cardHeight?: string;
}

// ===== CTA SECTION BLOCK =====
export class CtaButtonDto {
  @IsString()
  @IsNotEmpty()
  text: string;

  @IsString()
  @IsNotEmpty()
  url: string;

  @IsOptional()
  @IsBoolean()
  openInNewTab?: boolean;
}

export class CreateCTASectionBlockDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @ValidateNested()
  @Type(() => CtaButtonDto)
  primaryCta: CtaButtonDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => CtaButtonDto)
  secondaryCta?: CtaButtonDto;

  @IsOptional()
  @IsEnum(["primary", "secondary", "light", "dark", "gradient"])
  backgroundStyle?: string;

  @IsOptional()
  @IsEnum(["left", "center", "right"])
  textAlignment?: string;
}

// ===== CAROUSEL BLOCK =====
export class CarouselSlideDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsUrl()
  @IsNotEmpty()
  imageUrl: string;

  @IsString()
  @IsNotEmpty()
  imageAlt: string;

  @IsOptional()
  @IsString()
  linkUrl?: string;

  @IsOptional()
  @IsString()
  ctaText?: string;
}

export class CreateCarouselBlockDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsEnum(["cardBox", "image", "profile", "resource", "content"])
  carouselType: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CarouselSlideDto)
  slides: CarouselSlideDto[];

  @IsOptional()
  @IsBoolean()
  autoplay?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(1000)
  @Max(30000)
  autoplayInterval?: number;

  @IsOptional()
  @IsBoolean()
  showNavigation?: boolean;

  @IsOptional()
  @IsBoolean()
  showPagination?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(6)
  slidesPerView?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  gap?: number;
}

// ===== PULL QUOTE BLOCK =====
export class CreatePullQuoteBlockDto {
  @IsString()
  @IsNotEmpty()
  quote: string;

  @IsString()
  @IsNotEmpty()
  author: string;

  @IsOptional()
  @IsString()
  authorTitle?: string;

  @ValidateIf((o) => o.authorImage != null && o.authorImage !== "")
  @IsUrl()
  authorImage?: string;

  @IsOptional()
  @IsString()
  authorImageAlt?: string;

  @IsOptional()
  @IsEnum(["testimonial", "successStory", "endorsement", "quote"])
  quoteType?: string;

  @IsOptional()
  @IsEnum(["light", "primary", "secondary", "gradient"])
  backgroundColor?: string;

  @IsOptional()
  @IsEnum(["left", "center", "right"])
  textAlignment?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  rating?: number;
}

// ===== LOGO WALL BLOCK =====
export class LogoDto {
  @IsUrl()
  @IsNotEmpty()
  logoUrl: string;

  @IsString()
  @IsNotEmpty()
  altText: string;

  @IsString()
  @IsNotEmpty()
  companyName: string;

  @IsOptional()
  @IsString()
  linkUrl?: string;

  @IsOptional()
  @IsBoolean()
  openInNewTab?: boolean;
}

export class CreateLogoWallBlockDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LogoDto)
  logos: LogoDto[];

  @IsOptional()
  @IsEnum(["60", "80", "100", "120"])
  maxLogoHeight?: string;

  @IsOptional()
  @IsNumber()
  @Min(2)
  @Max(6)
  columnsDesktop?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(3)
  columnsMobile?: number;

  @IsOptional()
  @IsEnum(["grid", "center", "spaced"])
  alignmentStyle?: string;
}

// ===== CODE SNIPPET BLOCK =====
export class CreateCodeSnippetBlockDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(["iframe", "script"])
  embedType: string;

  @IsOptional()
  @IsString()
  iframeCode?: string;

  @IsOptional()
  @IsString()
  scriptCode?: string;

  @IsOptional()
  @IsEnum(["16-9", "4-3", "1-1", "auto"])
  aspectRatio?: string;

  @IsOptional()
  @IsNumber()
  @Min(300)
  @Max(1920)
  maxWidth?: number;

  @IsOptional()
  @IsBoolean()
  allowFullscreen?: boolean;

  @IsOptional()
  @IsBoolean()
  sandboxRestrictions?: boolean;

  @IsOptional()
  @IsString()
  fallbackText?: string;
}
