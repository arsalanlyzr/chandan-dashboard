import { cn } from "@/lib/utils";
import MarkdownDisplay from "./MarkdownDisplay";
import { ThumbsUp, ThumbsDown } from "lucide-react";

interface ChatBubbleProps {
  message: {
    message_id: string;
    role: "user" | "agent";
    content: string;
    timestamp: string;
    agent_id?: string | null;
    feedback?: "like" | "dislike" | null;
  };
}

export const ChatBubble = ({ message }: ChatBubbleProps) => {
  const isUser = message.role === "user";

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return timestamp;
    }
  };

  return (
    <div
      className={cn(
        "flex mb-4 fade-in",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[70%] p-4 rounded-2xl relative",
          isUser
            ? "chat-bubble-user text-primary-foreground rounded-br-md"
            : "chat-bubble-assistant text-foreground rounded-bl-md",
          // Add border color based on feedback
          message.feedback === "like" && "border-2 border-green-500",
          message.feedback === "dislike" && "border-2 border-red-500"
        )}
      >
        {isUser ? (
          <p className="text-sm leading-relaxed">{message.content}</p>
        ) : (
          <div className="space-y-2">
            <MarkdownDisplay content={message.content} />
          </div>
        )}

        <div
          className={cn(
            "flex items-center justify-between mt-2",
            isUser ? "text-primary-foreground/80" : "text-muted-foreground"
          )}
        >
          <div className="text-xs opacity-70">
            {formatTimestamp(message.timestamp)}
          </div>

          {/* Feedback indicator */}
          {message.feedback && (
            <div className="flex items-center gap-1 text-xs">
              {message.feedback === "like" ? (
                <ThumbsUp className="w-3 h-3 text-green-500" />
              ) : (
                <ThumbsDown className="w-3 h-3 text-red-500" />
              )}
              <span
                className={
                  message.feedback === "like"
                    ? "text-green-500"
                    : "text-red-500"
                }
              >
                {message.feedback}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
