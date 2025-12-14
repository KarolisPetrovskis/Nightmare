import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';

import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ContentCutIcon from '@mui/icons-material/ContentCut';
import EventNoteIcon from '@mui/icons-material/EventNote';
import TodayIcon from '@mui/icons-material/Today';
import StoreIcon from '@mui/icons-material/Store';
import EngineeringIcon from '@mui/icons-material/Engineering';
import HistoryIcon from '@mui/icons-material/History';

import './Home.css';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
    <h1 className="home-title">Nightmare Central</h1>
    <p className="home-subtitle">Managing chaos one click at a time</p>


      <div className="home-grid">
        <DashboardButton
          icon={<RestaurantMenuIcon />}
          label="Menu Management"
          color="#b8b5ff"
          onClick={() => navigate('/menu-management')}
        />

        <DashboardButton
          icon={<ShoppingCartIcon />}
          label="Order Management"
          color="#f3b7d8"
          onClick={() => navigate('/order-management')}
        />

        <DashboardButton
          icon={<ContentCutIcon />}
          label="Service Management"
          color="#a7c7e7"
          onClick={() => navigate('/service-management')}
        />

        <DashboardButton
          icon={<EventNoteIcon />}
          label="Schedule Management"
          color="#b6e3c6"
          onClick={() => navigate('/schedule-management')}
        />

        <DashboardButton
          icon={<TodayIcon />}
          label="Today’s Schedule"
          color="#f6e7b2"
          onClick={() =>
            navigate(`/current-schedule-management/${new Date().toISOString().slice(0, 10)}`)
          }
        />

        <DashboardButton
          icon={<StoreIcon />}
          label="Business View"
          color="#8de0cb"
          onClick={() => navigate('/admin/business-view')}
        />

        <DashboardButton
          icon={<EngineeringIcon />}
          label="Worker Management"
          color="#ffb6a3"
          onClick={() => navigate('/admin/worker-management')}
        />

        <DashboardButton
          icon={<HistoryIcon />}
          label="Order History"
          color="#c9a0dc"
          onClick={() => navigate('/admin/order-history')}
        />
      </div>
    </div>
  );
}

type DashboardButtonProps = {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
};

function DashboardButton({ icon, label, onClick, color }: DashboardButtonProps & { color: string }) {
  return (
    <Button
      className="item-action-button home-dashboard-button"
      onClick={onClick}
      style={{ '--accent-color': color } as React.CSSProperties}
    >
      <div className="home-button-content">
        <div className="home-button-icon">{icon}</div>
        <div className="home-button-text">{label}</div>
      </div>
    </Button>
  );
}

