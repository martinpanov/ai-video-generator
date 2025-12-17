"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormDropdownAndCheckbox } from "./VideoFormDropdown";
import { dispatchEvent } from "../../../utils/events";
import { handleVideoSubmit, type VideoSubmitState } from "../../../actions/video";
import { useActionState, useEffect } from "react";
import { DIALOG_IDS, VIDEO_DETAILS } from "../../../constants";

const DROPDOWN_AND_CHECKBOX_DETAILS = [
  {
    dropdowns: [
      {
        field: "clip-size",
        label: "Clip Size",
        defaultValue: "1080x1920",
        placeholder: "Select Clip Size",
        data: VIDEO_DETAILS.VIDEOS_SIZES,
      }
    ],
    checkboxLabel: "Zoom in on the person talking",
    checkboxField: "zoom"
  },
  {
    dropdowns: [
      {
        field: "video-duration",
        label: "Video Duration",
        defaultValue: "1 minute",
        placeholder: "Select Video Duration",
        data: VIDEO_DETAILS.VIDEOS_DURATION,
      },
      {
        field: "duration-type",
        label: "Duration Type",
        defaultValue: "Min",
        placeholder: "Select Duration Type",
        data: VIDEO_DETAILS.VIDEOS_DURATION_TYPE,
      }
    ],
    checkboxLabel: "Split Video Into Parts",
    checkboxField: "split-video"
  }
];

export const VideoForm = () => {
  const [state, action] = useActionState<VideoSubmitState, FormData>(handleVideoSubmit, undefined);

  useEffect(() => {
    if (state?.success && state?.jobId) {
      dispatchEvent(DIALOG_IDS.STATUS_DIALOG_OPEN);
      dispatchEvent("setJobId", { jobId: state.jobId });
    }
  }, [state]);

  return (
    <Card className="w-lg m-auto">
      <CardHeader>
        <CardTitle className="text-center">
          AI Video Generator
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form id="ai-video-generator-form" action={action}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="video-url">Video URL</FieldLabel>
              <Input id="video-url" name="video-url" type="text" />
              {state?.videoUrl && (
                <p className="text-sm text-red-500 mt-1">{state.videoUrl}</p>
              )}
            </Field>
            <Field>
              <FieldLabel htmlFor="videos-amount">Amount of videos</FieldLabel>
              <Input id="videos-amount" name="videos-amount" type="number" defaultValue={1} className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
              {state?.videosAmount && (
                <p className="text-sm text-red-500 mt-1">{state.videosAmount}</p>
              )}
            </Field>
            {DROPDOWN_AND_CHECKBOX_DETAILS.map(details => (
              <FormDropdownAndCheckbox
                key={details.checkboxLabel}
                checkboxField={details.checkboxField}
                checkboxLabel={details.checkboxLabel}
                state={state}
                dropdowns={details.dropdowns}
                shouldShowDropdown={details.dropdowns.some(dropdown => dropdown.field === "clip-size")}
              />
            ))}
            <Field>
              <div className="flex items-center gap-3">
                <Checkbox id="transcribe" name="transcribe" />
                <Label htmlFor="transcribe">Transcribe the video</Label>
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