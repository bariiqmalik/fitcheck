import { WeatherType } from '../types/database.types';

export interface LiveWeatherData {
  city: string;
  country: string;
  temperatureC: number;
  conditionText: string;
  weatherType: WeatherType;
  precipitationMm: number;
  latitude: number;
  longitude: number;
  timestamp: number;
}

const CACHE_KEY = 'fitting_room_cached_weather';
const CACHE_EXPIRY_MS = 30 * 60 * 1000; // 30 minutes

/**
 * Maps WMO weather code and temperature to Fitting Room's WeatherType
 */
export function mapWmoToWeather(
  code: number,
  tempC: number,
  precip: number
): { conditionText: string; weatherType: WeatherType } {
  let conditionText = 'Clear';
  let isRainy = precip > 0.2 || (code >= 51 && code <= 67) || (code >= 80 && code <= 82) || code >= 95;

  if (code === 0) conditionText = 'Clear & Sunny';
  else if (code === 1) conditionText = 'Mainly Clear';
  else if (code === 2) conditionText = 'Partly Cloudy';
  else if (code === 3) conditionText = 'Overcast';
  else if (code === 45 || code === 48) conditionText = 'Foggy';
  else if (code >= 51 && code <= 55) conditionText = 'Drizzle';
  else if (code >= 61 && code <= 65) conditionText = 'Rainy';
  else if (code >= 71 && code <= 77) conditionText = 'Snowy';
  else if (code >= 80 && code <= 82) conditionText = 'Rain Showers';
  else if (code >= 95) conditionText = 'Thunderstorm';

  let weatherType: WeatherType = 'warm';

  if (isRainy) {
    weatherType = 'rainy';
  } else if (tempC > 27) {
    weatherType = 'hot';
  } else if (tempC >= 20) {
    weatherType = 'warm';
  } else if (tempC >= 12) {
    weatherType = 'cool';
  } else {
    weatherType = 'cold';
  }

  return { conditionText, weatherType };
}

/**
 * Get cached weather if still fresh (< 30 minutes)
 */
export function getCachedWeather(): LiveWeatherData | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed: LiveWeatherData = JSON.parse(raw);
    if (Date.now() - parsed.timestamp < CACHE_EXPIRY_MS) {
      return parsed;
    }
  } catch {
    // ignore
  }
  return null;
}

/**
 * Request browser geolocation and fetch real-time local weather from Open-Meteo
 */
export async function fetchLiveLocationWeather(): Promise<LiveWeatherData> {
  if (!navigator.geolocation) {
    throw new Error('Geolocation is not supported by your browser.');
  }

  // 1. Get Coordinates
  const position = await new Promise<GeolocationPosition>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      resolve,
      (err) => {
        let msg = 'Location permission denied.';
        if (err.code === err.PERMISSION_DENIED) {
          msg = 'Location permission was denied. Please allow location in your browser settings.';
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          msg = 'Location information is unavailable.';
        } else if (err.code === err.TIMEOUT) {
          msg = 'Location request timed out.';
        }
        reject(new Error(msg));
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 600000, // 10 minutes cache
      }
    );
  });

  const { latitude, longitude } = position.coords;

  // 2. Query Open-Meteo Weather
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,precipitation`;
  const weatherRes = await fetch(weatherUrl);
  if (!weatherRes.ok) {
    throw new Error('Failed to fetch live weather forecast.');
  }

  const weatherJson = await weatherRes.json();
  const current = weatherJson.current || {};
  const tempC = Math.round(current.temperature_2m ?? 22);
  const code = current.weather_code ?? 0;
  const precip = current.precipitation ?? 0;

  const { conditionText, weatherType } = mapWmoToWeather(code, tempC, precip);

  // 3. Reverse Geocode City & Country Name
  let city = 'Your Location';
  let country = '';

  try {
    const geoUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`;
    const geoRes = await fetch(geoUrl);
    if (geoRes.ok) {
      const geoJson = await geoRes.json();
      city = geoJson.city || geoJson.locality || geoJson.principalSubdivision || 'Your Location';
      country = geoJson.countryName || '';
    }
  } catch {
    // Fallback: extract from Intl timezone
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz) city = tz.split('/').pop()?.replace(/_/g, ' ') || 'Your Location';
    } catch {}
  }

  const result: LiveWeatherData = {
    city,
    country,
    temperatureC: tempC,
    conditionText,
    weatherType,
    precipitationMm: precip,
    latitude,
    longitude,
    timestamp: Date.now(),
  };

  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(result));
  } catch {}

  return result;
}

