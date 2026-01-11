'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';

const TOTAL_STEPS = 6;

export default function ProfileSetupPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    nickname: '',
    gender: '',
    genderPreference: ['all'],
    age: '',
    ageRange: { min: 18, max: 120 },
    relationshipIntention: '',
    bio: '',
    spiritualBeliefs: [] as string[],
    spiritualPractices: [] as string[],
    lifestyleChoices: [] as string[],
    activityLevel: 'moderate',
    intentBadges: [] as string[],
  });

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles: File[] = [];

    // Filter valid image files (JPG, PNG only)
    files.forEach((file) => {
      if (file.type === 'image/jpeg' || file.type === 'image/jpg' || file.type === 'image/png') {
        validFiles.push(file);
      }
    });

    // Limit to 5 photos total
    const totalPhotos = photos.length + validFiles.length;
    let filesToAdd = validFiles;
    if (totalPhotos > 5) {
      const remaining = 5 - photos.length;
      filesToAdd = validFiles.slice(0, remaining);
      alert(`You can upload up to 5 photos. Only ${remaining} photo(s) were added.`);
    }

    // Create previews for new files using URL.createObjectURL (synchronous)
    const newPreviews = filesToAdd.map(file => URL.createObjectURL(file));
    
    setPhotos(prev => [...prev, ...filesToAdd]);
    setPhotoPreviews(prev => [...prev, ...newPreviews]);
    
    // Reset input
    e.target.value = '';
  };

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    const newPreviews = photoPreviews.filter((_, i) => i !== index);
    setPhotos(newPhotos);
    setPhotoPreviews(newPreviews);
  };

  const nextStep = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Create FormData for file upload
      const formDataToSend = new FormData();
      
      // Add all form fields
      formDataToSend.append('name', formData.name);
      formDataToSend.append('gender', formData.gender);
      formDataToSend.append('age', formData.age.toString());
      formDataToSend.append('genderPreference', JSON.stringify(formData.genderPreference));
      formDataToSend.append('relationshipIntention', formData.relationshipIntention);
      formDataToSend.append('bio', formData.bio || '');
      formDataToSend.append('spiritualBeliefs', JSON.stringify(formData.spiritualBeliefs));
      formDataToSend.append('spiritualPractices', JSON.stringify(formData.spiritualPractices));
      formDataToSend.append('lifestyleChoices', JSON.stringify(formData.lifestyleChoices));
      formDataToSend.append('activityLevel', formData.activityLevel);
      formDataToSend.append('intentBadges', JSON.stringify(formData.intentBadges));
      formDataToSend.append('ageRange', JSON.stringify(formData.ageRange));
      
      // Add photos
      photos.forEach((photo) => {
        formDataToSend.append('photos', photo);
      });

      // Send with multipart/form-data
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      
      const response = await fetch(`${API_URL}/profiles`, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
        credentials: 'include',
        body: formDataToSend,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error saving profile');
      }

      router.push('/plans');
    } catch (error: any) {
      console.error('Profile save error:', error);
      alert(error.message || 'Error saving profile');
    } finally {
      setLoading(false);
    }
  };

  const progressPercentage = (currentStep / TOTAL_STEPS) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-yellow-50 flex flex-col max-w-md mx-auto relative">
      {/* Overlay Loader */}
      {loading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm mx-4 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-lg font-semibold text-gray-800">Please wait</p>
            <p className="text-sm text-gray-600 mt-2">Creating your profile...</p>
          </div>
        </div>
      )}
      {/* Top Navigation */}
      <div className="bg-white/80 backdrop-blur-md sticky top-0 z-50 px-4 py-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold text-gray-800">Create Profile</h1>
          <span className="text-sm text-gray-600">{currentStep}/{TOTAL_STEPS}</span>
        </div>
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div
            className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-4 py-6 overflow-y-auto">
        <AnimatePresence mode="wait">
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="bg-white rounded-3xl shadow-xl p-6"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Tell us about yourself</h2>
              <p className="text-gray-600 mb-6">Let's start with the basics</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Your full name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Age *</label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => handleChange('age', parseInt(e.target.value))}
                    min="18"
                    max="120"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Your age"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gender *</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => handleChange('gender', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="non-binary">Non-binary</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Looking for</label>
                  <select
                    value={formData.genderPreference[0]}
                    onChange={(e) => handleChange('genderPreference', [e.target.value])}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="all">All</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="non-binary">Non-binary</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Photo Upload */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="bg-white rounded-3xl shadow-xl p-6"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Add Your Photos</h2>
              <p className="text-gray-600 mb-6">Upload up to 5 photos (JPG or PNG only). The first photo will be your profile picture.</p>

              <div className="space-y-4">
                {/* Photo Upload Area */}
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
                  <input
                    type="file"
                    id="photo-upload"
                    accept="image/jpeg,image/jpg,image/png"
                    multiple
                    onChange={handlePhotoChange}
                    className="hidden"
                    disabled={photos.length >= 5}
                  />
                  <label
                    htmlFor="photo-upload"
                    className={`cursor-pointer ${photos.length >= 5 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="text-4xl mb-2">📸</div>
                    <p className="text-gray-700 font-medium">
                      {photos.length >= 5 ? 'Maximum 5 photos reached' : 'Tap to upload photos'}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">JPG or PNG only</p>
                  </label>
                </div>

                {/* Photo Previews */}
                {photos.length > 0 && (
                  <div className="grid grid-cols-2 gap-4">
                    {photos.map((photo, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={photoPreviews[index] || URL.createObjectURL(photo)}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-48 object-cover rounded-xl"
                        />
                        {index === 0 && (
                          <div className="absolute top-2 left-2 bg-purple-500 text-white text-xs px-2 py-1 rounded-full">
                            Primary
                          </div>
                        )}
                        <button
                          onClick={() => removePhoto(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Step 3: Relationship Intent */}
          {currentStep === 3 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="bg-white rounded-3xl shadow-xl p-6"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-2">What are you looking for?</h2>
              <p className="text-gray-600 mb-6">Help us understand your intentions</p>

              <div className="space-y-3">
                {[
                  { value: 'conscious-partnership', label: 'Conscious Partnership', icon: '💜' },
                  { value: 'marriage-oriented', label: 'Marriage-Oriented', icon: '💍' },
                  { value: 'spiritual-friendship', label: 'Spiritual Friendship', icon: '🧘' },
                  { value: 'healing-companion', label: 'Healing Companion', icon: '🌱' },
                  { value: 'exploring', label: 'Exploring', icon: '🔍' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleChange('relationshipIntention', option.value)}
                    className={`w-full p-4 rounded-xl border-2 text-left flex items-center gap-3 transition-all ${
                      formData.relationshipIntention === option.value
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-2xl">{option.icon}</span>
                    <span className="font-medium text-gray-800">{option.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 4: Spiritual Beliefs */}
          {currentStep === 4 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="bg-white rounded-3xl shadow-xl p-6"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Your Spiritual Path</h2>
              <p className="text-gray-600 mb-6">Select your spiritual beliefs (multiple)</p>

              <div className="grid grid-cols-2 gap-3">
                {['buddhism', 'christianity', 'hinduism', 'islam', 'judaism', 'spiritual-but-not-religious', 'yoga-practitioner', 'meditation', 'atheist', 'agnostic'].map((belief) => (
                  <button
                    key={belief}
                    onClick={() => {
                      const current = formData.spiritualBeliefs;
                      if (current.includes(belief)) {
                        handleChange('spiritualBeliefs', current.filter(b => b !== belief));
                      } else {
                        handleChange('spiritualBeliefs', [...current, belief]);
                      }
                    }}
                    className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                      formData.spiritualBeliefs.includes(belief)
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-gray-200 text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {belief.replace(/-/g, ' ')}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 5: Spiritual Practices */}
          {currentStep === 5 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="bg-white rounded-3xl shadow-xl p-6"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Your Practices</h2>
              <p className="text-gray-600 mb-6">What spiritual practices do you engage in?</p>

              <div className="grid grid-cols-2 gap-3">
                {['meditation', 'yoga', 'prayer', 'chanting', 'breathwork', 'mindfulness', 'nature-connection', 'energy-healing', 'astrology', 'tarot'].map((practice) => (
                  <button
                    key={practice}
                    onClick={() => {
                      const current = formData.spiritualPractices;
                      if (current.includes(practice)) {
                        handleChange('spiritualPractices', current.filter(p => p !== practice));
                      } else {
                        handleChange('spiritualPractices', [...current, practice]);
                      }
                    }}
                    className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                      formData.spiritualPractices.includes(practice)
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {practice.replace(/-/g, ' ')}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 6: Bio */}
          {currentStep === 6 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="bg-white rounded-3xl shadow-xl p-6"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Tell your story</h2>
              <p className="text-gray-600 mb-6">Share a bit about yourself</p>

              <div>
                <textarea
                  value={formData.bio}
                  onChange={(e) => handleChange('bio', e.target.value)}
                  rows={8}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  placeholder="Tell us about yourself, your journey, what you're looking for..."
                />
                <p className="text-sm text-gray-500 mt-2">{formData.bio.length}/500</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Navigation */}
      <div className="bg-white/80 backdrop-blur-md px-4 py-4 border-t border-gray-200">
        <div className="flex gap-3">
          {currentStep > 1 && (
            <button
              onClick={prevStep}
              className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold"
            >
              Back
            </button>
          )}
          {currentStep < TOTAL_STEPS ? (
            <button
              onClick={nextStep}
              className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white py-3 rounded-xl font-semibold"
            >
              Continue
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white py-3 rounded-xl font-semibold disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Complete Profile'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
