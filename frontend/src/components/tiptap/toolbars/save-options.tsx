"use client";

import React from "react";
import { Download, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToolbar } from "./toolbar-provider";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// type SaveDocumentResponse = { message?: string };

function downloadHtmlFile(html: string, filename = "document.html") {
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

const SaveOptionsToolbar = React.forwardRef<
  HTMLDivElement,
  { className?: string }
>(({ className }, ref) => {
  const { editor } = useToolbar();

  //   const handleSaveToServer = async () => {
  //     try {
  //       const html = editor?.getHTML() ?? "";
  //       if (!html || html.trim() === "<p></p>") {
  //         toast.info("Nothing to save yet.");
  //         return;
  //       }
  //       await saveHtmlToServer(html);
  //       toast.success("Saved to server");
  //     } catch {
  //       toast.error("Failed to save. Please try again.");
  //     }
  //   };

  const handleDownload = () => {
    const html = editor?.getHTML() ?? "";
    if (!html || html.trim() === "<p></p>") {
      toast.info("Nothing to download yet.");
      return;
    }
    downloadHtmlFile(html);
  };

  return (
    <div ref={ref} className={cn("flex items-center gap-1", className)}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-max px-3 font-normal"
            // onClick={handleSaveToServer}
          >
            <Save className="mr-2 h-4 w-4" />
            Save
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <span>Save to server</span>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-max px-3 font-normal"
            onClick={handleDownload}
          >
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <span>Download as HTML</span>
        </TooltipContent>
      </Tooltip>
    </div>
  );
});

SaveOptionsToolbar.displayName = "SaveOptionsToolbar";

export { SaveOptionsToolbar };
