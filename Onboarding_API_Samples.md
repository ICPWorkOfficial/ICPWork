# Onboarding API Sample Requests

## 🚀 **Frontend API Endpoints**

I've created the following API routes for you:

- `POST /api/onboarding` - Create onboarding record
- `GET /api/onboarding` - Get onboarding record
- `POST /api/onboarding/update` - Update onboarding step
- `POST /api/onboarding/complete` - Complete onboarding

---

## 📝 **Sample Requests**

### **1. Create Onboarding Record**

**Method**: `POST`  
**URL**: `http://localhost:3000/api/onboarding`  
**Headers**:
```
Content-Type: application/json
```

**Body**:
```json
{
  "userType": "freelancer"
}
```

**cURL**:
```bash
curl -X POST http://localhost:3000/api/onboarding \
  -H "Content-Type: application/json" \
  -d '{
    "userType": "freelancer"
  }'
```

**Response**:
```json
{
  "success": true,
  "message": "Onboarding record created successfully"
}
```

---

### **2. Update Onboarding Step - Step 1 (Profile Method)**

**Method**: `POST`  
**URL**: `http://localhost:3000/api/onboarding/update`  
**Headers**:
```
Content-Type: application/json
```

**Body**:
```json
{
  "profileMethod": "manual"
}
```

**cURL**:
```bash
curl -X POST http://localhost:3000/api/onboarding/update \
  -H "Content-Type: application/json" \
  -d '{
    "profileMethod": "manual"
  }'
```

---

### **3. Update Onboarding Step - Step 2 (Personal Info)**

**Method**: `POST`  
**URL**: `http://localhost:3000/api/onboarding/update`  
**Headers**:
```
Content-Type: application/json
```

**Body**:
```json
{
  "personalInfo": {
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

**cURL**:
```bash
curl -X POST http://localhost:3000/api/onboarding/update \
  -H "Content-Type: application/json" \
  -d '{
    "personalInfo": {
      "firstName": "John",
      "lastName": "Doe"
    }
  }'
```

---

### **4. Update Onboarding Step - Step 3 (Skills)**

**Method**: `POST`  
**URL**: `http://localhost:3000/api/onboarding/update`  
**Headers**:
```
Content-Type: application/json
```

**Body**:
```json
{
  "skills": [
    "React",
    "Node.js",
    "TypeScript",
    "JavaScript",
    "HTML/CSS",
    "MongoDB",
    "Express.js"
  ]
}
```

**cURL**:
```bash
curl -X POST http://localhost:3000/api/onboarding/update \
  -H "Content-Type: application/json" \
  -d '{
    "skills": [
      "React",
      "Node.js",
      "TypeScript",
      "JavaScript",
      "HTML/CSS",
      "MongoDB",
      "Express.js"
    ]
  }'
```

---

### **5. Update Onboarding Step - Step 4 (Address)**

**Method**: `POST`  
**URL**: `http://localhost:3000/api/onboarding/update`  
**Headers**:
```
Content-Type: application/json
```

**Body**:
```json
{
  "address": {
    "country": "USA",
    "state": "California",
    "city": "San Francisco",
    "zipCode": "94102",
    "streetAddress": "123 Main Street",
    "isPublic": true
  }
}
```

**cURL**:
```bash
curl -X POST http://localhost:3000/api/onboarding/update \
  -H "Content-Type: application/json" \
  -d '{
    "address": {
      "country": "USA",
      "state": "California",
      "city": "San Francisco",
      "zipCode": "94102",
      "streetAddress": "123 Main Street",
      "isPublic": true
    }
  }'
```

---

### **6. Update Onboarding Step - Step 5 (Profile Data)**

**Method**: `POST`  
**URL**: `http://localhost:3000/api/onboarding/update`  
**Headers**:
```
Content-Type: application/json
```

**Body**:
```json
{
  "profile": {
    "profilePhoto": "https://example.com/profile-photo.jpg",
    "phoneNumber": "+1234567890",
    "phoneVerified": true
  }
}
```

**cURL**:
```bash
curl -X POST http://localhost:3000/api/onboarding/update \
  -H "Content-Type: application/json" \
  -d '{
    "profile": {
      "profilePhoto": "https://example.com/profile-photo.jpg",
      "phoneNumber": "+1234567890",
      "phoneVerified": true
    }
  }'
```

---

### **7. Update Onboarding Step - Final Data**

**Method**: `POST`  
**URL**: `http://localhost:3000/api/onboarding/update`  
**Headers**:
```
Content-Type: application/json
```

**Body**:
```json
{
  "final": {
    "resume": "https://example.com/resume.pdf",
    "linkedinProfile": "https://linkedin.com/in/johndoe"
  }
}
```

**cURL**:
```bash
curl -X POST http://localhost:3000/api/onboarding/update \
  -H "Content-Type: application/json" \
  -d '{
    "final": {
      "resume": "https://example.com/resume.pdf",
      "linkedinProfile": "https://linkedin.com/in/johndoe"
    }
  }'
```

---

### **8. Complete Onboarding**

**Method**: `POST`  
**URL**: `http://localhost:3000/api/onboarding/complete`  
**Headers**:
```
Content-Type: application/json
```

**Body**: (empty)

