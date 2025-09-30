# ICP Freelance Marketplace - Architecture Diagrams

## 🏗️ System Architecture Overview

### High-Level System Architecture
```
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND LAYER                                │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐   │
│  │   Next.js App   │ │   React UI      │ │   Socket.IO     │   │
│  │   (Client-side) │ │   Components    │ │   (Real-time)   │   │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    API GATEWAY LAYER                             │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐   │
│  │   Auth Routes    │ │   Business API  │ │   File Upload   │   │
│  │   (72 endpoints) │ │   (RESTful)     │ │   (Assets)      │   │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              INTERNET COMPUTER PROTOCOL (ICP)                   │
│                                                                 │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐   │
│  │   Main Canister │ │  User Mgmt      │ │   Escrow Canister│   │
│  │   (Orchestrator)│ │   Canister      │ │   (Payments)    │   │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘   │
│                                                                 │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐   │
│  │ Message Store   │ │  Chat System    │ │  Job Posting    │   │
│  │   Canister      │ │   Canister      │ │   Canister      │   │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘   │
│                                                                 │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐   │
│  │ Freelancer Data │ │   Client Data   │ │  ICP Ledger     │   │
│  │   Canister      │ │   Canister      │ │   Integration  │   │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘   │
│                                                                 │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐   │
│  │   Project Store │ │  Bounties       │ │  Hackathon      │   │
│  │   Canister      │ │   Canister      │ │   Canister      │   │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    ICP BLOCKCHAIN STORAGE                       │
│                    • All data on-chain                          │
│                    • Cryptographic security                     │
│                    • Global accessibility                       │
│                    • Immutable records                          │
└─────────────────────────────────────────────────────────────────┘
```

## 🔄 Data Flow Architecture

### 1. Authentication Flow
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   User      │───▶│  Frontend   │───▶│   API Route │───▶│ Main Canister│
│  (Browser)  │    │  (Next.js)  │    │ (/api/users)│    │  (Auth)     │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
                                                              │
                                                              ▼
                                                    ┌─────────────┐
                                                    │Session Store│
                                                    │  Canister   │
                                                    └─────────────┘
                                                              │
                                                              ▼
                                                    ┌─────────────┐
                                                    │ HTTP-only   │
                                                    │  Cookie     │
                                                    └─────────────┘
                                                              │
                                                              ▼
                                                    ┌─────────────┐
                                                    │   User      │
                                                    │  Session    │
                                                    └─────────────┘
```

### 2. Escrow Payment Flow
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Client    │───▶│  Frontend   │───▶│ Escrow API  │───▶│ Escrow      │
│             │    │  (Create)   │    │  Route      │    │ Canister    │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
                                                              │
                                                              ▼
                                                    ┌─────────────┐
                                                    │ ICP Ledger  │
                                                    │ Integration │
                                                    └─────────────┘
                                                              │
                                                              ▼
                                                    ┌─────────────┐
                                                    │   Funds     │
                                                    │  Locked     │
                                                    └─────────────┘
                                                              │
                                                              ▼
                                                    ┌─────────────┐
                                                    │  Project    │
                                                    │  Completed  │
                                                    └─────────────┘
                                                              │
                                                              ▼
                                                    ┌─────────────┐
                                                    │ Payment     │
                                                    │  Released   │
                                                    └─────────────┘
```

### 3. Real-time Messaging Flow
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   User A    │───▶│ Socket.IO   │───▶│ Chat System │───▶│ Message     │
│   (Send)    │    │  Server     │    │  Canister   │    │ Store       │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                                              │
       │                                              ▼
       │                                        ┌─────────────┐
       │                                        │   Message   │
       │                                        │  Stored     │
       │                                        └─────────────┘
       │                                              │
       │                                              ▼
       │                                        ┌─────────────┐
       │                                        │  Notify     │
       │                                        │  User B     │
       │                                        └─────────────┘
       │                                              │
       ▼                                              ▼
┌─────────────┐                                ┌─────────────┐
│   User A    │                                │   User B    │
│   (Local)   │                                │  (Receive)  │
└─────────────┘                                └─────────────┘
```

## 🎯 Canister Interaction Architecture

### 1. Canister Communication Pattern
```
┌─────────────────────────────────────────────────────────────────┐
│                    Main Canister                                 │
│                    (Central Orchestrator)                        │
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Auth          │  │   User Mgmt     │  │   Session       │ │
│  │   Module        │  │   Interface     │  │   Management    │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│           │                     │                    │            │
│           ▼                     ▼                    ▼            │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │  Validation     │  │  Profile CRUD  │  │  Session CRUD   │ │
│  │  Logic          │  │  Operations    │  │  Operations     │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
           │                     │                    │
           ▼                     ▼                    ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   User          │  │   Freelancer    │  │   Session       │
