import {
  Controller,
  Get,
  Query,
  Res,
  BadRequestException,
} from "@nestjs/common";
import { Response } from "express";
import * as http from "http";
import * as https from "https";

// Lenient agent — ignores self-signed / untrusted certs (POC only)
const httpsAgent = new https.Agent({ rejectUnauthorized: false });
const httpAgent = new http.Agent();

function fetchRemote(
  url: string,
): Promise<{ res: http.IncomingMessage; statusCode: number }> {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const lib = parsed.protocol === "https:" ? https : http;
    const agent = parsed.protocol === "https:" ? httpsAgent : httpAgent;
    const req = lib.get(url, { agent } as any, (res) => {
      resolve({ res, statusCode: res.statusCode ?? 0 });
    });
    req.on("error", reject);
    req.setTimeout(15_000, () => {
      req.destroy(new Error("Request timed out"));
    });
  });
}

@Controller("download-proxy")
export class DownloadProxyController {
  @Get()
  async proxyDownload(@Query("url") url: string, @Res() res: Response) {
    if (!url) {
      throw new BadRequestException("url query parameter is required");
    }

    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      throw new BadRequestException("Invalid URL");
    }

    if (!["http:", "https:"].includes(parsed.protocol)) {
      throw new BadRequestException("Only http/https URLs are supported");
    }

    let remote: http.IncomingMessage;
    let statusCode: number;

    try {
      ({ res: remote, statusCode } = await fetchRemote(url));
    } catch (err: any) {
      res
        .status(502)
        .json({ message: `Failed to reach remote server: ${err?.message}` });
      return;
    }

    if (statusCode < 200 || statusCode >= 300) {
      remote.resume(); // drain
      res
        .status(statusCode)
        .json({ message: `Remote server returned ${statusCode}` });
      return;
    }

    // Forward headers
    const contentType =
      remote.headers["content-type"] || "application/octet-stream";
    res.setHeader("Content-Type", contentType);

    const filename = parsed.pathname.split("/").pop() || "download";
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${decodeURIComponent(filename)}"`,
    );

    if (remote.headers["content-length"]) {
      res.setHeader("Content-Length", remote.headers["content-length"]);
    }

    // Pipe response body directly to client
    remote.pipe(res);
  }
}
