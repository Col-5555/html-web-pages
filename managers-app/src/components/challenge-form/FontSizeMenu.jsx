"use client";

import { ChevronDown } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { setFontSize } from "@/redux/workspaceSlice";

const FONT_SIZES = [12, 14, 16, 18, 20];

// Picks the CodeMirror font size. Purely an editor-display setting, so it lives
// in the Redux `workspace` slice but is not saved onto the challenge.
export default function FontSizeMenu() {
  const fontSize = useSelector((state) => state.workspace.fontSize);
  const dispatch = useDispatch();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="outline" size="sm">
            {fontSize}px
            <ChevronDown className="h-3.5 w-3.5" />
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        {FONT_SIZES.map((size) => (
          <DropdownMenuItem
            key={size}
            onClick={() => dispatch(setFontSize(size))}
          >
            {size}px
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
