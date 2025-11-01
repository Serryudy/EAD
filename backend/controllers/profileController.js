const { Employee, Customer } = require('../models/User');
const cloudinary = require('../config/cloudinary');

// Upload profile picture
exports.uploadProfilePicture = async (req, res) => {
  try {
    console.log('📸 Upload controller started');
    console.log('   File received:', req.file ? 'Yes' : 'No');
    console.log('   User:', req.user);
    
    if (!req.file) {
      console.log('❌ No file in request');
      return res.status(400).json({
        success: false,
        message: 'No file uploaded. Please select an image file.'
      });
    }

    console.log('📄 File details:', {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path
    });

    const userId = req.user.id; // From auth middleware
    const userRole = req.user.role; // From auth middleware

    console.log('👤 Processing upload for:', {
      userId,
      userRole
    });

    // Get the uploaded file info from Cloudinary
    const profilePictureUrl = req.file.path;
    const publicId = req.file.filename;

    console.log('☁️  Cloudinary upload successful:', publicId);

    // Find user based on role
    let user = null;
    if (userRole === 'employee') {
      user = await Employee.findById(userId);
    } else if (userRole === 'customer') {
      user = await Customer.findById(userId);
    }

    if (!user) {
      console.log('❌ User not found, deleting uploaded image');
      // Delete the newly uploaded image since user not found
      await cloudinary.uploader.destroy(publicId);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log(' User found, updating profile picture');

    // Delete old profile picture from Cloudinary if exists
    if (user.profilePicture && user.profilePicturePublicId) {
      try {
        console.log('  Deleting old profile picture:', user.profilePicturePublicId);
        await cloudinary.uploader.destroy(user.profilePicturePublicId);
      } catch (error) {
        console.error('Error deleting old profile picture:', error);
      }
    }

    // Update user with new profile picture
    user.profilePicture = profilePictureUrl;
    user.profilePicturePublicId = publicId;
    await user.save();

    console.log('✅ Profile picture updated successfully');
    console.log('🖼️  NEW PROFILE PICTURE URL:', profilePictureUrl);
    console.log('📦 Response data:', {
      success: true,
      profilePicture: profilePictureUrl
    });

    res.status(200).json({
      success: true,
      message: 'Profile picture uploaded successfully',
      data: {
        profilePicture: profilePictureUrl
      }
    });
  } catch (error) {
    console.error('❌ Upload profile picture error:', error);
    
    // Delete uploaded file if there was an error
    if (req.file && req.file.filename) {
      try {
        await cloudinary.uploader.destroy(req.file.filename);
      } catch (deleteError) {
        console.error('Error deleting uploaded file:', deleteError);
      }
    }

    res.status(500).json({
      success: false,
      message: 'Error uploading profile picture',
      error: error.message
    });
  }
};

// Delete profile picture
exports.deleteProfilePicture = async (req, res) => {
  try {
    console.log('🗑️  Delete profile picture started');
    
    const userId = req.user.id; // From auth middleware
    const userRole = req.user.role; // From auth middleware

    console.log('   User ID:', userId);
    console.log('   User Role:', userRole);

    // Find user based on role
    let user = null;
    if (userRole === 'employee') {
      user = await Employee.findById(userId);
    } else if (userRole === 'customer') {
      user = await Customer.findById(userId);
    }

    if (!user) {
      console.log('❌ User not found');
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user has a profile picture
    if (!user.profilePicture || !user.profilePicturePublicId) {
      console.log('⚠️  No profile picture to delete');
      return res.status(400).json({
        success: false,
        message: 'No profile picture to delete'
      });
    }

    console.log('🗑️  Deleting from Cloudinary:', user.profilePicturePublicId);

    // Delete from Cloudinary
    try {
      await cloudinary.uploader.destroy(user.profilePicturePublicId);
      console.log('✅ Deleted from Cloudinary');
    } catch (error) {
      console.error('Error deleting from Cloudinary:', error);
    }

    // Remove from database
    user.profilePicture = null;
    user.profilePicturePublicId = null;
    await user.save();

    console.log('✅ Profile picture deleted from database');

    res.status(200).json({
      success: true,
      message: 'Profile picture deleted successfully'
    });
  } catch (error) {
    console.error('❌ Delete profile picture error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting profile picture',
      error: error.message
    });
  }
};

// Get profile picture
exports.getProfilePicture = async (req, res) => {
  try {
    console.log('🖼️  Get profile picture started');
    
    const userId = req.user.id; // From auth middleware
    const userRole = req.user.role; // From auth middleware

    console.log('   User ID:', userId);
    console.log('   User Role:', userRole);

    // Find user based on role
    let user = null;
    if (userRole === 'employee') {
      user = await Employee.findById(userId).select('profilePicture');
    } else if (userRole === 'customer') {
      user = await Customer.findById(userId).select('profilePicture');
    }

    if (!user) {
      console.log('❌ User not found');
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('✅ Profile picture retrieved:', user.profilePicture ? 'Yes' : 'No');

    res.status(200).json({
      success: true,
      data: {
        profilePicture: user.profilePicture || null
      }
    });
  } catch (error) {
    console.error('❌ Get profile picture error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile picture',
      error: error.message
    });
  }
};
