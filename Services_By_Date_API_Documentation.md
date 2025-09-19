# Services By Date API Documentation

## Overview
The Services By Date API (`/api/services/by-date`) provides powerful filtering capabilities for fetching services based on creation dates and other criteria. It supports both simple GET requests with query parameters and complex POST requests with advanced filtering options.

## Base URL
```
http://localhost:3000/api/services/by-date
```

## GET Method - Simple Date Filtering

### Basic Usage
```bash
# Get all services (default: sorted by createdAt desc, limit 50)
curl "http://localhost:3000/api/services/by-date"
```

### Query Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `startDate` | ISO Date String | Filter services created after this date | `2025-09-19T10:00:00.000Z` |
| `endDate` | ISO Date String | Filter services created before this date | `2025-09-19T10:10:00.000Z` |
| `limit` | Integer | Number of services to return (default: 50) | `10` |
| `offset` | Integer | Number of services to skip (default: 0) | `20` |
| `sortBy` | String | Sort field: `createdAt`, `updatedAt`, `serviceTitle` | `createdAt` |
| `sortOrder` | String | Sort direction: `asc`, `desc` | `desc` |

### Examples

#### 1. Get services created today
```bash
curl "http://localhost:3000/api/services/by-date?startDate=2025-09-19T00:00:00.000Z&endDate=2025-09-19T23:59:59.999Z"
```

#### 2. Get services from the last hour
```bash
curl "http://localhost:3000/api/services/by-date?startDate=2025-09-19T09:00:00.000Z&endDate=2025-09-19T10:00:00.000Z"
```

#### 3. Get services sorted by title (ascending)
```bash
curl "http://localhost:3000/api/services/by-date?sortBy=serviceTitle&sortOrder=asc"
```

#### 4. Get services with pagination
```bash
curl "http://localhost:3000/api/services/by-date?limit=5&offset=10"
```

## POST Method - Advanced Filtering

### Request Body Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `dateRanges` | Array | Multiple date ranges to filter by | `[{"startDate": "2025-09-19T10:00:00.000Z", "endDate": "2025-09-19T10:10:00.000Z"}]` |
| `categories` | Array | Filter by main categories | `["Development", "Design"]` |
| `subCategories` | Array | Filter by subcategories | `["Web Development", "UI/UX Design"]` |
| `priceRange` | Object | Filter by price range | `{"min": 50, "max": 500}` |
| `isActive` | Boolean | Filter by active status | `true` |
| `limit` | Integer | Number of services to return | `20` |
| `offset` | Integer | Number of services to skip | `0` |
| `sortBy` | String | Sort field | `createdAt` |
| `sortOrder` | String | Sort direction | `desc` |

### Examples

#### 1. Complex filtering with multiple criteria
```bash
curl -X POST -H "Content-Type: application/json" \
  -d '{
    "dateRanges": [
      {"startDate": "2025-09-19T10:00:00.000Z", "endDate": "2025-09-19T10:10:00.000Z"}
    ],
    "categories": ["Development"],
    "subCategories": ["Web Development"],
    "priceRange": {"min": 50, "max": 500},
    "isActive": true,
    "limit": 10,
    "sortBy": "createdAt",
    "sortOrder": "desc"
  }' \
  "http://localhost:3000/api/services/by-date"
```

#### 2. Multiple date ranges
```bash
curl -X POST -H "Content-Type: application/json" \
  -d '{
    "dateRanges": [
      {"startDate": "2025-09-19T09:00:00.000Z", "endDate": "2025-09-19T09:30:00.000Z"},
      {"startDate": "2025-09-19T10:00:00.000Z", "endDate": "2025-09-19T10:30:00.000Z"}
    ],
    "categories": ["Development", "Design"]
  }' \
  "http://localhost:3000/api/services/by-date"
```

#### 3. Price range filtering
```bash
curl -X POST -H "Content-Type: application/json" \
  -d '{
    "priceRange": {"min": 100, "max": 300},
    "sortBy": "price",
    "sortOrder": "asc"
  }' \
  "http://localhost:3000/api/services/by-date"
```

## Response Format

### Success Response
```json
{
  "success": true,
  "services": [
    {
      "id": "user@example.com",
      "overview": {
        "serviceTitle": "App Development",
        "mainCategory": "Mobile Development",
        "subCategory": "Full Stack Development",
        "description": "App Development",
        "email": "user@example.com"
      },
      "projectTiers": {
        "Basic": {
          "title": "Basic",
          "description": "Advanced App",
          "price": "10"
        },
        "Advanced": {
          "title": "Advanced",
          "description": "Normal App",
          "price": "20"
        },
        "Premium": {
          "title": "Premium",
          "description": "Major Upgrade",
          "price": "50"
        }
      },
      "additionalCharges": [],
      "portfolioImages": ["Screenshot From 2025-09-17 09-43-05.png"],
      "questions": [
        {
          "question": "No questions",
          "type": "text",
          "options": [""]
        }
      ],
      "isActive": true,
      "createdAt": "2025-09-19T03:07:01.798Z",
      "updatedAt": "2025-09-19T03:07:01.798Z"
    }
  ],
  "pagination": {
    "total": 13,
    "limit": 50,
    "offset": 0,
    "hasMore": false,
    "totalPages": 1,
    "currentPage": 1
  },
  "filters": {
    "startDate": null,
    "endDate": null,
    "sortBy": "createdAt",
    "sortOrder": "desc"
  },
  "message": "Found 13 services matching date criteria"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Invalid startDate format. Use ISO date string (e.g., 2025-01-01T00:00:00.000Z)",
  "details": "Additional error details if available"
}
```

## Use Cases

### 1. Analytics Dashboard
```bash
# Get services created in the last 24 hours
curl "http://localhost:3000/api/services/by-date?startDate=2025-09-18T10:00:00.000Z&endDate=2025-09-19T10:00:00.000Z"
```

### 2. Recent Activity Feed
```bash
# Get latest 10 services
curl "http://localhost:3000/api/services/by-date?limit=10&sortBy=createdAt&sortOrder=desc"
```

### 3. Category Analysis
```bash
# Get all Design services created this week
curl -X POST -H "Content-Type: application/json" \
  -d '{
    "dateRanges": [{"startDate": "2025-09-13T00:00:00.000Z", "endDate": "2025-09-19T23:59:59.999Z"}],
    "categories": ["Design"]
  }' \
  "http://localhost:3000/api/services/by-date"
```

### 4. Price Analysis
```bash
# Get services in specific price range
curl -X POST -H "Content-Type: application/json" \
  -d '{
    "priceRange": {"min": 100, "max": 500},
    "sortBy": "price",
    "sortOrder": "asc"
  }' \
  "http://localhost:3000/api/services/by-date"
```

## Notes

- All dates should be in ISO 8601 format (e.g., `2025-09-19T10:00:00.000Z`)
- The API automatically converts dates to the canister's nanosecond timestamp format
- Services are fetched from the freelancer dashboard canister
- BigInt values are automatically serialized to strings in the response
- The API supports both simple query parameter filtering and complex JSON body filtering
- Pagination is available for both GET and POST methods
- All filtering is done in-memory after fetching from the canister for maximum flexibility
