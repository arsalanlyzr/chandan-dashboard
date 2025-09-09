import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Dispatch, SetStateAction, MutableRefObject } from "react";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Clean streaming content data for markdown rendering
 * @param content - The raw content from the API
 * @returns Cleaned content ready for markdown rendering
 */
export const cleanStreamingContent = (content: string): string => {
  return (
    content
      .replace(/data: /g, "") // Remove "data: " prefixes
      .replace(/\\n/g, "\n") // Convert escaped newlines to actual newlines
      .replace(/<follow_up_question>.*?<\/follow_up_question>/g, "") // Remove follow-up questions
      .replace(/\[DONE\]/g, "") // Remove [DONE] markers
      .replace(/<emudra_hubspot_form>/g, "") // Remove HubSpot form tags
      // Fix specific formatting issues in your content
      .replace(/##\s+/g, "\n## ") // Ensure proper heading spacing
      .replace(/(\w+)\s*\n\s*(\w+)/g, (match, word1, word2) => {
        // Don't join if it's part of markdown syntax or if it would break formatting
        if (
          word1.includes("**") ||
          word2.includes("**") ||
          word1.includes("#") ||
          word2.includes("#") ||
          word1.includes("-") ||
          word2.includes("-") ||
          word1.includes("₹") ||
          word2.includes("₹") ||
          word1.includes("/") ||
          word2.includes("/")
        ) {
          return match; // Keep original
        }
        return word1 + word2;
      })
      // Fix specific markdown formatting issues
      .replace(/\*\* ([^*]+) \*\*/g, "**$1**") // Fix bold with extra spaces
      .replace(/\*\*([^*]+)\*\*/g, "**$1**") // Ensure proper bold formatting
      // Fix specific content issues
      .replace(/₹1\s*,000/g, "₹1,000") // Fix price formatting
      .replace(/₹5\s*per/g, "₹5 per") // Fix price formatting
      .replace(/₹800\s*per/g, "₹800 per") // Fix price formatting
      .replace(/₹1,650\s*per/g, "₹1,650 per") // Fix price formatting
      .replace(/₹3,000\s*per/g, "₹3,000 per") // Fix price formatting
      .replace(/EssentialPlan:/g, "**Essential Plan:**") // Fix plan names
      .replace(/Advanced Plan:/g, "**Advanced Plan:**") // Fix plan names
      .replace(/ProfessionalPlan:/g, "**Professional Plan:**") // Fix plan names
      .replace(/Bharat Plan:/g, "**Bharat Plan:**") // Fix plan names
      .replace(/KeyBenefits/g, "**Key Benefits**") // Fix section headers
      .replace(/Enterprise-grade/g, "Enterprise-grade") // Fix hyphenation
      .replace(/legalcompliance/g, "legal compliance") // Fix spacing
      .replace(/document store included/g, "document store included") // Fix spacing
      // Normalize spacing while preserving markdown structure
      .replace(/\n\n+/g, "\n\n") // Normalize multiple newlines
      .replace(/([^\n])\n([^\n])/g, "$1\n\n$2") // Ensure proper paragraph breaks
      .trim()
  ); // Remove extra whitespace
};

/**
 * Handle scroll events with debounce
 * @param setIsScrolling - State setter for the scrolling state
 * @param scrollTimeout - Ref to store the timeout
 * @param timeoutDuration - Duration in ms before scrolling state resets
 */
export const handleScroll = (
  setIsScrolling: Dispatch<SetStateAction<boolean>>,
  scrollTimeout: MutableRefObject<ReturnType<typeof setTimeout> | null>,
  timeoutDuration: number = 1000
) => {
  setIsScrolling(true);
  if (scrollTimeout.current) {
    clearTimeout(scrollTimeout.current);
  }
  scrollTimeout.current = setTimeout(() => {
    setIsScrolling(false);
  }, timeoutDuration);
};

/**
 * Call the Lyzr chat API with streaming support
 * @param sessionId - The current session ID
 * @param message - The message to send
 * @param onStreamChunk - Callback function to handle streaming chunks
 * @returns Promise that resolves with the agent_message_id
 */
export const callChatAPI = async (
  sessionId: string,
  message: string,
  onStreamChunk: (chunk: string) => void
): Promise<string | null> => {
  try {
    const response = await fetch(
      import.meta.env.VITE_API_URL + "/api/lyzr/router",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          session_id: sessionId,
          message: message,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();
      const responseText =
        data.response || data.message || data.content || data;
      if (responseText) {
        const processedResponse = responseText.replace(/\\n/g, "\n");
        onStreamChunk(processedResponse);
      }
      return data.agent_message_id || null;
    }

    // Handle streaming response
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error("No response body reader available");
    }

    let buffer = "";
    let agentMessageId: string | null = null;

    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.trim()) {
          // Handle Server-Sent Events format
          if (line.startsWith("data: ")) {
            const dataContent = line.substring(6);

            if (dataContent.includes("[DONE]")) {
              break;
            }

            try {
              const data = JSON.parse(dataContent);

              // Capture agent_message_id from the final metadata
              if (data.type === "end_metadata" && data.agent_message_id) {
                agentMessageId = data.agent_message_id;
              }

              const chunk =
                data.response ||
                data.message ||
                data.chunk ||
                data.content ||
                "";
              if (chunk) {
                const processedChunk = chunk.replace(/\\n/g, "\n");
                onStreamChunk(processedChunk);
              }
            } catch (parseError) {
              if (dataContent.trim()) {
                const processedContent = dataContent.replace(/\\n/g, "\n");
                onStreamChunk(processedContent);
              }
              console.log(parseError);
            }
          } else if (
            line.trim() &&
            !line.startsWith("event:") &&
            !line.startsWith("id:")
          ) {
            const processedLine = line.replace(/\\n/g, "\n");
            onStreamChunk(processedLine);
          }
        }
      }
    }

    if (buffer.trim()) {
      if (buffer.startsWith("data: ")) {
        const dataContent = buffer.substring(6);
        if (!dataContent.includes("[DONE]")) {
          try {
            const data = JSON.parse(dataContent);

            // Capture agent_message_id from the final metadata
            if (data.type === "end_metadata" && data.agent_message_id) {
              agentMessageId = data.agent_message_id;
            }

            const chunk =
              data.response || data.message || data.chunk || data.content || "";
            if (chunk) {
              const processedChunk = chunk.replace(/\\n/g, "\n");
              onStreamChunk(processedChunk);
            }
          } catch (parseError) {
            if (dataContent.trim()) {
              const processedContent = dataContent.replace(/\\n/g, "\n");
              onStreamChunk(processedContent);
            }
            console.log(parseError);
          }
        }
      }
    }

    return agentMessageId;
  } catch (error) {
    console.error("Error calling Lyzr streaming API:", error);
    throw new Error("Failed to get response from chat API");
  }
};

