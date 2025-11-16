import { requestYoutubeLink } from "@/app/services/transcribeVideo/youtube";
import { getMetadata } from "../../services/transcribeVideo/metadata";
import { generateTranscript } from "../../services/transcribeVideo/transcribe";
import { NextResponse } from "next/server";

const YOUTUBE_URLS = ["youtube.com", "youtu.be", "youtube"];

export async function POST(request: Request) {
  try {
    const config = await request.json();
    const isYoutubeUrl = YOUTUBE_URLS.some(url => config.videoUrl.includes(url));

    if (isYoutubeUrl) {
      const jobId = await requestYoutubeLink(config);
      return NextResponse.json({ jobId });
    }

    const jobId = await getMetadata(config);
    await generateTranscript(config.videoUrl, jobId);

    return NextResponse.json({ jobId });
  } catch (error: any) {
    console.error('Failed to process video:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process video', step: error.step },
      { status: 500 }
    );
  }
}