│   Canister      │  │   Canister      │  │   Canister      │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

### 2. Inter-Canister Communication
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Main          │    │   Escrow        │    │   User          │
│   Canister       │───▶│   Canister      │───▶│   Canister      │
│   (Request)      │    │   (Validation)  │    │   (Profile)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                              │
                                                              ▼
                                                    ┌──────────────┐
                                                    │   Profile    │
                                                    │   Data       │
                                                    └──────────────┘
                                                              │
                                                              ▼
                                                    ┌──────────────┐
                                                    │   Success/   │
                                                    │   Error      │
                                                    │   Response   │
                                                    └──────────────┘
```

## 🏗️ Frontend Component Architecture

### 1. Component Hierarchy
```
App
├── Layout
│   ├── Header
│   ├── Sidebar
│   └── Footer
├── Dashboard
│   ├── FreelancerDashboard
│   │   ├── ProfileOverview
│   │   ├── EarningsChart
│   │   ├── RecentProjects
│   │   └── MessagesPreview
│   └── ClientDashboard
│       ├── PostedJobs
│       ├── ActiveEscrows
│       ├── TeamManagement
│       └── Analytics
├── Messages
│   ├── ConversationList
│   ├── ChatWindow
│   ├── MessageInput
│   └── OnlineStatus
├── Jobs
│   ├── JobBoard
│   ├── JobDetails
│   ├── ApplicationForm
│   └── JobManagement
└── Onboarding
    ├── Step1PersonalInfo
    ├── Step2ProfessionalInfo
    ├── Step3Skills
    └── Step4Verification
```

### 2. State Management Architecture
```
┌─────────────────────────────────────────────────────────────────┐
│                    React Context Providers                       │
│                                                                 │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐   │
│  │   AuthContext   │ │  UserContext    │ │  SessionContext │   │
│  │   (Login/Logout)│ │  (Profile Data) │ │  (Session Mgmt) │   │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘   │
│                                                                 │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐   │
│  │  MessageContext │ │  EscrowContext │ │  JobContext     │   │
│  │  (Chat State)   │ │  (Payment State)│ │  (Job Listings) │   │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Component Hooks                               │
│                                                                 │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐   │
│  │   useAuth()     │ │   useUser()    │ │   useSession()  │   │
│  │   (Auth State)  │ │   (User Data)  │ │   (Session)     │   │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘   │
│                                                                 │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐   │
│  │   useMessages() │ │   useEscrow()  │ │   useJobs()     │   │
│  │   (Chat)        │ │   (Payments)   │ │   (Jobs)        │   │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## 🔐 Security Architecture

### 1. Authentication Security Layers
```
┌─────────────────────────────────────────────────────────────────┐
│                    Client-Side Security                         │
│                                                                 │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐   │
│  │   HTTP-only     │ │   CSRF Tokens   │ │   Content       │   │
│  │   Cookies       │ │   Protection    │ │   Security      │   │
│  │   (XSS Protection)│ │   (CSRF Prevention)│ │   Policy       │   │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Server-Side Security                          │
│                                                                 │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐   │
│  │   Session       │ │   Input         │ │   Rate          │   │
│  │   Validation    │ │   Validation    │ │   Limiting      │   │
│  │   (24h Expiry)  │ │   (Sanitization)│ │   (DDOS Protect)│   │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Canister Security                             │
│                                                                 │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐   │
│  │   Principal     │ │   Caller        │ │   Access        │   │
│  │   Authentication│ │   Authorization │ │   Control       │   │
│  │   (ICP Identity)│ │   (Permission)  │ │   (RBAC)        │   │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 2. Escrow Security Flow
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Client    │───▶│  Create     │───▶│  Validate   │───▶│  Lock       │
│   Request   │    │  Escrow     │    │  Funds      │    │  Funds      │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                                               │
       │                                               ▼
       │                                         ┌─────────────┐
       │                                         │  5% Platform│
       │                                         │  Fee Deducted│
       │                                         └─────────────┘
       │                                               │
       ▼                                               ▼
┌─────────────┐                                ┌─────────────┐
│  Project    │                                │  Monitor    │
│  Started    │                                │  Progress   │
└─────────────┘                                └─────────────┘
       │                                               │
       ▼                                               ▼
┌─────────────┐                                ┌─────────────┐
│  Complete   │                                │  Approval   │
│  Project    │                                │  Process    │
└─────────────┘                                └─────────────┘
       │                                               │
       ▼                                               ▼
┌─────────────┐                                ┌─────────────┐
│  Release    │                                │  Distribute │
│  Payment    │                                │  Funds      │
└─────────────┘                                └─────────────┘
```

