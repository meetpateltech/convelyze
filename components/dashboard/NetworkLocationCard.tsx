import React, { useState, useEffect } from 'react';
import { ArrowUpDown, ArrowUpRight, ArrowDownRight, Eye, EyeOff, Globe, MapPin } from 'lucide-react';
import { hasFlag } from 'country-flag-icons';
import * as FlagComponents from 'country-flag-icons/react/3x2';
import GlassCard from '@/components/cards/GlassCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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

const LocationCard: React.FC<{ 
  location: LocationData; 
  count: number;
  type: 'send' | 'receive';
  isBlurred: boolean;
}> = ({ location, count, type, isBlurred }) => {
  const FlagComponent = hasFlag(location.countryCode) 
    ? FlagComponents[location.countryCode as keyof typeof FlagComponents]
    : null;

  return (
    <div className={cn(
      "group relative overflow-hidden bg-white/5 dark:bg-black/20 border border-white/10 dark:border-white/5 rounded-xl p-4 transition-all duration-300 hover:bg-white/10 dark:hover:bg-black/30 hover:border-white/20 hover:shadow-xl",
      isBlurred && "blur-md select-none pointer-events-none"
    )}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="p-2 rounded-lg bg-white/5 dark:bg-white/10 group-hover:scale-110 transition-transform duration-300 shrink-0">
            {FlagComponent ? (
              <FlagComponent className="w-6 h-4 rounded shadow-sm" title={location.country} />
            ) : (
              <Globe className="w-5 h-5 text-gray-400" />
            )}
          </div>
          <div className="flex flex-col overflow-hidden">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{location.city}</h3>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{location.countryCode}</span>
              <div className={cn(
                "w-1 h-1 rounded-full",
                type === 'send' ? "bg-blue-400" : "bg-emerald-400"
              )} />
            </div>
          </div>
        </div>
        <div className="shrink-0">
          <span className={cn(
            "text-lg font-black tabular-nums tracking-tight",
            type === 'send' ? "text-blue-500/90 dark:text-blue-400" : "text-emerald-500/90 dark:text-emerald-400"
          )}>
            {count}
          </span>
        </div>
      </div>
    </div>
  );
};

const NetworkLocationCard: React.FC<NetworkLocationCardProps> = ({ locationData }) => {
  const [locations, setLocations] = useState<Record<string, LocationData>>({});
  const [error, setError] = useState<string | null>(null);
  const [isBlurred, setIsBlurred] = useState(true);
  const [loading, setLoading] = useState(true);
  const [visibleItems, setVisibleItems] = useState<Record<'user' | 'assistant', number>>({
    user: 10,
    assistant: 10
  });

  useEffect(() => {
    const fetchLocationData = async () => {
      try {
        setLoading(true);
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
        setError('Failed to load location data.');
      } finally {
        setLoading(false);
      }
    };

    fetchLocationData();
  }, []);

  const renderLocationGrid = (data: Record<string, number>, type: 'send' | 'receive', category: 'user' | 'assistant') => {
    const sortedCodes = Object.keys(data).sort((a, b) => data[b] - data[a]);
    const isShowingMore = visibleItems[category] >= sortedCodes.length;
    const currentVisibleCount = visibleItems[category];
    const displayCodes = sortedCodes.slice(0, currentVisibleCount);
    
    if (sortedCodes.length === 0) {
      return (
        <div className="col-span-full flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
          <MapPin className="w-12 h-12 mb-3 opacity-20" />
          <p className="text-sm font-medium">No location data found</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {displayCodes.map(code => {
            const location = locations[code];
            if (!location) return null;
            return (
              <LocationCard 
                key={code} 
                location={location} 
                count={data[code]} 
                type={type} 
                isBlurred={isBlurred}
              />
            );
          })}
        </div>
        
        {sortedCodes.length > 10 && (
          <div className="flex justify-center pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setVisibleItems(prev => ({
                ...prev,
                [category]: isShowingMore ? 10 : sortedCodes.length
              }))}
              className="bg-white/5 dark:bg-white/10 border-white/10 hover:bg-white/10 dark:hover:bg-white/20 text-xs font-semibold px-6 rounded-full transition-all"
            >
              {isShowingMore ? (
                <>Show Less</>
              ) : (
                <>Show More ({sortedCodes.length - 10} more)</>
              )}
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <GlassCard className="relative group">
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
            Edge Network Distribution
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
            <Globe className="w-3 h-3" />
            Global CDN edge locations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsBlurred(!isBlurred)}
            className="h-8 px-3 text-xs bg-white/5 dark:bg-white/10 hover:bg-white/10 dark:hover:bg-white/20 transition-all border border-white/10"
          >
            {isBlurred ? (
              <><Eye className="w-3.5 h-3.5 mr-2" /> Show Locations</>
            ) : (
              <><EyeOff className="w-3.5 h-3.5 mr-2" /> Hide Locations</>
            )}
          </Button>
          <div className="p-2 rounded-xl bg-blue-500/10 dark:bg-blue-400/10">
            <ArrowUpDown className="w-5 h-5 text-blue-500 dark:text-blue-400" />
          </div>
        </div>
      </div>

      {error ? (
        <div className="flex items-center justify-center py-10">
          <p className="text-red-500 text-sm font-medium bg-red-500/10 px-4 py-2 rounded-lg border border-red-500/20">
            {error}
          </p>
        </div>
      ) : loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-white/5 dark:bg-white/10 rounded-xl" />
          ))}
        </div>
      ) : (
        <Tabs defaultValue="user" className="w-full">
          <TabsList className="grid w-full max-w-[400px] grid-cols-2 mb-8 bg-black/10 dark:bg-white/5">
            <TabsTrigger value="user" className="flex items-center gap-2">
              <ArrowUpRight className="w-4 h-4 text-blue-400" />
              Outbound Requests
            </TabsTrigger>
            <TabsTrigger value="assistant" className="flex items-center gap-2">
              <ArrowDownRight className="w-4 h-4 text-emerald-400" />
              Inbound Responses
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="user" className="mt-0">
            {renderLocationGrid(locationData.user, 'send', 'user')}
          </TabsContent>
          
          <TabsContent value="assistant" className="mt-0">
            {renderLocationGrid(locationData.assistant, 'receive', 'assistant')}
          </TabsContent>
        </Tabs>
      )}
    </GlassCard>
  );
};

export default NetworkLocationCard;