import { VideoForm } from "./components/VideoForm";
import { StatusDialog } from "./components/StatusDialog";
import { LogoutButton } from "./components/LogoutButton";

export default async function Home() {
  return (
    <>
      <div className="absolute top-4 right-4">
        <LogoutButton />
      </div>
      <VideoForm />
      <StatusDialog />
    </>
  );
}
