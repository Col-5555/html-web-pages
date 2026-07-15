"use client";

import { useEffect, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
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
import { challengeSchema } from "@/schemas/challengeSchema";
import { setLanguage } from "@/redux/workspaceSlice";
import { createChallenge, updateChallenge } from "@/app/actions";
import MarkdownField from "./MarkdownField";
import CodeEditorPane from "./CodeEditorPane";
import TestsBuilder from "./TestsBuilder";

const LEVELS = ["Easy", "Moderate", "Hard"];

// Turns a challenge record (edit) or nothing (create) into react-hook-form's
// default values. The right pane's function name + starter code are stored under
// the challenge's `code`.
function toDefaults(challenge) {
  const code = challenge?.code ?? {};
  return {
    title: challenge?.title ?? "",
    category: challenge?.category ?? "",
    level: challenge?.level ?? "Easy",
    description: challenge?.description ?? "",
    functionName: code.functionName ?? "",
    body: code.body ?? "",
    tests: challenge?.tests ?? [],
  };
}

// The two-pane create/edit form. The same component backs both routes: pass a
// `challenge` to edit it, or nothing to create a new one. Left pane = details +
// markdown description; right pane = function name + CodeMirror + tests.
export default function ChallengeForm({ challenge }) {
  const isEdit = Boolean(challenge);
  const dispatch = useDispatch();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const language = useSelector((state) => state.workspace.language);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(challengeSchema),
    defaultValues: toDefaults(challenge),
  });

  // When editing, seed the editor language from the saved challenge so the
  // dropdown + syntax highlighting match what was stored.
  useEffect(() => {
    if (challenge?.code?.language) {
      dispatch(setLanguage(challenge.code.language));
    }
  }, [challenge, dispatch]);

  const onSubmit = (data) => {
    const payload = {
      title: data.title,
      category: data.category,
      level: data.level,
      description: data.description,
      code: {
        functionName: data.functionName,
        language,
        body: data.body,
      },
      tests: data.tests,
    };

    startTransition(async () => {
      try {
        if (isEdit) {
          await updateChallenge(challenge.id, {
            ...payload,
            createdAt: challenge.createdAt,
          });
          toast.success("Challenge updated");
        } else {
          await createChallenge(payload);
          toast.success("Challenge created");
        }
        router.push("/");
      } catch {
        toast.error(
          isEdit ? "Failed to update challenge" : "Failed to create challenge"
        );
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Left pane — details + description */}
        <div className="flex flex-col gap-4">
          <div>
            <Label className="mb-1">Title</Label>
            <Input placeholder="e.g. Palindrome Checker" {...register("title")} />
            {errors.title && (
              <p className="mt-1 text-sm text-destructive">
                {errors.title.message}
              </p>
            )}
          </div>

          <div>
            <Label className="mb-1">Category</Label>
            <Input placeholder="e.g. Strings" {...register("category")} />
            {errors.category && (
              <p className="mt-1 text-sm text-destructive">
                {errors.category.message}
              </p>
            )}
          </div>

          <div>
            <Label className="mb-1">Level</Label>
            <Controller
              control={control}
              name="level"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Level" />
                  </SelectTrigger>
                  <SelectContent>
                    {LEVELS.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.level && (
              <p className="mt-1 text-sm text-destructive">
                {errors.level.message}
              </p>
            )}
          </div>

          <div>
            <Label className="mb-1">Description</Label>
            <Controller
              control={control}
              name="description"
              render={({ field }) => (
                <MarkdownField value={field.value} onChange={field.onChange} />
              )}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>
        </div>

        {/* Right pane — starter code + tests */}
        <div className="flex flex-col gap-4">
          <div>
            <Label className="mb-1">Function name</Label>
            <Input
              placeholder="e.g. isPalindrome"
              {...register("functionName")}
            />
            {errors.functionName && (
              <p className="mt-1 text-sm text-destructive">
                {errors.functionName.message}
              </p>
            )}
          </div>

          <div>
            <Label className="mb-1">Starter code</Label>
            <Controller
              control={control}
              name="body"
              render={({ field }) => (
                <CodeEditorPane value={field.value} onChange={field.onChange} />
              )}
            />
          </div>

          <TestsBuilder control={control} register={register} errors={errors} />
        </div>
      </div>

      <div className="mt-8 flex items-center justify-end gap-3">
        <Button asChild variant="ghost" type="button">
          <Link href="/">Cancel</Link>
        </Button>
        <Button type="submit" disabled={isPending}>
          {isEdit ? "Save changes" : "Create challenge"}
        </Button>
      </div>
    </form>
  );
}
