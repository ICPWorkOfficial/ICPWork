# ICPWork API Documentation

## Base URL
- **Development**: `http://localhost:3000`
- **Production**: `https://your-domain.com`

## Authentication
Most endpoints require authentication via session cookies. Login first to get a session cookie.

---

## 🔐 Authentication Endpoints

### POST /api/login
**Description**: Login user and create session
**Body**:
```json
{
  "email": "test@example.com",
  "password": "TestPass123!"
}
```
**Response**:
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "email": "test@example.com",
    "userType": "freelancer"
  },
  "sessionId": "session_123"
}
```

### POST /api/signup
**Description**: Register new user
**Body**:
```json
{
  "email": "newuser@example.com",
  "password": "NewPass123!",
  "confirmPassword": "NewPass123!",
  "userType": "freelancer"
}
```
**Response**:
```json
{
  "success": true,
  "message": "Account created successfully",
  "user": {
    "email": "newuser@example.com",
    "userType": "freelancer"
  },
  "sessionId": "session_456"
}
```

### POST /api/logout
**Description**: Logout user and clear session
**Headers**: Requires session cookie
**Response**:
```json
{
  "success": true,
  "message": "Logout successful"
}
```

### GET /api/validate-session
**Description**: Check if session is valid
**Headers**: Requires session cookie
**Response**:
```json
{
  "success": true,
  "message": "Session is valid",
  "valid": true,
  "user": {
    "email": "test@example.com",
    "userType": "freelancer",
    "expiresAt": 1234567890
  }
}
```

---

## 💼 Job Postings Endpoints

### GET /api/job-postings
**Description**: Get job postings with optional filters
**Query Parameters**:
- `active=true` - Get only active job postings
- `clientEmail=email@example.com` - Get job postings by client
- `category=Technology` - Get job postings by category
- `subCategory=Frontend` - Get job postings by subcategory
- `workplaceType=Remote` - Get job postings by workplace type
- `search=developer` - Search job postings by title
- `stats=true` - Get job posting statistics

**Example**: `GET /api/job-postings?active=true&category=Technology`

**Response**:
```json
{
  "success": true,
  "jobPostings": [
    {
      "id": "job_123",
      "clientEmail": "client@example.com",
      "category": {"Technology": null},
      "subCategory": {"Frontend": null},
      "jobTitle": "React Developer",
      "rolesAndResponsibilities": ["Develop React apps"],
      "skillsRequired": ["React", "JavaScript"],
      "benefits": ["Health insurance"],
      "jobRoles": ["Frontend Developer"],
      "duration": "6 months",
      "isContractToHire": true,
      "workplaceType": {"Remote": null},
      "location": "Remote",
      "budget": "$5000-8000",
      "budgetType": {"PerHour": null},
      "applicationType": {"Paid": null},
      "applicationDetails": "Include portfolio",
      "isActive": true,
      "createdAt": "1234567890",
      "updatedAt": "1234567890",
      "applicationsCount": "5"
    }
  ],
  "count": 1
}
```

### POST /api/job-postings
**Description**: Create new job posting
**Body**:
```json
{
  "clientEmail": "client@example.com",
  "category": "Technology",
  "subCategory": "Frontend",
  "jobTitle": "React Developer",
  "rolesAndResponsibilities": [
    "Develop user-facing features using React",
    "Build reusable components and libraries"
  ],
  "skillsRequired": ["React", "JavaScript", "TypeScript"],
  "benefits": ["Competitive salary", "Health insurance"],
  "jobRoles": ["Frontend Developer", "UI Developer"],
  "duration": "6 months",
  "isContractToHire": true,
  "workplaceType": "Remote",
  "location": "Remote",
  "budget": "$5000-8000",
  "budgetType": "PerHour",
  "applicationType": "Paid",
  "applicationDetails": "Please include your portfolio"
}
```

### GET /api/job-postings/{id}
**Description**: Get specific job posting by ID
**Response**: Same as job posting object above

### PUT /api/job-postings/{id}
**Description**: Update job posting
**Body**:
```json
{
  "jobTitle": "Senior React Developer",
  "budget": "$6000-9000",
  "isActive": true
}
```

### DELETE /api/job-postings/{id}
**Description**: Delete job posting
**Response**:
```json
{
  "success": true,
  "message": "Job posting deleted successfully"
}
```

### POST /api/job-postings/{id}/apply
**Description**: Apply to a job posting
**Body**:
```json
{
  "applicantEmail": "freelancer@example.com",
  "applicantName": "John Doe",
  "coverLetter": "I am very interested in this position...",
  "resume": "https://example.com/resume.pdf",
  "portfolio": "https://example.com/portfolio",
  "expectedSalary": "$6000",
  "availability": "Immediately",
  "additionalNotes": "Available for full-time work"
}
```

---

## 👥 User Management Endpoints

### GET /api/users/all
**Description**: Get all users (admin function)
**Response**:
```json
{
  "success": true,
  "users": [
    {
      "email": "user@example.com",
      "userType": "freelancer",
      "createdAt": "1234567890"
    }
  ],
  "count": 1,
  "message": "Retrieved 1 users"
}
```

### POST /api/users
**Description**: Register user (legacy endpoint)
**Body**:
```json
{
  "email": "legacy@example.com",
  "password": "LegacyPass123!",
  "userType": "client"
}
```

### GET /api/users/email/{email}
**Description**: Get user by email address
**Response**:
```json
{
  "success": true,
  "user": {
    "email": "test@example.com",
    "userType": "freelancer"
  }
}
```

### GET /api/users/by-type/{userType}
**Description**: Get users by type (freelancer or client)
**Response**: Array of users with specified type

### POST /api/users/login
**Description**: User login (legacy endpoint)
**Body**:
```json
{
  "email": "test@example.com",
  "password": "TestPass123!"
}
```

---

## 👤 Profile Endpoints

### GET /api/profile
**Description**: Get all profiles
**Query Parameters**:
- `id={profileId}` - Get specific profile by ID

**Response**:
```json
{
  "ok": true,
  "profiles": [
    {
      "id": "profile_123",
      "firstName": "John",
      "lastName": "Doe",
      "skills": ["React", "Node.js"],
      "experience": "5 years"
    }
  ]
}
```

### POST /api/profile/complete
**Description**: Complete user profile
**Body**:
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "skills": ["React", "Node.js", "TypeScript"],
  "experience": "5 years",
  "bio": "Experienced full-stack developer"
}
```

