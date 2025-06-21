import React, { useState, useEffect } from 'react';
import { Search, MapPin, Thermometer, Eye, Wind, Droplets, Gauge, Sun, Cloud, CloudRain, CloudSnow } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface WeatherData {
  location: {
    name: string;
    region: string;
    country: string;
    localtime: string;
  };
  current: {
    temp_c: number;
    temp_f: number;
    condition: {
      text: string;
      icon: string;
    };
    wind_kph: number;
    wind_dir: string;
    pressure_mb: number;
    humidity: number;
    feelslike_c: number;
    feelslike_f: number;
    vis_km: number;
    uv: number;
    air_quality: {
      co: number;
      no2: number;
      o3: number;
      so2: number;
      pm2_5: number;
      pm10: number;
    };
  };
}

const Index = () => {
  const [location, setLocation] = useState('');
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [unit, setUnit] = useState<'C' | 'F'>('C');
  const { toast } = useToast();

  const fetchWeather = async (searchLocation: string) => {
    if (!searchLocation.trim()) {
      toast({
        title: "Please enter a location",
        description: "Enter a city name to get weather information",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://api.weatherapi.com/v1/current.json?key=471bb8a35839433481265013252106&q=${encodeURIComponent(searchLocation)}&aqi=yes`
      );
      
      if (!response.ok) {
        throw new Error('Location not found');
      }
      
      const data = await response.json();
      setWeatherData(data);
      toast({
        title: "Weather updated!",
        description: `Weather information for ${data.location.name} loaded successfully`
      });
    } catch (error) {
      toast({
        title: "Error fetching weather",
        description: "Please check the location name and try again",
        variant: "destructive"
      });
      console.error('Weather fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchWeather(location);
  };

  const getWeatherIcon = (condition: string) => {
    const lowerCondition = condition.toLowerCase();
    if (lowerCondition.includes('rain') || lowerCondition.includes('drizzle')) {
      return <CloudRain className="w-16 h-16 text-blue-400" />;
    } else if (lowerCondition.includes('snow')) {
      return <CloudSnow className="w-16 h-16 text-blue-200" />;
    } else if (lowerCondition.includes('cloud')) {
      return <Cloud className="w-16 h-16 text-gray-400" />;
    } else {
      return <Sun className="w-16 h-16 text-yellow-400" />;
    }
  };

  const getBackgroundGradient = () => {
    if (!weatherData) return 'from-blue-400 via-purple-500 to-pink-500';
    
    const condition = weatherData.current.condition.text.toLowerCase();
    const temp = weatherData.current.temp_c;
    
    if (condition.includes('rain')) {
      return 'from-gray-600 via-blue-600 to-blue-800';
    } else if (condition.includes('snow')) {
      return 'from-blue-200 via-blue-300 to-blue-500';
    } else if (condition.includes('cloud')) {
      return 'from-gray-400 via-gray-500 to-gray-700';
    } else if (temp > 25) {
      return 'from-orange-400 via-red-500 to-pink-600';
    } else if (temp > 15) {
      return 'from-yellow-400 via-orange-500 to-red-500';
    } else {
      return 'from-blue-400 via-indigo-500 to-purple-600';
    }
  };

  const getAirQualityStatus = (pm25: number) => {
    if (pm25 <= 12) return { status: 'Good', color: 'text-green-400' };
    if (pm25 <= 35) return { status: 'Moderate', color: 'text-yellow-400' };
    if (pm25 <= 55) return { status: 'Unhealthy for Sensitive', color: 'text-orange-400' };
    if (pm25 <= 150) return { status: 'Unhealthy', color: 'text-red-400' };
    return { status: 'Very Unhealthy', color: 'text-purple-400' };
  };

  useEffect(() => {
    // Load default weather for London on component mount
    fetchWeather('London');
  }, []);

  return (
    <div className={`min-h-screen bg-gradient-to-br ${getBackgroundGradient()} transition-all duration-1000 ease-in-out`}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 animate-fade-in">
            WeatherScope
          </h1>
          <p className="text-xl text-white/80 animate-fade-in">
            Discover weather conditions around the world
          </p>
        </div>

        {/* Search Section */}
        <div className="max-w-md mx-auto mb-8 animate-scale-in">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="Enter city name..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="pl-10 bg-white/10 backdrop-blur-md border-white/20 text-white placeholder:text-white/60 focus:bg-white/20 transition-all duration-300"
              />
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
            </div>
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-md border-white/20 text-white transition-all duration-300 hover:scale-105"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
            </Button>
          </form>
        </div>

        {weatherData && (
          <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
            {/* Main Weather Card */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white overflow-hidden">
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-3xl font-bold mb-2">
                      {weatherData.location.name}
                    </h2>
                    <p className="text-white/80">
                      {weatherData.location.region}, {weatherData.location.country}
                    </p>
                    <p className="text-white/60 text-sm">
                      {new Date(weatherData.location.localtime).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setUnit(unit === 'C' ? 'F' : 'C')}
                      className="text-white hover:bg-white/20"
                    >
                      °{unit}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    {getWeatherIcon(weatherData.current.condition.text)}
                    <div>
                      <div className="text-6xl font-bold mb-2">
                        {unit === 'C' ? Math.round(weatherData.current.temp_c) : Math.round(weatherData.current.temp_f)}°
                      </div>
                      <p className="text-xl text-white/80">
                        {weatherData.current.condition.text}
                      </p>
                      <p className="text-white/60">
                        Feels like {unit === 'C' ? Math.round(weatherData.current.feelslike_c) : Math.round(weatherData.current.feelslike_f)}°
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Weather Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20 transition-all duration-300 hover:scale-105">
                <CardContent className="p-6 text-center">
                  <Wind className="w-8 h-8 mx-auto mb-3 text-blue-300" />
                  <h3 className="font-semibold mb-2">Wind</h3>
                  <p className="text-2xl font-bold">{weatherData.current.wind_kph}</p>
                  <p className="text-sm text-white/60">km/h {weatherData.current.wind_dir}</p>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20 transition-all duration-300 hover:scale-105">
                <CardContent className="p-6 text-center">
                  <Droplets className="w-8 h-8 mx-auto mb-3 text-blue-300" />
                  <h3 className="font-semibold mb-2">Humidity</h3>
                  <p className="text-2xl font-bold">{weatherData.current.humidity}</p>
                  <p className="text-sm text-white/60">%</p>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20 transition-all duration-300 hover:scale-105">
                <CardContent className="p-6 text-center">
                  <Eye className="w-8 h-8 mx-auto mb-3 text-blue-300" />
                  <h3 className="font-semibold mb-2">Visibility</h3>
                  <p className="text-2xl font-bold">{weatherData.current.vis_km}</p>
                  <p className="text-sm text-white/60">km</p>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20 transition-all duration-300 hover:scale-105">
                <CardContent className="p-6 text-center">
                  <Gauge className="w-8 h-8 mx-auto mb-3 text-blue-300" />
                  <h3 className="font-semibold mb-2">Pressure</h3>
                  <p className="text-2xl font-bold">{weatherData.current.pressure_mb}</p>
                  <p className="text-sm text-white/60">mb</p>
                </CardContent>
              </Card>
            </div>

            {/* Air Quality Card */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <Thermometer className="w-5 h-5 mr-2" />
                  Air Quality Index
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-white/60">PM2.5</p>
                    <p className="text-lg font-bold">{weatherData.current.air_quality.pm2_5.toFixed(1)}</p>
                    <p className={`text-xs ${getAirQualityStatus(weatherData.current.air_quality.pm2_5).color}`}>
                      {getAirQualityStatus(weatherData.current.air_quality.pm2_5).status}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-white/60">PM10</p>
                    <p className="text-lg font-bold">{weatherData.current.air_quality.pm10.toFixed(1)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-white/60">CO</p>
                    <p className="text-lg font-bold">{weatherData.current.air_quality.co.toFixed(1)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-white/60">NO2</p>
                    <p className="text-lg font-bold">{weatherData.current.air_quality.no2.toFixed(1)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-white/60">O3</p>
                    <p className="text-lg font-bold">{weatherData.current.air_quality.o3.toFixed(1)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-white/60">UV Index</p>
                    <p className="text-lg font-bold">{weatherData.current.uv}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
