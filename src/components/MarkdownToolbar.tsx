import React, { forwardRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Code,
  Quote,
  Link,
  Minus,
} from "lucide-react";

interface MarkdownToolbarProps {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  value: string;
  onChange: (value: string) => void;
}

interface ToolbarAction {
  icon: React.ElementType;
  label: string;
  shortcut?: string;
  action: (text: string, selectionStart: number, selectionEnd: number) => {
    newText: string;
    newCursorPos: number;
  };
}

const toolbarActions: ToolbarAction[] = [
  {
    icon: Bold,
    label: "In đậm",
    shortcut: "Ctrl+B",
    action: (text, start, end) => {
      const selectedText = text.substring(start, end);
      const beforeText = text.substring(0, start);
      const afterText = text.substring(end);
      const newText = `${beforeText}**${selectedText || "text"}**${afterText}`;
      return {
        newText,
        newCursorPos: selectedText ? end + 4 : start + 2,
      };
    },
  },
  {
    icon: Italic,
    label: "In nghiêng",
    shortcut: "Ctrl+I",
    action: (text, start, end) => {
      const selectedText = text.substring(start, end);
      const beforeText = text.substring(0, start);
      const afterText = text.substring(end);
      const newText = `${beforeText}*${selectedText || "text"}*${afterText}`;
      return {
        newText,
        newCursorPos: selectedText ? end + 2 : start + 1,
      };
    },
  },
  {
    icon: Heading1,
    label: "Tiêu đề 1",
    action: (text, start, end) => {
      const lineStart = text.lastIndexOf("\n", start - 1) + 1;
      const beforeText = text.substring(0, lineStart);
      const lineText = text.substring(lineStart, end);
      const afterText = text.substring(end);
      const newText = `${beforeText}# ${lineText}${afterText}`;
      return {
        newText,
        newCursorPos: end + 2,
      };
    },
  },
  {
    icon: Heading2,
    label: "Tiêu đề 2",
    action: (text, start, end) => {
      const lineStart = text.lastIndexOf("\n", start - 1) + 1;
      const beforeText = text.substring(0, lineStart);
      const lineText = text.substring(lineStart, end);
      const afterText = text.substring(end);
      const newText = `${beforeText}## ${lineText}${afterText}`;
      return {
        newText,
        newCursorPos: end + 3,
      };
    },
  },
  {
    icon: Heading3,
    label: "Tiêu đề 3",
    action: (text, start, end) => {
      const lineStart = text.lastIndexOf("\n", start - 1) + 1;
      const beforeText = text.substring(0, lineStart);
      const lineText = text.substring(lineStart, end);
      const afterText = text.substring(end);
      const newText = `${beforeText}### ${lineText}${afterText}`;
      return {
        newText,
        newCursorPos: end + 4,
      };
    },
  },
  {
    icon: List,
    label: "Danh sách",
    action: (text, start, end) => {
      const lineStart = text.lastIndexOf("\n", start - 1) + 1;
      const beforeText = text.substring(0, lineStart);
      const lineText = text.substring(lineStart, end);
      const afterText = text.substring(end);
      const newText = `${beforeText}- ${lineText}${afterText}`;
      return {
        newText,
        newCursorPos: end + 2,
      };
    },
  },
  {
    icon: ListOrdered,
    label: "Danh sách số",
    action: (text, start, end) => {
      const lineStart = text.lastIndexOf("\n", start - 1) + 1;
      const beforeText = text.substring(0, lineStart);
      const lineText = text.substring(lineStart, end);
      const afterText = text.substring(end);
      const newText = `${beforeText}1. ${lineText}${afterText}`;
      return {
        newText,
        newCursorPos: end + 3,
      };
    },
  },
  {
    icon: Code,
    label: "Code block",
    action: (text, start, end) => {
      const selectedText = text.substring(start, end);
      const beforeText = text.substring(0, start);
      const afterText = text.substring(end);
      const codeBlock = selectedText
        ? `\`\`\`javascript\n${selectedText}\n\`\`\``
        : `\`\`\`javascript\n// code here\n\`\`\``;
      const newText = `${beforeText}${codeBlock}${afterText}`;
      return {
        newText,
        newCursorPos: start + 14, // After ```javascript\n
      };
    },
  },
  {
    icon: Quote,
    label: "Trích dẫn",
    action: (text, start, end) => {
      const lineStart = text.lastIndexOf("\n", start - 1) + 1;
      const beforeText = text.substring(0, lineStart);
      const lineText = text.substring(lineStart, end);
      const afterText = text.substring(end);
      const newText = `${beforeText}> ${lineText}${afterText}`;
      return {
        newText,
        newCursorPos: end + 2,
      };
    },
  },
  {
    icon: Link,
    label: "Liên kết",
    action: (text, start, end) => {
      const selectedText = text.substring(start, end);
      const beforeText = text.substring(0, start);
      const afterText = text.substring(end);
      const linkText = selectedText || "text";
      const newText = `${beforeText}[${linkText}](url)${afterText}`;
      return {
        newText,
        newCursorPos: start + linkText.length + 3, // Position at 'url'
      };
    },
  },
  {
    icon: Minus,
    label: "Đường kẻ ngang",
    action: (text, start, end) => {
      const beforeText = text.substring(0, start);
      const afterText = text.substring(end);
      const newText = `${beforeText}\n---\n${afterText}`;
      return {
        newText,
        newCursorPos: start + 5,
      };
    },
  },
];

export const MarkdownToolbar = forwardRef<HTMLDivElement, MarkdownToolbarProps>(
  function MarkdownToolbar({ textareaRef, value, onChange }, ref) {
    const handleAction = (action: ToolbarAction["action"]) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      const { newText, newCursorPos } = action(value, start, end);
      onChange(newText);

      // Restore focus and cursor position after state update
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);
    };

    return (
      <TooltipProvider delayDuration={300}>
        <div ref={ref} className="flex items-center gap-0.5 p-1 border rounded-lg bg-muted/30 flex-wrap">
          {toolbarActions.map((action, index) => (
            <Tooltip key={index}>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => handleAction(action.action)}
                >
                  <action.icon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                <p>{action.label}</p>
                {action.shortcut && (
                  <p className="text-muted-foreground">{action.shortcut}</p>
                )}
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </TooltipProvider>
    );
  }
);
