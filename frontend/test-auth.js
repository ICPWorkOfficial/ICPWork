// Simple test script to verify authentication integration
const testAuth = async () => {
  console.log('Testing authentication integration...');
  
  // Test signup
  try {
    const signupResponse = await fetch('http://localhost:3000/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'TestPass123!',
        confirmPassword: 'TestPass123!',
        userType: 'freelancer'
      })
    });
    
    const signupResult = await signupResponse.json();
    console.log('Signup test result:', signupResult);
    
    if (signupResult.success) {
      console.log('✅ Signup integration working!');
    } else {
      console.log('❌ Signup failed:', signupResult.message);
    }
  } catch (error) {
    console.log('❌ Signup error:', error.message);
  }
  
  // Test login
  try {
    const loginResponse = await fetch('http://localhost:3000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'TestPass123!'
      })
    });
    
    const loginResult = await loginResponse.json();
    console.log('Login test result:', loginResult);
    
    if (loginResult.success) {
      console.log('✅ Login integration working!');
    } else {
      console.log('❌ Login failed:', loginResult.message);
    }
  } catch (error) {
    console.log('❌ Login error:', error.message);
  }
};

// Run the test
testAuth();