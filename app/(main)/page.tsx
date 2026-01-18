import { StatusDialog } from "./components/Status/StatusDialog";
import { VideoForm } from "./components/VideoForm/VideoForm";

export default async function Home() {
  return (
    <>
      <div className="flex flex-col justify-center items-center w-full py-10">
        <div className="flex gap-12 flex-col w-2xl">
          <div className="flex gap-1 flex-col">
            <h1 className="text-3xl font-bold">AI Video Generator</h1>
            <p className="text-gray-400">Configure your source and output settings to generate high-quality short-form content.</p>
          </div>

          <VideoForm />
        </div>
      </div>
      <StatusDialog />
    </>
  );
}
