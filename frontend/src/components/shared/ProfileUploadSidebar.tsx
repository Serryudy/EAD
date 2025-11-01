import React, { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import { X, Upload, Trash2 } from 'lucide-react';
import defaultProfileImage from '../../assets/profile.png';

interface ProfileUploadSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentImage: string;
  onImageUpload: (file: File) => void;
  onImageDelete: () => void;
}

const ProfileUploadSidebar: React.FC<ProfileUploadSidebarProps> = ({
  isOpen,
  onClose,
  currentImage,
  onImageUpload,
  onImageDelete,
}) => {
  const [previewImage, setPreviewImage] = useState<string>(currentImage);

  // Update preview when currentImage changes
  useEffect(() => {
    setPreviewImage(currentImage);
  }, [currentImage]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Preview the image
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      // Call the upload handler
      onImageUpload(file);
    }
  };

  const handleDelete = () => {
    setPreviewImage(defaultProfileImage);
    onImageDelete();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="position-fixed top-0 start-0 w-100 h-100"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1040,
        }}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className="position-fixed top-0 end-0 h-100 bg-white shadow-lg"
        style={{
          width: '100%',
          maxWidth: '400px',
          zIndex: 1050,
          transition: 'transform 0.3s ease-in-out',
        }}
      >
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center p-2 p-md-3 border-bottom">
          <h5 className="mb-0 fs-6 fs-md-5">Profile Picture</h5>
          <Button
            variant="link"
            className="text-dark p-0"
            onClick={onClose}
          >
            <X size={20} className="d-md-none" />
            <X size={24} className="d-none d-md-block" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-3 p-md-4" style={{ overflowY: 'auto', height: '100%' }}>
          {/* Current Image Preview */}
          <div className="text-center mb-4">
            <div
              className="mx-auto rounded-circle overflow-hidden"
              style={{
                width: 'min(200px, 60vw)',
                height: 'min(200px, 60vw)',
                maxWidth: '200px',
                maxHeight: '200px',
                border: '4px solid #e9ecef',
              }}
            >
              <img
                src={previewImage || defaultProfileImage}
                alt="Profile Preview"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            </div>
          </div>

          {/* Upload Button */}
          <div className="mb-3">
            <label htmlFor="profile-upload" className="w-100">
              <Button
                variant="primary"
                className="w-100 d-flex align-items-center justify-content-center py-2"
                style={{ gap: '0.5rem', fontSize: 'clamp(0.875rem, 2vw, 1rem)' }}
                as="span"
              >
                <Upload size={18} className="d-md-none" />
                <Upload size={20} className="d-none d-md-inline" />
                <span className="d-none d-sm-inline">Upload New Picture</span>
                <span className="d-sm-none">Upload</span>
              </Button>
            </label>
            <input
              id="profile-upload"
              type="file"
              accept="image/*"
              className="d-none"
              onChange={handleFileChange}
            />
          </div>

          {/* Delete Button */}
          {previewImage && previewImage !== defaultProfileImage && (
            <Button
              variant="danger"
              className="w-100 d-flex align-items-center justify-content-center py-2"
              style={{ gap: '0.5rem', fontSize: 'clamp(0.875rem, 2vw, 1rem)' }}
              onClick={handleDelete}
            >
              <Trash2 size={18} className="d-md-none" />
              <Trash2 size={20} className="d-none d-md-inline" />
              <span className="d-none d-sm-inline">Reset to Default</span>
              <span className="d-sm-none">Reset</span>
            </Button>
          )}

          {/* Info Text */}
          <div className="mt-3 mt-md-4">
            <small className="text-muted" style={{ fontSize: 'clamp(0.75rem, 1.5vw, 0.875rem)' }}>
              <strong>Supported formats:</strong> JPG, PNG, GIF
              <br />
              <strong>Max size:</strong> 5MB
              <br />
              <strong>Recommended:</strong> Square image, at least 200x200px
            </small>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfileUploadSidebar;