## 📊 Data Storage Architecture

### 1. Canister Storage Pattern
```
┌─────────────────────────────────────────────────────────────────┐
│                    Canister Storage                              │
│                                                                 │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐   │
│  │   Stable        │ │   Transient     │ │   HashMap       │   │
│  │   Variables     │ │   Variables     │ │   Collections   │   │
│  │   (Persistent)  │ │   (Volatile)    │ │   (Fast Access) │   │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘   │
│           │                     │                    │            │
│           ▼                     ▼                    ▼            │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   preupgrade()  │  │   postupgrade() │  │   System        │ │
│  │   (Serialization)│ │   (Deserialization)│ │   Functions    │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### 2. Data Relationships
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Users         │───▶│   Profiles      │───▶│   Skills        │
│   (Email/Pass)  │    │   (Extended)    │    │   (Tags)        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
       │                     │                     │
       ▼                     ▼                     ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Sessions      │    │   Jobs          │    │   Applications  │
│   (Auth)        │    │   (Postings)    │    │   (Bids)        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
       │                     │                     │
       ▼                     ▼                     ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Escrows       │    │   Messages      │    │   Reviews       │
│   (Payments)    │    │   (Chat)        │    │   (Feedback)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Deployment Architecture

### 1. Development Environment
```
┌─────────────────────────────────────────────────────────────────┐
│                    Local Development                             │
│                                                                 │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐   │
│  │   Next.js       │ │   ICP Replica   │ │   Socket.IO     │   │
│  │   Dev Server    │ │   (Local)       │ │   Server        │   │
│  │   :3000         │ │   :4943         │ │   :4000         │   │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘   │
│                                                                 │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐   │
│  │   Hot Reload    │ │   Auto Deploy   │ │   Real-time     │   │
│  │   (Frontend)    │ │   (Canisters)   │ │   Updates       │   │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 2. Production Environment
```
┌─────────────────────────────────────────────────────────────────┐
│                    Production Deployment                         │
│                                                                 │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐   │
│  │   Next.js       │ │   ICP Mainnet   │ │   CDN/Edge      │   │
│  │   Production    │ │   (Global)       │ │   (Cache)       │   │
│  │   (Static)      │ │   (Canisters)   │ │   (Fast)        │   │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘   │
│                                                                 │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐   │
│  │   HTTPS Only    │ │   Query Sigs    │ │   Custom        │   │
│  │   (Security)    │ │   (Verified)    │ │   Domains       │   │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## 📈 Performance Architecture

### 1. Query vs Update Operations
```
┌─────────────────────────────────────────────────────────────────┐
│                    Query Operations (Fast)                      │
│                                                                 │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐   │
│  │   getUser()      │ │   getMessages() │ │   getEscrows()  │   │
│  │   (Single User) │ │   (Chat History)│ │   (Payment Hist)│   │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘   │
│           │                     │                    │            │
│           ▼                     ▼                    ▼            │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   No Consensus  │  │   No Consensus  │  │   No Consensus  │ │
│  │   (Instant)     │  │   (Instant)     │  │   (Instant)     │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    Update Operations (Consensus)                 │
│                                                                 │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐   │
│  │   createUser()  │ │   sendMessage() │ │   createEscrow()│   │
│  │   (Registration)│ │   (New Message) │ │   (New Payment) │   │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘   │
│           │                     │                    │            │
│           ▼                     ▼                    ▼            │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Consensus     │  │   Consensus     │  │   Consensus     │ │
│  │   (~2s)         │  │   (~2s)         │  │   (~2s)         │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### 2. Caching Strategy
```
┌─────────────────────────────────────────────────────────────────┐
│                    Multi-Layer Caching                          │
│                                                                 │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐   │
│  │   Browser       │ │   API Routes    │ │   Canister      │   │
│  │   Cache         │ │   Cache         │ │   Cache         │   │
│  │   (Local)       │ │   (Memory)      │ │   (Stable Var)  │   │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘   │
│           │                     │                    │            │
│           ▼                     ▼                    ▼            │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   5min TTL      │  │   1min TTL      │  │   Persistent    │ │
│  │   (Fastest)     │  │   (Fast)        │  │   (Reliable)    │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

*These architecture diagrams provide a comprehensive visual representation of the ICP freelance marketplace system, showing the relationships between components, data flow, security measures, and deployment strategies.*