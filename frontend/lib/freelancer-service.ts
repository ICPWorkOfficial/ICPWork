// Freelancer Dashboard Service
export interface FreelancerProfile {
  email: string;
  serviceTitle: string;
  mainCategory: string;
  subCategory: string;
  description: string;
  requirementPlans: {
    basic: PlanDetails;
    advanced: PlanDetails;
    premium: PlanDetails;
  };
  additionalCharges: {
    fastDelivery?: ChargeDetails;
    additionalChanges?: ChargeDetails;
    perExtraChange?: ChargeDetails;
  };
  portfolioImages: string[];
  additionalQuestions: string[];
  createdAt: number;
  updatedAt: number;
  isActive: boolean;
}

export interface PlanDetails {
  price: string;
  description: string;
  features: string[];
  deliveryTime: string;
}

export interface ChargeDetails {
  price: string;
  description: string;
  isEnabled: boolean;
}

export interface FreelancerStats {
  totalProfiles: number;
  activeProfiles: number;
  inactiveProfiles: number;
  activationRate: string;
}

export interface BrowseFilters {
  category?: string;
  subCategory?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface BrowseResponse {
  profiles: [string, FreelancerProfile][];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

class FreelancerService {
  private baseUrl = '/api/freelancer-dashboard/mock'; // Using mock API temporarily

  // Get all freelancer profiles
  async getAllProfiles(): Promise<{ success: boolean; profiles: [string, FreelancerProfile][]; count: number }> {
    const response = await fetch(`${this.baseUrl}`);
    return response.json();
  }

  // Get active freelancer profiles
  async getActiveProfiles(): Promise<{ success: boolean; profiles: [string, FreelancerProfile][]; count: number }> {
    const response = await fetch(`${this.baseUrl}?activeOnly=true`);
    return response.json();
  }

  // Get profiles by category
  async getProfilesByCategory(category: string): Promise<{ success: boolean; profiles: [string, FreelancerProfile][]; count: number }> {
    const response = await fetch(`${this.baseUrl}?category=${encodeURIComponent(category)}`);
    return response.json();
  }

  // Get profiles by subcategory
  async getProfilesBySubCategory(category: string, subCategory: string): Promise<{ success: boolean; profiles: [string, FreelancerProfile][]; count: number }> {
    const response = await fetch(`${this.baseUrl}?category=${encodeURIComponent(category)}&subCategory=${encodeURIComponent(subCategory)}`);
    return response.json();
  }

  // Search profiles by title
  async searchProfiles(searchTerm: string): Promise<{ success: boolean; profiles: [string, FreelancerProfile][]; count: number }> {
    const response = await fetch(`${this.baseUrl}?search=${encodeURIComponent(searchTerm)}`);
    return response.json();
  }

  // Browse profiles with filters
  async browseProfiles(filters: BrowseFilters = {}): Promise<{ success: boolean; profiles: [string, FreelancerProfile][]; pagination: BrowseResponse['pagination'] }> {
    const params = new URLSearchParams();
    
    if (filters.category) params.append('category', filters.category);
    if (filters.subCategory) params.append('subCategory', filters.subCategory);
    if (filters.search) params.append('search', filters.search);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

    const response = await fetch(`${this.baseUrl}/browse?${params.toString()}`);
    return response.json();
  }

  // Get freelancer dashboard statistics
  async getStats(): Promise<{ success: boolean; stats: FreelancerStats }> {
    const response = await fetch(`${this.baseUrl}/stats`);
    return response.json();
  }

  // Create a new freelancer profile
  async createProfile(email: string, profile: FreelancerProfile): Promise<{ success: boolean; profile: FreelancerProfile; message: string }> {
    const response = await fetch(`${this.baseUrl}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, profile }),
    });
    return response.json();
  }

  // Get profile by email
  async getProfile(email: string): Promise<{ success: boolean; profile: FreelancerProfile }> {
    const response = await fetch(`${this.baseUrl}/${email}`);
    return response.json();
  }

  // Update profile
  async updateProfile(email: string, profile: FreelancerProfile): Promise<{ success: boolean; profile: FreelancerProfile; message: string }> {
    const response = await fetch(`${this.baseUrl}/${email}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, profile }),
    });
    return response.json();
  }

  // Activate profile
  async activateProfile(email: string): Promise<{ success: boolean; profile: FreelancerProfile; message: string }> {
    const response = await fetch(`${this.baseUrl}/activate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
    return response.json();
  }

  // Deactivate profile
  async deactivateProfile(email: string): Promise<{ success: boolean; profile: FreelancerProfile; message: string }> {
    const response = await fetch(`${this.baseUrl}/deactivate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
    return response.json();
  }

  // Check if profile exists
  async profileExists(email: string): Promise<{ success: boolean; exists: boolean; email: string }> {
    const response = await fetch(`${this.baseUrl}/exists?email=${encodeURIComponent(email)}`);
    return response.json();
  }

  // Delete profile
  async deleteProfile(email: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${this.baseUrl}/${email}`, {
      method: 'DELETE',
    });
    return response.json();
  }
}

export const freelancerService = new FreelancerService();
