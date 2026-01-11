import mongoose from 'mongoose';
import Profile from '../models/Profile.js';
import Match from '../models/Match.js';
import Engagement from '../models/Engagement.js';
import Subscription from '../models/Subscription.js';
import RejectedUser from '../models/RejectedUser.js';

/**
 * Matching Algorithm Service
 * 
 * This is like a smart friend who helps you find people you'd get along with.
 * It gives points when two people are similar. The more points, the better the match.
 * 
 * We look at:
 * - Age (are they in each other's preferred range?)
 * - Gender preference (do they match?)
 * - Distance (how close are they?)
 * - Spiritual practices (do they share beliefs?)
 * - Life values (what matters to them?)
 * - Relationship goals (do they want the same thing?)
 * - Lifestyle (do they live similarly?)
 * - Activity level (are they both active or both chill?)
 */

// Calculate distance between two coordinates (Haversine formula)
// Like measuring how far two dots are on a map
function calculateDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return Infinity;
  
  const R = 3959; // Earth radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Calculate age compatibility score
// Like checking if two people are in the same life stage
function calculateAgeScore(profile1, profile2) {
  const age1 = profile1.age;
  const age2 = profile2.age;
  
  // Check if age2 is in profile1's preferred range
  const inRange1 = age2 >= profile1.ageRange.min && age2 <= profile1.ageRange.max;
  // Check if age1 is in profile2's preferred range
  const inRange2 = age1 >= profile2.ageRange.min && age1 <= profile2.ageRange.max;
  
  if (!inRange1 || !inRange2) return 0;
  
  // Closer ages = higher score
  const ageDiff = Math.abs(age1 - age2);
  if (ageDiff === 0) return 100;
  if (ageDiff <= 2) return 90;
  if (ageDiff <= 5) return 75;
  if (ageDiff <= 10) return 60;
  return 40;
}

// Calculate gender preference compatibility
// Like checking if they're looking for each other's gender
function calculateGenderScore(profile1, profile2) {
  const pref1 = profile1.genderPreference || ['all'];
  const pref2 = profile2.genderPreference || ['all'];
  
  // If either has 'all', it's compatible
  if (pref1.includes('all') || pref2.includes('all')) return 100;
  
  // Check if profile2's gender is in profile1's preferences
  const match1 = pref1.includes(profile2.gender);
  // Check if profile1's gender is in profile2's preferences
  const match2 = pref2.includes(profile1.gender);
  
  if (match1 && match2) return 100;
  if (match1 || match2) return 50;
  return 0;
}

// Calculate distance score
// Like checking if they live close enough to meet
function calculateDistanceScore(profile1, profile2) {
  const coords1 = profile1.location?.coordinates;
  const coords2 = profile2.location?.coordinates;
  
  if (!coords1 || !coords2) return 50; // Neutral if no location
  
  const distance = calculateDistance(
    coords1.latitude,
    coords1.longitude,
    coords2.latitude,
    coords2.longitude
  );
  
  const maxDist1 = profile1.maxDistance || 50;
  const maxDist2 = profile2.maxDistance || 50;
  const maxDist = Math.min(maxDist1, maxDist2);
  
  if (distance > maxDist) return 0;
  
  // Closer = higher score
  if (distance <= 5) return 100;
  if (distance <= 10) return 90;
  if (distance <= 25) return 75;
  if (distance <= 50) return 60;
  return 40;
}

// Calculate spiritual alignment score
// Like checking if they share similar spiritual beliefs and practices
function calculateSpiritualScore(profile1, profile2) {
  let score = 0;
  let factors = 0;
  
  // Spiritual beliefs
  const beliefs1 = profile1.spiritualBeliefs || [];
  const beliefs2 = profile2.spiritualBeliefs || [];
  if (beliefs1.length > 0 && beliefs2.length > 0) {
    const commonBeliefs = beliefs1.filter(b => beliefs2.includes(b));
    if (commonBeliefs.length > 0) {
      score += (commonBeliefs.length / Math.max(beliefs1.length, beliefs2.length)) * 100;
    }
    factors++;
  }
  
  // Spiritual practices
  const practices1 = profile1.spiritualPractices || [];
  const practices2 = profile2.spiritualPractices || [];
  if (practices1.length > 0 && practices2.length > 0) {
    const commonPractices = practices1.filter(p => practices2.includes(p));
    if (commonPractices.length > 0) {
      score += (commonPractices.length / Math.max(practices1.length, practices2.length)) * 100;
    }
    factors++;
  }
  
  // Healing stage similarity
  if (profile1.healingStage && profile2.healingStage) {
    if (profile1.healingStage === profile2.healingStage) {
      score += 100;
    } else {
      // Similar stages get partial score
      const stages = ['beginning', 'in-progress', 'advanced', 'maintaining'];
      const idx1 = stages.indexOf(profile1.healingStage);
      const idx2 = stages.indexOf(profile2.healingStage);
      const diff = Math.abs(idx1 - idx2);
      score += (1 - diff / 3) * 100;
    }
    factors++;
  }
  
  return factors > 0 ? score / factors : 50; // Neutral if no data
}

