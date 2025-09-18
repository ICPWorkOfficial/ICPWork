// Freelancer Dashboard Types

export interface FreelancerProfile {
  email: string;
  serviceTitle: string;
  mainCategory: string;
  subCategory: string;
  description: string;
  requirementPlans: RequirementPlans;
  additionalCharges: AdditionalCharges;
  portfolioImages: string[]; // Array of up to 5 image URLs
  additionalQuestions: string[];
  createdAt: number;
  updatedAt: number;
  isActive: boolean;
}

export interface RequirementPlans {
  basic: PlanDetails;
  advanced: PlanDetails;
  premium: PlanDetails;
}

export interface PlanDetails {
  price: string;
  description: string;
  features: string[];
  deliveryTime: string; // e.g., "3 days", "1 week"
}

export interface AdditionalCharges {
  fastDelivery?: ChargeDetails;
  additionalChanges?: ChargeDetails;
  perExtraChange?: ChargeDetails;
}

export interface ChargeDetails {
  price: string;
  description: string;
  isEnabled: boolean;
}

// API Response Types
export interface CreateProfileRequest {
  sessionId: string;
  profile: FreelancerProfile;
}

export interface UpdateProfileRequest {
  sessionId: string;
  profile: FreelancerProfile;
}

export interface GetProfileRequest {
  sessionId: string;
  email?: string; // Optional, for getting other users' profiles
}

export interface BrowseProfilesRequest {
  sessionId: string;
  mainCategory?: string;
  subCategory?: string;
  search?: string;
}

export interface ActivateProfileRequest {
  sessionId: string;
}

export interface DeactivateProfileRequest {
  sessionId: string;
}

export interface CheckExistsRequest {
  sessionId: string;
}

export interface GetStatsRequest {
  sessionId: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  error?: string;
  details?: any;
  data?: T;
}

export interface ProfileResponse extends ApiResponse {
  profile?: FreelancerProfile;
}

export interface ProfilesResponse extends ApiResponse {
  profiles?: [string, FreelancerProfile][];
}

export interface ExistsResponse extends ApiResponse {
  exists?: boolean;
}

export interface StatsResponse extends ApiResponse {
  stats?: {
    totalProfiles: number;
    activeProfiles: number;
  };
}

// Common categories for dropdowns
export const MAIN_CATEGORIES = [
  'Web Development',
  'Mobile Development',
  'Design',
  'Writing & Translation',
  'Digital Marketing',
  'Data Science & Analytics',
  'Engineering & Architecture',
  'Sales & Marketing',
  'Customer Service',
  'Business Services',
  'Other'
] as const;

export const SUB_CATEGORIES: Record<string, string[]> = {
  'Web Development': [
    'Frontend Development',
    'Backend Development',
    'Full Stack Development',
    'E-commerce Development',
    'WordPress Development',
    'Shopify Development',
    'Web Scraping',
    'API Development'
  ],
  'Mobile Development': [
    'iOS Development',
    'Android Development',
    'React Native',
    'Flutter Development',
    'Cross-platform Development',
    'Mobile App Design'
  ],
  'Design': [
    'UI/UX Design',
    'Graphic Design',
    'Logo Design',
    'Web Design',
    'Mobile App Design',
    'Brand Identity',
    'Print Design',
    'Illustration'
  ],
  'Writing & Translation': [
    'Content Writing',
    'Copywriting',
    'Technical Writing',
    'Translation',
    'Proofreading',
    'Creative Writing',
    'Blog Writing',
    'SEO Writing'
  ],
  'Digital Marketing': [
    'Social Media Marketing',
    'SEO',
    'PPC Advertising',
    'Email Marketing',
    'Content Marketing',
    'Influencer Marketing',
    'Analytics',
    'Marketing Strategy'
  ],
  'Data Science & Analytics': [
    'Data Analysis',
    'Machine Learning',
    'Data Visualization',
    'Business Intelligence',
    'Statistical Analysis',
    'Data Mining',
    'Predictive Modeling'
  ],
  'Engineering & Architecture': [
    'Software Engineering',
    'System Architecture',
    'DevOps',
    'Cloud Computing',
    'Database Design',
    'Network Engineering',
    'Security Engineering'
  ],
  'Sales & Marketing': [
    'Lead Generation',
    'Sales Strategy',
    'Market Research',
    'Customer Acquisition',
    'Business Development',
    'Partnership Development'
  ],
  'Customer Service': [
    'Customer Support',
    'Virtual Assistant',
    'Administrative Support',
    'Data Entry',
    'Transcription',
    'Customer Success'
  ],
  'Business Services': [
    'Business Consulting',
    'Project Management',
    'Financial Analysis',
    'Legal Services',
    'HR Services',
    'Operations Management'
  ],
  'Other': [
    'Video Editing',
    'Audio Production',
    'Photography',
    'Voice Over',
    'Online Tutoring',
    'Research',
    'Other'
  ]
};

// Sample data for testing
export const SAMPLE_PROFILE: FreelancerProfile = {
  email: 'freelancer@example.com',
  serviceTitle: 'Professional Web Development Services',
  mainCategory: 'Web Development',
  subCategory: 'Full Stack Development',
  description: 'I provide comprehensive web development services including frontend, backend, and database design. With 5+ years of experience in modern web technologies.',
  requirementPlans: {
    basic: {
      price: '$500',
      description: 'Basic website with up to 5 pages',
      features: ['Responsive design', 'Contact form', 'Basic SEO', '1 revision'],
      deliveryTime: '1 week'
    },
    advanced: {
      price: '$1200',
      description: 'Advanced website with custom features',
      features: ['All basic features', 'Custom functionality', 'Admin panel', '3 revisions', '1 month support'],
      deliveryTime: '2 weeks'
    },
    premium: {
      price: '$2500',
      description: 'Premium website with full-stack development',
      features: ['All advanced features', 'Database integration', 'User authentication', 'API development', '5 revisions', '3 months support'],
      deliveryTime: '3 weeks'
    }
  },
  additionalCharges: {
    fastDelivery: {
      price: '$200',
      description: 'Rush delivery (50% faster)',
      isEnabled: true
    },
    additionalChanges: {
      price: '$50',
      description: 'Per additional revision beyond plan',
      isEnabled: true
    },
    perExtraChange: {
      price: '$25',
      description: 'Minor changes and tweaks',
      isEnabled: true
    }
  },
  portfolioImages: [
    'https://example.com/portfolio1.jpg',
    'https://example.com/portfolio2.jpg',
    'https://example.com/portfolio3.jpg'
  ],
  additionalQuestions: [
    'What is your preferred technology stack?',
    'Do you have existing designs or need design services?',
    'What is your target launch date?',
    'Do you need ongoing maintenance and support?'
  ],
  createdAt: Date.now(),
  updatedAt: Date.now(),
  isActive: true
};
