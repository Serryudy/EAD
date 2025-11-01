import React, { useState, useEffect } from 'react';
import { Container, Form, Button } from 'react-bootstrap';
import { FaSearch } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import ApiService from '../../services/api';
import profileImage from '../../assets/profile.png';
import ProfileUploadSidebar from './ProfileUploadSidebar';

interface PageLayoutProps {
  children: React.ReactNode;
  showTopBar?: boolean;
}

const PageLayout: React.FC<PageLayoutProps> = ({ children, showTopBar = true }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentProfileImage, setCurrentProfileImage] = useState(profileImage);

  // Load profile picture on mount
  useEffect(() => {
    const loadProfilePicture = async () => {
      try {
        const response = await ApiService.getProfilePicture();
        if (response.success && response.data?.profilePicture) {
          setCurrentProfileImage(response.data.profilePicture);
        }
      } catch (error) {
        console.error('Error loading profile picture:', error);
      }
    };
    loadProfilePicture();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleImageUpload = async (file: File) => {
    try {
      const response = await ApiService.uploadProfilePicture(file);
      if (response.success && response.data?.profilePicture) {
        setCurrentProfileImage(response.data.profilePicture);
      }
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      throw error;
    }
  };

  const handleImageDelete = async () => {
    try {
      await ApiService.deleteProfilePicture();
      setCurrentProfileImage(profileImage);
    } catch (error) {
      console.error('Error deleting profile picture:', error);
      throw error;
    }
  };

  const handleProfileClick = () => {
    setIsSidebarOpen(true);
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
