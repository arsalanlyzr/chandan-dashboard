import { cn } from "@/lib/utils";

interface SessionListItemProps {
  sessionId: string;
  createdAt: string;
  isActive?: boolean;
  onClick: () => void;
}

export const SessionListItem = ({ 
  sessionId, 
  createdAt, 
  isActive = false, 
  onClick 
}: SessionListItemProps) => {
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "session-item p-4 rounded-xl cursor-pointer",
        isActive && "active"
      )}
    >
      <div className="font-semibold text-foreground text-sm mb-1 truncate">
        {sessionId}
      </div>
      <div className="text-xs text-muted-foreground">
        {formatDate(createdAt)}
      </div>
    </div>
  );
};