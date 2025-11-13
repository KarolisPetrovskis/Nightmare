import { Link } from 'react-router-dom';
import styles from './Navbar.module.css';

const Navbar = () => {
  return (
    <nav className={styles.navbar}>
      <ul className={styles.navList}>
        <li className={styles.navItem}>
          <Link to="/">Home</Link>
        </li>
        <li className={styles.navItem}>
          <Link to="/forecast">Forecast</Link>
        </li>
        <li className={styles.navItem}>
          <Link to="/menu-management">Menu Management</Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;