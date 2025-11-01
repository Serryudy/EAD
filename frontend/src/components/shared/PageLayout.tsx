import React, { useState } from 'react';
import { Container, Form, Button } from 'react-bootstrap';
import { FaSearch } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import profileImage from '../../assets/profile.png';
import ProfileUploadSidebar from './ProfileUploadSidebar';

interface PageLayoutProps {
  children: React.ReactNode;
  showTopBar?: boolean;
}

const PageLayout: React.FC<PageLayoutProps> = ({ children, showTopBar = true }) => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentProfileImage, setCurrentProfileImage] = useState(profileImage);

  const handleImageUpload = (file: File) => {
    console.log('Uploading file:', file);
    // TODO: Implement actual upload logic to backend
    // For now, just show the preview
  };

  const handleImageDelete = () => {
    console.log('Deleting profile picture');
    // TODO: Implement actual delete logic
    setCurrentProfileImage(profileImage); // Reset to default profile image
  };

  const handleProfileClick = () => {
    setIsSidebarOpen(true);
  };

  const handleLogout = () => {
    // Clear any stored tokens/data
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    
    // Redirect to login page
    navigate('/login');
  };
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
          <div className="d-flex align-items-center" style={{ gap: '1rem', color: '#FF0000' }}>
            <Button 
              variant="link" 
              className="text-danger text-decoration-none"
              onClick={handleLogout}
            >
              Log out
            </Button>
            <img
              src={currentProfileImage || profileImage}
              alt="Profile"
              className="rounded-circle"
              onClick={handleProfileClick}
              style={{
                width: '38px',
                height: '38px',
                objectFit: 'cover',
                cursor: 'pointer'
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

      {/* Profile Upload Sidebar */}
      <ProfileUploadSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        currentImage={currentProfileImage || profileImage}
        onImageUpload={handleImageUpload}
        onImageDelete={handleImageDelete}
      />
    </>
  );
};

export default PageLayout;