---

## 💬 Messages Endpoints

### GET /api/messages
**Description**: Get all contacts
**Response**:
```json
{
  "ok": true,
  "contacts": [
    {
      "id": "contact_123",
      "name": "John Doe",
      "lastMessage": "Hello there!"
    }
  ]
}
```

### GET /api/messages?contactId={contactId}
**Description**: Get messages for specific contact
**Response**:
```json
{
  "ok": true,
  "messages": [
    {
      "id": "msg_123",
      "from": "me",
      "to": "contact_123",
      "text": "Hello, I'm interested in your project!",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### POST /api/messages
**Description**: Send a message to a contact
**Body**:
```json
{
  "contactId": "contact_123",
  "from": "me",
  "text": "Hello, I'm interested in your project!"
}
```

---

## 📁 Projects Endpoints

### GET /api/projects
**Description**: Get all projects
**Query Parameters**:
- `id={projectId}` - Get specific project by ID

**Response**:
```json
{
  "ok": true,
  "projects": [
    {
      "id": "project_123",
      "title": "Website Development",
      "status": "in_progress",
      "files": ["doc1.pdf", "image1.jpg"]
    }
  ]
}
```

### PATCH /api/projects
**Description**: Update project status and files
**Body**:
```json
{
  "id": "project_123",
  "status": "completed",
  "files": ["file1.pdf", "file2.docx"]
}
```

### POST /api/projects/upload
**Description**: Upload files to a project
**Body**:
```json
{
  "projectId": "project_123",
  "files": ["document1.pdf", "image1.jpg"]
}
```

---

## 🛠️ Services Endpoints

### GET /api/service/{id}
**Description**: Get service by ID
**Response**:
```json
{
  "success": true,
  "service": {
    "id": "service_123",
    "title": "Web Development Service",
    "description": "Professional web development",
    "price": "$50/hour"
  }
}
```

### POST /api/service/publish
**Description**: Publish a new service
**Body**:
```json
{
  "title": "Web Development Service",
  "description": "Professional web development services",
  "price": "$50/hour",
  "category": "Technology",
  "skills": ["React", "Node.js", "MongoDB"]
}
```

---

## 💱 ICP Swap Endpoints

### POST /api/icpswap/convert
**Description**: Convert currency using ICP swap
**Body**:
```json
{
  "from": "USD",
  "to": "ICP",
  "amount": "100"
}
```
**Response**:
```json
{
  "success": true,
  "rate": 400.8989,
  "converted": 0.2494
}
```

### GET /api/icpswap/transactions
**Description**: Get ICP swap transactions
**Response**:
```json
{
  "success": true,
  "transactions": [
    {
      "id": "tx_123",
      "from": "USD",
      "to": "ICP",
      "amount": "100",
      "converted": "0.2494",
      "timestamp": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

## 🔧 Admin Endpoints

### POST /api/admin/delete-user
**Description**: Delete user (admin function)
**Body**:
```json
{
  "id": "user_123",
  "name": "John Doe"
}
```
**Response**:
```json
{
  "ok": true,
  "id": "user_123",
  "name": "John Doe"
}
```

---

## 🛠️ Utility Endpoints

### GET /api/principal
**Description**: Get ICP principal and canister information
**Response**:
```json
{
  "success": true,
  "principalId": "2vxsx-fae",
  "canisterIds": {
    "main": "ulvla-h7777-77774-qaacq-cai",
    "userManagement": "vizcg-th777-77774-qaaea-cai",
    "clientData": "u6s2n-gx777-77774-qaaba-cai",
    "freelancerData": "umunu-kh777-77774-qaaca-cai",
    "escrow": "uzt4z-lp777-77774-qaabq-cai"
  }
}
```

### POST /api/invite
**Description**: Send invitation email
**Body**:
```json
{
  "email": "invite@example.com",
  "message": "Join our platform!"
}
```

### GET /api/demo
**Description**: Get demo data
**Response**: Demo data for testing

### GET /api/demo/profile
**Description**: Get demo profile data
**Response**: Demo profile data for testing

---

## 📝 Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "errors": {
    "field": "Field-specific error message"
  }
}
```

**Common HTTP Status Codes**:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error

---

## 🔑 Authentication Notes

1. **Session Management**: Most endpoints require a valid session cookie
2. **Login Flow**: 
   - POST to `/api/login` with credentials
   - Server sets `sessionId` cookie
   - Include cookie in subsequent requests
3. **Logout**: POST to `/api/logout` clears the session cookie

---

## 📊 Data Types

### Job Categories
- `Technology`
- `Marketing`
- `Design`
- `Sales`
- `Finance`
- `HumanResources`
- `Operations`
- `CustomerService`
- `Other`

### Sub Categories
- `Frontend`, `Backend`, `FullStack`, `Mobile`, `DevOps`
- `DataScience`, `MachineLearning`, `UIUX`, `GraphicDesign`
- `DigitalMarketing`, `ContentMarketing`, `SEO`, `SocialMedia`
- `SalesDevelopment`, `AccountManagement`
- `FinancialAnalysis`, `Accounting`
- `Recruitment`, `Training`
- `ProjectManagement`, `QualityAssurance`
- `CustomerSupport`, `TechnicalSupport`
- `Other`

### Workplace Types
- `Onsite`
- `Remote`
- `Hybrid`

### Budget Types
- `PerHour`
- `Fixed`
- `Negotiable`

### Application Types
- `Paid`
- `Unpaid`

### User Types
- `freelancer`
- `client`

---

## 🚀 Getting Started

1. **Import the Postman Collection**: Import `ICPWork_API_Postman_Collection.json` into Postman
2. **Set Environment Variables**:
   - `baseUrl`: `http://localhost:3000` (or your production URL)
   - `sessionId`: Will be set automatically after login
3. **Start Testing**:
   - Begin with authentication endpoints
   - Use the session cookie for protected endpoints
   - Test job posting creation and management
   - Explore user management and messaging features

---

## 📋 Testing Checklist

- [ ] Authentication (login, signup, logout, session validation)
- [ ] Job postings (CRUD operations, filtering, searching)
- [ ] User management (get users, register, get by type)
- [ ] Profiles (get, complete profile)
- [ ] Messages (get contacts, send messages)
- [ ] Projects (get, update, upload files)
- [ ] Services (get, publish)
- [ ] ICP Swap (convert currency, get transactions)
- [ ] Admin functions (delete user)
- [ ] Utility endpoints (principal info, invites, demo data)
