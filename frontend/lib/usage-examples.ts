import ICPWorkService from './api-services';
import type { Freelancer, Client, CreateEscrowArgs } from './canister-connections';

// ===== USAGE EXAMPLES =====

export class UsageExamples {
  
  // ===== AUTHENTICATION EXAMPLES =====
  
  static async authenticationExamples() {
    console.log('=== AUTHENTICATION EXAMPLES ===');
    
    try {
      // 1. User Signup
      const signupResult = await ICPWorkService.auth.signup(
        'user@example.com',
        'SecurePassword123!',
        'freelancer'
      );
      
      if (ICPWorkService.utils.isSuccess(signupResult)) {
        console.log('✅ Signup successful:', signupResult.ok);
        const sessionId = signupResult.ok.sessionId;
        
        // 2. Session Validation
        const validationResult = await ICPWorkService.auth.validateSession(sessionId);
        if (ICPWorkService.utils.isSuccess(validationResult)) {
          console.log('✅ Session valid:', validationResult.ok);
        }
        
        // 3. User Login (alternative)
        const loginResult = await ICPWorkService.auth.login(
          'user@example.com',
          'SecurePassword123!'
        );
        
        if (ICPWorkService.utils.isSuccess(loginResult)) {
          console.log('✅ Login successful:', loginResult.ok);
        }
        
        return sessionId;
      } else {
        console.error('❌ Signup failed:', ICPWorkService.utils.getErrorMessage(signupResult.err));
      }
    } catch (error) {
      console.error('❌ Authentication error:', error);
    }
  }

  // ===== FREELANCER EXAMPLES =====
  
  static async freelancerExamples(sessionId: string) {
    console.log('=== FREELANCER EXAMPLES ===');
    
    const freelancerData: Freelancer = {
      name: 'John Doe',
      skills: ['React', 'TypeScript', 'Node.js', 'MongoDB'],
      country: 'United States',
      state: 'California',
      city: 'San Francisco',
      zipCode: '94102',
      streetAddress: '123 Main Street',
      phoneNumber: '+1-555-0123',
      linkedinProfile: 'https://linkedin.com/in/johndoe',
      photo: 'https://example.com/photo.jpg'
    };

    try {
      // 1. Create Freelancer Profile
      const createResult = await ICPWorkService.freelancer.createProfile(sessionId, freelancerData);
      
      if (ICPWorkService.utils.isSuccess(createResult)) {
        console.log('✅ Freelancer profile created');
        
        // 2. Get Freelancer Profile
        const getResult = await ICPWorkService.freelancer.getProfile(sessionId);
        if (ICPWorkService.utils.isSuccess(getResult)) {
          console.log('✅ Freelancer profile retrieved:', getResult.ok);
        }
        
        // 3. Update Freelancer Profile
        const updatedData = { ...freelancerData, name: 'John Smith' };
        const updateResult = await ICPWorkService.freelancer.updateProfile(sessionId, updatedData);
        if (ICPWorkService.utils.isSuccess(updateResult)) {
          console.log('✅ Freelancer profile updated');
        }
        
        // 4. Get All Freelancers
        const allResult = await ICPWorkService.freelancer.getAllFreelancers(sessionId);
        if (ICPWorkService.utils.isSuccess(allResult)) {
          console.log('✅ All freelancers:', allResult.ok);
        }
      } else {
        console.error('❌ Freelancer creation failed:', ICPWorkService.utils.getErrorMessage(createResult.err));
      }
    } catch (error) {
      console.error('❌ Freelancer error:', error);
    }
  }

  // ===== CLIENT EXAMPLES =====
  
  static async clientExamples(sessionId: string) {
    console.log('=== CLIENT EXAMPLES ===');
    
    const clientData: Client = {
      firstName: 'Jane',
      lastName: 'Smith',
      companyName: 'Tech Innovations Inc.',
      companyWebsite: 'https://techinnovations.com',
      industry: 'Technology',
      businessType: 'Corporation',
      numberOfEmployees: ICPWorkService.utils.numberToBigint(150),
      phoneNumber: '+1-555-0456',
      description: 'Leading technology company specializing in AI and machine learning solutions.'
    };

    try {
      // 1. Create Client Profile
      const createResult = await ICPWorkService.client.createProfile(sessionId, clientData);
      
      if (ICPWorkService.utils.isSuccess(createResult)) {
        console.log('✅ Client profile created');
        
        // 2. Get Client Profile
        const getResult = await ICPWorkService.client.getProfile(sessionId);
        if (ICPWorkService.utils.isSuccess(getResult)) {
          console.log('✅ Client profile retrieved:', getResult.ok);
        }
        
        // 3. Update Client Profile
        const updatedData = { ...clientData, companyName: 'Tech Innovations Corp.' };
        const updateResult = await ICPWorkService.client.updateProfile(sessionId, updatedData);
        if (ICPWorkService.utils.isSuccess(updateResult)) {
          console.log('✅ Client profile updated');
        }
        
        // 4. Get All Clients
        const allResult = await ICPWorkService.client.getAllClients(sessionId);
        if (ICPWorkService.utils.isSuccess(allResult)) {
          console.log('✅ All clients:', allResult.ok);
        }
      } else {
        console.error('❌ Client creation failed:', ICPWorkService.utils.getErrorMessage(createResult.err));
      }
    } catch (error) {
      console.error('❌ Client error:', error);
    }
  }

  // ===== ESCROW EXAMPLES =====
  
