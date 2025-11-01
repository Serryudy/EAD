const Vehicle = require('../models/Vehicle');
const Appointment = require('../models/Appointment');

// Create a new vehicle
exports.createVehicle = async (req, res) => {
  try {
    const {
      vehicleNumber,
      make,
      model,
      year,
      type,
      color,
      engineType,
      transmission,
      mileage,
      vin,
      notes
    } = req.body;

    // Get owner ID from authenticated user
    const ownerId = req.user?.id || req.body.ownerId;
    const ownerName = req.user?.name || req.body.ownerName;

    // Check if vehicle already exists
    const existingVehicle = await Vehicle.findOne({ 
      vehicleNumber: vehicleNumber.toUpperCase() 
    });

    if (existingVehicle) {
      return res.status(400).json({
        success: false,
        message: 'Vehicle with this number already exists'
      });
    }

    const vehicle = new Vehicle({
      ownerId,
      ownerName,
      vehicleNumber: vehicleNumber.toUpperCase(),
      make,
      model,
      year,
      type,
      color,
      engineType,
      transmission,
      mileage,
      vin,
      notes
    });

    await vehicle.save();

    res.status(201).json({
      success: true,
      message: 'Vehicle created successfully',
      data: vehicle
    });
  } catch (error) {
    console.error('Error creating vehicle:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create vehicle',
      error: error.message
    });
  }
};

// Get all vehicles
exports.getAllVehicles = async (req, res) => {
  try {
    const { 
      ownerId, 
      isActive = true, 
      page = 1, 
      limit = 10,
      search 
    } = req.query;

    const query = {};
    if (ownerId) query.ownerId = ownerId;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    
    if (search) {
      query.$or = [
        { vehicleNumber: new RegExp(search, 'i') },
        { make: new RegExp(search, 'i') },
        { model: new RegExp(search, 'i') }
      ];
    }

    const skip = (page - 1) * limit;

    const vehicles = await Vehicle.find(query)
      .populate('ownerId', 'name email phone')
      .populate({
        path: 'serviceHistory',
        options: { limit: 5, sort: { createdAt: -1 } }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Vehicle.countDocuments(query);

    res.json({
      success: true,
      data: vehicles,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch vehicles',
      error: error.message
    });
  }
};

// Get vehicle by ID
exports.getVehicleById = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id)
      .populate('ownerId', 'name email phone')
      .populate('serviceHistory');

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    res.json({
      success: true,
      data: vehicle
    });
  } catch (error) {
    console.error('Error fetching vehicle:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch vehicle',
      error: error.message
    });
  }
};

// Get vehicle by vehicle number
exports.getVehicleByNumber = async (req, res) => {
  try {
    const vehicle = await Vehicle.findOne({ 
      vehicleNumber: req.params.vehicleNumber.toUpperCase() 
    })
      .populate('ownerId', 'name email phone')
      .populate('serviceHistory');

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    res.json({
      success: true,
      data: vehicle
    });
  } catch (error) {
    console.error('Error fetching vehicle:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch vehicle',
      error: error.message
    });
  }
};

// Update vehicle
exports.updateVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Don't allow updating certain fields
    delete updateData.ownerId;
    delete updateData.serviceHistory;
    delete updateData.createdAt;

    if (updateData.vehicleNumber) {
      updateData.vehicleNumber = updateData.vehicleNumber.toUpperCase();
    }

    const vehicle = await Vehicle.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    res.json({
      success: true,
      message: 'Vehicle updated successfully',
      data: vehicle
    });
  } catch (error) {
    console.error('Error updating vehicle:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update vehicle',
      error: error.message
    });
  }
};

// Delete vehicle (soft delete)
exports.deleteVehicle = async (req, res) => {
  try {
    const { id } = req.params;

    const vehicle = await Vehicle.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    res.json({
      success: true,
      message: 'Vehicle deleted successfully',
      data: vehicle
    });
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete vehicle',
      error: error.message
    });
  }
};

// Get vehicle service history
exports.getVehicleServiceHistory = async (req, res) => {
  try {
    const { id } = req.params;

    const vehicle = await Vehicle.findById(id).populate({
      path: 'serviceHistory',
      options: { sort: { createdAt: -1 } },
      populate: { path: 'assignedEmployee', select: 'name email' }
    });

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    res.json({
      success: true,
      data: vehicle.serviceHistory
    });
  } catch (error) {
    console.error('Error fetching service history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch service history',
      error: error.message
    });
  }
};
