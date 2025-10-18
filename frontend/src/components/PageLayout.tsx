import React from 'react';
import { Container, Form, Button } from 'react-bootstrap';
import { FaSearch } from 'react-icons/fa';

interface PageLayoutProps {
  children: React.ReactNode;
  showTopBar?: boolean;
}

const PageLayout: React.FC<PageLayoutProps> = ({ children, showTopBar = true }) => {
  return (
    <>
      {showTopBar && (
        <div className="bg-white border-bottom p-3 d-flex justify-content-between align-items-center">
          <div className="flex-fill" style={{ maxWidth: '600px' }}>
            <div className="position-relative">
              <FaSearch 
                className="position-absolute text-muted" 
                style={{ 
                  left: '12px', 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  fontSize: '14px'
                }} 
              />
              <Form.Control
                type="text"
                placeholder="Search vehicles, services, bookings"
                size="sm"
                style={{ paddingLeft: '36px' }}
              />
            </div>
          </div>
          <div className="d-flex align-items-center" style={{ gap: '1rem' }}>
            <Button variant="link" className="text-dark text-decoration-none">
              Login
            </Button>
            <div
              className="rounded-circle"
              style={{
                width: '32px',
                height: '32px',
                backgroundColor: '#fd7e14'
              }}
            />
          </div>
        </div>
      )}

      <div style={{ backgroundColor: '#f8f9fa', minHeight: showTopBar ? 'calc(100vh - 60px)' : '100vh' }}>
        <Container fluid className="p-4" style={{ maxWidth: '1400px' }}>
          {children}
        </Container>
      </div>
    </>
  );
};

export default PageLayout;
