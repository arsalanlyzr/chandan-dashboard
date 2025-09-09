const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

if (!API_BASE_URL) {
  console.error("VITE_BACKEND_URL is not configured in environment variables");
}

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Time filter options for analytics queries
 */
export type TimeFilter = "today" | "week" | "month";

/**
 * HubSpot interaction types
 */
export type HubSpotInteraction = "rendered" | "filled" | "none";

/**
 * Feedback types for user interactions
 */
export type FeedbackType = "like" | "dislike";

/**
 * Analytics data structure returned by the analytics API
 */
export interface AnalyticsData {
  /** Total number of chat sessions */
  total_sessions: number;

  /** Total number of user messages across all sessions */
  total_user_messages: number;

  /** Number of sessions with multiple messages */
  sessions_with_multiple_messages: number;

  /** HubSpot form interaction statistics */
  hubspot_stats: {
    /** Number of forms rendered to users */
    rendered: number;
    /** Number of forms filled by users */
    filled: number;
    /** Number of sessions with no HubSpot interaction */
    none: number;
    /** Total number of HubSpot interactions */
    total: number;
  };

  /** User feedback statistics */
  feedback_stats: {
    /** Total number of likes received */
    total_likes: number;
    /** Total number of dislikes received */
    total_dislikes: number;
    /** Total feedback count (likes + dislikes) */
    total_feedback: number;
    /** Number of sessions that received feedback */
    sessions_with_feedback: number;
    /** Total number of sessions */
    total_sessions: number;
    /** Feedback rate as percentage */
    feedback_rate: number;
  };

  /** Array of individual session data */
  sessions: SessionData[];
}

/**
 * Individual session data structure
 */
export interface SessionData {
  /** Unique session identifier */
  session_id: string;

  /** HubSpot interaction type for this session */
  hubspot_interaction: string | null;

  /** Total number of messages in this session */
  total_messages: number;

  /** Number of user messages in this session */
  user_messages: number;

  /** Number of agent messages in this session */
  agent_messages: number;

  /** Feedback statistics for this session */
  feedback_stats: {
    /** Number of likes for this session */
    like: number;
    /** Number of dislikes for this session */
    dislike: number;
    /** Total feedback for this session */
    total: number;
  };

  /** Whether this session has multiple messages */
  has_multiple_messages: boolean;

  /** Session creation timestamp */
  created_at: string;

  /** Last activity timestamp */
  last_activity: string;
}

/**
 * HubSpot sessions data structure
 */
export interface HubSpotSessionsData {
  /** Total number of HubSpot sessions */
  total_sessions: number;

  /** Array of HubSpot session details */
  sessions: HubSpotSession[];

  /** Pagination limit */
  limit: number;

  /** Pagination offset */
  offset: number;
}

/**
 * Individual HubSpot session data
 */
export interface HubSpotSession {
  /** Unique session identifier */
  session_id: string;

  /** HubSpot interaction type */
  hubspot_interaction: string;

  /** Session creation timestamp */
  created_at: string;

  /** Last activity timestamp */
  last_activity: string;

  /** Number of user messages */
  user_messages: number;

  /** Total number of messages */
  total_messages: number;
}

/**
 * API query parameters for analytics
 */
export interface AnalyticsQueryParams {
  /** Start date for filtering (YYYY-MM-DD format) */
  start_date?: string;
  /** End date for filtering (YYYY-MM-DD format) */
  end_date?: string;
  /** Time filter preset */
  timeFilter?: TimeFilter;
}

/**
 * API response wrapper
 */
interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Generates date range based on time filter
 * @param timeFilter - The time filter to apply
 * @returns Object with start_date and end_date in YYYY-MM-DD format
 */
export const getDateRangeFromFilter = (
  timeFilter: TimeFilter
): { start_date: string; end_date: string } => {
  const now = new Date();
  const startDate = new Date();
  const endDate = new Date();

  switch (timeFilter) {
    case "today":
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      break;
    case "week":
      startDate.setDate(now.getDate() - now.getDay());
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      break;
    case "month":
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
      endDate.setMonth(endDate.getMonth() + 1);
      endDate.setDate(0);
      endDate.setHours(23, 59, 59, 999);
      break;
  }

  return {
    start_date: startDate.toISOString().split("T")[0],
    end_date: endDate.toISOString().split("T")[0],
  };
};

