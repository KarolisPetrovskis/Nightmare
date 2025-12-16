import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types/userRole';

import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ContentCutIcon from '@mui/icons-material/ContentCut';
import EventNoteIcon from '@mui/icons-material/EventNote';
import TodayIcon from '@mui/icons-material/Today';
import StoreIcon from '@mui/icons-material/Store';
import EngineeringIcon from '@mui/icons-material/Engineering';
import HistoryIcon from '@mui/icons-material/History';
import PercentIcon from '@mui/icons-material/Percent';

import './Home.css';

interface DashboardItem {
  icon: React.ReactNode;
  label: string;
  color: string;
  path: string;
  minRole?: number;
  allowedRoles?: number[];
}

export default function Home() {
  const navigate = useNavigate();
  const { userType } = useAuth();

  const dashboardItems: DashboardItem[] = [
    {
      icon: <RestaurantMenuIcon />,
      label: 'Menu Management',
      color: '#b8b5ff',
      path: '/menu-management',
      minRole: UserRole.Manager,
    },
    {
      icon: <ShoppingCartIcon />,
      label: 'Order Management',
      color: '#f3b7d8',
      path: '/order-management',
    },
    {
      icon: <ContentCutIcon />,
      label: 'Service Management',
      color: '#a7c7e7',
      path: '/service-management',
      minRole: UserRole.Manager,
    },
    {
      icon: <EventNoteIcon />,
      label: 'Schedule Management',
      color: '#b6e3c6',
      path: '/schedule-management',
    },
    {
      icon: <TodayIcon />,
      label: "Today's Schedule",
      color: '#f6e7b2',
      path: `/current-schedule-management/${new Date().toISOString().slice(0, 10)}`,
    },
    {
      icon: <StoreIcon />,
      label: 'Business View',
      color: '#8de0cb',
      path: '/admin/business-view',
      allowedRoles: [UserRole.Owner, UserRole.SuperAdmin],
    },
    {
      icon: <EngineeringIcon />,
      label: 'Worker Management',
      color: '#ffb6a3',
      path: '/admin/worker-management',
      allowedRoles: [UserRole.Owner, UserRole.SuperAdmin],
    },
    {
      icon: <HistoryIcon />,
      label: 'Order History',
      color: '#c9a0dc',
      path: '/admin/order-history',
      minRole: UserRole.Manager,
    },
    {
      icon: <PercentIcon />,
      label: 'VAT Management',
      color: '#f5d4b8',
      path: '/admin/vat',
      minRole: UserRole.Manager,
    },
  ];

  const canAccessItem = (item: DashboardItem): boolean => {
    // SuperAdmin and Owner can access everything
    if (userType === UserRole.SuperAdmin || userType === UserRole.Owner) {
      return true;
    }

    // Check allowed roles (whitelist)
    if (item.allowedRoles !== undefined && userType !== null) {
      return item.allowedRoles.includes(userType);
    }

    // Check minimum role requirement
    if (item.minRole !== undefined && userType !== null) {
      return userType >= item.minRole;
    }

    // No restriction
    return true;
  };

  const visibleItems = dashboardItems.filter(canAccessItem);

  return (
    <div className="home-container">
      <h1 className="home-title">Nightmare Central</h1>
      <p className="home-subtitle">Managing chaos one click at a time</p>

      <div className="home-grid">
        {visibleItems.map((item) => (
          <DashboardButton
            key={item.path}
            icon={item.icon}
            label={item.label}
            color={item.color}
            onClick={() => navigate(item.path)}
          />
        ))}
      </div>
    </div>
  );
}

type DashboardButtonProps = {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
};

function DashboardButton({
  icon,
  label,
  onClick,
  color,
}: DashboardButtonProps & { color: string }) {
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
