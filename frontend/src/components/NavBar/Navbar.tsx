import { AppBar, Toolbar, Button, Box, Typography, colors } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './Navbar.module.css';
import NightlightRoundIcon from '@mui/icons-material/NightlightRound';

const links = [
  { to: '/menu-management', label: 'Menu Management' },
  { to: '/order-management', label: 'Order Management' },
  { to: '/service-management', label: 'Service Management' },
  { to: '/schedule-management', label: 'Schedule Management' },
  { to: '/admin/business-view', label: 'Business Management' },
  { to: '/admin/worker-management', label: 'Worker Management' },
  { to: '/admin/order-history', label: 'Order History' },
  { to: '/admin/vat', label: 'VAT Management' },
];

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const getCurrentPageTitle = () => {

    return links.find(link => link.to === location.pathname)?.label || 'Home';
  };

  const currentPage = getCurrentPageTitle();

  return (
    <AppBar position="sticky" className={styles.appBar}>
      <Toolbar className={styles.toolbar}>
        <Typography variant="h6" className={styles.businessName} sx={{ display: 'flex', alignItems: 'center', gap: '0.5rem'}} onClick={() => navigate('/')}>
          <NightlightRoundIcon fontSize="large"/> Nightmare 
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
