import { Checkbox } from "@/components/ui/checkbox";
import { Field } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { Dispatch, SetStateAction } from "react";

type FormCheckboxProps = {
  field: string;
  label: string;
  description: string;
  setCheckedCheckboxes: Dispatch<SetStateAction<string[]>>;
};

export const FormCheckbox = ({ field, label, description, setCheckedCheckboxes }: FormCheckboxProps) => {
  const handleCheckedCheckedBoxes = (checkedValue: boolean) => {
    setCheckedCheckboxes((prevState: string[]) => {
      if (!checkedValue) {
        return prevState.filter((checkbox: string) => checkbox !== field);
      }

      if (!prevState.includes(field)) {
        return [...prevState, field];
      }

      return prevState;
    });
  };

  return (
    <Field>
      <div className="flex items-center gap-3 p-4 border-2 rounded-lg">
        <Checkbox id={field} name={field} onCheckedChange={handleCheckedCheckedBoxes} />
        <div>
          <Label htmlFor={field}>{label}</Label>
          <p className="text-gray-400 text-sm">{description}</p>
        </div>
      </div>
    </Field>
  );
};