/**
 * Send feedback for a specific message
 * @param sessionId - The current session ID
 * @param messageId - The agent message ID
 * @param feedback - The feedback type ('like' or 'dislike')
 */
export const sendFeedback = async (
  sessionId: string,
  messageId: string,
  feedback: "like" | "dislike"
): Promise<void> => {
  try {
    const response = await fetch(
      `${
        import.meta.env.VITE_API_URL
      }/api/lyzr/feedback/${sessionId}/${messageId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          feedback: feedback,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(
        `Feedback API request failed with status ${response.status}`
      );
    }

    console.log(
      `Feedback sent successfully: ${feedback} for message ${messageId}`
    );
  } catch (error) {
    console.error("Error sending feedback:", error);
    throw new Error("Failed to send feedback");
  }
};

/**
 * Send HubSpot form interaction update to backend
 * @param sessionId - The current session ID
 * @param interaction - The interaction type ('rendered', 'filled', or 'none')
 */
export const sendHubSpotInteraction = async (
  sessionId: string,
  interaction: "rendered" | "filled" | "none"
): Promise<void> => {
  try {
    const response = await fetch(
      `${
        import.meta.env.VITE_API_URL
      }/api/lyzr/hubspot-interaction/${sessionId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          hubspot_interaction: interaction,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(
        `HubSpot interaction API request failed with status ${response.status}`
      );
    }

    console.log(
      `HubSpot interaction sent successfully: ${interaction} for session ${sessionId}`
    );
  } catch (error) {
    console.error("Error sending HubSpot interaction:", error);
    throw new Error("Failed to send HubSpot interaction");
  }
};
