import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { SessionListItem } from "@/components/SessionListItem";
import { ChatBubble } from "@/components/ChatBubble";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { MessageCircle, RefreshCw } from "lucide-react";

interface Session {
  session_id: string;
  created_at: string;
}

interface ChatMessage {
  message_id: string;
  role: "user" | "agent";
  content: string;
  timestamp: string;
  agent_id?: string | null;
  feedback?: "like" | "dislike" | null;
}

interface ChatHistoryResponse {
  session_id: string;
  hubspot_interaction: string | null;
  messages: ChatMessage[];
  total_messages: number;
}

const ChatHistory = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    sessionId || null
  );
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [hubspotInteraction, setHubspotInteraction] = useState<string | null>(
    null
  );
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = async () => {
    setLoadingSessions(true);
    setError(null);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/lyzr/get-session`
      );
      if (!response.ok) throw new Error("Failed to fetch sessions");

      const data = await response.json();
      setSessions(data.sessions || []);
    } catch (err) {
      setError("Failed to load sessions");
      console.error("Error fetching sessions:", err);
    } finally {
      setLoadingSessions(false);
    }
  };

  const fetchChatHistory = async (sessionId: string) => {
    setLoadingChat(true);
    setError(null);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/lyzr/chat-history/${sessionId}`
      );
      if (!response.ok) throw new Error("Failed to fetch chat history");

      const data: ChatHistoryResponse = await response.json();
      setChatHistory(data.messages || []);
      setHubspotInteraction(data.hubspot_interaction);
    } catch (err) {
      setError("Failed to load chat history");
      console.error("Error fetching chat history:", err);
      setChatHistory([]);
      setHubspotInteraction(null);
    } finally {
      setLoadingChat(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  // Load chat history when sessionId changes from URL
  useEffect(() => {
    if (sessionId) {
      setSelectedSessionId(sessionId);
      fetchChatHistory(sessionId);
    }
  }, [sessionId]);

  const handleSessionClick = (sessionId: string) => {
    setSelectedSessionId(sessionId);
    fetchChatHistory(sessionId);
    // Update URL to include session ID
    navigate(`/chat-history/${sessionId}`);
  };

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Left Sidebar - Sessions */}
      <div className="w-[30%] bg-card border-r border-border flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Sessions</h2>
            <button
              onClick={fetchSessions}
              disabled={loadingSessions}
              className="p-2 rounded-lg hover:bg-accent transition-colors"
            >
              <RefreshCw
                className={`w-4 h-4 ${loadingSessions ? "animate-spin" : ""}`}
              />
            </button>
          </div>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loadingSessions ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="lg" />
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No sessions found
            </div>
          ) : (
            sessions.map((session) => (
              <SessionListItem
                key={session.session_id}
                sessionId={session.session_id}
                createdAt={session.created_at}
                isActive={selectedSessionId === session.session_id}
                onClick={() => handleSessionClick(session.session_id)}
              />
            ))
          )}
        </div>
      </div>

      {/* Right Panel - Chat */}
      <div className="flex-1 flex flex-col bg-background">
        {selectedSessionId ? (
          <>
            {/* Chat Header */}
            <div className="p-6 border-b border-border bg-card">
              <h3 className="font-semibold text-foreground truncate">
                {selectedSessionId}
              </h3>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{chatHistory.length} messages</span>
                {hubspotInteraction && (
                  <span className="flex items-center gap-1">
                    <span>HubSpot Form:</span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        hubspotInteraction === "rendered"
                          ? "bg-blue-100 text-blue-800"
                          : hubspotInteraction === "filled"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {hubspotInteraction}
                    </span>
                  </span>
                )}
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6">
              {loadingChat ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner size="lg" />
                </div>
              ) : chatHistory.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No messages in this session
                </div>
              ) : (
                <div className="space-y-4">
                  {chatHistory.map((message, index) => (
                    <ChatBubble key={index} message={message} />
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-muted flex items-center justify-center">
                <MessageCircle className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Select a Session
                </h3>
                <p className="text-muted-foreground">
                  Choose a session from the left to view the conversation
                  history
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Toast */}
        {error && (
          <div className="absolute bottom-4 right-4 bg-destructive text-destructive-foreground px-4 py-2 rounded-lg shadow-lg">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatHistory;
