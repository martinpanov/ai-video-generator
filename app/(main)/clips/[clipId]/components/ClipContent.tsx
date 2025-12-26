import { prisma } from "@/app/lib/db";
import { verifySession } from "@/app/lib/session";
import { notFound } from "next/navigation";
import { Video } from "./Video";
import { NotAvailableVideo } from "./NotAvailableVideo";

type ClipContentProps = {
  params: Promise<{ clipId: string; }>;
};

export async function ClipContent({ params }: ClipContentProps) {
  const { clipId } = await params;
  const userId = await verifySession();

  const clip = await prisma.clip.findUnique({
    where: {
      id: clipId,
      userId: userId as string
    },
  });

  if (!clip) {
    notFound();
  }

  if (!clip.clipUrl) {
    return <NotAvailableVideo />;
  }

  return <Video key={clip.id} clip={clip} />;
}
