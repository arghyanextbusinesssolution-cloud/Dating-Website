import express from 'express';
import { protect } from '../middleware/auth.js';
import { requireSubscription } from '../middleware/subscription.js';
import { getSuggestedMatches, createOrUpdateMatch } from '../services/matchingService.js';
import Match from '../models/Match.js';
import Profile from '../models/Profile.js';
import Engagement from '../models/Engagement.js';
import Notification from '../models/Notification.js';
import Subscription from '../models/Subscription.js';
import RejectedUser from '../models/RejectedUser.js';

const router = express.Router();

// @route   GET /api/matches/suggested
// @desc    Get suggested matches
// @access  Private (requires subscription)
router.get('/suggested', protect, requireSubscription, async (req, res) => {
  try {
    const userId = req.user._id;
    const { limit = 20 } = req.query;

    // Get suggested matches using matching algorithm
    const suggestions = await getSuggestedMatches(userId, parseInt(limit));

    console.log(`✅ [BACKEND] Found ${suggestions.length} suggested matches for user ${userId}`);

    res.json({
      success: true,
      matches: suggestions
    });
  } catch (error) {
    console.error('Get suggested matches error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching suggested matches'
    });
  }
});

// @route   POST /api/matches/like/:userId
// @desc    Like a user
// @access  Private (requires subscription)
router.post('/like/:userId', protect, requireSubscription, async (req, res) => {
  try {
    // Ensure userId is extracted properly (handle both _id and id)
    const userId = req.user?._id || req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User ID not found'
      });
    }
    
    // Convert to string to ensure consistency
    const userIdStr = userId.toString ? userId.toString() : String(userId);
    
    // Ensure likedUserId is a string (handle any type)
    let likedUserId = String(req.params.userId);
    
    // Safety check: if the parameter looks like an object string representation, try to extract the ID
    // This handles cases where malformed data somehow gets through
    if (likedUserId.includes('ObjectId(') || likedUserId.includes('_id:')) {
      // Try to extract ObjectId from string like "{ _id: new ObjectId('...'), email: '...' }"
      const objectIdMatch = likedUserId.match(/ObjectId\(['"]([^'"]+)['"]\)/);
      if (objectIdMatch && objectIdMatch[1]) {
        likedUserId = objectIdMatch[1];
      } else {
        // Try simpler pattern
        const idMatch = likedUserId.match(/([0-9a-fA-F]{24})/);
        if (idMatch && idMatch[1]) {
          likedUserId = idMatch[1];
        }
      }
    }

    if (userIdStr === likedUserId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot like yourself'
      });
    }

    // Check daily like limit
    let engagement = await Engagement.findOne({ user: userIdStr });
    if (!engagement) {
      engagement = new Engagement({ user: userIdStr });
    }

    // Reset daily limits if needed
    engagement.resetDailyLimits();

    // Check subscription for limits
    const subscription = req.subscription;
    if (subscription.plan === 'basic') {
      // Basic plan has limited likes
      if (engagement.dailyLikesUsed >= engagement.dailyLikesLimit) {
        return res.status(403).json({
          success: false,
          message: 'Daily like limit reached. Upgrade to send more likes.',
          requiresUpgrade: true
        });
      }
    }

    // Create or update match (pass strings)
    const match = await createOrUpdateMatch(userIdStr, likedUserId, true, false);

    // Update engagement
    engagement.likesSent += 1;
    engagement.dailyLikesUsed += 1;
    engagement.lastLike = new Date();
    engagement.calculateEngagementScore();
    await engagement.save();

    // Check if it's a mutual match
    let isMutualMatch = false;
    if (match.isMatch) {
      isMutualMatch = true;

      // Create notifications for both users
      await Notification.create({
        user: userIdStr,
        type: 'new_match',
        title: 'New Match!',
        message: 'You have a new match!',
        relatedUser: likedUserId,
        relatedMatch: match._id,
        actionUrl: `/messages/${likedUserId}`
      });

      await Notification.create({
        user: likedUserId,
        type: 'new_match',
        title: 'New Match!',
        message: 'You have a new match!',
        relatedUser: userIdStr,
        relatedMatch: match._id,
        actionUrl: `/messages/${userIdStr}`
      });

      // Emit socket notification for real-time match updates
      const io = req.app.get('io');
      if (io) {
        // Notify both users about the mutual match
        io.to(`user:${userIdStr}`).emit('new_match', {
          matchId: match._id.toString(),
          userId: likedUserId,
          message: '🎉 It\'s a match! You can now message each other.',
          actionUrl: `/messages/${likedUserId}`
        });

        io.to(`user:${likedUserId}`).emit('new_match', {
          matchId: match._id.toString(),
          userId: userIdStr,
          message: '🎉 It\'s a match! You can now message each other.',
          actionUrl: `/messages/${userIdStr}`
        });
      }
    } else {
      // Create notification for liked user
      await Notification.create({
        user: likedUserId,
        type: 'new_like',
        title: 'Someone liked you',
        message: 'Someone liked your profile',
        relatedUser: userIdStr,
        actionUrl: `/matches/likes`
      });

      // Emit socket notification for like (optional - user might want to see real-time likes)
      const io = req.app.get('io');
      if (io) {
        io.to(`user:${likedUserId}`).emit('new_like', {
          userId: userIdStr,
          message: 'Someone liked your profile'
        });
      }
    }

    res.json({
      success: true,
      match,
      isMutualMatch
    });
  } catch (error) {
    console.error('Like user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error liking user'
    });
  }
});

