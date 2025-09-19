'use client';

import React, { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';

// Design tokens from Figma
const designTokens = {
  colors: {
    primary: '#161616',
    secondary: '#041D37',
    textSecondary: '#8D8D8D',
    textStrong: '#6F6F6F',
    background: '#FFFFFF',
    backgroundPage: '#FCFCFC',
    borderDefault: '#E0E0E0',
    borderInput: '#8D8D8D',
    borderDashed: '#A8A8A8',
    success: '#32CD32',
    progressBlue: '#44B0FF',
    progressBackground: '#F6F6F6'
  },
  typography: {
    headingLarge: 'text-[32px] font-semibold leading-[40px] tracking-[-0.4px]',
    headingMedium: 'text-[42px] font-medium leading-[50px] tracking-[-0.8px]',
    headingSmall: 'text-[18px] font-medium leading-[28px]',
    bodyRegular: 'text-[20px] leading-[28px]',
    bodySmall: 'text-[14px] leading-[20px]',
    labelSmall: 'text-[14px] font-medium leading-[20px] tracking-[1px] uppercase'
  }
};

interface FormData {
  country: string;
  state: string;
  city: string;
  zipCode: string;
  streetAddress: string;
}

interface CountriesData {
  [country: string]: {
    states: string[];
  };
}

interface Step4LocationProps {
  formData: FormData;
  setFormData: (data: FormData) => void;
  onNext: () => void;
  onBack: () => void;
}

const Step4Location: React.FC<Step4LocationProps> = ({
  formData,
  setFormData,
  onNext,
  onBack
}) => {
  const [countriesData, setCountriesData] = useState<CountriesData>({});
  const [loading, setLoading] = useState(true);

  // Fetch countries data
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch('/api/countries');
        const data = await response.json();
        if (data.success) {
          setCountriesData(data.countries);
        }
      } catch (error) {
        console.error('Error fetching countries:', error);
        // Fallback to basic countries if API fails
        setCountriesData({
          "United States": { states: ["California", "New York", "Texas", "Florida"] },
          "United Kingdom": { states: ["England", "Scotland", "Wales", "Northern Ireland"] },
          "Canada": { states: ["Ontario", "Quebec", "British Columbia", "Alberta"] },
          "Australia": { states: ["New South Wales", "Victoria", "Queensland", "Western Australia"] }
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCountries();
  }, []);

  // Update state when country changes
  useEffect(() => {
    if (countriesData[formData.country]) {
      const states = countriesData[formData.country].states;
      setFormData({
        ...formData,
        state: states[0] || '',
        city: ''
      });
    }
  }, [formData.country, countriesData]);

  const countryOptions = Object.keys(countriesData).sort();
  const stateOptions = countriesData[formData.country]?.states || [];

  // Sample cities for major states (in a real app, you'd fetch this from an API)
  const getCitiesForState = (state: string): string[] => {
    const cityMap: { [key: string]: string[] } = {
      "California": ["Los Angeles", "San Francisco", "San Diego", "San Jose", "Fresno"],
      "New York": ["New York City", "Buffalo", "Rochester", "Yonkers", "Syracuse"],
      "Texas": ["Houston", "Dallas", "Austin", "San Antonio", "Fort Worth"],
      "Florida": ["Miami", "Orlando", "Tampa", "Jacksonville", "St. Petersburg"],
      "England": ["London", "Manchester", "Birmingham", "Liverpool", "Leeds"],
      "Scotland": ["Edinburgh", "Glasgow", "Aberdeen", "Dundee", "Stirling"],
      "Wales": ["Cardiff", "Swansea", "Newport", "Wrexham", "Barry"],
      "Northern Ireland": ["Belfast", "Derry", "Lisburn", "Newtownabbey", "Bangor"],
      "Ontario": ["Toronto", "Ottawa", "Hamilton", "London", "Mississauga"],
      "Quebec": ["Montreal", "Quebec City", "Laval", "Gatineau", "Longueuil"],
      "British Columbia": ["Vancouver", "Victoria", "Surrey", "Burnaby", "Richmond"],
      "Alberta": ["Calgary", "Edmonton", "Red Deer", "Lethbridge", "St. Albert"],
      "New South Wales": ["Sydney", "Newcastle", "Wollongong", "Wagga Wagga", "Albury"],
      "Victoria": ["Melbourne", "Geelong", "Ballarat", "Bendigo", "Shepparton"],
      "Queensland": ["Brisbane", "Gold Coast", "Townsville", "Cairns", "Toowoomba"],
      "Western Australia": ["Perth", "Fremantle", "Rockingham", "Mandurah", "Bunbury"]
    };
    return cityMap[state] || [];
  };

  const cityOptions = getCitiesForState(formData.state);

  // Update city when state changes
  useEffect(() => {
    if (cityOptions.length > 0) {
      setFormData({
        ...formData,
        city: cityOptions[0] || ''
      });
    }
  }, [formData.state]);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="mb-8">
          <h1 className={`${designTokens.typography.headingLarge} text-[#161616] mb-4`}>
            Location Information
          </h1>
          <p className={`${designTokens.typography.bodyRegular} text-[#393939] mb-6`}>
            Loading location data...
          </p>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h1 className={`${designTokens.typography.headingLarge} text-[#161616] mb-4`}>
          Location Information
        </h1>
        <p className={`${designTokens.typography.bodyRegular} text-[#393939] mb-6`}>
          Tell us where you're located to help connect you with relevant opportunities.
        </p>
      </div>

      <div className="space-y-6">
        {/* Location Fields */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl border-[0.6px] border-[#8D8D8D] p-6 bg-white">
              <label className={`${designTokens.typography.labelSmall} text-[#6F6F6F] block mb-3`}>
                COUNTRY
              </label>
              <select
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="w-full p-3 rounded border border-transparent focus:border-[#44B0FF]"
              >
                <option value="">Select Country</option>
                {countryOptions.map((country) => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>
            
            <div className="rounded-xl border-[0.6px] border-[#8D8D8D] p-6 bg-white">
              <label className={`${designTokens.typography.labelSmall} text-[#6F6F6F] block mb-3`}>
                STATE/PROVINCE
              </label>
              <select
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full p-3 rounded border border-transparent focus:border-[#44B0FF]"
                disabled={!formData.country}
              >
                <option value="">Select State/Province</option>
                {stateOptions.map((state) => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>
            
            <div className="rounded-xl border-[0.6px] border-[#8D8D8D] p-6 bg-white">
              <label className={`${designTokens.typography.labelSmall} text-[#6F6F6F] block mb-3`}>
                CITY
              </label>
              <select
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full p-3 rounded border border-transparent focus:border-[#44B0FF]"
                disabled={!formData.state}
              >
                <option value="">Select City</option>
                {cityOptions.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border-[0.6px] border-[#8D8D8D] p-6 bg-white">
              <label className={`${designTokens.typography.labelSmall} text-[#6F6F6F] block mb-3`}>
                ZIP/POSTAL CODE
              </label>
              <input
                type="text"
                value={formData.zipCode}
                onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                className="w-full p-3 rounded border border-transparent focus:border-[#44B0FF]"
                placeholder="Enter zip/postal code"
              />
            </div>
            
            <div className="rounded-xl border-[0.6px] border-[#8D8D8D] p-6 bg-white">
              <label className={`${designTokens.typography.labelSmall} text-[#6F6F6F] block mb-3`}>
                STREET ADDRESS
              </label>
              <input
                type="text"
                value={formData.streetAddress}
                onChange={(e) => setFormData({ ...formData, streetAddress: e.target.value })}
                className="w-full p-3 rounded border border-transparent focus:border-[#44B0FF]"
                placeholder="Enter street address"
              />
            </div>
          </div>
        </div>

        {/* Location Preview */}
        {formData.country && formData.state && formData.city && (
          <div className="rounded-xl border-[0.6px] border-[#8D8D8D] p-6 bg-white">
            <div className="flex items-center gap-3">
              <MapPin size={20} className="text-[#44B0FF]" />
              <div>
                <h4 className={`${designTokens.typography.headingSmall} text-[#161616]`}>
                  Your Location
                </h4>
                <p className="text-sm text-[#6F6F6F]">
                  {formData.streetAddress && `${formData.streetAddress}, `}
                  {formData.city}, {formData.state}, {formData.country}
                  {formData.zipCode && ` ${formData.zipCode}`}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-8">
        <button
          type="button"
          onClick={onBack}
          className="w-full sm:w-[220px] h-16 bg-white rounded-[30px] border border-[#041D37] flex items-center justify-center hover:bg-gray-50 transition-colors"
        >
          <span className={`${designTokens.typography.headingSmall} text-[#041D37]`}>
            Back
          </span>
        </button>
        
        <button
          type="button"
          onClick={onNext}
          className="w-full sm:w-[220px] h-16 bg-[#161616] rounded-[30px] shadow-[0px_4px_12px_0px_rgba(0,0,0,0.08)] flex items-center justify-center hover:bg-gray-800 transition-colors"
        >
          <span className={`${designTokens.typography.headingSmall} text-white`}>
            Next Step
          </span>
        </button>
      </div>
    </div>
  );
};

export default Step4Location;
