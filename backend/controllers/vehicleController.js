const Vehicle = require('../models/Vehicle');
const Appointment = require('../models/Appointment');

// Create a new vehicle
exports.createVehicle = async (req, res) => {
  try {
    console.log('\n🚗 === VEHICLE CREATION REQUEST ===');
    console.log('📋 Request body:', JSON.stringify(req.body, null, 2));
    console.log('👤 Authenticated user:', req.user ? {
      id: req.user._id,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      name: req.user.name,
      role: req.user.role
    } : 'NO USER');

    const {
      licensePlate,
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
    const ownerId = req.user?._id || req.body.ownerId;
    const ownerName = req.user ? `${req.user.firstName} ${req.user.lastName}` : req.body.ownerName;

    console.log('🚗 Creating vehicle for user:', {
      userId: req.user?._id?.toString(),
      userName: ownerName,
      licensePlate: licensePlate
    });

    // Check if vehicle already exists
    const existingVehicle = await Vehicle.findOne({ 
      licensePlate: licensePlate.toUpperCase() 
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
      licensePlate: licensePlate.toUpperCase(),
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

    console.log('✅ Vehicle created successfully:', {
      _id: vehicle._id.toString(),
      ownerId: vehicle.ownerId.toString(),
      licensePlate: vehicle.licensePlate
    });

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
    console.log('\n🚗 === GET VEHICLES REQUEST ===');
    console.log('👤 User:', req.user ? {
      _id: req.user._id,
      role: req.user.role,
      firstName: req.user.firstName
    } : 'NO USER');

    const { 
      ownerId, 
      isActive, 
      page = 1, 
      limit = 10,
      search 
    } = req.query;

    const query = {};
    
    // If user is a customer, only show their vehicles
    if (req.user && req.user.role === 'customer') {
      query.ownerId = req.user._id;
      console.log('🔍 Customer querying vehicles for ownerId:', req.user._id.toString());
    } else if (ownerId) {
      // Employees can filter by ownerId
      query.ownerId = ownerId;
    }
    
    // Only filter by isActive if explicitly provided
    if (isActive !== undefined) {
      query.isActive = isActive === 'true' || isActive === true;
    }
    
    if (search) {
      query.$or = [
        { licensePlate: new RegExp(search, 'i') },
        { make: new RegExp(search, 'i') },
        { model: new RegExp(search, 'i') }
      ];
    }

    console.log('🔍 Vehicle query:', JSON.stringify(query));

    const skip = (page - 1) * limit;

    const vehicles = await Vehicle.find(query)
      .populate('ownerId', 'name email mobile')
      .populate({
        path: 'serviceHistory',
        options: { limit: 5, sort: { createdAt: -1 } }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Vehicle.countDocuments(query);

    console.log('✅ Found vehicles:', total, '| Returned:', vehicles.length);
    if (vehicles.length > 0) {
      console.log('   First vehicle:', {
        licensePlate: vehicles[0].licensePlate,
        ownerId: vehicles[0].ownerId?.toString(),
        make: vehicles[0].make
      });
    }

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
      licensePlate: req.params.licensePlate.toUpperCase() 
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

    if (updateData.licensePlate) {
      updateData.licensePlate = updateData.licensePlate.toUpperCase();
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
