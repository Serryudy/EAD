const Service = require('../models/Service');

// Create a new service
exports.createService = async (req, res) => {
  try {
    const {
      name,
      code,
      category,
      description,
      shortDescription,
      estimatedDuration,
      basePrice,
      priceRange,
      steps,
      requiredParts,
      requiredTools,
      skillLevel,
      isPopular,
      tags
    } = req.body;

    // Check if service with same code exists
    const existingService = await Service.findOne({ 
      code: code.toUpperCase() 
    });

    if (existingService) {
      return res.status(400).json({
        success: false,
        message: 'Service with this code already exists'
      });
    }

    const service = new Service({
      name,
      code: code.toUpperCase(),
      category,
      description,
      shortDescription,
      estimatedDuration,
      basePrice,
      priceRange,
      steps,
      requiredParts,
      requiredTools,
      skillLevel,
      isPopular,
      tags
    });

    await service.save();

    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      data: service
    });
  } catch (error) {
    console.error('Error creating service:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create service',
      error: error.message
    });
  }
};

// Get all services
exports.getAllServices = async (req, res) => {
  try {
    const {
      category,
      isActive,
      isPopular,
      search,
      page = 1,
      limit = 10,
      sortBy = 'name',
      sortOrder = 'asc'
    } = req.query;

    console.log('📋 getAllServices called with query params:', req.query);

    const query = {};

    if (category) query.category = category;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (isPopular !== undefined) query.isPopular = isPopular === 'true';
    
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { code: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') }
      ];
    }

    console.log('🔍 Query object:', JSON.stringify(query));

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    console.log('⏭️ Skip:', skip, 'Limit:', limit, 'Sort:', sort);

    const services = await Service.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    console.log('📊 Services found:', services.length);

    const total = await Service.countDocuments(query);

    console.log('📈 Total count:', total);

    res.json({
      success: true,
      data: services,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch services',
      error: error.message
    });
  }
};

// Get service by ID
exports.getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    res.json({
      success: true,
      data: service
    });
  } catch (error) {
    console.error('Error fetching service:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch service',
      error: error.message
    });
  }
};

// Get service by code
exports.getServiceByCode = async (req, res) => {
  try {
    const service = await Service.findOne({ 
      code: req.params.code.toUpperCase() 
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    res.json({
      success: true,
      data: service
    });
  } catch (error) {
    console.error('Error fetching service:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch service',
      error: error.message
    });
  }
};

// Update service
exports.updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Don't allow updating certain fields
    delete updateData.timesBooked;
    delete updateData.createdAt;

    if (updateData.code) {
      updateData.code = updateData.code.toUpperCase();
    }

    const service = await Service.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    res.json({
      success: true,
      message: 'Service updated successfully',
      data: service
    });
  } catch (error) {
    console.error('Error updating service:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update service',
      error: error.message
    });
  }
};

// Delete service (soft delete)
exports.deleteService = async (req, res) => {
  try {
    const { id } = req.params;

    const service = await Service.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    res.json({
      success: true,
      message: 'Service deleted successfully',
      data: service
    });
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete service',
      error: error.message
    });
  }
};

// Increment service booking count
exports.incrementBookingCount = async (req, res) => {
  try {
    const { id } = req.params;

    const service = await Service.findByIdAndUpdate(
      id,
      { $inc: { timesBooked: 1 } },
      { new: true }
    );

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    res.json({
      success: true,
      message: 'Service booking count updated',
      data: service
    });
  } catch (error) {
    console.error('Error updating service:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update service',
      error: error.message
    });
  }
};

// Get popular services
exports.getPopularServices = async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    const services = await Service.find({ 
      isActive: true,
      isPopular: true 
    })
      .sort({ timesBooked: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: services
    });
  } catch (error) {
    console.error('Error fetching popular services:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch popular services',
      error: error.message
    });
  }
};

// Get services by category
exports.getServicesByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    const services = await Service.find({ 
      category,
      isActive: true 
    }).sort({ name: 1 });

    res.json({
      success: true,
      data: services
    });
  } catch (error) {
    console.error('Error fetching services by category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch services',
      error: error.message
    });
  }
};
