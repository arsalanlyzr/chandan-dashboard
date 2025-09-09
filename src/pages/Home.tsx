import { useState, useEffect } from "react";
import {
  MessageCircle,
  ThumbsUp,
  ThumbsDown,
  FormInput,
  CheckCircle,
  TrendingUp,
  Users,
  Activity,
  Calendar as CalendarIcon,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface AnalyticsData {
  total_sessions: number;
  total_user_messages: number;
  sessions_with_multiple_messages: number;
  hubspot_stats: {
    rendered: number;
    filled: number;
    none: number;
    total: number;
  };
  feedback_stats: {
    total_likes: number;
    total_dislikes: number;
    total_feedback: number;
    sessions_with_feedback: number;
    total_sessions: number;
    feedback_rate: number;
  };
  sessions: Array<{
    session_id: string;
    hubspot_interaction: string | null;
    total_messages: number;
    user_messages: number;
    agent_messages: number;
    feedback_stats: {
      like: number;
      dislike: number;
      total: number;
    };
    has_multiple_messages: boolean;
    created_at: string;
    last_activity: string;
  }>;
}

type TimeFilter = "today" | "week" | "month";

interface Filters {
  timeFilter: TimeFilter;
  start_date: string;
  end_date: string;
}

interface HubSpotSession {
  session_id: string;
  hubspot_interaction: string;
  created_at: string;
  last_activity: string;
  user_messages: number;
  total_messages: number;
}

interface HubSpotData {
  total_sessions: number;
  sessions: HubSpotSession[];
  limit: number;
  offset: number;
}

const Home = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({
    timeFilter: "today",
    start_date: "",
    end_date: "",
  });
  const [showHubSpotDialog, setShowHubSpotDialog] = useState(false);
  const [hubSpotData, setHubSpotData] = useState<HubSpotData | null>(null);
  const [loadingHubSpot, setLoadingHubSpot] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, [filters]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (filters.start_date) params.append("start_date", filters.start_date);
      if (filters.end_date) params.append("end_date", filters.end_date);
      // Add time filter parameters based on selected time range
      const now = new Date();
      const startDate = new Date();
      const endDate = new Date();

      switch (filters.timeFilter) {
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

      params.append("start_date", startDate.toISOString().split("T")[0]);
      params.append("end_date", endDate.toISOString().split("T")[0]);

      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/lyzr/analytics?${params.toString()}`
      );
      if (!response.ok) throw new Error("Failed to fetch analytics");

      const data = await response.json();
      setAnalyticsData(data);
    } catch (err) {
      setError("Failed to load analytics data");
      console.error("Error fetching analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      timeFilter: "today",
      start_date: "",
      end_date: "",
    });
  };

  const hasActiveFilters = () => {
    return (
      filters.timeFilter !== "today" ||
      filters.start_date !== "" ||
      filters.end_date !== ""
    );
  };

  const fetchHubSpotData = async () => {
    try {
      setLoadingHubSpot(true);
      const params = new URLSearchParams();

      // Add time filter parameters based on selected time range
      const now = new Date();
      const startDate = new Date();
      const endDate = new Date();

      switch (filters.timeFilter) {
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

      params.append("start_date", startDate.toISOString().split("T")[0]);
      params.append("end_date", endDate.toISOString().split("T")[0]);

      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/lyzr/hubspot-sessions?${params.toString()}`
      );
      if (!response.ok) throw new Error("Failed to fetch HubSpot data");

      const data = await response.json();
      setHubSpotData(data);
    } catch (err) {
      console.error("Error fetching HubSpot data:", err);
    } finally {
      setLoadingHubSpot(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-destructive">{error}</p>
          <button
            onClick={fetchAnalytics}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">No analytics data available</p>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const hubspotData = [
    {
      name: "Rendered",
      value: analyticsData.hubspot_stats.rendered,
      color: "#3b82f6",
    },
    {
      name: "Filled",
      value: analyticsData.hubspot_stats.filled,
      color: "#10b981",
    },
  ];

  const feedbackData = [
    {
      name: "Likes",
      value: analyticsData.feedback_stats.total_likes,
      color: "#10b981",
    },
    {
      name: "Dislikes",
      value: analyticsData.feedback_stats.total_dislikes,
      color: "#ef4444",
    },
  ];

  const sessionActivityData = analyticsData.sessions
    .slice(0, 7)
    .map((session) => ({
      name: session.session_id.slice(-8),
      messages: session.total_messages,
      date: new Date(session.created_at).toLocaleDateString(),
    }));

  return (
    <div className="min-h-[calc(100vh-4rem)] p-6 space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">
            Analytics Dashboard
          </h1>
          <p className="text-muted-foreground">
            Overview of your chat interactions and performance metrics
          </p>
        </div>

        {/* Time Filters */}
        <div className="flex items-center space-x-2 bg-card border border-border rounded-lg p-4">
          <div className="flex items-center space-x-1">
            <CalendarIcon className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">
              Time Range:
            </span>
          </div>

          <div className="flex items-center space-x-1">
            <Button
              variant={filters.timeFilter === "today" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilters({ ...filters, timeFilter: "today" })}
              className="text-xs"
            >
              Today
            </Button>
            <Button
              variant={filters.timeFilter === "week" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilters({ ...filters, timeFilter: "week" })}
              className="text-xs"
            >
              This Week
            </Button>
            <Button
              variant={filters.timeFilter === "month" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilters({ ...filters, timeFilter: "month" })}
              className="text-xs"
            >
              This Month
            </Button>
          </div>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Sessions */}
        <div className="bg-card border border-border rounded-lg p-6 space-y-2 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Total Sessions
              </p>
              <p className="text-2xl font-bold text-foreground">
                {analyticsData.total_sessions}
              </p>
            </div>
            <div className="p-3 bg-primary/10 rounded-lg">
              <MessageCircle className="w-6 h-6 text-primary" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            {analyticsData.sessions_with_multiple_messages} with multiple
            messages
          </p>
        </div>

        {/* Likes */}
        <div className="bg-card border border-border rounded-lg p-6 space-y-2 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Total Likes
              </p>
              <p className="text-2xl font-bold text-foreground">
                {analyticsData.feedback_stats.total_likes}
              </p>
            </div>
            <div className="p-3 bg-green-500/10 rounded-lg">
              <ThumbsUp className="w-6 h-6 text-green-500" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            {analyticsData.feedback_stats.feedback_rate}% feedback rate
          </p>
        </div>

        {/* Dislikes */}
        <div className="bg-card border border-border rounded-lg p-6 space-y-2 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Total Dislikes
              </p>
              <p className="text-2xl font-bold text-foreground">
                {analyticsData.feedback_stats.total_dislikes}
              </p>
            </div>
            <div className="p-3 bg-red-500/10 rounded-lg">
              <ThumbsDown className="w-6 h-6 text-red-500" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            {analyticsData.feedback_stats.sessions_with_feedback} sessions with
            feedback
          </p>
        </div>

        {/* HubSpot Forms */}
        <div className="bg-card border border-border rounded-lg p-6 space-y-2 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                HubSpot Forms
              </p>
              <p className="text-2xl font-bold text-foreground">
                {analyticsData.hubspot_stats.filled}
              </p>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <CheckCircle className="w-6 h-6 text-blue-500" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            {analyticsData.hubspot_stats.rendered} rendered,{" "}
            {analyticsData.hubspot_stats.filled} filled
          </p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* HubSpot Interaction Distribution */}
        <div className="bg-card border border-border rounded-lg p-6 space-y-4 transition-all duration-200 hover:bg-card">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  HubSpot Form Interactions
                </h3>
                <p className="text-sm text-muted-foreground">
                  {analyticsData.hubspot_stats.total} total forms rendered
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowHubSpotDialog(true);
                  fetchHubSpotData();
                }}
                className="text-xs"
              >
                View Details
              </Button>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={hubspotData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {hubspotData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Feedback Distribution */}
        <div className="bg-card border border-border rounded-lg p-6 space-y-4 transition-all duration-200 hover:bg-card">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">
              Feedback Distribution
            </h3>
            <p className="text-sm text-muted-foreground">
              Likes vs Dislikes across all sessions
            </p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={feedbackData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />

                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Session Activity */}
        <div className="bg-card border border-border rounded-lg p-6 space-y-4 lg:col-span-2 transition-all duration-200 hover:bg-card">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">
              Recent Session Activity
            </h3>
            <p className="text-sm text-muted-foreground">
              Message count per session (last 7 sessions)
            </p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sessionActivityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />

                <Bar dataKey="messages" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-border rounded-lg p-6 space-y-2 transition-all duration-200">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-muted-foreground" />
            <p className="text-sm font-medium text-muted-foreground">
              Total User Messages
            </p>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {analyticsData.total_user_messages}
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 space-y-2 transition-all duration-200">
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-muted-foreground" />
            <p className="text-sm font-medium text-muted-foreground">
              Sessions with Multiple Messages
            </p>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {analyticsData.sessions_with_multiple_messages}
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 space-y-2 transition-all duration-200">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-muted-foreground" />
            <p className="text-sm font-medium text-muted-foreground">
              Feedback Rate
            </p>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {analyticsData.feedback_stats.feedback_rate}%
          </p>
        </div>
      </div>

      {/* HubSpot Sessions Dialog */}
      <Dialog open={showHubSpotDialog} onOpenChange={setShowHubSpotDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>HubSpot Form Sessions</DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto max-h-[70vh]">
            {loadingHubSpot ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : hubSpotData ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Session ID</TableHead>
                    <TableHead>HubSpot Interaction</TableHead>
                    <TableHead>User Queries</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead>Last Activity</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {hubSpotData.sessions.map((session) => (
                    <TableRow
                      key={session.session_id}
                      className="cursor-pointer hover:bg-accent transition-colors"
                      onClick={() => {
                        const url = `${window.location.origin}/chat-history/${session.session_id}`;
                        window.open(url, "_blank");
                      }}
                    >
                      <TableCell className="font-mono text-xs">
                        {session.session_id.slice(-12)}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            session.hubspot_interaction === "rendered"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {session.hubspot_interaction}
                        </span>
                      </TableCell>
                      <TableCell>{session.user_messages}</TableCell>
                      <TableCell className="text-xs">
                        {new Date(session.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-xs">
                        {new Date(session.last_activity).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No HubSpot session data available
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Home;
