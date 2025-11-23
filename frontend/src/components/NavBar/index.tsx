import { AppBar, Toolbar, Button, Box } from '@mui/material';
import { NavLink } from 'react-router-dom';
import styles from './Navbar.module.css';

const links = [
  { to: '/menu-management', label: 'Menu Management' },
  { to: '/order-management', label: 'Order Management' },
  { to: '/service-management', label: 'Service Management' },
];

export default function Navbar() {
  return (
    <AppBar position="sticky" className={styles.appBar}>
      <Toolbar className={styles.toolbar}>
        <Box className={styles.navList}>
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.active : ''}`
              }
            >
              <Button className={styles.navButton}>{link.label}</Button>
            </NavLink>
          ))}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
