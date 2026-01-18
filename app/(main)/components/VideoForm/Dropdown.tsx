import { Field, FieldLabel } from "@/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

type FormDropdownProps = {
  label: string;
  field: string;
  defaultValue: string;
  placeholder: string;
  data: string[];
};

export const FormDropdown = ({ label, field, defaultValue, placeholder, data }: FormDropdownProps) => {
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

