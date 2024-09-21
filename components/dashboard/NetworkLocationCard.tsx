import React, { useState, useEffect } from 'react';
import { ArrowUpDown, ArrowUpRight, ArrowDownRight, Eye, EyeOff } from 'lucide-react';
import { hasFlag } from 'country-flag-icons';
import * as FlagComponents from 'country-flag-icons/react/3x2';

type LocationData = {
  city: string;
  country: string;
  countryCode: string;
  code: string;
};

interface NetworkLocationCardProps {
  locationData: {
    user: Record<string, number>;
    assistant: Record<string, number>;
  };
}

const GlassCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white/10 dark:bg-white/5 backdrop-filter backdrop-blur-md rounded-xl p-6 shadow-lg border border-white/20 dark:border-white/10 transition-all duration-300 ${className}`}>
    {children}
  </div>
);

const LocationCard: React.FC<{ location: LocationData; type: 'send' | 'receive' }> = ({ location, type }) => {
  const FlagComponent = hasFlag(location.countryCode) 
    ? FlagComponents[location.countryCode as keyof typeof FlagComponents]
    : null;

  return (
    <div className="bg-white/5 dark:bg-black/5 rounded-lg p-4 shadow-sm transition-all duration-300 ease-in-out hover:shadow-md hover:scale-105">
      <div className="flex items-center justify-between mb-2">
        {FlagComponent ? (
          <FlagComponent className="w-8 h-6 rounded shadow-sm" title={location.country} />
        ) : (
          <span className="w-8 h-6 bg-gray-300 dark:bg-gray-700 rounded shadow-sm" />
        )}
        {type === 'send' ? (
          <ArrowUpRight className="w-4 h-4 text-blue-400" />
        ) : (
          <ArrowDownRight className="w-4 h-4 text-green-400" />
        )}
      </div>
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">{location.city}</h3>
      <p className="text-xs text-gray-500 dark:text-gray-400">{location.countryCode}</p>
    </div>
  );
};

const NetworkLocationCard: React.FC<NetworkLocationCardProps> = ({ locationData }) => {
  const [locations, setLocations] = useState<Record<string, LocationData>>({});
  const [error, setError] = useState<string | null>(null);
  const [isBlurred, setIsBlurred] = useState(true);

  useEffect(() => {
    const fetchLocationData = async () => {
      try {
        const response = await fetch('/cf-server.json');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const locationMap: Record<string, LocationData> = {};
        data.regions.forEach((region: { locations: LocationData[] }) => {
          region.locations.forEach(location => {
            locationMap[location.code] = location;
          });
        });
        setLocations(locationMap);
      } catch (e) {
        console.error('Error fetching location data:', e);
        setError('Failed to load location data. Please try again later.');
      }
    };

    fetchLocationData();
  }, []);

  const renderLocationGrid = (data: Record<string, number>, type: 'send' | 'receive') => {
    return Object.keys(data).map(code => {
      const location = locations[code];
      if (!location) return null;
      return (
        <div key={code} className={isBlurred ? 'blur-md' : ''}>
          <LocationCard location={location} type={type} />
        </div>
      );
    });
  };

  const toggleBlur = () => {
    setIsBlurred(!isBlurred);
  };

  return (
    <div className="relative">
      <GlassCard className="overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Your Network Requests</h2>
          <ArrowUpDown className="w-8 h-8 text-blue-500 dark:text-blue-400" />
        </div>
        {error ? (
          <p className="text-red-500 mb-4">{error}</p>
        ) : (
          <div className="flex space-x-6">
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4 flex items-center">
                <ArrowUpRight className="w-5 h-5 mr-2 text-blue-400" />
                Send
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {renderLocationGrid(locationData.user, 'send')}
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4 flex items-center">
                <ArrowDownRight className="w-5 h-5 mr-2 text-green-400" />
                Receive
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {renderLocationGrid(locationData.assistant, 'receive')}
              </div>
            </div>
          </div>
        )}
      </GlassCard>
      <div className="absolute bottom-0 left-0 right-0 flex justify-center pb-4">
        <button
          onClick={toggleBlur}
          className="flex items-center justify-center px-4 py-2 bg-white/20 dark:bg-black/20 rounded-full shadow-md hover:bg-white/30 dark:hover:bg-black/30 transition-all duration-300"
        >
          {isBlurred ? (
            <>
              <Eye className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-300" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Show</span>
            </>
          ) : (
            <>
              <EyeOff className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-300" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Hide</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default NetworkLocationCard;