'use client';

import React, { useState, useEffect } from 'react';
import { useLocalStorageAuth } from '@/hooks/useLocalStorageAuth';
import { 
  Plus, 
  Edit, 
  Eye, 
  Trash2, 
  MoreVertical, 
  Calendar,
  DollarSign,
  Users,
  Star,
  Image as ImageIcon,
  ExternalLink
} from 'lucide-react';

// Design tokens
const designTokens = {
  colors: {
    primary: '#041D37',
    secondary: '#272D37',
    success: '#1BB152',
    danger: '#FF3B30',
    warning: '#FF9500',
    textPrimary: '#16192C',
    textSecondary: '#525252',
    textDisabled: '#A8A8A8',
    background: '#FCFCFC',
    white: '#FFFFFF',
    border: '#E0E0E0',
    lightBorder: '#F9F9F9'
  },
  typography: {
    heading: 'text-[24px] font-semibold leading-[32px] tracking-[-0.4px]',
    subheading: 'text-[18px] font-medium leading-[28px]',
    bodyMedium: 'text-[16px] font-medium leading-[24px]',
    bodyRegular: 'text-[16px] leading-[24px]',
    bodySmall: 'text-[14px] leading-[22px]',
    caption: 'text-[12px] leading-[18px] text-[#A8A8A8]'
  }
};

