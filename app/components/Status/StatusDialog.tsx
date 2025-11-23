"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BadgeCheckIcon, XCircle } from "lucide-react";
import { useDialogState } from "../../hooks/useDialogState";
import { useEffect, useState } from "react";
import { subscribe, unsubscribe } from "../../utils/events";
import { JobStatus } from "./types";
import { JobStatusMessage } from "./StatusMessage";
import { JobStatusItemsContent } from "./StatusItemsContent/ItemsContent";
import { STATUS } from "@/app/constants";

export const StatusDialog = () => {
  const { isOpen, setIsOpen } = useDialogState();
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null);

  useEffect(() => {
    const handleSetJobId = (event?: CustomEvent) => {
      if (event?.detail?.jobId) {
        setJobId(event.detail.jobId);
      }
    };

    subscribe("setJobId", handleSetJobId);
    return () => unsubscribe("setJobId", handleSetJobId);
  }, []);

  useEffect(() => {
    setJobStatus(null);

    if (!jobId || !isOpen) {
      return;
    };

    let pollInterval = 1000;
    const maxInterval = 10000;
    let timeoutId: NodeJS.Timeout;

    const poll = async () => {
      try {
        const response = await fetch(`/api/job/${jobId}`);
        const data = await response.json();

        setJobStatus(data);

        if (data.status === STATUS.COMPLETED || data.status === STATUS.FAILED) {
          return;
        }

        pollInterval = Math.min(pollInterval * 1.5, maxInterval);
        timeoutId = setTimeout(poll, pollInterval);
      } catch (error) {
        console.error('Failed to fetch job status:', error);
        timeoutId = setTimeout(poll, pollInterval);
      }
    };

    poll();

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      };
    };
  }, [jobId, isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>AI Video Generation Progress</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <JobStatusItemsContent jobStatus={jobStatus} />

          <JobStatusMessage
            jobStatus={jobStatus}
            icon={jobStatus?.error ?
              <XCircle className="h-5 w-5 text-red-400" /> :
              <BadgeCheckIcon className="h-5 w-5 text-green-400" />
            }
            title={jobStatus?.error ? "Error" : "Success"}
            description={jobStatus?.error || "Your clips have been generated successfully!"}
          />
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
          {jobStatus?.status === STATUS.COMPLETED && (
            <Button>View Clips</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};