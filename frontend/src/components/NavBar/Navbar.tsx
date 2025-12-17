import { AppBar, Toolbar, Button, Box, Typography, colors } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types/userRole';
import styles from './Navbar.module.css';
import NightlightRoundIcon from '@mui/icons-material/NightlightRound';
import { useEffect, useState } from 'react';
import { fetchBusinessName } from '../../services/businessService';

interface NavLink {
  to: string;
  label: string;
  minRole?: number; // Minimum role required (Manager=2, Owner=3, SuperAdmin=4)
}

const links: NavLink[] = [
  { to: '/menu-management', label: 'Menu Management', minRole: UserRole.Manager },
  { to: '/order-management', label: 'Order Management' },
  { to: '/service-management', label: 'Service Management', minRole: UserRole.Manager },
  { to: '/schedule-management', label: 'Schedule Management' },
  { to: '/admin/business-view', label: 'Business Management' }, // Only SuperAdmin/Owner
  { to: '/admin/worker-management', label: 'Worker Management' }, // Only SuperAdmin/Owner
  { to: '/admin/order-history', label: 'Order History', minRole: UserRole.Manager },
  { to: '/admin/vat', label: 'VAT Management', minRole: UserRole.Manager },
];

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { userType, businessId } = useAuth();
  const [businessName, setBusinessName] = useState<string | null>(null);

  useEffect(() => {
    if (userType === UserRole.SuperAdmin) {
      setBusinessName('Admin');
    } else if (businessId) {
      fetchBusinessName(businessId).then(setBusinessName);
    } else {
      setBusinessName(null);
    }
  }, [businessId, userType]);

  const canAccessLink = (link: NavLink): boolean => {
    // SuperAdmin and Owner can access everything
    if (userType === UserRole.SuperAdmin || userType === UserRole.Owner) {
      return true;
    }

    // Business Management and Worker Management are only for SuperAdmin/Owner
    if (link.to === '/admin/business-view' || link.to === '/admin/worker-management') {
      return false;
    }

    // For other links, check minimum role requirement
    if (link.minRole !== undefined && userType !== null) {
      return userType >= link.minRole;
    }

    // No restriction
    return true;
  };

  const visibleLinks = links.filter(canAccessLink);

  const getCurrentPageTitle = () => {
    const match = visibleLinks.find(link => link.to === location.pathname)?.label;
    if (match) return match;
    if (location.pathname.startsWith('/payment/')) return 'Payment';
    return 'Home';
  };

  const currentPage = getCurrentPageTitle();

  return (
    <AppBar position="sticky" className={styles.appBar}>
      <Toolbar className={styles.toolbar}>
        <Typography variant="h6" className={styles.businessName} sx={{ display: 'flex', alignItems: 'center', gap: '0.5rem'}} onClick={() => navigate('/')}>
          <NightlightRoundIcon fontSize="large"/> Nightmare
          {businessName && (
            <span style={{ fontSize: '1rem', color: '#bbb', marginLeft: 12, fontWeight: 400 }}>
              | {businessName}
            </span>
          )}
        </Typography>

        <Typography variant="h6" className={styles.pageTitle}>
          {currentPage}
        </Typography>

        <Box className={styles.rightButtons}>
          {/* <Button className={styles.navButton} onClick={() => {}}>Options</Button> */}
          <Button className={styles.navButton} onClick={() => navigate('/login')}>Log out</Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
