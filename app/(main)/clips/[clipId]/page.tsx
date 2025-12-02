import { prisma } from "@/app/lib/db";
import { verifySession } from "@/app/lib/session";
import { notFound } from "next/navigation";

type Params = Promise<{ clipId: string; }>;

export default async function PlayClip(props: { params: Params; }) {
  const params = await props.params;
  const userId = await verifySession();

  const clip = await prisma.clip.findUnique({
    where: { id: params.clipId },
  });

  if (!clip || clip.userId !== userId) {
    notFound();
  }

  if (!clip.clipUrl) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Video Not Available</h1>
          <p className="text-muted-foreground">This video has not been processed yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden">
      <div className="shrink-0 p-4 border-b border-gray-700">
        <h1 className="text-xl font-bold text-white truncate">{clip.title}</h1>
        {clip.description && (
          <p className="text-sm text-gray-400 truncate">{clip.description}</p>
        )}
      </div>
      <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
        <video
          src={clip.clipUrl}
          controls
          autoPlay
          className="max-w-full max-h-full rounded-lg shadow-2xl"
          preload="metadata"
        >
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  );
}
