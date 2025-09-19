// Service API for managing freelancer services
export interface ServiceData {
  overview: {
    serviceTitle: string;
    mainCategory: string;
    subCategory: string;
    description?: string;
    email?: string;
  };
  projectTiers: {
    Basic: {
      title: string;
      description: string;
      price: string;
    };
    Advanced: {
      title: string;
      description: string;
      price: string;
    };
    Premium: {
      title: string;
      description: string;
      price: string;
    };
  };
  additionalCharges: Array<{
    name: string;
    price: string;
  }>;
  portfolioImages: string[];
  questions: Array<{
    question: string;
    type: string;
    options: string[];
  }>;
}

export interface ServiceResponse {
  success: boolean;
  service?: ServiceData;
  id?: string;
  message?: string;
  error?: string;
}

class ServiceAPI {
  private baseUrl = '/api/service';

  // Publish a new service
  async publishService(serviceData: ServiceData): Promise<ServiceResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(serviceData),
      });
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error publishing service:', error);
      return {
        success: false,
        error: 'Failed to publish service'
      };
    }
  }

  // Get service by ID
  async getService(id: string): Promise<ServiceResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`);
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error fetching service:', error);
      return {
        success: false,
        error: 'Failed to fetch service'
      };
    }
  }

  // Update service by ID
  async updateService(id: string, serviceData: ServiceData): Promise<ServiceResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(serviceData),
      });
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error updating service:', error);
      return {
        success: false,
        error: 'Failed to update service'
      };
    }
  }

  // Delete service by ID
  async deleteService(id: string): Promise<ServiceResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'DELETE',
      });
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error deleting service:', error);
      return {
        success: false,
        error: 'Failed to delete service'
      };
    }
  }

  // Get all services (browse)
  async browseServices(filters: {
    category?: string;
    subCategory?: string;
    search?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<{ success: boolean; profiles: any[]; pagination: any }> {
    try {
      const params = new URLSearchParams();
      
      if (filters.category) params.append('category', filters.category);
      if (filters.subCategory) params.append('subCategory', filters.subCategory);
      if (filters.search) params.append('search', filters.search);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());

      const response = await fetch(`/api/freelancer-dashboard/browse?${params.toString()}`);
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error browsing services:', error);
      return {
        success: false,
        profiles: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false
        }
      };
    }
  }
}

export const serviceAPI = new ServiceAPI();
