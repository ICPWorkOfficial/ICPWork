'use client';

import React, { useState } from 'react';
import { ImageUploader } from '@/components/ImageUploader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Test component to demonstrate ImageUploader integration
 * This shows how the component returns URLs that can be used in forms
 */
export function ImageUploadTest() {
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    profilePhoto: '',
    portfolioImages: [] as string[],
  });

  const handleProfilePhotoUpload = (result: any) => {
    console.log('Profile photo uploaded:', result);
    setFormData(prev => ({ ...prev, profilePhoto: result.url }));
  };

  const handlePortfolioUpload = (result: any) => {
    console.log('Portfolio image uploaded:', result);
    setFormData(prev => ({ 
      ...prev, 
      portfolioImages: [...prev.portfolioImages, result.url] 
    }));
  };

  const handleSubmit = () => {
    console.log('Form data with uploaded URLs:', formData);
    alert(`Form submitted with:
    - Profile Photo: ${formData.profilePhoto || 'None'}
    - Portfolio Images: ${formData.portfolioImages.length} images
    - URLs: ${JSON.stringify(formData, null, 2)}`);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>ImageUploader Integration Test</CardTitle>
          <CardDescription>
            This demonstrates how the ImageUploader component integrates with forms
            and returns URLs that can be passed to form submission.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Profile Photo Upload */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Profile Photo Upload</h3>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center">
                {formData.profilePhoto ? (
                  <img 
                    src={formData.profilePhoto} 
                    alt="Profile" 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <div className="text-gray-400 text-sm">No photo</div>
                )}
              </div>
              <div className="flex-1">
                <ImageUploader
                  userId="test-user"
                  folder="test-profile-photos"
                  maxFiles={1}
                  onUploadSuccess={handleProfilePhotoUpload}
                  onUploadError={(error) => console.error('Profile upload failed:', error)}
                />
              </div>
            </div>
            {formData.profilePhoto && (
              <div className="text-sm text-gray-600">
                <strong>Profile Photo URL:</strong> {formData.profilePhoto}
              </div>
            )}
          </div>

          {/* Portfolio Images Upload */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Portfolio Images Upload</h3>
            <ImageUploader
              userId="test-user"
              folder="test-portfolio"
              maxFiles={3}
              onUploadSuccess={handlePortfolioUpload}
              onUploadError={(error) => console.error('Portfolio upload failed:', error)}
            />
            
            {formData.portfolioImages.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Uploaded Portfolio Images:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {formData.portfolioImages.map((url, index) => (
                    <div key={index} className="relative">
                      <img 
                        src={url} 
                        alt={`Portfolio ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border"
                      />
                      <button
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          portfolioImages: prev.portfolioImages.filter((_, i) => i !== index)
                        }))}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <div className="text-sm text-gray-600">
                  <strong>Portfolio URLs:</strong>
                  <ul className="list-disc list-inside mt-1">
                    {formData.portfolioImages.map((url, index) => (
                      <li key={index} className="truncate">{url}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Form Submission Test */}
          <div className="pt-4 border-t">
            <button
              onClick={handleSubmit}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Test Form Submission
            </button>
            <p className="text-sm text-gray-600 mt-2">
              Click to see how the uploaded image URLs are passed to the form data.
            </p>
          </div>

          {/* Current Form State */}
          <div className="pt-4 border-t">
            <h4 className="font-medium mb-2">Current Form State:</h4>
            <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
              {JSON.stringify(formData, null, 2)}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
