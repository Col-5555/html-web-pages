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
import { setLanguage } from "@/redux/workspaceSlice";

const LANGUAGES = [
  { value: "javascript", label: "JavaScript" },
  { value: "python", label: "Python" },
];

// Picks the starter-code language for the challenge. The choice lives in the
// Redux `workspace` slice: it drives CodeMirror's syntax highlighting and is
// saved onto the challenge's `code.language`.
export default function LanguageMenu() {
  const language = useSelector((state) => state.workspace.language);
  const dispatch = useDispatch();

  const current =
    LANGUAGES.find((l) => l.value === language)?.label ?? "Language";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="outline" size="sm">
            {current}
            <ChevronDown className="h-3.5 w-3.5" />
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        {LANGUAGES.map((lang) => (
          <DropdownMenuItem
            key={lang.value}
            onClick={() => dispatch(setLanguage(lang.value))}
          >
            {lang.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