  static async escrowExamples() {
    console.log('=== ESCROW EXAMPLES ===');
    
    try {
      // 1. Check Balance
      const balance = await ICPWorkService.escrow.getBalance();
      console.log('💰 Current balance:', ICPWorkService.utils.formatCurrency(balance));
      
      // 2. Deposit Funds
      const depositAmount = ICPWorkService.utils.numberToBigint(1000);
      const depositResult = await ICPWorkService.escrow.deposit(depositAmount);
      
      if (ICPWorkService.utils.isSuccess(depositResult)) {
        console.log('✅ Deposit successful. New balance:', ICPWorkService.utils.formatCurrency(depositResult.ok));
        
        // 3. Create Escrow
        const escrowArgs: CreateEscrowArgs = {
          seller: 'seller-principal-id',
          amount: ICPWorkService.utils.numberToBigint(500),
          description: 'Payment for web development project'
        };
        
        const createResult = await ICPWorkService.escrow.createEscrow(escrowArgs);
        if (ICPWorkService.utils.isSuccess(createResult)) {
          const escrowId = createResult.ok;
          console.log('✅ Escrow created with ID:', escrowId);
          
          // 4. Get Escrow Details
          const escrowDetails = await ICPWorkService.escrow.getEscrow(escrowId);
          if (escrowDetails) {
            console.log('✅ Escrow details:', escrowDetails);
          }
          
          // 5. Buyer Approve
          const approveResult = await ICPWorkService.escrow.buyerApprove(escrowId);
          if (ICPWorkService.utils.isSuccess(approveResult)) {
            console.log('✅ Buyer approval:', approveResult.ok);
          }
          
          // 6. Get My Escrows
          const myEscrows = await ICPWorkService.escrow.getMyEscrows();
          console.log('✅ My escrows:', myEscrows);
        } else {
          console.error('❌ Escrow creation failed:', ICPWorkService.utils.getErrorMessage(createResult.err));
        }
      } else {
        console.error('❌ Deposit failed:', ICPWorkService.utils.getErrorMessage(depositResult.err));
      }
    } catch (error) {
      console.error('❌ Escrow error:', error);
    }
  }

  // ===== WORK STORE EXAMPLES =====
  
  static async workStoreExamples() {
    console.log('=== WORK STORE EXAMPLES ===');
    
    const projectData = {
      title: 'E-commerce Website Development',
      description: 'Build a modern e-commerce website with React and Node.js',
      clientId: 'client-principal-id',
      status: 'Open' as const,
      budget: ICPWorkService.utils.numberToBigint(5000),
      deadline: ICPWorkService.utils.numberToBigint(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    };

    try {
      // 1. Create Project
      const createResult = await ICPWorkService.workStore.createProject(projectData);
      
      if (ICPWorkService.utils.isSuccess(createResult)) {
        const projectId = createResult.ok;
        console.log('✅ Project created with ID:', projectId);
        
        // 2. Get Project
        const getResult = await ICPWorkService.workStore.getProject(projectId);
        if (ICPWorkService.utils.isSuccess(getResult)) {
          console.log('✅ Project retrieved:', getResult.ok);
        }
        
        // 3. Update Project
        const updateData = { status: 'InProgress' as const };
        const updateResult = await ICPWorkService.workStore.updateProject(projectId, updateData);
        if (ICPWorkService.utils.isSuccess(updateResult)) {
          console.log('✅ Project updated');
        }
        
        // 4. Get All Projects
        const allResult = await ICPWorkService.workStore.getAllProjects();
        if (ICPWorkService.utils.isSuccess(allResult)) {
          console.log('✅ All projects:', allResult.ok);
        }
      } else {
        console.error('❌ Project creation failed:', ICPWorkService.utils.getErrorMessage(createResult.err));
      }
    } catch (error) {
      console.error('❌ Work store error:', error);
    }
  }

  // ===== COMPLETE WORKFLOW EXAMPLE =====
  
  static async completeWorkflowExample() {
    console.log('🚀 === COMPLETE WORKFLOW EXAMPLE ===');
    
    try {
      // 1. Authentication
      const sessionId = await this.authenticationExamples();
      if (!sessionId) {
        console.error('❌ Authentication failed, stopping workflow');
        return;
      }
      
      // 2. Create Freelancer Profile
      await this.freelancerExamples(sessionId);
      
      // 3. Create Client Profile
      await this.clientExamples(sessionId);
      
      // 4. Escrow Operations
      await this.escrowExamples();
      
      // 5. Work Store Operations
      await this.workStoreExamples();
      
      // 6. Get System Stats
      const sessionCount = await ICPWorkService.utils.getActiveSessionCount();
      console.log('📊 Active sessions:', ICPWorkService.utils.bigintToNumber(sessionCount));
      
      console.log('✅ Complete workflow finished successfully!');
      
    } catch (error) {
      console.error('❌ Workflow error:', error);
    }
  }

  // ===== ERROR HANDLING EXAMPLES =====
  
  static async errorHandlingExamples() {
    console.log('=== ERROR HANDLING EXAMPLES ===');
    
    try {
      // Example of handling authentication errors
      const signupResult = await ICPWorkService.auth.signup(
        'invalid-email',
        'weak',
        'freelancer'
      );
      
      if (ICPWorkService.utils.isError(signupResult)) {
        const errorMessage = ICPWorkService.utils.getErrorMessage(signupResult.err);
        console.log('❌ Expected error:', errorMessage);
        
        // Handle specific error types
        if (errorMessage.includes('InvalidEmail')) {
          console.log('💡 Suggestion: Please enter a valid email address');
        } else if (errorMessage.includes('WeakPassword')) {
          console.log('💡 Suggestion: Password must be at least 8 characters with uppercase, lowercase, number, and special character');
        }
      }
      
    } catch (error) {
      console.error('❌ Unexpected error:', error);
    }
  }
}

// Export for easy access
export default UsageExamples;
