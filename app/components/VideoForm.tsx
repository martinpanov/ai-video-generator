"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormDropdown } from "./VideoFormDropdown";
import { dispatchEvent } from "../utils/events";
import { handleVideoSubmit } from "../actions/video";
import { useActionState, useEffect } from "react";
import { VIDEO_DETAILS } from "../constants";

const DROPDOWN_DETAILS = [
  { field: "video-duration", label: "Video Duration", defaultValue: "1 minute", placeholder: "Select Video Duration", data: VIDEO_DETAILS.VIDEOS_DURATION },
  { field: "clip-size", label: "Clip Size", defaultValue: "1080x1920", placeholder: "Select Clip Size", data: VIDEO_DETAILS.VIDEOS_SIZES }
];

export const VideoForm = () => {
  const [state, action, pending] = useActionState(handleVideoSubmit, undefined);

  useEffect(() => {
    if (pending) {
      dispatchEvent("showDialog");
    }
  }, [pending]);

  useEffect(() => {
    if (state?.success && state?.jobId) {
      dispatchEvent("setJobId", { jobId: state.jobId });
    }
  }, [state]);

  return (
    <Card className="w-lg mx-auto">
      <CardHeader>
        <CardTitle className="text-center">
          Ai Video Generator
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form id="ai-video-generator-form" action={action}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="video-url">Video URL</FieldLabel>
              <Input id="video-url" name="video-url" type="url" required />
            </Field>
            <Field>
              <FieldLabel htmlFor="videos-amount">Amount of videos</FieldLabel>
              <Input id="videos-amount" name="videos-amount" type="number" defaultValue={1} min={1} max={5} required />
            </Field>
            {DROPDOWN_DETAILS.map(dropdown => <FormDropdown key={dropdown.field} {...dropdown} />)}
            <Field>
              <div className="flex items-center gap-3">
                <Checkbox id="transcribe" name="transcribe" />
                <Label htmlFor="transcribe">Transcribe the video</Label>
              </div>
            </Field>
            <Field>
              <div className="flex items-center gap-3">
                <Checkbox id="zoom" name="zoom" />
                <Label htmlFor="zoom">Zoom in on the person talking</Label>
              </div>
            </Field>
            <Field>
              <Button type="submit" size="lg">Submit</Button>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
};