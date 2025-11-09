import { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom'
import NavBar from './components/NavBar'
import Home from './pages/Home'
import Forecast from './pages/Forecast'

export interface WeatherForecast {
  date: string;
  temperatureC: number;
  summary: string;
}

export default function App() {
  const [data, setData] = useState<WeatherForecast[]>([]);

  useEffect(() => {
    fetch('/api/weatherforecast')
      .then((res) => res.json())
      .then((data) => setData(data))
      .catch(console.error);
  }, []);

  return (
    <>

      <NavBar />
      <div style={{ padding: 16 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/forecast" element={<Forecast />} />
        </Routes>
      </div>
    </>
  );
}