// Calculate lifestyle compatibility
// Like checking if they'd enjoy doing things together
function calculateLifestyleScore(profile1, profile2) {
  let score = 50; // Start neutral
  
  const lifestyle1 = profile1.lifestyleChoices || [];
  const lifestyle2 = profile2.lifestyleChoices || [];
  
  if (lifestyle1.length > 0 && lifestyle2.length > 0) {
    const common = lifestyle1.filter(l => lifestyle2.includes(l));
    const total = new Set([...lifestyle1, ...lifestyle2]).size;
    score = (common.length / total) * 100;
  }
  
  // Activity level compatibility
  if (profile1.activityLevel && profile2.activityLevel) {
    if (profile1.activityLevel === profile2.activityLevel) {
      score += 20;
    }
  }
  
  return Math.min(score, 100);
}

// Calculate relationship intent compatibility
// Like checking if they want the same type of relationship
function calculateIntentScore(profile1, profile2) {
  const intent1 = profile1.relationshipIntention;
  const intent2 = profile2.relationshipIntention;
  
  if (!intent1 || !intent2) return 50;
  
  // Exact match = perfect
  if (intent1 === intent2) return 100;
  
  // Compatible intents
  const compatiblePairs = [
    ['conscious-partnership', 'marriage-oriented'],
    ['spiritual-friendship', 'healing-companion'],
    ['exploring', 'not-sure']
  ];
  
  for (const pair of compatiblePairs) {
    if ((pair.includes(intent1) && pair.includes(intent2))) {
      return 75;
    }
  }
  
  // Intent badges match
  const badges1 = profile1.intentBadges || [];
  const badges2 = profile2.intentBadges || [];
  if (badges1.length > 0 && badges2.length > 0) {
    const commonBadges = badges1.filter(b => badges2.includes(b));
    if (commonBadges.length > 0) return 80;
  }
  
  return 40; // Lower score for mismatched intents
}

