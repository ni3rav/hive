import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/accordion-animated";
import {
  Calendar as CalendarIcon,
  Settings,
  Users,
  Folder,
  Tag,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { type PostMetadata } from "@/types/editor";

interface MetadataFormProps {
  isExpanded: boolean;
  setIsExpanded: (isExpanded: boolean) => void;
  metadata: PostMetadata;
  setMetadata: React.Dispatch<React.SetStateAction<PostMetadata>>;
  onTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function MetadataForm({
  isExpanded,
  setIsExpanded,
  metadata,
  setMetadata,
  onTitleChange,
}: MetadataFormProps) {
  const formFieldClasses =
    "bg-transparent border border-border/40 rounded-md transition-all duration-300 hover:border-border/80 focus-visible:ring-1 focus-visible:ring-primary/80 focus-visible:shadow-lg focus-visible:shadow-primary/10";
  const readOnlyClasses = "bg-muted/50 cursor-not-allowed";

  return (
    <Accordion
      type="single"
      collapsible
      value={isExpanded ? "metadata" : ""}
      onValueChange={(value) => setIsExpanded(value === "metadata")}
    >
      <AccordionItem value="metadata">
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center justify-between w-full pr-4">
            <div className="flex items-center gap-3 text-sm truncate flex-1 min-w-0">
              <span
                className="font-semibold truncate max-w-60"
                title={metadata.title}
              >
                {metadata.title || "Untitled Post"}
              </span>
              <Separator orientation="vertical" className="h-4" />
              <div className="flex items-center gap-4 text-muted-foreground">
                <span>{format(metadata.publishedAt, "PPP")}</span>
                <span className="hidden sm:inline-block">•</span>
                <span className="hidden sm:inline-block">
                  Category: {metadata.category?.toString() || "None"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground flex-shrink-0">
              <Settings className="h-4 w-4" />
              <span>Details</span>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="p-6 space-y-6">
            <Input
              type="text"
              placeholder="A Great Title"
              className={cn(
                // Big, bold, clean heading
                "w-full h-auto bg-none border-none px-4 py-4 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold leading-snug tracking-tight shadow-none",
                // Subtle placeholder + no focus ring/border
                "placeholder:text-muted-foreground/60 focus-visible:ring-0 focus-visible:border-none !outline-none",
                // Use tokens for caret/selection to respect theme
                "caret-primary selection:bg-primary selection:text-primary-foreground"
              )}
              value={metadata.title}
              onChange={onTitleChange}
            />
            <div className="grid grid-cols-1 md:grid-cols-[120px_1fr] md:items-center gap-x-6 gap-y-6 text-sm">
              <label className="text-muted-foreground font-medium">Slug</label>
              <Input
                readOnly
                className={cn("h-9", formFieldClasses, readOnlyClasses)}
                value={metadata.slug}
              />

              <label className="text-muted-foreground font-medium">
                Authors
              </label>
              <div className="relative flex items-center">
                <Users className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  className={cn("h-9 w-full pl-10", formFieldClasses)}
                  placeholder="Select authors"
                />
              </div>

              <label className="text-muted-foreground font-medium">
                Published at
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[240px] justify-start text-left font-normal h-9 px-3",
                      formFieldClasses
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {metadata.publishedAt ? (
                      format(metadata.publishedAt, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={metadata.publishedAt}
                    onSelect={(date) =>
                      setMetadata((prev) => ({
                        ...prev,
                        publishedAt: date || new Date(),
                      }))
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              <label className="text-muted-foreground font-medium self-start md:pt-2">
                Excerpt
              </label>
              <Textarea
                placeholder="A short description of your post. Recommended to be 155 characters or less."
                className={cn("min-h-[80px]", formFieldClasses)}
                value={metadata.excerpt}
                onChange={(e) =>
                  setMetadata((prev) => ({ ...prev, excerpt: e.target.value }))
                }
              />

              <label className="text-muted-foreground font-medium">
                Category
              </label>
              <div className="relative flex items-center">
                <Folder className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  className={cn("h-9 w-full pl-10", formFieldClasses)}
                  placeholder="Select a category"
                />
              </div>

              <label className="text-muted-foreground font-medium">Tags</label>
              <div className="relative flex items-center">
                <Tag className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  className={cn("h-9 w-full pl-10", formFieldClasses)}
                  placeholder="Select some tags"
                />
              </div>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
