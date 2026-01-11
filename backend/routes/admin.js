import express from 'express';
import { protect, adminOnly } from '../middleware/auth.js';
import User from '../models/User.js';
import Profile from '../models/Profile.js';
import Subscription from '../models/Subscription.js';
import Match from '../models/Match.js';
import Message from '../models/Message.js';
import AdminAction from '../models/Admin.js';

const router = express.Router();

// All admin routes require admin authentication
router.use(protect);
router.use(adminOnly);

// @route   GET /api/admin/stats
// @desc    Get platform statistics
// @access  Private (admin)
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalProfiles = await Profile.countDocuments();
    const approvedProfiles = await Profile.countDocuments({ isApproved: true });
    const pendingProfiles = await Profile.countDocuments({ approvalStatus: 'pending' });
    
    const totalSubscriptions = await Subscription.countDocuments({ status: 'active' });
    const basicSubs = await Subscription.countDocuments({ plan: 'basic', status: 'active' });
    const standardSubs = await Subscription.countDocuments({ plan: 'standard', status: 'active' });
    const premiumSubs = await Subscription.countDocuments({ plan: 'premium', status: 'active' });
    
    const totalMatches = await Match.countDocuments({ isMatch: true });
    const totalMessages = await Message.countDocuments();

    // Get email list
    const users = await User.find({ role: 'user' }).select('email');
    const emailList = users.map(u => u.email);

    res.json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          withProfiles: totalProfiles,
          approved: approvedProfiles,
          pending: pendingProfiles
        },
        subscriptions: {
          total: totalSubscriptions,
          basic: basicSubs,
          standard: standardSubs,
          premium: premiumSubs
        },
        engagement: {
          matches: totalMatches,
          messages: totalMessages
        },
        emailList
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics'
    });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private (admin)
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 50, search = '' } = req.query;

    const query = { role: 'user' };
    if (search) {
      query.email = { $regex: search, $options: 'i' };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    // Get profiles and subscriptions for each user
    const usersWithDetails = await Promise.all(
      users.map(async (user) => {
        const profile = await Profile.findOne({ user: user._id });
        const subscription = await Subscription.findOne({ user: user._id });

        return {
          ...user.toObject(),
          hasProfile: !!profile,
          profileApproved: profile?.isApproved || false,
          subscription: subscription ? {
            plan: subscription.plan,
            status: subscription.status
          } : null
        };
      })
    );

    res.json({
      success: true,
      users: usersWithDetails,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users'
    });
  }
});

// @route   DELETE /api/admin/users/:userId
// @desc    Delete a user
// @access  Private (admin)
router.delete('/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (userId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Delete related data
    await Profile.deleteOne({ user: userId });
    await Subscription.deleteOne({ user: userId });
    await Match.deleteMany({
      $or: [{ user1: userId }, { user2: userId }]
    });
    await Message.deleteMany({
      $or: [{ sender: userId }, { recipient: userId }]
    });

    // Delete user
    await User.deleteOne({ _id: userId });

    // Log admin action
    await AdminAction.create({
      admin: req.user._id,
      action: 'user_deleted',
      targetUser: userId,
      details: { email: user.email },
      ipAddress: req.ip
    });

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting user'
    });
  }
});

// @route   POST /api/admin/users/:userId/suspend
// @desc    Suspend or unsuspend a user
// @access  Private (admin)
router.post('/users/:userId/suspend', async (req, res) => {
  try {
    const { userId } = req.params;
    const { suspend, reason } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isSuspended = suspend || false;
    user.suspensionReason = suspend ? (reason || 'Violation of terms') : null;
    await user.save();

    // Log admin action
    await AdminAction.create({
      admin: req.user._id,
      action: suspend ? 'user_suspended' : 'user_unsuspended',
      targetUser: userId,
      details: { reason: user.suspensionReason },
      ipAddress: req.ip
    });

    res.json({
      success: true,
      message: `User ${suspend ? 'suspended' : 'unsuspended'} successfully`,
      user
    });
  } catch (error) {
    console.error('Suspend user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error suspending user'
    });
  }
});

// @route   POST /api/admin/profiles/:profileId/approve
// @desc    Approve or reject a profile
// @access  Private (admin)
router.post('/profiles/:profileId/approve', async (req, res) => {
  try {
    const { profileId } = req.params;
    const { approved, reason } = req.body;

    const profile = await Profile.findById(profileId);
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    if (approved) {
      profile.isApproved = true;
      profile.approvalStatus = 'approved';
      profile.rejectionReason = null;
    } else {
      profile.isApproved = false;
      profile.approvalStatus = 'rejected';
      profile.rejectionReason = reason || 'Profile did not meet guidelines';
    }

    await profile.save();

    // Log admin action
    await AdminAction.create({
      admin: req.user._id,
      action: approved ? 'profile_approved' : 'profile_rejected',
      targetUser: profile.user,
      details: { reason: profile.rejectionReason },
      ipAddress: req.ip
    });

    res.json({
      success: true,
      profile
    });
  } catch (error) {
    console.error('Approve profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error approving profile'
    });
  }
});

export default router;

