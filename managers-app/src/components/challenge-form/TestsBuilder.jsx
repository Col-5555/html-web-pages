"use client";

import { useFieldArray, Controller } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// A blank test case, added when the manager clicks "Add test".
const EMPTY_TEST = {
  type: "string",
  name: "",
  value: "",
  output: "",
  weight: 1,
};

// The dynamic tests list. Uses react-hook-form's useFieldArray so rows can be
// added / removed; each test is { type, name, value, output, weight }. `control`,
// `register` and `errors` come from the parent ChallengeForm's useForm.
export default function TestsBuilder({ control, register, errors }) {
  const { fields, append, remove } = useFieldArray({ control, name: "tests" });

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Tests</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append(EMPTY_TEST)}
        >
          <Plus className="h-3.5 w-3.5" />
          Add test
        </Button>
      </div>

      {fields.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No tests yet. Add one to grade submissions against.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {fields.map((field, index) => (
            <div key={field.id} className="rounded-md border p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium">Test {index + 1}</span>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon-sm"
                  aria-label={`Remove test ${index + 1}`}
                  onClick={() => remove(index)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <Label className="mb-1">Name</Label>
                  <Input
                    placeholder="e.g. handles empty string"
                    {...register(`tests.${index}.name`)}
                  />
                  {errors?.tests?.[index]?.name && (
                    <p className="mt-1 text-sm text-destructive">
                      {errors.tests[index].name.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label className="mb-1">Type</Label>
                  <Controller
                    control={control}
                    name={`tests.${index}.type`}
                    render={({ field: typeField }) => (
                      <Select
                        value={typeField.value}
                        onValueChange={typeField.onChange}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="string">string</SelectItem>
                          <SelectItem value="number">number</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div>
                  <Label className="mb-1">Input</Label>
                  <Input
                    placeholder="value passed in"
                    {...register(`tests.${index}.value`)}
                  />
                  {errors?.tests?.[index]?.value && (
                    <p className="mt-1 text-sm text-destructive">
                      {errors.tests[index].value.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label className="mb-1">Expected output</Label>
                  <Input
                    placeholder="value expected back"
                    {...register(`tests.${index}.output`)}
                  />
                  {errors?.tests?.[index]?.output && (
                    <p className="mt-1 text-sm text-destructive">
                      {errors.tests[index].output.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label className="mb-1">Weight (0–1)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="1"
                    {...register(`tests.${index}.weight`)}
                  />
                  {errors?.tests?.[index]?.weight && (
                    <p className="mt-1 text-sm text-destructive">
                      {errors.tests[index].weight.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
