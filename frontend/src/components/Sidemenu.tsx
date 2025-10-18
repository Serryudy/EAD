import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Nav } from 'react-bootstrap';
import {
  FaHome,
  FaCalendarAlt,
  FaCalendarCheck,
  FaChartLine,
  FaCar
} from 'react-icons/fa';

const Sidemenu: React.FC = () => {
  const location = useLocation();

  const menuItems = [
    {
      path: '/dashboard',
      label: 'Dashboard',
      icon: <FaHome />
    },
    {
      path: '/book-appointment',
      label: 'Book Appointment',
      icon: <FaCalendarAlt />
    },
    {
      path: '/my-calendar',
      label: 'My Calendar',
      icon: <FaCalendarCheck />
    },
    {
      path: '/progress',
      label: 'Progress',
      icon: <FaChartLine />
    }
  ];

  return (
    <div 
      className="d-flex flex-column vh-100 bg-light shadow"
      style={{ width: '260px' }}
    >
      {/* Logo/Header Section */}
      <div className="px-4 py-4 border-bottom">
        <div className="d-flex align-items-center" style={{ gap: '0.5rem' }}>
          <FaCar className="fs-3 text-dark" />
          <h1 className="fs-4 fw-semibold mb-0 text-dark">AutoService</h1>
        </div>
      </div>

      {/* Customer Label */}
      <div className="px-3 py-3">
        <p className="text-muted small fw-medium mb-0 text-start">Customer</p>
      </div>

      {/* Menu Items */}
      <Nav className="flex-column flex-fill px-3">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          
          return (
            <Nav.Link
              key={item.path}
              as={Link}
              to={item.path}
              className={`d-flex align-items-center px-3 py-3 mb-2 rounded text-decoration-none ${
                isActive ? 'text-white' : 'text-dark'
              }`}
              style={{
                gap: '1rem',
                backgroundColor: isActive ? '#60a5fa' : 'transparent',
                boxShadow: isActive ? '0 2px 8px rgba(96, 165, 250, 0.3)' : 'none',
                transition: 'all 0.2s ease-in-out'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = '#e9ecef';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <span className="fs-5">{item.icon}</span>
              <span className="fw-medium">{item.label}</span>
            </Nav.Link>
          );
        })}
      </Nav>
    </div>
  );
};

export default Sidemenu;