interface Service {
  id: string;
  overview: {
    serviceTitle: string;
    mainCategory: string;
    subCategory: string;
    description: string;
    email: string;
  };
  projectTiers: {
    Basic: {
      title: string;
      description: string;
      price: string;
      features?: string[];
      deliveryTime?: string;
    };
    Advanced: {
      title: string;
      description: string;
      price: string;
      features?: string[];
      deliveryTime?: string;
    };
    Premium: {
      title: string;
      description: string;
      price: string;
      features?: string[];
      deliveryTime?: string;
    };
  };
  additionalCharges: Array<{
    name: string;
    price: string;
    description?: string;
  }>;
  portfolioImages: string[];
  questions: Array<{
    question: string;
    type: string;
    options: string[];
  }>;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

const MyServicesView: React.FC = () => {
  const { user } = useLocalStorageAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Fetch user's services
  const fetchServices = async () => {
    if (!user?.email) {
      setError('User not authenticated');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/services/user/${encodeURIComponent(user.email)}`);
      const data = await response.json();

      if (data.success && data.service) {
        setServices([data.service]);
      } else {
        setServices([]);
      }
    } catch (err) {
      console.error('Error fetching services:', err);
      setError('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [user?.email]);

  const handleEditService = (service: Service) => {
    setSelectedService(service);
    setShowEditModal(true);
  };

  const handleDeleteService = async (serviceId: string) => {
    if (!confirm('Are you sure you want to delete this service?')) {
      return;
    }

    try {
      // TODO: Implement delete API endpoint
      console.log('Delete service:', serviceId);
      // After successful deletion, refresh the services list
      fetchServices();
    } catch (err) {
      console.error('Error deleting service:', err);
    }
  };

  const handleToggleActive = async (service: Service) => {
    try {
      // TODO: Implement toggle active API endpoint
      console.log('Toggle active for service:', service.id);
      // After successful toggle, refresh the services list
      fetchServices();
    } catch (err) {
      console.error('Error toggling service status:', err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? designTokens.colors.success : designTokens.colors.textDisabled;
  };

  const getStatusText = (isActive: boolean) => {
    return isActive ? 'Active' : 'Inactive';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#041D37] mx-auto mb-4"></div>
          <p className="text-[#525252]">Loading your services...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-[#FF3B30] mb-4">{error}</p>
          <button 
            onClick={fetchServices}
            className="px-4 py-2 bg-[#041D37] text-white rounded-lg hover:bg-[#272D37]"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className={designTokens.typography.heading + ' text-[#16192C] mb-2'}>
            My Services
          </h1>
          <p className="text-[#525252]">
            Manage and edit the services you offer to clients
          </p>
        </div>
        <button 
          onClick={() => window.location.href = '/service/register'}
          className="flex items-center gap-2 px-4 py-2 bg-[#041D37] text-white rounded-lg hover:bg-[#272D37] transition-colors"
        >
          <Plus size={20} />
          Create New Service
        </button>
      </div>

      {/* Services Grid */}
      {services.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-[#F9F9F9] rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus size={24} className="text-[#A8A8A8]" />
          </div>
          <h3 className="text-[18px] font-medium text-[#16192C] mb-2">
            No services yet
          </h3>
          <p className="text-[#525252] mb-6">
            Create your first service to start offering your skills to clients
          </p>
          <button 
            onClick={() => window.location.href = '/service/register'}
            className="px-6 py-3 bg-[#041D37] text-white rounded-lg hover:bg-[#272D37] transition-colors"
          >
            Create Your First Service
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onEdit={handleEditService}
              onDelete={handleDeleteService}
              onToggleActive={handleToggleActive}
              formatDate={formatDate}
              getStatusColor={getStatusColor}
              getStatusText={getStatusText}
            />
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedService && (
        <EditServiceModal
          service={selectedService}
          onClose={() => {
            setShowEditModal(false);
            setSelectedService(null);
          }}
          onSave={(updatedService) => {
            // TODO: Implement save functionality
            console.log('Save service:', updatedService);
            setShowEditModal(false);
            setSelectedService(null);
            fetchServices();
          }}
        />
      )}
    </div>
  );
};

// Service Card Component
interface ServiceCardProps {
  service: Service;
  onEdit: (service: Service) => void;
  onDelete: (serviceId: string) => void;
  onToggleActive: (service: Service) => void;
  formatDate: (date: string) => string;
  getStatusColor: (isActive: boolean) => string;
  getStatusText: (isActive: boolean) => string;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  onEdit,
  onDelete,
  onToggleActive,
  formatDate,
  getStatusColor,
  getStatusText
}) => {
  const [showActions, setShowActions] = useState(false);

  return (
    <div className="bg-white rounded-lg border border-[#E0E0E0] overflow-hidden hover:shadow-lg transition-shadow">
      {/* Service Image */}
      <div className="h-48 bg-gradient-to-br from-[#44B0FF] to-[#973EEE] relative">
        {service.portfolioImages && service.portfolioImages.length > 0 ? (
          <img 
            src={service.portfolioImages[0]} 
            alt={service.overview.serviceTitle}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon size={48} className="text-white opacity-50" />
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <span 
            className="px-2 py-1 rounded-full text-xs font-medium"
            style={{ 
              backgroundColor: getStatusColor(service.isActive) + '20',
              color: getStatusColor(service.isActive)
            }}
          >
            {getStatusText(service.isActive)}
          </span>
        </div>

        {/* Actions Menu */}
        <div className="absolute top-3 right-3">
          <button
            onClick={() => setShowActions(!showActions)}
            className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
          >
            <MoreVertical size={16} className="text-white" />
          </button>
          
          {showActions && (
            <div className="absolute right-0 top-10 bg-white rounded-lg shadow-lg border border-[#E0E0E0] py-1 z-10 min-w-[120px]">
              <button
                onClick={() => {
                  onEdit(service);
                  setShowActions(false);
                }}
                className="w-full px-3 py-2 text-left text-sm text-[#16192C] hover:bg-[#F9F9F9] flex items-center gap-2"
              >
                <Edit size={14} />
                Edit
              </button>
              <button
                onClick={() => {
                  onToggleActive(service);
                  setShowActions(false);
                }}
                className="w-full px-3 py-2 text-left text-sm text-[#16192C] hover:bg-[#F9F9F9] flex items-center gap-2"
              >
                <Star size={14} />
                {service.isActive ? 'Deactivate' : 'Activate'}
              </button>
              <button
                onClick={() => {
                  onDelete(service.id);
                  setShowActions(false);
                }}
                className="w-full px-3 py-2 text-left text-sm text-[#FF3B30] hover:bg-[#F9F9F9] flex items-center gap-2"
              >
                <Trash2 size={14} />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Service Content */}
      <div className="p-4">
        <div className="mb-3">
          <h3 className="font-semibold text-[#16192C] mb-1 line-clamp-1">
            {service.overview.serviceTitle}
          </h3>
          <p className="text-sm text-[#525252] mb-2">
            {service.overview.mainCategory} • {service.overview.subCategory}
          </p>
          <p className="text-sm text-[#A8A8A8] line-clamp-2">
            {service.overview.description}
          </p>
        </div>

        {/* Pricing */}
        <div className="mb-3">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <DollarSign size={14} className="text-[#525252]" />
              <span className="text-[#16192C] font-medium">
                ${service.projectTiers.Basic.price}
              </span>
              <span className="text-[#A8A8A8]">starting</span>
            </div>
          </div>
        </div>

        {/* Portfolio Images Count */}
        {service.portfolioImages && service.portfolioImages.length > 0 && (
          <div className="mb-3">
            <div className="flex items-center gap-1 text-sm text-[#525252]">
              <ImageIcon size={14} />
              <span>{service.portfolioImages.length} portfolio image{service.portfolioImages.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
        )}

        {/* Dates */}
        <div className="flex items-center justify-between text-xs text-[#A8A8A8]">
          <div className="flex items-center gap-1">
            <Calendar size={12} />
            <span>Created {formatDate(service.createdAt)}</span>
          </div>
          {service.updatedAt !== service.createdAt && (
            <span>Updated {formatDate(service.updatedAt)}</span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => onEdit(service)}
            className="flex-1 px-3 py-2 border border-[#E0E0E0] text-[#16192C] rounded-lg hover:bg-[#F9F9F9] transition-colors flex items-center justify-center gap-2"
          >
            <Edit size={14} />
            Edit
          </button>
          <button
            onClick={() => window.open(`/service/${service.id}`, '_blank')}
            className="flex-1 px-3 py-2 bg-[#041D37] text-white rounded-lg hover:bg-[#272D37] transition-colors flex items-center justify-center gap-2"
          >
            <ExternalLink size={14} />
            View
          </button>
        </div>
      </div>
    </div>
  );
};

// Edit Service Modal Component
interface EditServiceModalProps {
  service: Service;
  onClose: () => void;
  onSave: (service: Service) => void;
}

const EditServiceModal: React.FC<EditServiceModalProps> = ({
  service,
  onClose,
  onSave
}) => {
  const [editedService, setEditedService] = useState<Service>(service);

  const handleSave = () => {
    onSave(editedService);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-[#16192C]">
              Edit Service
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[#F9F9F9] rounded-lg transition-colors"
            >
              ×
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#16192C] mb-2">
                Service Title
              </label>
              <input
                type="text"
                value={editedService.overview.serviceTitle}
                onChange={(e) => setEditedService({
                  ...editedService,
                  overview: {
                    ...editedService.overview,
                    serviceTitle: e.target.value
                  }
                })}
                className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#041D37]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#16192C] mb-2">
                Description
              </label>
              <textarea
                value={editedService.overview.description}
                onChange={(e) => setEditedService({
                  ...editedService,
                  overview: {
                    ...editedService.overview,
                    description: e.target.value
                  }
                })}
                rows={3}
                className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#041D37]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#16192C] mb-2">
                  Basic Price
                </label>
                <input
                  type="text"
                  value={editedService.projectTiers.Basic.price}
                  onChange={(e) => setEditedService({
                    ...editedService,
                    projectTiers: {
                      ...editedService.projectTiers,
                      Basic: {
                        ...editedService.projectTiers.Basic,
                        price: e.target.value
                      }
                    }
                  })}
                  className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#041D37]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#16192C] mb-2">
                  Advanced Price
                </label>
                <input
                  type="text"
                  value={editedService.projectTiers.Advanced.price}
                  onChange={(e) => setEditedService({
                    ...editedService,
                    projectTiers: {
                      ...editedService.projectTiers,
                      Advanced: {
                        ...editedService.projectTiers.Advanced,
                        price: e.target.value
                      }
                    }
                  })}
                  className="w-full px-3 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#041D37]"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-[#E0E0E0] text-[#16192C] rounded-lg hover:bg-[#F9F9F9] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2 bg-[#041D37] text-white rounded-lg hover:bg-[#272D37] transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyServicesView;
