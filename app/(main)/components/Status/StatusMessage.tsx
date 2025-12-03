import { ReactElement } from "react";
import { JobStatus } from "./types";
import { STATUS } from "@/app/constants";

type Props = {
  jobStatus: JobStatus | null;
  icon: ReactElement;
  title: string;
  description: string;
};

export const JobStatusMessage = ({ jobStatus, icon, title, description }: Props) => {
  const textColor = jobStatus?.error ? "red" : "green";

  if (!jobStatus || jobStatus?.status === STATUS.PROCESSING) {
    return;
  }

  return (
    <div className={`rounded-md bg-${textColor}-50 p-4`}>
      <div className="flex items-center">
        {icon}
        <div className="ml-3">
          <h3 className={`text-sm font-medium text-${textColor}-800`}>{title}</h3>
          <p className={`mt-0.5 text-sm text-${textColor}-700`}>
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};