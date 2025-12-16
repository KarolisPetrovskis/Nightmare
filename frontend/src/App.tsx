import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/NavBar/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home/Home';
// import Forecast from './pages/Forecast'
import MenuManagement from './pages/MenuManagement/MenuManagement';
import OrderManagement from './pages/OrderManagement/OrderManagement';
import ServiceManagement from './pages/ServiceManagement/ServiceManagement';
import ScheduleManagement from './pages/ScheduleManagement/ScheduleManagement';
import CurrentScheduleManagement from './pages/CurrentScheduleManagement/CurrentScheduleManagement';
import VATManagement from './pages/VAT/VATManagement';
import DishSelection from './pages/OrderManagement/DishSelection/DishSelection';
import PaymentProcessing from './pages/PaymentProcessing/PaymentProcessing';
import Login from './pages/Login/Login';
import BusinessView from './pages/AdminPages/Business view/BusinessView';
import WorkerManagement from './pages/AdminPages/Worker Management/WorkerManagement';
import OrderHistory from './pages/AdminPages/OrderHistory/OrderHistory';
import { OrderProvider } from './context/OrderContext';
import { AuthProvider } from './context/AuthContext';
import { UserRole } from './types/userRole';

export default function App() {
  const location = useLocation();
  //const [_data, setData] = useState<WeatherForecast[]>([]);

  useEffect(() => {
    //fetch('/api/weatherforecast')
    //  .then((res) => res.json())
    //  .then((data) => setData(data))
    //  .catch(console.error);
  }, []);

  return (
    <>
      <AuthProvider>
        <OrderProvider>
          <div className="root-container">
            {location.pathname !== '/login' && <Navbar />}
            <div className="content-wrapper">
              <div className="side-container" />
              <main className="page-container">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route 
                    path="/menu-management" 
                    element={
                      <ProtectedRoute requiredRole={UserRole.Manager}>
                        <MenuManagement />
                      </ProtectedRoute>
                    } 
                  />
                  <Route
                    path="/order-management"
                    element={<OrderManagement />}
                  />
                  <Route
                    path="/order-management/select-dish"
                    element={<DishSelection />}
                  />
                  <Route
                    path="/payment/:orderId"
                    element={<PaymentProcessing />}
                  />
                  <Route
                    path="/service-management"
                    element={
                      <ProtectedRoute requiredRole={UserRole.Manager}>
                        <ServiceManagement />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/schedule-management"
                    element={<ScheduleManagement />}
                  />
                  <Route
                    path="/current-schedule-management/:date"
                    element={<CurrentScheduleManagement />}
                  />
                  <Route path="/login" element={<Login />} />
                  <Route
                    path="/admin/business-view"
                    element={
                      <ProtectedRoute allowedRoles={[UserRole.Owner, UserRole.SuperAdmin]}>
                        <BusinessView />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/worker-management"
                    element={
                      <ProtectedRoute allowedRoles={[UserRole.Owner, UserRole.SuperAdmin]}>
                        <WorkerManagement />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/order-history"
                    element={
                      <ProtectedRoute requiredRole={UserRole.Manager}>
                        <OrderHistory />
                      </ProtectedRoute>
                    }
                  />
                  <Route 
                    path="/admin/vat" 
                    element={
                      <ProtectedRoute requiredRole={UserRole.Manager}>
                        <VATManagement />
                      </ProtectedRoute>
                    } 
                  />
                </Routes>
              </main>
              <div className="side-container" />
            </div>
          </div>
        </OrderProvider>
      </AuthProvider>
    </>
  );
}
