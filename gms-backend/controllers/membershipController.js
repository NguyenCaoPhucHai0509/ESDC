const Membership = require('../models/Membership');

// @desc    Get all memberships
// @route   GET /api/memberships
// @access  Public
exports.getMemberships = async (req, res, next) => {
  try {
    const memberships = await Membership.find({ isActive: true });

    res.status(200).json({
      success: true,
      count: memberships.length,
      data: memberships
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single membership
// @route   GET /api/memberships/:id
// @access  Public
exports.getMembership = async (req, res, next) => {
  try {
    const membership = await Membership.findById(req.params.id);

    if (!membership) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy gói tập'
      });
    }

    res.status(200).json({
      success: true,
      data: membership
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new membership
// @route   POST /api/memberships
// @access  Private/Admin
exports.createMembership = async (req, res, next) => {
  try {
    const membership = await Membership.create(req.body);

    res.status(201).json({
      success: true,
      data: membership
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update membership
// @route   PUT /api/memberships/:id
// @access  Private/Admin
exports.updateMembership = async (req, res, next) => {
  try {
    const membership = await Membership.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!membership) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy gói tập'
      });
    }

    res.status(200).json({
      success: true,
      data: membership
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete membership
// @route   DELETE /api/memberships/:id
// @access  Private/Admin
exports.deleteMembership = async (req, res, next) => {
  try {
    const membership = await Membership.findById(req.params.id);

    if (!membership) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy gói tập'
      });
    }

    await membership.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};