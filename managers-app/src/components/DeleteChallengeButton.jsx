"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { deleteChallenge } from "@/app/actions";

// Delete action for a table row. Calls the deleteChallenge Server Action (which
// deletes on json-server and revalidates the list) and reports the outcome with
// a toast. useTransition keeps the UI responsive while the action runs.
export default function DeleteChallengeButton({ id }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deleteChallenge(id);
        toast.success("Challenge deleted");
      } catch {
        toast.error("Failed to delete challenge");
      }
    });
  };

  return (
    <Button
      variant="destructive"
      size="icon"
      onClick={handleDelete}
      disabled={isPending}
      aria-label="Delete challenge"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}
