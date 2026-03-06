import { Module } from "@nestjs/common";
import { ContentService } from "./content.service.js";
import { ContentController } from "./content.controller.js";
import { DownloadProxyController } from "./download-proxy.controller.js";

@Module({
  controllers: [ContentController, DownloadProxyController],
  providers: [ContentService],
})
export class ContentModule {}
