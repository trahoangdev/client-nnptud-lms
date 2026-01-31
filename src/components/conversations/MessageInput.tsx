import { Send, Paperclip, Image, Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
}

export function MessageInput({ value, onChange, onSend }: MessageInputProps) {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="p-4 border-t">
      <div className="flex items-end gap-2">
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="shrink-0">
            <Paperclip className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="shrink-0">
            <Image className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex-1 relative">
          <Input
            placeholder="Nhập tin nhắn..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyPress={handleKeyPress}
            className="pr-10"
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
          >
            <Smile className="w-4 h-4" />
          </Button>
        </div>
        <Button onClick={onSend} disabled={!value.trim()} className="shrink-0">
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
