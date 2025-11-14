import { AppBar, Toolbar, Button, Box } from '@mui/material';
import { NavLink } from 'react-router-dom';
import styles from './Navbar.module.css';

const links = [
  { to: '/', label: 'Home' },
  { to: '/forecast', label: 'Forecast' },
  { to: '/menu-management', label: 'Menu Management' },
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
