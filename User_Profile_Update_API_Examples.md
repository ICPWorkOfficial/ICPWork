# User Profile Update API Documentation

## Overview
The `/api/users/update-profile` route allows you to update all user profile fields in the user_management canister.

## Endpoints

### POST `/api/users/update-profile`
Updates a user's profile with all available fields.

### GET `/api/users/update-profile?email=user@example.com`
Retrieves the current user profile for reference.

## Request Format

### POST Request Body
```json
{
  "email": "user@example.com",
  "profileData": {
    "firstName": "John",
    "lastName": "Doe",
    "phoneNumber": "+1234567890",
    "companyName": "Tech Corp",
    "companyWebsite": "https://techcorp.com",
    "industry": "Technology",
    "businessType": "Corporation",
    "numberOfEmployees": 100,
    "description": "Leading technology company",
    "skills": ["JavaScript", "React", "Node.js", "TypeScript"],
    "country": "United States",
    "state": "California",
    "city": "San Francisco",
    "zipCode": "94105",
    "streetAddress": "123 Tech Street",
    "photo": "https://example.com/photo.jpg",
    "linkedinProfile": "https://linkedin.com/in/johndoe"
  }
}
```

## Available Fields

| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| `email` | string | ✅ | User's email address | Valid email format |
| `firstName` | string | ❌ | User's first name | Trimmed string |
| `lastName` | string | ❌ | User's last name | Trimmed string |
| `phoneNumber` | string | ❌ | Phone number | Valid phone format |
| `companyName` | string | ❌ | Company name | Trimmed string |
| `companyWebsite` | string | ❌ | Company website | Valid URL (http/https) |
| `industry` | string | ❌ | Industry type | Trimmed string |
| `businessType` | string | ❌ | Business type | Trimmed string |
| `numberOfEmployees` | number | ❌ | Number of employees | Positive integer |
| `description` | string | ❌ | Company/user description | Trimmed string |
| `skills` | string[] | ❌ | Array of skills | Max 50 skills, no duplicates |
| `country` | string | ❌ | Country | Trimmed string |
| `state` | string | ❌ | State/Province | Trimmed string |
| `city` | string | ❌ | City | Trimmed string |
| `zipCode` | string | ❌ | ZIP/Postal code | Trimmed string |
| `streetAddress` | string | ❌ | Street address | Trimmed string |
| `photo` | string | ❌ | Profile photo URL | Trimmed string |
| `linkedinProfile` | string | ❌ | LinkedIn profile URL | Valid LinkedIn URL |

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": {
    "email": "user@example.com",
    "userId": "user_user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phoneNumber": "+1234567890",
    "userType": "client",
    "companyName": "Tech Corp",
    "companyWebsite": "https://techcorp.com",
    "industry": "Technology",
    "businessType": "Corporation",
    "numberOfEmployees": 100,
    "description": "Leading technology company",
    "skills": ["JavaScript", "React", "Node.js", "TypeScript"],
    "country": "United States",
    "state": "California",
    "city": "San Francisco",
    "zipCode": "94105",
    "streetAddress": "123 Tech Street",
    "photo": "https://example.com/photo.jpg",
    "linkedinProfile": "https://linkedin.com/in/johndoe",
    "createdAt": "0",
    "updatedAt": "0"
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Please fix the validation errors",
  "errors": {
    "phoneNumber": "Please enter a valid phone number",
    "companyWebsite": "Please enter a valid website URL (must start with http:// or https://)"
  }
}
```

## Usage Examples

### JavaScript/TypeScript
```javascript
// Update user profile
const updateProfile = async (email, profileData) => {
  try {
    const response = await fetch('/api/users/update-profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        profileData
      })
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('Profile updated:', result.user);
      return result.user;
    } else {
      console.error('Update failed:', result.message, result.errors);
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

// Get current profile
const getProfile = async (email) => {
  try {
    const response = await fetch(`/api/users/update-profile?email=${encodeURIComponent(email)}`);
    const result = await response.json();
    
    if (result.success) {
      return result.user;
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('Error getting profile:', error);
    throw error;
  }
};

// Example usage
const profileData = {
  firstName: "Jane",
  lastName: "Smith",
  phoneNumber: "+1987654321",
  companyName: "Design Studio",
  companyWebsite: "https://designstudio.com",
  industry: "Design",
  businessType: "LLC",
  numberOfEmployees: 25,
  description: "Creative design agency",
  skills: ["UI/UX Design", "Figma", "Adobe Creative Suite", "Prototyping"],
  country: "United States",
  state: "New York",
  city: "New York",
  zipCode: "10001",
  streetAddress: "456 Design Ave",
  photo: "https://example.com/jane-photo.jpg",
  linkedinProfile: "https://linkedin.com/in/janesmith"
};

updateProfile("jane@designstudio.com", profileData);
```

### cURL Examples
```bash
# Update profile
curl -X POST http://localhost:3000/api/users/update-profile \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "profileData": {
      "firstName": "John",
      "lastName": "Doe",
      "phoneNumber": "+1234567890",
      "companyName": "Tech Corp",
      "skills": ["JavaScript", "React", "Node.js"]
    }
  }'

# Get current profile
curl "http://localhost:3000/api/users/update-profile?email=user@example.com"
```

## Error Handling

The API returns specific error messages for different scenarios:

- **400 Bad Request**: Validation errors, missing required fields
- **404 Not Found**: User not found with provided email
- **500 Internal Server Error**: Server or canister communication errors

## Notes

1. **Partial Updates**: You can update only specific fields - all fields are optional except `email`
2. **Data Sanitization**: All string fields are automatically trimmed
3. **Validation**: Comprehensive validation for phone numbers, URLs, and data types
4. **Skills Array**: Maximum 50 skills allowed, duplicates are automatically removed
5. **BigInt Handling**: All BigInt values are converted to strings in responses
6. **Canister ID**: Uses the user_management canister ID `vizcg-th777-77774-qaaea-cai`

## Integration with Frontend

This API route can be easily integrated with React forms, Vue components, or any frontend framework. The comprehensive validation and error handling make it suitable for production use.