// Main matching function
// This is the big function that puts it all together
export async function calculateMatchScore(userId1, userId2) {
  try {
    // Extract and validate ObjectIds
    const extractObjectId = (value) => {
      if (!value) {
        throw new Error('User ID is required');
      }
      
      // If it's already an ObjectId, return it
      if (value instanceof mongoose.Types.ObjectId) {
        return value;
      }
      
      // If it's an object with _id property, extract it
      if (typeof value === 'object' && value._id) {
        value = value._id;
      }
      
      // Convert to string for validation
      const idStr = value?.toString ? value.toString() : String(value);
      
      // Validate ObjectId format
      if (!mongoose.Types.ObjectId.isValid(idStr)) {
        throw new Error(`Invalid ObjectId: ${idStr}`);
      }
      
      // Return as ObjectId instance
      return new mongoose.Types.ObjectId(idStr);
    };
    
    const validId1 = extractObjectId(userId1);
    const validId2 = extractObjectId(userId2);
    
    // Get both profiles
    const profile1 = await Profile.findOne({ user: validId1 }).populate('user');
    const profile2 = await Profile.findOne({ user: validId2 }).populate('user');
    
    if (!profile1 || !profile2) {
      throw new Error('One or both profiles not found');
    }
    
    // Check if profiles are complete
    if (!profile1.isComplete || !profile2.isComplete) return null;
    
    // In production, require approval. In development/test, allow unapproved profiles
    const requireApproval = process.env.NODE_ENV === 'production' && process.env.ALLOW_UNAPPROVED_MATCHES !== 'true';
    if (requireApproval) {
      if (!profile1.isApproved || !profile2.isApproved) return null;
    }
    
    // Calculate individual scores (each out of 100)
    // These are like different tests - we'll combine them
    const ageScore = calculateAgeScore(profile1, profile2);
    const genderScore = calculateGenderScore(profile1, profile2);
    const distanceScore = calculateDistanceScore(profile1, profile2);
    const spiritualScore = calculateSpiritualScore(profile1, profile2);
    const lifestyleScore = calculateLifestyleScore(profile1, profile2);
    const intentScore = calculateIntentScore(profile1, profile2);
    
    // Weighted combination (like a report card with different subjects)
    // Spiritual alignment is most important for this platform
    const weights = {
      age: 0.10,        // 10% - important but not critical
      gender: 0.15,     // 15% - must match preferences
      distance: 0.15,   // 15% - closer is better
      spiritual: 0.30,  // 30% - MOST IMPORTANT for spiritual platform
      lifestyle: 0.15,  // 15% - helps compatibility
      intent: 0.15      // 15% - relationship goals matter
    };
    
    // If gender doesn't match, it's a dealbreaker
    if (genderScore === 0) {
      return null; // No match possible
    }
    
    // Calculate final score
    const totalScore = 
      ageScore * weights.age +
      genderScore * weights.gender +
      distanceScore * weights.distance +
      spiritualScore * weights.spiritual +
      lifestyleScore * weights.lifestyle +
      intentScore * weights.intent;
    
    // Determine match labels (why they matched)
    const labels = [];
    if (spiritualScore >= 80) {
      labels.push('aligned-in-spiritual-rhythm');
    }
    if (intentScore >= 80 && (profile1.lifePurpose || profile2.lifePurpose)) {
      labels.push('aligned-in-purpose');
    }
    if (lifestyleScore >= 75) {
      labels.push('similar-lifestyle');
    }
    if (intentScore >= 75) {
      labels.push('compatible-intent');
    }
    if (spiritualScore >= 70 && lifestyleScore >= 70) {
      labels.push('spiritual-synergy');
    }
    
    return {
      score: Math.round(totalScore),
      labels,
      breakdown: {
        spiritual: Math.round(spiritualScore),
        lifestyle: Math.round(lifestyleScore),
        intent: Math.round(intentScore),
        values: Math.round((spiritualScore + lifestyleScore) / 2)
      }
    };
  } catch (error) {
    console.error('Error calculating match score:', error);
    throw error;
  }
}

// Generate match explanation text
// Like explaining why two people are a good match
function generateMatchExplanation(score, labels, breakdown) {
  const explanations = [];
  
  if (score >= 85) {
    explanations.push('Exceptional spiritual alignment');
  } else if (score >= 70) {
    explanations.push('Strong spiritual connection');
  } else if (score >= 55) {
    explanations.push('Good compatibility potential');
  }
  
  if (breakdown.spiritual >= 80) {
    explanations.push('Deep spiritual resonance');
  }
  if (breakdown.intent >= 80) {
    explanations.push('Aligned relationship goals');
  }
  if (breakdown.lifestyle >= 75) {
    explanations.push('Compatible lifestyle choices');
  }
  
  if (labels.includes('aligned-in-spiritual-rhythm')) {
    explanations.push('Shared spiritual practices');
  }
  if (labels.includes('aligned-in-purpose')) {
    explanations.push('Similar life purpose');
  }
  
  return explanations.length > 0 
    ? explanations.join(' • ')
    : 'Potential connection based on compatibility';
}

