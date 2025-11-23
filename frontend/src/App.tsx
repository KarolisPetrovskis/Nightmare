import { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Forecast from './pages/Forecast'
import MenuManagement from './pages/MenuManagement';
import OrderManagement from './pages/OrderManagement';

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
      <div className="root-container">
        <Navbar />
        <div className="content-wrapper">
          <div className="side-container" />
          <main className="page-container">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/forecast" element={<Forecast />} />
              <Route path="/menu-management" element={<MenuManagement />} />
              <Route path="/order-management" element={<OrderManagement />} />
            </Routes>
          </main>
          <div className="side-container" />
        </div>
      </div>
    </>
  );
}
