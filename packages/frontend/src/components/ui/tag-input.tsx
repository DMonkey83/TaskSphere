"use client";

import React, { useState } from "react";
import { MdClose } from "react-icons/md";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export const TagInput = ({ 
  value, 
  onChange, 
  placeholder = "Add tags...", 
  className,
  disabled = false
}: TagInputProps) => {
  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const newTag = inputValue.trim();
      if (newTag && !value.includes(newTag)) {
        onChange([...(value || []), newTag]);
        setInputValue("");
      }
    } else if (e.key === "Backspace" && !inputValue && value.length > 0) {
      // Remove last tag if input is empty and backspace is pressed
      onChange(value.slice(0, -1));
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange((value || []).filter(tag => tag !== tagToRemove));
  };

  return (
    <div className={cn("space-y-2", className)}>
      {value && value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((tag) => (
            <Badge key={tag} variant="secondary" className="flex items-center gap-1">
              {tag}
              {!disabled && (
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-1 rounded-full outline-none hover:bg-gray-200 focus:bg-gray-200"
                  aria-label={`Remove ${tag} tag`}
                >
                  <MdClose className="h-3 w-3" />
                </button>
              )}
            </Badge>
          ))}
        </div>
      )}
      <Input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className="min-h-10"
      />
      <p className="text-xs text-muted-foreground">
        Press Enter or comma to add tags
      </p>
    </div>
  );
};