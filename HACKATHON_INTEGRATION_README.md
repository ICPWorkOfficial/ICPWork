# Hackathon Integration for ICPWork

This document describes the Hackathon integration implemented in the ICPWork platform, providing comprehensive hackathon management functionality for organizing and participating in coding competitions.

## 🏗️ Architecture Overview

The Hackathon integration consists of:

1. **Hackathon Canister** (`/backend/src/hackathon_store/src/main.mo`) - Core hackathon functionality
2. **Main Application Integration** (`/backend/src/main.mo`) - API endpoints and session management
3. **Frontend Interface** (`/frontend/app/dashboard/views/hackathons/index.tsx`) - User interface
4. **Configuration** (`/backend/dfx.json`) - Canister deployment configuration

## 🚀 Features Implemented

### Core Functionality
- ✅ **Hackathon Management** - Create, update, and delete hackathons
- ✅ **Registration System** - User registration with team support
- ✅ **Submission System** - Project submission with multiple file types
- ✅ **Status Management** - Registration, ongoing, completed status tracking
- ✅ **Prize Management** - Multiple prize tiers and token support
- ✅ **Search & Filtering** - Advanced search with multiple criteria
- ✅ **Statistics** - Comprehensive hackathon analytics

### Advanced Features
- ✅ **Team Support** - Multi-member team registration
- ✅ **File Attachments** - GitHub repos, demos, presentations
- ✅ **Organizer Tools** - Participant management and winner selection
- ✅ **Category System** - Web3, DeFi, NFT, AI, Security, etc.
- ✅ **Mode Support** - Virtual, In-Person, Hybrid events
- ✅ **Featured Events** - Highlighted hackathons
- ✅ **Social Links** - Discord, Twitter, website integration

## 📁 File Structure

```
backend/
├── src/
│   ├── hackathon_store/
│   │   └── src/
│   │       └── main.mo          # Hackathon canister implementation
│   └── main.mo                  # Main application with hackathon integration
├── dfx.json                     # Canister configuration
└── test-hackathon.js           # Test script

frontend/
└── app/
    └── dashboard/
        └── views/
            └── hackathons/
                └── index.tsx    # Hackathon UI component
```

## 🔧 API Endpoints

### Main Application Endpoints

#### Hackathon Management
```motoko
// Create a new hackathon
public func createHackathon(sessionId: Text, input: HackathonInput): async Result.Result<Hackathon, Error>

// Update an existing hackathon
public func updateHackathon(sessionId: Text, hackathonId: Text, update: HackathonUpdate): async Result.Result<Hackathon, Error>

// Delete a hackathon
public func deleteHackathon(sessionId: Text, hackathonId: Text): async Result.Result<(), Error>
```

#### Participation Management
```motoko
// Register for a hackathon
public func registerForHackathon(sessionId: Text, hackathonId: Text, teamMembers: [Text]): async Result.Result<(), Error>

// Submit project to hackathon
public func submitToHackathon(sessionId: Text, hackathonId: Text, submissionUrl: Text, description: Text, githubRepo: ?Text, demoUrl: ?Text, presentationUrl: ?Text): async Result.Result<(), Error>

// Withdraw from hackathon
public func withdrawFromHackathon(sessionId: Text, hackathonId: Text): async Result.Result<(), Error>
```

#### Query Functions
```motoko
// Get hackathon by ID
public func getHackathon(hackathonId: Text): async ?Hackathon

// Get all hackathons
public func getAllHackathons(): async [Hackathon]

// Get hackathons by status
public func getHackathonsByStatus(status: HackathonStatus): async [Hackathon]

// Get hackathons by category
public func getHackathonsByCategory(category: HackathonCategory): async [Hackathon]

// Get featured hackathons
public func getFeaturedHackathons(): async [Hackathon]

// Search hackathons with filters
public func searchHackathons(filters: HackathonSearchFilters): async [Hackathon]
```

