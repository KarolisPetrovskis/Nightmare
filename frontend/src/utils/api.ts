import type { WeatherForecast } from '../App';

const API_BASE_URL = '/api';

export const fetchWeatherForecast = async (): Promise<WeatherForecast[]> => {
  const response = await fetch(`${API_BASE_URL}/weatherforecast`);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};