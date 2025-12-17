import { VideoSubmitState } from "@/app/actions/video";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldLabel } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

type FormDropdownProps = {
  label: string;
  field: string;
  defaultValue: string;
  placeholder: string;
  data: string[];
};

type FormDropdownAndCheckboxProps = {
  checkboxField: string;
  checkboxLabel: string;
  state: VideoSubmitState;
  dropdowns: {
    field: string;
    label: string;
    defaultValue: string;
    placeholder: string;
    data: string[];
  }[];
  shouldShowDropdown?: boolean;
};

const FormDropdown = ({ label, field, defaultValue, placeholder, data }: FormDropdownProps) => {
  const [value, setValue] = useState(defaultValue);

  return (
    <Field>
      <FieldLabel htmlFor={field}>{label}</FieldLabel>
      <input type="hidden" name={field} value={value} />
      <Select value={value} onValueChange={setValue}>
        <SelectTrigger id={field}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {data.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}
        </SelectContent>
      </Select>
    </Field>
  );
};

export const FormDropdownAndCheckbox = ({ checkboxField, checkboxLabel, state, dropdowns, shouldShowDropdown }: FormDropdownAndCheckboxProps) => {
  const [isChecked, setIsChecked] = useState(false);

  return (
    <>
      <Field>
        <div className="flex items-center gap-3">
          <Checkbox id={checkboxField} name={checkboxField} onCheckedChange={checkedValue => setIsChecked(Boolean(checkedValue))} />
          <Label htmlFor={checkboxField}>{checkboxLabel}</Label>
        </div>
      </Field>
      {(shouldShowDropdown || !isChecked) && dropdowns.map(dropdown => (
        <Field key={dropdown.label}>
          <FormDropdown {...dropdown} />
          {state?.[dropdown.field] && (
            <p className="text-sm text-red-500 mt-1">{state[dropdown.field]}</p>
          )}
        </Field>
      ))
      }
    </>
  );
};