#### User-Specific Functions
```motoko
// Get hackathons organized by user
public func getHackathonsByOrganizer(sessionId: Text): async Result.Result<[Hackathon], Error>

// Get hackathons user is participating in
public func getUserHackathons(sessionId: Text): async Result.Result<[Hackathon], Error>
```

#### Admin Functions
```motoko
// Update participant status (organizer only)
public func updateHackathonParticipantStatus(sessionId: Text, hackathonId: Text, userEmail: Text, status: HackathonParticipantStatus): async Result.Result<(), Error>

// Set winners (organizer only)
public func setHackathonWinners(sessionId: Text, hackathonId: Text, winnerIds: [Text]): async Result.Result<(), Error>

// Get hackathon statistics
public func getHackathonStatistics(): async HackathonStats
```

### Hackathon Canister Endpoints

#### Core DEX Functions
```motoko
// Create hackathon with validation
public func createHackathon(organizerEmail: Text, input: HackathonInput): async Result.Result<Hackathon, Text>

// Register for hackathon with team support
public func registerForHackathon(hackathonId: Text, userEmail: Text, teamMembers: [Text]): async Result.Result<(), Text>

// Submit project with multiple file types
public func submitToHackathon(hackathonId: Text, userEmail: Text, submissionUrl: Text, description: Text, githubRepo: ?Text, demoUrl: ?Text, presentationUrl: ?Text): async Result.Result<(), Text>
```

## 🎯 Data Types

### Core Types
```motoko
public type HackathonStatus = {
    #RegistrationOpen;
    #Upcoming;
    #Ongoing;
    #Completed;
    #Cancelled;
};

public type HackathonMode = {
    #Virtual;
    #InPerson;
    #Hybrid;
};

public type HackathonCategory = {
    #Web3;
    #DeFi;
    #NFT;
    #SmartContracts;
    #Frontend;
    #Backend;
    #Mobile;
    #AI;
    #Security;
    #Infrastructure;
    #Other : Text;
};
```

### Hackathon Structure
```motoko
public type Hackathon = {
    id: Text;
    title: Text;
    description: Text;
    organizer: Text;
    organizerId: Text;
    mode: HackathonMode;
    prizePool: Text;
    prizes: [HackathonPrize];
    timeline: Text;
    startDate: Int;
    endDate: Int;
    registrationDeadline: Int;
    submissionDeadline: Int;
    tags: [Text];
    category: HackathonCategory;
    status: HackathonStatus;
    featured: Bool;
    requirements: [Text];
    deliverables: [Text];
    judgingCriteria: [Text];
    maxParticipants: ?Nat;
    maxTeamSize: ?Nat;
    createdAt: Int;
    updatedAt: Int;
    participants: [HackathonParticipant];
    winnerIds: [Text];
    location: ?Text;
    website: ?Text;
    discord: ?Text;
    twitter: ?Text;
    imageUrl: ?Text;
    bannerUrl: ?Text;
};
```

### Participant Types
```motoko
public type HackathonParticipant = {
    userId: Text;
    userEmail: Text;
    registeredAt: Int;
    status: HackathonParticipantStatus;
    submissionUrl: ?Text;
    submissionDescription: ?Text;
    submittedAt: ?Int;
    teamMembers: [Text];
    githubRepo: ?Text;
    demoUrl: ?Text;
    presentationUrl: ?Text;
};

public type HackathonParticipantStatus = {
    #Registered;
    #Submitted;
    #Winner;
    #RunnerUp;
    #Disqualified;
    #Withdrawn;
};
```

### Prize Structure
```motoko
public type HackathonPrize = {
    position: Text; // "1st", "2nd", "3rd", "Participation"
    amount: Text;
    description: ?Text;
    token: ?Text; // ICP, ETH, etc.
};
```

## 🚀 Deployment Instructions

### 1. Deploy Hackathon Canister
```bash
cd backend
dfx deploy hackathon_store
```

### 2. Deploy Main Application
```bash
dfx deploy main
```

### 3. Test the Integration
```bash
cd ..
node test-hackathon.js
```

## 🧪 Testing

The integration includes comprehensive testing:

