import { useEffect, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Home from './pages/Home'
import Forecast from './pages/Forecast'
import MenuManagement from './pages/MenuManagement/MenuManagement';
import OrderManagement from './pages/OrderManagement/OrderManagement';
import ServiceManagement from './pages/ServiceManagement/ServiceManagement';
import ScheduleManagement from './pages/ScheduleManagement/ScheduleManagement';
import CurrentScheduleManagement from './pages/CurrentScheduleManagement/CurrentScheduleManagement';
import DishSelection from './pages/OrderManagement/DishSelection/DishSelection';
import Login from './pages/Login/Login';

export interface WeatherForecast {
  date: string;
  temperatureC: number;
  summary: string;
}

export default function App() {
  const location = useLocation();
  const [_data, setData] = useState<WeatherForecast[]>([]);

  useEffect(() => {
    fetch('/api/weatherforecast')
      .then((res) => res.json())
      .then((data) => setData(data))
      .catch(console.error);
  }, []);

  return (
    <>
      <div className="root-container">
        {location.pathname !== '/login' && <Navbar />}
        <div className="content-wrapper">
          <div className="side-container" />
          <main className="page-container">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/forecast" element={<Forecast />} />
              <Route path="/menu-management" element={<MenuManagement />} />
              <Route path="/order-management" element={<OrderManagement />} />
              <Route path="/order-management/select-dish" element={<DishSelection />} />
              <Route path="/service-management" element={<ServiceManagement />} />
              <Route path="/schedule-management" element={<ScheduleManagement />} />
              <Route path="/current-schedule-management/:date" element={<CurrentScheduleManagement />} />
              <Route path="/login" element={<Login />} />
            </Routes>
          </main>
          <div className="side-container" />
        </div>
      </div>
    </>
  );
}
