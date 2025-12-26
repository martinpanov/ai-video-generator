import { Clip } from "@/generated/prisma/client";

export const Video = ({ clip }: { clip: Clip; }) => {
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
          src={clip.clipUrl as string}
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
};