### Automated Tests
- Canister deployment verification
- Hackathon creation and validation
- Registration and participation
- Search and filtering functionality
- Statistics generation
- Admin functions

### Manual Testing
1. **Frontend Testing**: Use the hackathon interface in the dashboard
2. **API Testing**: Test endpoints using the provided test script
3. **Integration Testing**: Verify end-to-end functionality

## 🔒 Security Features

### Authentication
- Session-based authentication for all operations
- User email validation for ownership
- Organizer-only functions for admin operations
- Secure canister-to-canister communication

### Validation
- Input validation for all hackathon data
- Date validation (start < end, registration < start)
- Team size and participant limits
- Submission deadline enforcement

### Authorization
- Organizer-only hackathon management
- User-specific data access
- Admin functions restricted to organizers

## 📊 Performance Considerations

### Optimizations
- Lazy canister initialization
- Efficient HashMap storage
- Minimal cross-canister calls
- Cached search results

### Scalability
- Modular canister architecture
- Separate storage for different data types
- Efficient query patterns
- Batch operations support

## 🎨 Frontend Integration

The hackathon frontend (`/frontend/app/dashboard/views/hackathons/index.tsx`) provides:

### User Interface
- **Hackathon Grid**: Visual display of available hackathons
- **Status Badges**: Clear status indicators (Registration Open, Ongoing, etc.)
- **Filtering**: Category, mode, and status filters
- **Search**: Real-time search functionality
- **Registration**: One-click registration with team support

### Features
- **Responsive Design**: Mobile-friendly interface
- **Real-time Updates**: Live status updates
- **Social Integration**: Links to Discord, Twitter, websites
- **Prize Display**: Clear prize pool and tier information

## 🔮 Future Enhancements

### Planned Features
- [ ] **Real-time Notifications** - Live updates for participants
- [ ] **Advanced Judging** - Multi-criteria scoring system
- [ ] **Live Streaming** - Integration with streaming platforms
- [ ] **Team Matching** - Automatic team formation
- [ ] **Mentorship System** - Mentor-participant matching
- [ ] **Analytics Dashboard** - Advanced organizer analytics
- [ ] **Mobile App** - Native mobile application
- [ ] **Video Submissions** - Video pitch submissions

### Technical Improvements
- [ ] **Caching Layer** - Redis-like caching for better performance
- [ ] **Event System** - Real-time event notifications
- [ ] **File Storage** - Decentralized file storage integration
- [ ] **Payment Integration** - Automatic prize distribution
- [ ] **API Rate Limiting** - Protection against abuse
- [ ] **Monitoring** - Comprehensive logging and monitoring

## 🐛 Troubleshooting

### Common Issues

#### Canister Deployment Fails
```bash
# Check dfx status
dfx ping

# Restart dfx replica
dfx start --clean
```

#### Hackathon Creation Errors
- Verify all required fields are provided
- Check date validation (start < end)
- Ensure organizer email is valid

#### Registration Issues
- Verify hackathon is in registration phase
- Check team size limits
- Ensure user is not already registered

### Debug Commands
```bash
# Check canister status
dfx canister status hackathon_store

# View canister logs
dfx canister logs hackathon_store

# Test specific function
dfx canister call hackathon_store getAllHackathons
```

## 📚 Additional Resources

- [Internet Computer Documentation](https://internetcomputer.org/docs)
- [Motoko Language Guide](https://internetcomputer.org/docs/current/motoko/main/motoko)
- [DFX Command Reference](https://internetcomputer.org/docs/current/references/cli-reference/dfx-parent)
- [Hackathon Best Practices](https://devpost.com/help/hackathon-organizers)

## 🤝 Contributing

To contribute to the hackathon integration:

1. Fork the repository
2. Create a feature branch
3. Implement your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This hackathon integration is part of the ICPWork platform and follows the same licensing terms.

---

**Note**: This integration provides a comprehensive foundation for hackathon management. For production use, additional security audits, real-time features, and comprehensive testing are recommended.
