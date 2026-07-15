import Link from "next/link";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import DeleteChallengeButton from "./DeleteChallengeButton";

// The challenges table on the dashboard. Server Component: it just renders the
// `challenges` passed from the page. Each row links to the edit page and has a
// delete action; a "New Challenge" link sits above the table.
export default function ChallengesList({ challenges }) {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Your challenges</h2>
        <Button asChild size="sm">
          <Link href="/challenges/new">New Challenge</Link>
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableCaption>Your challenges list</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Difficulty</TableHead>
              <TableHead>Created at</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {challenges.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No challenges yet.
                </TableCell>
              </TableRow>
            ) : (
              challenges.map((challenge) => (
                <TableRow key={challenge.id}>
                  <TableCell className="font-medium">{challenge.title}</TableCell>
                  <TableCell>{challenge.category}</TableCell>
                  <TableCell>{challenge.level}</TableCell>
                  <TableCell>{challenge.createdAt}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button asChild size="icon" aria-label="Edit challenge">
                        <Link href={`/challenges/${challenge.id}/edit`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <DeleteChallengeButton id={challenge.id} />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