/**
 * Builds query string from parameters
 * @param params - Query parameters object
 * @returns URL-encoded query string
 */
const buildQueryString = (
  params: Record<string, string | undefined>
): string => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      searchParams.append(key, value);
    }
  });

  return searchParams.toString();
};

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Fetches analytics data from the backend
 *
 * @param params - Query parameters for filtering analytics data
 * @returns Promise resolving to analytics data
 *
 * @example
 * ```typescript
 * // Get today's analytics
 * const todayData = await fetchAnalytics({ timeFilter: 'today' });
 *
 * // Get custom date range
 * const customData = await fetchAnalytics({
 *   start_date: '2024-01-01',
 *   end_date: '2024-01-31'
 * });
 * ```
 */
export const fetchAnalytics = async (
  params: AnalyticsQueryParams = {}
): Promise<AnalyticsData> => {
  try {
    // Build query parameters
    const queryParams: Record<string, string> = {};

    // Add custom date range if provided
    if (params.start_date) queryParams.start_date = params.start_date;
    if (params.end_date) queryParams.end_date = params.end_date;

    // Add time filter date range if no custom dates provided
    if (params.timeFilter && !params.start_date && !params.end_date) {
      const dateRange = getDateRangeFromFilter(params.timeFilter);
      queryParams.start_date = dateRange.start_date;
      queryParams.end_date = dateRange.end_date;
    }

    const queryString = buildQueryString(queryParams);
    const url = `${API_BASE_URL}/api/lyzr/analytics${
      queryString ? `?${queryString}` : ""
    }`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        `Analytics API request failed with status ${response.status}`
      );
    }

    const data: AnalyticsData = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching analytics data:", error);
    throw new Error("Failed to fetch analytics data");
  }
};

/**
 * Fetches HubSpot sessions data from the backend
 *
 * @param params - Query parameters for filtering HubSpot sessions
 * @returns Promise resolving to HubSpot sessions data
 *
 * @example
 * ```typescript
 * // Get this week's HubSpot sessions
 * const hubspotData = await fetchHubSpotSessions({ timeFilter: 'week' });
 * ```
 */
export const fetchHubSpotSessions = async (
  params: AnalyticsQueryParams = {}
): Promise<HubSpotSessionsData> => {
  try {
    // Build query parameters
    const queryParams: Record<string, string> = {};

    // Add custom date range if provided
    if (params.start_date) queryParams.start_date = params.start_date;
    if (params.end_date) queryParams.end_date = params.end_date;

    // Add time filter date range if no custom dates provided
    if (params.timeFilter && !params.start_date && !params.end_date) {
      const dateRange = getDateRangeFromFilter(params.timeFilter);
      queryParams.start_date = dateRange.start_date;
      queryParams.end_date = dateRange.end_date;
    }

    const queryString = buildQueryString(queryParams);
    const url = `${API_BASE_URL}/api/lyzr/hubspot-sessions${
      queryString ? `?${queryString}` : ""
    }`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        `HubSpot sessions API request failed with status ${response.status}`
      );
    }

    const data: HubSpotSessionsData = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching HubSpot sessions data:", error);
    throw new Error("Failed to fetch HubSpot sessions data");
  }
};

// ============================================================================
// ERROR HANDLING
// ============================================================================

/**
 * Custom error class for API-related errors
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public endpoint?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Handles API errors consistently
 * @param error - The error object
 * @param endpoint - The API endpoint that failed
 * @throws ApiError with standardized error information
 */
export const handleApiError = (error: unknown, endpoint: string): never => {
  if (error instanceof ApiError) {
    throw error;
  }

  const message = error instanceof Error ? error.message : "Unknown API error";
  throw new ApiError(message, undefined, endpoint);
};

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  fetchAnalytics,
  fetchHubSpotSessions,
  getDateRangeFromFilter,
  ApiError,
  handleApiError,
};
