# API Documentation

This directory contains the API utilities and type definitions for the Emudhra Analytics Dashboard.

## Files

### `api.ts`

Centralized API utility file containing:

- Type definitions for all API responses
- API configuration and base URL setup
- Utility functions for date handling and query building
- Main API functions for fetching data
- Error handling utilities

### `utils.ts`

General utility functions including:

- `cn()` - Class name merging utility for Tailwind CSS

## API Endpoints

### Analytics API

- **Endpoint**: `/api/lyzr/analytics`
- **Method**: GET
- **Description**: Fetches comprehensive analytics data including sessions, feedback, and HubSpot interactions
- **Parameters**:
  - `start_date` (optional): Start date in YYYY-MM-DD format
  - `end_date` (optional): End date in YYYY-MM-DD format
  - `timeFilter` (optional): Preset time filter ("today", "week", "month")

### HubSpot Sessions API

- **Endpoint**: `/api/lyzr/hubspot-sessions`
- **Method**: GET
- **Description**: Fetches HubSpot form interaction data
- **Parameters**: Same as Analytics API

## Usage Examples

```typescript
import { fetchAnalytics, fetchHubSpotSessions } from "@/lib/api";

// Fetch today's analytics
const todayData = await fetchAnalytics({ timeFilter: "today" });

// Fetch custom date range
const customData = await fetchAnalytics({
  start_date: "2024-01-01",
  end_date: "2024-01-31",
});

// Fetch HubSpot sessions
const hubspotData = await fetchHubSpotSessions({ timeFilter: "week" });
```

## Type Safety

All API functions are fully typed with TypeScript interfaces:

- `AnalyticsData` - Main analytics response structure
- `HubSpotSessionsData` - HubSpot sessions response structure
- `TimeFilter` - Time filter options
- `AnalyticsQueryParams` - Query parameters interface

## Error Handling

The API utilities include comprehensive error handling:

- Custom `ApiError` class for API-specific errors
- Consistent error messages and logging
- Graceful fallbacks for failed requests

## Environment Configuration

Make sure to set the following environment variable:

- `VITE_BACKEND_URL` - Base URL for the backend API

## Adding New API Endpoints

When adding new API endpoints:

1. Define TypeScript interfaces for request/response data
2. Add the API function to `api.ts` with proper error handling
3. Export the function and types
4. Update this documentation
5. Add usage examples

## Best Practices

- Always use the centralized API functions instead of direct fetch calls
- Leverage TypeScript interfaces for type safety
- Handle errors gracefully with try-catch blocks
- Use the provided utility functions for date handling
- Follow the established naming conventions
