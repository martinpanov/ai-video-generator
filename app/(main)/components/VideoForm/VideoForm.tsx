"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { FormDropdown } from "./Dropdown";
import { dispatchEvent } from "../../../utils/events";
import { handleVideoSubmit, type VideoSubmitState } from "../../../actions/video";
import { useActionState, useEffect, useState } from "react";
import { DIALOG_IDS, VIDEO_DETAILS } from "../../../constants";
import { Earth, Link2, Settings, Sparkles } from "lucide-react";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { FormCheckbox } from "./Checkbox";

const CHECKBOX_DETAILS = [
  {
    label: "Transcribe the video",
    field: "transcribe",
    description: "Generate high-accuracy captions and summaries."
  },
  {
    label: "Zoom in on the person talking",
    field: "zoom",
    description: "AI will automatically detect and follow speakers."
  },
  {
    label: "Split Video Into Parts",
    field: "split-video",
    description: "Divide long content into serial segments."
  }
];

const DROPDOWN_DETAILS = [
  {
    field: "clip-size",
    label: "Clip Size",
    defaultValue: "1080x1920",
    placeholder: "Select Clip Size",
    data: VIDEO_DETAILS.VIDEOS_SIZES,
    checkbox: "zoom"
  },
  {
    field: "video-duration",
    label: "Video Duration",
    defaultValue: "1 minute",
    placeholder: "Select Video Duration",
    data: VIDEO_DETAILS.VIDEOS_DURATION,
    checkbox: "split-video"
  },
  {
    field: "duration-type",
    label: "Duration Type",
    defaultValue: "Min",
    placeholder: "Select Duration Type",
    data: VIDEO_DETAILS.VIDEOS_DURATION_TYPE,
    checkbox: "split-video"
  }
];

export const VideoForm = () => {
  const [state, action] = useActionState<VideoSubmitState, FormData>(handleVideoSubmit, undefined);
  const [checkedCheckboxes, setCheckedCheckboxes] = useState<string[]>([]);

  useEffect(() => {
    if (state?.success && state?.jobId) {
      dispatchEvent(DIALOG_IDS.STATUS_DIALOG);
      dispatchEvent("setJobId", { jobId: state.jobId });
    }
  }, [state]);

  return (
    <form id="ai-video-generator-form" action={action} className="flex flex-col gap-4">
      <div className="flex flex-col gap-10">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link2 size={18} />
              SOURCE & QUANTITY
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FieldGroup className="grid grid-cols-2">
              <Field className="col-span-2">
                <FieldLabel htmlFor="video-url">Video URL</FieldLabel>
                <InputGroup>
                  <InputGroupInput id="video-url" name="video-url" type="text" placeholder="https://youtube.com/watch?v=..." />
                  <InputGroupAddon>
                    <Earth size={18} />
                  </InputGroupAddon>
                </InputGroup>
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
            </FieldGroup>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings size={18} />
              OUTPUT SETTINGS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FieldGroup className={`grid grid-cols-${!checkedCheckboxes.includes("split-video") ? "2" : "1"}`}>
              {DROPDOWN_DETAILS.map(dropdown => {
                if (dropdown.field === "clip-size") {
                  return <FormDropdown key={dropdown.field} {...dropdown} />;
                }

                if ((dropdown.field === "duration-type" ||
                  dropdown.field === "video-duration") &&
                  !checkedCheckboxes.includes("split-video")) {
                  return <FormDropdown key={dropdown.field} {...dropdown} />;
                }

                return null;
              })}
            </FieldGroup>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles size={18} />
              ADDITIONAL FEATURES
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              {CHECKBOX_DETAILS.map(checkbox => (
                <FormCheckbox
                  key={checkbox.field}
                  field={checkbox.field}
                  label={checkbox.label}
                  description={checkbox.description}
                  setCheckedCheckboxes={setCheckedCheckboxes}
                />
              ))}
            </FieldGroup>
          </CardContent>
        </Card>
      </div>
      <Button type="submit" size="lg">Submit & Generate</Button>
    </form>
  );
};