**cURL**:
```bash
curl -X POST http://localhost:3000/api/onboarding/complete \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Response**:
```json
{
  "success": true,
  "message": "Onboarding completed successfully"
}
```

---

### **9. Get Onboarding Record**

**Method**: `GET`  
**URL**: `http://localhost:3000/api/onboarding`  
**Headers**: (none required, uses session cookie)

**cURL**:
```bash
curl -X GET http://localhost:3000/api/onboarding
```

**Response**:
```json
{
  "success": true,
  "onboardingRecord": {
    "email": "user@example.com",
    "userType": "freelancer",
    "profileMethod": "manual",
    "personalInfo": {
      "firstName": "John",
      "lastName": "Doe"
    },
    "skills": ["React", "Node.js", "TypeScript"],
    "address": {
      "country": "USA",
      "state": "California",
      "city": "San Francisco",
      "zipCode": "94102",
      "streetAddress": "123 Main Street",
      "isPublic": true
    },
    "profile": {
      "profilePhoto": "https://example.com/profile-photo.jpg",
      "phoneNumber": "+1234567890",
      "phoneVerified": true
    },
    "final": {
      "resume": "https://example.com/resume.pdf",
      "linkedinProfile": "https://linkedin.com/in/johndoe"
    },
    "isComplete": true,
    "createdAt": "1234567890",
    "updatedAt": "1234567890",
    "completedAt": "1234567890"
  }
}
```

---

## 🔧 **Direct Canister Calls (Alternative)**

If you prefer to call the canister directly:

### **Create Onboarding Record**
```bash
dfx canister call main createOnboardingRecord '("session_123", "freelancer")'
```

### **Update Onboarding Step - Personal Info**
```bash
dfx canister call main updateOnboardingStep '("session_123", null, opt record{firstName=opt "John"; lastName=opt "Doe"}, null, null, null, null, null)'
```

### **Update Onboarding Step - Skills**
```bash
dfx canister call main updateOnboardingStep '("session_123", null, null, opt vec{"React"; "Node.js"; "TypeScript"}, null, null, null, null)'
```

### **Complete Onboarding**
```bash
dfx canister call main completeOnboarding '("session_123")'
```

---

## 📋 **Complete Onboarding Flow Example**

Here's a complete example of the onboarding flow:

```bash
# 1. First, signup/login to get a session
curl -X POST http://localhost:3000/api/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "onboarding@example.com",
    "password": "OnboardPass123!",
    "confirmPassword": "OnboardPass123!",
    "userType": "freelancer"
  }'

# 2. Create onboarding record
curl -X POST http://localhost:3000/api/onboarding \
  -H "Content-Type: application/json" \
  -d '{
    "userType": "freelancer"
  }'

# 3. Update step 1 - Profile method
curl -X POST http://localhost:3000/api/onboarding/update \
  -H "Content-Type: application/json" \
  -d '{
    "profileMethod": "manual"
  }'

# 4. Update step 2 - Personal info
curl -X POST http://localhost:3000/api/onboarding/update \
  -H "Content-Type: application/json" \
  -d '{
    "personalInfo": {
      "firstName": "John",
      "lastName": "Doe"
    }
  }'

# 5. Update step 3 - Skills
curl -X POST http://localhost:3000/api/onboarding/update \
  -H "Content-Type: application/json" \
  -d '{
    "skills": ["React", "Node.js", "TypeScript"]
  }'

# 6. Update step 4 - Address
curl -X POST http://localhost:3000/api/onboarding/update \
  -H "Content-Type: application/json" \
  -d '{
    "address": {
      "country": "USA",
      "state": "California",
      "city": "San Francisco",
      "zipCode": "94102",
      "streetAddress": "123 Main Street",
      "isPublic": true
    }
  }'

# 7. Update step 5 - Profile data
curl -X POST http://localhost:3000/api/onboarding/update \
  -H "Content-Type: application/json" \
  -d '{
    "profile": {
      "profilePhoto": "https://example.com/photo.jpg",
      "phoneNumber": "+1234567890",
      "phoneVerified": true
    }
  }'

# 8. Update final data
curl -X POST http://localhost:3000/api/onboarding/update \
  -H "Content-Type: application/json" \
  -d '{
    "final": {
      "resume": "https://example.com/resume.pdf",
      "linkedinProfile": "https://linkedin.com/in/johndoe"
    }
  }'

# 9. Complete onboarding
curl -X POST http://localhost:3000/api/onboarding/complete \
  -H "Content-Type: application/json" \
  -d '{}'

# 10. Get final onboarding record
curl -X GET http://localhost:3000/api/onboarding
```

---

## 🔑 **Important Notes**

1. **Session Required**: All onboarding endpoints require a valid session cookie
2. **Step-by-Step**: You can update onboarding data step by step or all at once
3. **Validation**: The backend validates all data before storing
4. **Completion**: Only call complete onboarding when all required data is provided
5. **Error Handling**: All endpoints return proper error messages for debugging

---

## 🚨 **Error Responses**

**Invalid Session**:
```json
{
  "success": false,
  "message": "No active session found"
}
```

**Validation Error**:
```json
{
  "success": false,
  "message": "Invalid onboarding data"
}
```

**Server Error**:
```json
{
  "success": false,
  "message": "Internal server error",
  "error": "Detailed error message"
}
```