// Get suggested matches for a user
// Like a friend suggesting people you might like
export async function getSuggestedMatches(userId, limit = 20) {
  try {
    // Ensure userId is a string for queries
    const userIdStr = userId?.toString ? userId.toString() : String(userId);
    
    const userProfile = await Profile.findOne({ user: userIdStr });
    if (!userProfile || !userProfile.isComplete) {
      return [];
    }
    
    // In production, require user's profile to be approved
    const requireApproval = process.env.NODE_ENV === 'production' && process.env.ALLOW_UNAPPROVED_MATCHES !== 'true';
    if (requireApproval && !userProfile.isApproved) {
      return [];
    }
    
    // Get user's subscription for priority ranking
    const subscription = await Subscription.findOne({ user: userIdStr, status: 'active' });
    const isPremium = subscription?.plan === 'premium';
    
    // Get user's engagement for activity ranking
    const engagement = await Engagement.findOne({ user: userIdStr });
    
    // Find potential matches
    // Exclude:
    // 1. Users you've already liked (unless they liked you back - then show as mutual match)
    // 2. Mutual matches (already matched)
    // 3. Yourself
    const existingMatches = await Match.find({
      $or: [{ user1: userIdStr }, { user2: userIdStr }]
    });
    
    // Only exclude users you've liked who haven't liked you back
    // OR users you've mutually matched with
    const excludedUserIds = [];
    for (const match of existingMatches) {
      const isUser1 = match.user1.toString() === userIdStr;
      const otherUserId = isUser1 ? match.user2 : match.user1;
      
      if (match.isMatch) {
        // Mutual match - exclude from suggestions (show in "My Matches" instead)
        excludedUserIds.push(otherUserId);
      } else if (isUser1 && match.user1Liked && !match.user2Liked) {
        // You liked them, they haven't liked you - exclude (they'll show in "Likes You" if they like you)
        excludedUserIds.push(otherUserId);
      } else if (!isUser1 && match.user2Liked && !match.user1Liked) {
        // You liked them, they haven't liked you - exclude
        excludedUserIds.push(otherUserId);
      }
      // If they liked you but you haven't liked them, DON'T exclude - show them in suggestions
    }
    excludedUserIds.push(userIdStr);
    
    // Exclude rejected users (still within 7-day block period)
    const now = new Date();
    const activeRejections = await RejectedUser.find({
      user: userIdStr,
      expiresAt: { $gt: now },
      isActive: true
    });
    
    for (const rejection of activeRejections) {
      const rejectedUserId = rejection.rejectedUser.toString();
      if (!excludedUserIds.includes(rejectedUserId)) {
        excludedUserIds.push(rejectedUserId);
      }
    }
    
    // Build query for potential matches
    // In development/test mode, allow unapproved profiles (for testing)
    // In production, only show approved profiles
    const query = {
      user: { $nin: excludedUserIds },
      isComplete: true
    };
    
    // Only require approval in production (unless explicitly set)
    if (process.env.NODE_ENV === 'production' && process.env.ALLOW_UNAPPROVED_MATCHES !== 'true') {
      query.isApproved = true;
    }
    
    // Gender preference filter
    if (userProfile.genderPreference && !userProfile.genderPreference.includes('all')) {
      query.gender = { $in: userProfile.genderPreference };
    }
    
    // Age range filter
    if (userProfile.ageRange) {
      query.age = {
        $gte: userProfile.ageRange.min,
        $lte: userProfile.ageRange.max
      };
    }
    
    // Get potential profiles
    let profiles = await Profile.find(query)
      .populate('user', 'email')
      .limit(limit * 3); // Get more to calculate scores
    
    // Calculate match scores for each
    const matchesWithScores = [];
    
    for (const profile of profiles) {
      try {
        const matchData = await calculateMatchScore(userIdStr, profile.user._id);
        if (matchData && matchData.score >= 40) { // Minimum threshold
          matchesWithScores.push({
            profile,
            matchScore: matchData.score,
            labels: matchData.labels,
            breakdown: matchData.breakdown
          });
        }
      } catch (error) {
        console.error(`Error calculating score for ${profile.user._id}:`, error);
      }
    }
    
    // Sort by match score (highest first)
    matchesWithScores.sort((a, b) => b.matchScore - a.matchScore);
    
    // Premium users get priority placement (boosted in results)
    if (isPremium) {
      // Already sorted by score, premium just ensures visibility
    }
    
    // Return top matches with detailed information
    return matchesWithScores.slice(0, limit).map(item => {
      const matchProfile = item.profile;
      
      // Find common interests between userProfile and matchProfile
      const commonBeliefs = (userProfile.spiritualBeliefs || []).filter(b => 
        (matchProfile.spiritualBeliefs || []).includes(b)
      );
      const commonPractices = (userProfile.spiritualPractices || []).filter(p => 
        (matchProfile.spiritualPractices || []).includes(p)
      );
      const commonLifestyle = (userProfile.lifestyleChoices || []).filter(l => 
        (matchProfile.lifestyleChoices || []).includes(l)
      );
      
      // Format gender preference for display
      const genderPreferenceDisplay = matchProfile.genderPreference?.length === 1 && matchProfile.genderPreference[0] === 'all'
        ? 'All genders'
        : matchProfile.genderPreference?.map(g => {
            const genderMap = {
              'male': 'Men',
              'female': 'Women',
              'non-binary': 'Non-binary',
              'all': 'All'
            };
            return genderMap[g] || g;
          }).join(', ') || 'Not specified';
      
      return {
        userId: matchProfile.user._id.toString(), // Ensure it's a string
        profile: matchProfile,
        matchScore: item.matchScore,
        matchLabels: item.labels,
        compatibility: item.breakdown,
        // Additional match details
        genderPreference: genderPreferenceDisplay,
        commonInterests: {
          beliefs: commonBeliefs,
          practices: commonPractices,
          lifestyle: commonLifestyle
        },
        matchExplanation: generateMatchExplanation(item.matchScore, item.labels, item.breakdown)
      };
    });
  } catch (error) {
    console.error('Error getting suggested matches:', error);
    throw error;
  }
}

