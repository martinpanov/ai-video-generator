import { NextResponse } from "next/server";
import { create as createYoutubeDl } from "youtube-dl-exec";

export async function getYoutubeLink(videoUrl: string) {
  try {
    const youtubeDl = createYoutubeDl('yt-dlp');
    const result: any = await youtubeDl(videoUrl, {
      dumpSingleJson: true,
      noCheckCertificates: true,
      noWarnings: true,
      preferFreeFormats: true,
      addHeader: ['referer:youtube.com', 'user-agent:googlebot']
    });

    return result.url;
  } catch (error: any) {
    console.error('❌ yt-dlp error:', error.message);
    console.error('Full error:', error);
    return NextResponse.json({ error: "Failed to get youtube link" }, { status: 500 });
  }
}