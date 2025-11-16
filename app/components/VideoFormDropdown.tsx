import { Field, FieldLabel } from "@/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Props = {
  label: string;
  field: string;
  defaultValue: string;
  placeholder: string;
  data: string[];
};

export const FormDropdown = ({ label, field, defaultValue, placeholder, data }: Props) => {
  return (
    <Field>
      <FieldLabel htmlFor={field}>{label}</FieldLabel>
      <Select name={field} defaultValue={defaultValue}>
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