// Create or update match record
export async function createOrUpdateMatch(userId1, userId2, user1Liked = false, user2Liked = false) {
  try {
    // Extract ObjectId from user objects or strings
    // Handle: ObjectId, string, or full user object
    const extractObjectId = (value) => {
      if (!value) {
        throw new Error('User ID is required');
      }
      
      // If it's already an ObjectId, return it
      if (value instanceof mongoose.Types.ObjectId) {
        return value;
      }
      
      // If it's an object with _id property, extract it
      if (typeof value === 'object' && value._id) {
        value = value._id;
      }
      
      // Convert to string for validation
      const idStr = value?.toString ? value.toString() : String(value);
      
      // Validate ObjectId format
      if (!mongoose.Types.ObjectId.isValid(idStr)) {
        throw new Error(`Invalid ObjectId: ${idStr}`);
      }
      
      // Return as ObjectId instance
      return new mongoose.Types.ObjectId(idStr);
    };
    
    const id1 = extractObjectId(userId1);
    const id2 = extractObjectId(userId2);
    
    // Ensure consistent ordering (smaller ID first)
    const id1Str = id1.toString();
    const id2Str = id2.toString();
    const ids = [id1Str, id2Str].sort();
    const [sortedId1Str, sortedId2Str] = ids;
    const sortedId1 = new mongoose.Types.ObjectId(sortedId1Str);
    const sortedId2 = new mongoose.Types.ObjectId(sortedId2Str);
    
    // Check if match already exists
    let match = await Match.findOne({
      $or: [
        { user1: sortedId1, user2: sortedId2 },
        { user1: sortedId2, user2: sortedId1 }
      ]
    });
    
    if (!match) {
      // Determine which user is which
      const isUser1First = id1Str === sortedId1Str;
      
      match = new Match({
        user1: sortedId1,
        user2: sortedId2,
        user1Liked: isUser1First ? user1Liked : user2Liked,
        user2Liked: isUser1First ? user2Liked : user1Liked
      });
    } else {
      // Update existing match
      const isUser1First = id1Str === match.user1.toString();
      if (isUser1First) {
        match.user1Liked = user1Liked;
      } else {
        match.user2Liked = user2Liked;
      }
    }
    
    // Check if it's a mutual match
    if (match.user1Liked && match.user2Liked && !match.isMatch) {
      match.isMatch = true;
      match.matchedAt = new Date();
      
      // Calculate and store match score
      // Ensure we pass ObjectIds, not populated objects
      const user1Id = match.user1 instanceof mongoose.Types.ObjectId 
        ? match.user1 
        : new mongoose.Types.ObjectId(match.user1.toString());
      const user2Id = match.user2 instanceof mongoose.Types.ObjectId 
        ? match.user2 
        : new mongoose.Types.ObjectId(match.user2.toString());
      
      const matchData = await calculateMatchScore(user1Id, user2Id);
      if (matchData) {
        match.matchScore = matchData.score;
        match.matchLabels = matchData.labels;
        match.compatibility = matchData.breakdown;
      }
    }
    
    await match.save();
    return match;
  } catch (error) {
    console.error('Error creating/updating match:', error);
    throw error;
  }
}

