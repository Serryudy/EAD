const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth');
const upload = require('../middlewares/upload');
const {
  uploadProfilePicture,
  deleteProfilePicture,
  getProfilePicture
} = require('../controllers/profileController');

// @route   POST /api/profile/upload
// @desc    Upload profile picture
// @access  Private
router.post('/upload', authenticateToken, (req, res, next) => {
  console.log(' Upload request authenticated');
  console.log('   User ID:', req.user.id);
  console.log('   User Role:', req.user.role);
  next();
}, upload.single('profilePicture'), (err, req, res, next) => {
  // Handle multer errors
  if (err) {
    console.error('❌ Multer error:', err.message);
    return res.status(400).json({
      success: false,
      message: err.message || 'Error uploading file'
    });
  }
  next();
}, uploadProfilePicture);

// @route   DELETE /api/profile/delete
// @desc    Delete profile picture
// @access  Private
router.delete('/delete', authenticateToken, deleteProfilePicture);

// @route   GET /api/profile/picture
// @desc    Get profile picture
// @access  Private
router.get('/picture', authenticateToken, getProfilePicture);

module.exports = router;
