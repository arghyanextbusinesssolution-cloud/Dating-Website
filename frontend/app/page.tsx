'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Loader } from '@/components/Loader';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { MaskContainer } from '@/components/ui/svg-mask-effect';
import { AnimatedTestimonials } from '@/components/ui/animated-testimonials';

// Back to Top Button Component
const BackToTopButton = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [waveOffset, setWaveOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      // Calculate scroll progress more accurately
      const totalScrollable = documentHeight - windowHeight;
      const progress = totalScrollable > 0 ? (scrollTop / totalScrollable) * 100 : 0;
      
      setScrollProgress(Math.min(Math.max(progress, 0), 100));
      setIsVisible(scrollTop > 300); // Show after scrolling 300px
    };

    // Initial calculation
    handleScroll();
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Wave animation effect
  useEffect(() => {
    const waveInterval = setInterval(() => {
      setWaveOffset(prev => (prev + 0.1) % (Math.PI * 2));
    }, 50);
    return () => clearInterval(waveInterval);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (scrollProgress / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: isVisible ? 1 : 0,
        scale: isVisible ? 1 : 0
      }}
      transition={{ duration: 0.3 }}
      className="fixed bottom-8 right-8 z-50"
    >
      <div className="relative w-16 h-16">
        {/* Circular Progress */}
        <svg
          width="64"
          height="64"
          className="absolute inset-0"
        >
          {/* Background circle */}
          <circle
            cx="32"
            cy="32"
            r={radius}
            stroke="rgba(147, 51, 234, 0.2)"
            strokeWidth="3"
            fill="transparent"
          />
          {/* Water fill effect */}
          <g clipPath="url(#waterClip)">
            <circle
              cx="32"
              cy="32"
              r={radius - 1.5}
              fill="url(#waterGradient)"
              className="transition-all duration-300 ease-out"
            />
            {/* Wave animation */}
            <path
              d={`M ${32 - radius + 1.5} ${32 + radius - 1.5 - (scrollProgress / 100) * (2 * radius - 3) + Math.sin(waveOffset) * 1} Q ${32} ${32 + radius - 1.5 - (scrollProgress / 100) * (2 * radius - 3) + Math.sin(waveOffset + Math.PI) * 1} ${32 + radius - 1.5} ${32 + radius - 1.5 - (scrollProgress / 100) * (2 * radius - 3) + Math.sin(waveOffset + Math.PI * 2) * 1} L ${32 + radius - 1.5} ${32 + radius + 10} L ${32 - radius + 1.5} ${32 + radius + 10} Z`}
              fill="url(#waterGradient)"
              opacity="0.4"
            />
          </g>
          {/* Clip path for water level */}
          <defs>
            <clipPath id="waterClip">
              <rect
                x={32 - radius + 1.5}
                y={32 + radius - 1.5 - (scrollProgress / 100) * (2 * radius - 3)}
                width={2 * radius - 3}
                height={(scrollProgress / 100) * (2 * radius - 3)}
              />
            </clipPath>
            <linearGradient id="waterGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="50%" stopColor="#A855F7" />
              <stop offset="100%" stopColor="#EC4899" />
            </linearGradient>
          </defs>
        </svg>

        {/* Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={scrollToTop}
          className="absolute inset-0 flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer"
        >
          <motion.svg
            animate={{ y: [0, -2, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            className="text-white"
          >
            <path
              d="M12 19V5M5 12L12 5L19 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </motion.svg>
        </motion.button>

        {/* Percentage Text */}
        <div className="absolute inset-0 flex items-end justify-center ml-2 pb-1 pointer-events-none z-10">
          <span className="text-xs font-bold text-white drop-shadow-lg">
            {Math.round(scrollProgress)}%
          </span>
        </div>
      </div>
    </motion.div>
  );
};