// @route   GET /api/matches/my-matches
// @desc    Get user's matches (mutual likes)
// @access  Private (requires subscription)
router.get('/my-matches', protect, requireSubscription, async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const userIdStr = userId?.toString ? userId.toString() : String(userId);

    // Find all mutual matches
    const matches = await Match.find({
      $or: [{ user1: userIdStr }, { user2: userIdStr }],
      isMatch: true
    })
      .populate('user1', 'email')
      .populate('user2', 'email')
      .sort({ matchedAt: -1 });

    // Get profile data for matches
    const matchesWithProfiles = await Promise.all(
      matches.map(async (match) => {
        const otherUserId = match.user1.toString() === userIdStr 
          ? match.user2 
          : match.user1;

        const profile = await Profile.findOne({ user: otherUserId });

        return {
          matchId: match._id,
          userId: otherUserId,
          profile,
          matchScore: match.matchScore,
          matchLabels: match.matchLabels,
          compatibility: match.compatibility,
          matchedAt: match.matchedAt,
          connectionRitualStarted: match.connectionRitualStarted,
          connectionRitualDay: match.connectionRitualDay
        };
      })
    );

    res.json({
      success: true,
      matches: matchesWithProfiles
    });
  } catch (error) {
    console.error('Get matches error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching matches'
    });
  }
});

// @route   GET /api/matches/likes
// @desc    Get users who liked current user
// @access  Private (requires standard or premium)
router.get('/likes', protect, requireSubscription, async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const userIdStr = userId?.toString ? userId.toString() : String(userId);
    const subscription = req.subscription;

    // Check if plan allows seeing likes
    if (!subscription.features.seeLikes) {
      return res.status(403).json({
        success: false,
        message: 'Standard or Premium plan required to see who liked you',
        requiresUpgrade: true
      });
    }

    // Find matches where other user liked but current user hasn't
    const matches = await Match.find({
      $or: [
        { user1: userIdStr, user2Liked: true, user1Liked: false },
        { user2: userIdStr, user1Liked: true, user2Liked: false }
      ]
    })
      .populate('user1', 'email')
      .populate('user2', 'email')
      .sort({ createdAt: -1 });

    // Get profiles
    const likesWithProfiles = await Promise.all(
      matches.map(async (match) => {
        // Extract IDs from populated objects
        const user1Id = match.user1._id ? match.user1._id.toString() : match.user1.toString();
        const user2Id = match.user2._id ? match.user2._id.toString() : match.user2.toString();
        
        // Determine which is the other user (the one who liked us)
        const otherUserId = user1Id === userIdStr ? user2Id : user1Id;

        const profile = await Profile.findOne({ user: otherUserId });

        return {
          userId: otherUserId, // Already a string ID
          profile,
          likedAt: match.createdAt
        };
      })
    );

    res.json({
      success: true,
      likes: likesWithProfiles
    });
  } catch (error) {
    console.error('Get likes error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching likes'
    });
  }
});

// @route   POST /api/matches/reject/:userId
// @desc    Reject a user (hide for 7 days)
// @access  Private (requires subscription)
router.post('/reject/:userId', protect, requireSubscription, async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const userIdStr = userId?.toString ? userId.toString() : String(userId);
    let rejectedUserId = String(req.params.userId);
    
    if (userIdStr === rejectedUserId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot reject yourself'
      });
    }
    
    // Calculate expiration date (7 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    
    // Create or update rejection record
    let rejection = await RejectedUser.findOne({
      user: userIdStr,
      rejectedUser: rejectedUserId
    });
    
    if (rejection) {
      // Update existing rejection
      rejection.rejectedAt = new Date();
      rejection.expiresAt = expiresAt;
      rejection.isActive = true;
    } else {
      // Create new rejection
      rejection = new RejectedUser({
        user: userIdStr,
        rejectedUser: rejectedUserId,
        rejectedAt: new Date(),
        expiresAt: expiresAt,
        isActive: true
      });
    }
    
    await rejection.save();
    
    res.json({
      success: true,
      message: 'User rejected. They will not appear in your matches for 7 days.',
      rejection
    });
  } catch (error) {
    console.error('Reject user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error rejecting user'
    });
  }
});

export default router;

