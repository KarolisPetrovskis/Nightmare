import { useEffect, useState } from 'react';

interface WeatherForecast {
  date: string;
  temperatureC: number;
  summary: string;
}

export default function Forecast() {
  const [data, setData] = useState<WeatherForecast[]>([]);

  useEffect(() => {
    fetch('/api/weatherforecast')
      .then((res) => res.json())
      .then((data) => setData(data))
      .catch(console.error);
  }, []);

  return (
    <div>
      <h2>Weather Forecast</h2>
      <ul>
        {data.map((item, index) => (
          <li key={index}>
            <strong>{item.date}</strong> — {item.temperatureC}°C —{' '}
            {item.summary}
          </li>
        ))}
      </ul>
    </div>
  );
}