// Heart Sync Game Component
const HeartSyncGame = () => {
  const [gameState, setGameState] = useState<'start' | 'playing' | 'result'>('start');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<any>(null);

  // Share functionality
  const shareResult = async () => {
    const shareText = `I discovered I'm "${result.title}" on Spiritual Unity Match! ${result.emoji} ${result.description}. Find your dating vibe too!`;
    const shareUrl = window.location.origin;

    if (navigator.share) {
      // Use native Web Share API if available
      try {
        await navigator.share({
          title: 'My Dating Personality - Spiritual Unity Match',
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      const fullText = `${shareText} ${shareUrl}`;
      navigator.clipboard.writeText(fullText).then(() => {
        alert('Link copied to clipboard! Share it with your friends.');
      });
    }
  };

  const questions = [
    {
      question: "Perfect date is:",
      options: [
        { text: "Sunrise walk & deep talk", emoji: "🌅" },
        { text: "Concert & dancing", emoji: "🎶" },
        { text: "Movie night & chill", emoji: "🍕" }
      ]
    },
    {
      question: "You believe love is:",
      options: [
        { text: "Soul connection", emoji: "💫" },
        { text: "Friendship first", emoji: "🤝" },
        { text: "Wild chemistry", emoji: "⚡" }
      ]
    },
    {
      question: "Your texting style:",
      options: [
        { text: "Deep & meaningful", emoji: "💭" },
        { text: "Funny & random", emoji: "😂" },
        { text: "Short & sweet", emoji: "💕" }
      ]
    },
    {
      question: "Weekend mood:",
      options: [
        { text: "Nature & peace", emoji: "🌿" },
        { text: "Friends & fun", emoji: "🎉" },
        { text: "Rest & recharge", emoji: "😌" }
      ]
    },
    {
      question: "Heart says:",
      options: [
        { text: "Feel everything deeply", emoji: "❤️" },
        { text: "Love freely", emoji: "🕊️" },
        { text: "Love slowly", emoji: "🐢" }
      ]
    }
  ];

  const results = {
    romantic: {
      title: "The Romantic Soul",
      description: "loves deep emotional bonds",
      emoji: "💖",
      color: "from-pink-500 to-rose-500"
    },
    passion: {
      title: "The Passion Spark",
      description: "energetic and expressive",
      emoji: "🔥",
      color: "from-orange-500 to-red-500"
    },
    calm: {
      title: "The Calm Connector",
      description: "peaceful and steady",
      emoji: "🌿",
      color: "from-green-500 to-teal-500"
    },
    fun: {
      title: "The Fun Lover",
      description: "playful and social",
      emoji: "🎭",
      color: "from-purple-500 to-indigo-500"
    }
  };

  const calculateResult = (answers: number[]) => {
    // Simple scoring logic based on answer patterns
    const scores = { romantic: 0, passion: 0, calm: 0, fun: 0 };

    answers.forEach((answer, index) => {
      if (index === 0) { // Perfect date
        if (answer === 0) scores.romantic += 2; // Sunrise walk
        if (answer === 1) scores.passion += 2; // Concert
        if (answer === 2) scores.calm += 1; scores.fun += 1; // Movie night
      } else if (index === 1) { // Love belief
        if (answer === 0) scores.romantic += 2; // Soul connection
        if (answer === 1) scores.calm += 2; // Friendship first
        if (answer === 2) scores.passion += 2; // Wild chemistry
      } else if (index === 2) { // Texting style
        if (answer === 0) scores.romantic += 2; // Deep & meaningful
        if (answer === 1) scores.fun += 2; // Funny & random
        if (answer === 2) scores.calm += 2; // Short & sweet
      } else if (index === 3) { // Weekend mood
        if (answer === 0) scores.romantic += 1; scores.calm += 1; // Nature & peace
        if (answer === 1) scores.fun += 2; // Friends & fun
        if (answer === 2) scores.calm += 2; // Rest & recharge
      } else if (index === 4) { // Heart says
        if (answer === 0) scores.romantic += 2; // Feel deeply
        if (answer === 1) scores.passion += 2; // Love freely
        if (answer === 2) scores.calm += 2; // Love slowly
      }
    });

    // Find the highest score
    const maxScore = Math.max(...Object.values(scores));
    const resultKey = Object.keys(scores).find(key => scores[key as keyof typeof scores] === maxScore) as keyof typeof results;
    
    return results[resultKey];
  };

  const handleStart = () => {
    setGameState('playing');
    setCurrentQuestion(0);
    setAnswers([]);
  };

  const handleAnswer = (answerIndex: number) => {
    const newAnswers = [...answers, answerIndex];
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      const result = calculateResult(newAnswers);
      setResult(result);
      setGameState('result');
    }
  };

  const handleRestart = () => {
    setGameState('start');
    setCurrentQuestion(0);
    setAnswers([]);
    setResult(null);
  };

  if (gameState === 'start') {
    return (
      <div className="bg-white rounded-3xl p-8 shadow-2xl">
        <div className="text-6xl mb-6 text-center">💓</div>
        <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">Heart Sync</h3>
        <p className="text-gray-600 mb-8 text-center">
          Answer 5 fun questions to discover your dating personality!
        </p>
        <button
          onClick={handleStart}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-xl transition-all duration-200"
        >
          Start Heart Sync ✨
        </button>
      </div>
    );
  }

  if (gameState === 'playing') {
    const question = questions[currentQuestion];
    return (
      <div className="bg-white rounded-3xl p-8 shadow-2xl">
        <div className="text-4xl mb-4 text-center">💭</div>
        <div className="mb-2 text-sm text-purple-600 font-medium text-center">
          Question {currentQuestion + 1} of {questions.length}
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-8 text-center">
          {question.question}
        </h3>
        <div className="space-y-4">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(index)}
              className="w-full bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 p-4 rounded-xl border border-purple-200 hover:border-purple-300 transition-all duration-200 text-left"
            >
              <span className="text-2xl mr-3">{option.emoji}</span>
              <span className="font-medium text-gray-800">{option.text}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (gameState === 'result') {
    return (
      <div className={`bg-gradient-to-br ${result.color} rounded-3xl p-8 shadow-2xl text-white`}>
        <div className="text-8xl mb-6 text-center">
          {result.emoji}
        </div>
        <h3 className="text-3xl font-bold mb-4 text-center">
          {result.title}
        </h3>
        <p className="text-lg mb-8 opacity-90 text-center">
          {result.description}
        </p>
        <div className="space-y-4">
          <button className="w-full bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-full font-semibold hover:bg-white/30 transition-all duration-200">
            Find People With My Vibe ✨
          </button>
          <button
            onClick={shareResult}
            className="w-full bg-white/10 backdrop-blur-sm text-white px-6 py-3 rounded-full font-semibold hover:bg-white/20 transition-all duration-200 border border-white/20"
          >
            Share My Vibe 🌟
          </button>
          <div className="text-center">
            <button
              onClick={handleRestart}
              className="text-white/80 hover:text-white text-sm underline"
            >
              Take quiz again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

// Image Slider component
const ImageSlider = () => {
  const images = ['/photo1.webp', '/photo2.webp', '/photo3.webp'];
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="relative w-full h-96 rounded-3xl overflow-hidden shadow-2xl">
      {images.map((image, index) => (
        <motion.div
          key={image}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: index === currentIndex ? 1 : 0 }}
          transition={{ duration: 0.5 }}
        >
          <Image
            src={image}
            alt={`Slide ${index + 1}`}
            fill
            className="object-cover"
            priority={index === 0}
          />
        </motion.div>
      ))}
      
      {/* Slider indicators */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full transition-colors ${
              index === currentIndex ? 'bg-white' : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  // Modal state
  const [showHeartSyncModal, setShowHeartSyncModal] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      // Auto-redirect logged-in users to matches section
      router.push('/matches/suggested');
    }
  }, [user, loading, router]);

  // Show Heart Sync modal after 10 seconds
  useEffect(() => {
    if (!loading && !user) {
      const timer = setTimeout(() => {
        setShowHeartSyncModal(true);
      }, 10000); // 10 seconds

      return () => clearTimeout(timer);
    }
  }, [loading, user]);

  if (loading) {
    return <Loader />;
  }

  if (user) {
    // Show loader while redirecting
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* Left Side - Text and Buttons */}
            <div className="order-2 lg:order-1">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="mb-8"
              >
                <div className="mb-6 flex justify-center lg:justify-start">
                  <Image
                    src="/logo.webp"
                    alt="Spiritual Unity Match Logo"
                    width={200}
                    height={200}
                    className="w-40 h-40 sm:w-48 sm:h-48 lg:w-56 lg:h-56 object-contain"
                  />
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight font-serif">
                  Find Alignment Before{" "}
                  <motion.span
                    className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-800 bg-clip-text text-transparent"
                    animate={{
                      backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                    style={{
                      backgroundSize: "200% 200%",
                    }}
                  >
                    Attraction
                  </motion.span>
                </h1>
                <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl leading-relaxed">
                  Connect with souls who share your spiritual journey. Where depth meets intention, and conscious relationships begin.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="flex flex-col sm:flex-row gap-4 justify-start items-start mb-6"
              >
                <Link
                  href="/auth/register"
                  className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                >
                  Start Your Journey Free
                </Link>
                <Link
                  href="/plans"
                  className="w-full sm:w-auto border-2 border-purple-600 text-purple-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-purple-50 transition-colors"
                >
                  View Plans
                </Link>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-gray-500"
              >
                Already have an account?{' '}
                <Link href="/auth/login" className="text-purple-600 font-semibold hover:underline">
                  Sign In
                </Link>
              </motion.p>
            </div>

            {/* Right Side - Image Slider */}
            <div className="order-1 lg:order-2">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="relative"
              >
                <ImageSlider />
              </motion.div>
            </div>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
          <div className="absolute top-20 left-10 w-32 h-32 bg-purple-200 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-24 h-24 bg-pink-200 rounded-full opacity-20 animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full opacity-10"></div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 sm:py-20 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
              About Spiritual Unity Match
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              A conscious dating platform designed for spiritual souls seeking meaningful connections
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              <p className="text-gray-700 text-lg leading-relaxed">
                Spiritual Unity Match is a conscious dating platform designed for spiritual souls seeking meaningful connections. We prioritize depth, intention, and spiritual alignment over superficial connections.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
                  <div className="text-2xl mb-2">🧘</div>
                  <h4 className="font-semibold text-purple-800 mb-1">Spiritual Focus</h4>
                  <p className="text-purple-700 text-sm">Connecting souls on similar spiritual journeys</p>
                </div>
                <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-4 border border-pink-100">
                  <div className="text-2xl mb-2">💝</div>
                  <h4 className="font-semibold text-pink-800 mb-1">Conscious Dating</h4>
                  <p className="text-pink-700 text-sm">Meaningful relationships built on shared values</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative h-[28rem]"
            >
              <MaskContainer
                revealText={
                  <div className="text-center p-8">
                    <div className="text-6xl mb-4">✨</div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-4">Conscious Connections</h3>
                    <p className="text-gray-600">
                      Building relationships based on spiritual alignment and shared purpose
                    </p>
                  </div>
                }
                size={20}
                revealSize={400}
                className="rounded-3xl"
              >
                <div className="text-center p-8">
                  <div className="text-6xl mb-4">💜</div>
                  <h3 className="text-2xl font-bold text-white mb-4">Our Philosophy</h3>
                  <p className="text-white leading-relaxed max-w-sm">
                    "Find alignment before attraction" - We believe true connections come from shared values, spiritual paths, and conscious intentions, not just physical attraction.
                  </p>
                </div>
              </MaskContainer>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
              Why Choose Spiritual Unity Match?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover the features that make conscious dating meaningful and transformative
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                icon: '🧘',
                title: 'Spiritual Matching',
                description: 'Advanced algorithm matches based on spiritual beliefs, practices, and life intentions'
              },
              {
                icon: '💬',
                title: 'Meaningful Connections',
                description: 'Connect with people who share your values and spiritual journey'
              },
              {
                icon: '✨',
                title: 'Conscious Relationships',
                description: 'Build relationships based on depth, intention, and alignment'
              },
              {
                icon: '🔒',
                title: 'Safe & Secure',
                description: 'Verified profiles, privacy controls, and a respectful community'
              },
              {
                icon: '🌱',
                title: 'Growth-Oriented',
                description: 'Tools and features to support your personal and spiritual growth'
              },
              {
                icon: '💜',
                title: 'Authentic Profiles',
                description: 'Comprehensive profiles that reflect your true self and intentions'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.8 }}
                whileHover={{ 
                  y: -8, 
                  scale: 1.02,
                  transition: { duration: 0.2 }
                }}
                className="bg-white rounded-2xl p-6 lg:p-8 shadow-lg hover:shadow-2xl cursor-pointer group relative overflow-hidden"
              >
                {/* Background gradient on hover */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-purple-50 to-pink-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                />
                
                {/* Content */}
                <div className="relative z-10">
                  <motion.div 
                    className="text-4xl mb-4"
                    whileHover={{ 
                      scale: 1.1, 
                      rotate: [0, -5, 5, 0],
                      transition: { duration: 0.3 }
                    }}
                  >
                    {feature.icon}
                  </motion.div>
                  <motion.h3 
                    className="text-xl font-bold text-gray-900 mb-3 group-hover:text-purple-800 transition-colors duration-300"
                    whileHover={{ scale: 1.05 }}
                  >
                    {feature.title}
                  </motion.h3>
                  <motion.p 
                    className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300"
                    whileHover={{ y: -2 }}
                  >
                    {feature.description}
                  </motion.p>
                </div>

                {/* Subtle border animation */}
                <motion.div
                  className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-purple-200 transition-colors duration-300"
                  whileHover={{ 
                    borderColor: "rgba(168, 85, 247, 0.3)",
                    transition: { duration: 0.3 }
                  }}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 sm:py-20 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
              How It Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Your journey to conscious connections in four simple steps
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {[
              {
                step: '1',
                title: 'Create Your Profile',
                description: 'Share your spiritual beliefs, practices, and what you\'re looking for in a relationship',
                icon: '📝'
              },
              {
                step: '2',
                title: 'Find Your Matches',
                description: 'Our algorithm connects you with people who share your spiritual path and values',
                icon: '🔍'
              },
              {
                step: '3',
                title: 'Connect & Message',
                description: 'When you both like each other, start meaningful conversations and build connections',
                icon: '💬'
              },
              {
                step: '4',
                title: 'Build Relationships',
                description: 'Nurture conscious relationships based on alignment, depth, and mutual growth',
                icon: '💑'
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.8 }}
                className="flex flex-col sm:flex-row gap-6 items-start"
              >
                <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  {item.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-sm font-semibold text-purple-600 bg-purple-100 px-3 py-1 rounded-full">
                      Step {item.step}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Membership Plans Preview */}
      <section id="plans" className="py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
              Choose Your Path
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Find the plan that aligns with your spiritual journey
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
            {[
              {
                name: 'Basic',
                price: '$9.99/month',
                description: 'Perfect for getting started',
                features: ['Create profile', 'Limited browsing', 'Basic features'],
                icon: '🌱'
              },
              {
                name: 'Standard',
                price: '$19.99/month',
                description: 'Most popular choice',
                features: ['Unlimited browsing', 'See who liked you', 'Full messaging'],
                popular: true,
                icon: '✨'
              },
              {
                name: 'Premium',
                price: '$39.99/month',
                description: 'Complete spiritual experience',
                features: ['Priority placement', 'Advanced filters', 'Unlimited everything'],
                icon: '💎'
              }
            ].map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.8 }}
                className={`bg-white rounded-3xl p-6 lg:p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 relative ${
                  plan.popular ? 'ring-2 ring-purple-500 scale-105' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm px-4 py-2 rounded-full font-semibold shadow-lg">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <div className="text-4xl mb-4">{plan.icon}</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
                  <div className="text-3xl font-bold text-purple-600 mb-2">{plan.price}</div>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-gray-700">
                      <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/plans"
                  className={`w-full py-3 px-6 rounded-full font-semibold text-center transition-all duration-200 block ${
                    plan.popular
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-xl hover:scale-105'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  Choose Plan
                </Link>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-center mt-12"
          >
            <Link
              href="/plans"
              className="inline-flex items-center text-purple-600 font-semibold hover:text-purple-800 transition-colors"
            >
              View All Plans & Pricing
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-gray-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
              What Our Conscious Couples Say
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Real stories from spiritual souls who found meaningful connections
            </p>
          </motion.div>

          <AnimatedTestimonials
            testimonials={[
              {
                quote: "Spiritual Unity Match helped me find someone who truly understands my spiritual journey. We've been together for 8 months and it's been the most aligned relationship I've ever experienced.",
                name: "Sarah & Michael",
                designation: "Conscious Couple • California",
                src: "data:image/svg+xml;base64," + btoa('<svg width="400" height="400" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="400" rx="20" fill="url(#gradient1)"/><text x="200" y="180" text-anchor="middle" fill="white" font-size="60" font-family="Arial, sans-serif">LOVE</text><text x="200" y="240" text-anchor="middle" fill="white" font-size="24" font-family="Arial, sans-serif" font-weight="bold">Sarah &amp; Michael</text><defs><linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#8B5CF6"/><stop offset="100%" style="stop-color:#EC4899"/></linearGradient></defs></svg>')
              },
              {
                quote: "The matching algorithm is incredible! It connected me with someone who shares my meditation practice and yoga philosophy. We met and instantly knew we were meant to be together.",
                name: "Emma & David",
                designation: "Spiritual Partners • New York",
                src: "data:image/svg+xml;base64," + btoa('<svg width="400" height="400" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="400" rx="20" fill="url(#gradient2)"/><text x="200" y="180" text-anchor="middle" fill="white" font-size="60" font-family="Arial, sans-serif">OM</text><text x="200" y="240" text-anchor="middle" fill="white" font-size="24" font-family="Arial, sans-serif" font-weight="bold">Emma &amp; David</text><defs><linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#10B981"/><stop offset="100%" style="stop-color:#3B82F6"/></linearGradient></defs></svg>')
              },
              {
                quote: "After years of superficial dating, I finally found depth and meaning. Spiritual Unity Match brought us together based on our shared values and spiritual beliefs. Grateful every day!",
                name: "Lisa & James",
                designation: "Soul Mates • Texas",
                src: "data:image/svg+xml;base64," + btoa('<svg width="400" height="400" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="400" rx="20" fill="url(#gradient3)"/><text x="200" y="180" text-anchor="middle" fill="white" font-size="60" font-family="Arial, sans-serif">*</text><text x="200" y="240" text-anchor="middle" fill="white" font-size="24" font-family="Arial, sans-serif" font-weight="bold">Lisa &amp; James</text><defs><linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#F59E0B"/><stop offset="100%" style="stop-color:#EF4444"/></linearGradient></defs></svg>')
              },
              {
                quote: "The platform creates such a safe space for authentic connections. We bonded over our spiritual practices and now we're building a conscious life together. Thank you for this beautiful service!",
                name: "Maria & Alex",
                designation: "Mindful Partners • Florida",
                src: "data:image/svg+xml;base64," + btoa('<svg width="400" height="400" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="400" rx="20" fill="url(#gradient4)"/><text x="200" y="180" text-anchor="middle" fill="white" font-size="60" font-family="Arial, sans-serif">+</text><text x="200" y="240" text-anchor="middle" fill="white" font-size="24" font-family="Arial, sans-serif" font-weight="bold">Maria &amp; Alex</text><defs><linearGradient id="gradient4" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#6366F1"/><stop offset="100%" style="stop-color:#8B5CF6"/></linearGradient></defs></svg>')
              }
            ]}
            autoplay={true}
          />
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              Ready to Begin Your Journey?
            </h2>
            <p className="text-lg sm:text-xl mb-8 max-w-2xl mx-auto opacity-90 leading-relaxed">
              Join thousands of conscious souls seeking meaningful connections in a world of superficial swipes
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <Link
                href="/auth/register"
                className="w-full sm:w-auto bg-white text-purple-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 transition-all duration-200 transform hover:scale-105 shadow-xl"
              >
                Start Your Journey Free
              </Link>
              <Link
                href="/auth/login"
                className="w-full sm:w-auto border-2 border-white text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white hover:text-purple-600 transition-all duration-200"
              >
                Sign In
              </Link>
            </div>
            <p className="text-sm opacity-75">
              ✨ No credit card required • 100% free to get started
            </p>
          </motion.div>
        </div>

        {/* Background decoration */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
          <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full"></div>
          <div className="absolute bottom-10 right-10 w-32 h-32 bg-white/5 rounded-full"></div>
          <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white/10 rounded-full"></div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Spiritual Unity Match
              </h3>
              <p className="text-gray-400 mb-6 max-w-md">
                Where Spiritual Heritage Meets Modern Love. Connect with conscious souls who share your journey toward alignment and meaningful relationships.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center hover:bg-purple-700 transition-colors cursor-pointer">
                  <span className="text-sm">📘</span>
                </div>
                <div className="w-10 h-10 bg-pink-600 rounded-full flex items-center justify-center hover:bg-pink-700 transition-colors cursor-pointer">
                  <span className="text-sm">📷</span>
                </div>
                <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center hover:bg-purple-700 transition-colors cursor-pointer">
                  <span className="text-sm">🐦</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-3">
                <li><Link href="/auth/login" className="text-gray-400 hover:text-white transition-colors">Sign In</Link></li>
                <li><Link href="/auth/register" className="text-gray-400 hover:text-white transition-colors">Get Started</Link></li>
                <li><Link href="/how-it-works" className="text-gray-400 hover:text-white transition-colors">How It Works</Link></li>
                <li><Link href="/plans" className="text-gray-400 hover:text-white transition-colors">Plans & Pricing</Link></li>
                <li><Link href="/about" className="text-gray-400 hover:text-white transition-colors">About Us</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Support</h4>
              <ul className="space-y-3">
                <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact Us</Link></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} Spiritual Unity Match. All rights reserved. Made with 💜 for conscious connections. Designed by <a href="https://nextbusinesssolution.com/" target="_blank" rel="noopener noreferrer" className="hover:text-purple-400 transition-colors">Next Business Solution</a>.
            </p>
          </div>
        </div>
      </footer>

      {/* Heart Sync Modal */}
      {showHeartSyncModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowHeartSyncModal(false)}
          />
          
          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative max-w-md w-full max-h-[90vh] overflow-y-auto"
          >
            <HeartSyncGame />
            
            {/* Close button */}
            <button
              onClick={() => setShowHeartSyncModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </motion.div>
        </div>
      )}

      {/* Back to Top Button */}
      <BackToTopButton />
    </div>
  );
}