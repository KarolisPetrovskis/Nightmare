import { AppBar, Toolbar, Button, Box, Typography } from '@mui/material';
import { useLocation } from 'react-router-dom';
import styles from './Navbar.module.css';

const links = [
  { to: '/menu-management', label: 'Menu Management' },
  { to: '/order-management', label: 'Order Management' },
  { to: '/service-management', label: 'Service Management' },
  { to: '/schedule-management', label: 'Schedule Management' },
];

export default function Navbar() {
  const location = useLocation();
  
  // Get current page name from route
  const getCurrentPageTitle = () => {
    // Check for current-schedule-management route (dynamic route with date parameter)
    if (location.pathname.startsWith('/current-schedule-management/')) {
      return 'Current Schedule Management';
    }
    return links.find(link => link.to === location.pathname)?.label || 'Home';
  };
  
  const currentPage = getCurrentPageTitle();

  return (
    <AppBar position="sticky" className={styles.appBar}>
      <Toolbar className={styles.toolbar}>
        <Typography variant="h6" className={styles.businessName}>
          Nightmare
        </Typography>

        <Typography variant="h6" className={styles.pageTitle}>
          {currentPage}
        </Typography>

        <Box className={styles.rightButtons}>
          <Button className={styles.navButton} onClick={() => {}}>Options</Button>
          <Button className={styles.navButton} onClick={() => {}}>Sign out</Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
