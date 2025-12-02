import { StatusDialog } from "../components/Status/StatusDialog";
import { VideoForm } from "../components/VideoForm";


export default async function Home() {
  return (
    <>
      <VideoForm />
      <StatusDialog />
    </>
  );
}
