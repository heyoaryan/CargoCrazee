import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Users, BarChart3, Shield, Clock, Zap, Globe, TrendingUp, Star, CheckCircle, Route, Package } from 'lucide-react';
import Logo from '../components/Logo';

const Home = () => {
  const features = [
    {
      icon: MapPin,
      title: 'AI Route Optimization',
      description: 'Smart algorithms find the most efficient delivery routes, saving time and fuel.',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Users,
      title: 'Shared Truck Pooling',
      description: 'Connect with other businesses to share transportation costs and reduce emissions.',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: BarChart3,
      title: 'Live IoT Tracking',
      description: 'Real-time visibility of your shipments with GPS and sensor monitoring.',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: Shield,
      title: 'Micro-Warehousing',
      description: 'Strategic storage locations across Delhi for faster last-mile delivery.',
      color: 'from-orange-500 to-red-500',
    },
  ];

  const stats = [
    { number: '500+', label: 'Active MSMEs', icon: Users },
    { number: '10,000+', label: 'Deliveries Made', icon: 'logo' },
    { number: '30%', label: 'Cost Reduction', icon: TrendingUp },
    { number: '25%', label: 'CO₂ Savings', icon: Star },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen w-full overflow-x-hidden"
    >
      {/* Enhanced Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-50 via-white to-green-50 text-gray-800 overflow-hidden min-h-screen flex items-center w-full">
        {/* Enhanced Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none w-full">
          {/* Animated Grid Pattern */}
          <div className="absolute inset-0 opacity-3 w-full">
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-px h-full bg-blue-300"
                style={{
                  left: `${(i * 8) % 100}%`,
                }}
                animate={{
                  opacity: [0.05, 0.2, 0.05],
                  scaleY: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 8 + Math.random() * 4,
                  repeat: Infinity,
                  delay: Math.random() * 5,
                }}
              />
            ))}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i + 12}
                className="absolute w-full h-px bg-green-300"
                style={{
                  top: `${(i * 12) % 100}%`,
                }}
                animate={{
                  opacity: [0.05, 0.2, 0.05],
                  scaleX: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 6 + Math.random() * 3,
                  repeat: Infinity,
                  delay: Math.random() * 4,
                }}
              />
            ))}
          </div>

          {/* Enhanced Floating Shapes - Reduced Count and Mobile Responsive */}
          <motion.div
            className="absolute top-16 left-8 w-16 h-16 md:w-24 md:h-24 bg-gradient-to-r from-blue-200 to-cyan-200 rounded-full opacity-15"
            animate={{
              y: [0, -20, 0],
              rotate: [0, 180, 360],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute top-32 right-8 md:right-16 w-12 h-12 md:w-20 md:h-20 bg-gradient-to-r from-green-200 to-emerald-200 rounded-full opacity-20"
            animate={{
              y: [0, 25, 0],
              x: [0, -10, 0],
              rotate: [0, -180, -360],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
          />
          <motion.div
            className="absolute bottom-32 left-1/3 w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full opacity-15"
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, -180, -360],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 3,
            }}
          />
          
          {/* Additional Animated Elements - Reduced Count */}
          <motion.div
            className="absolute top-1/2 right-4 md:right-8 w-10 h-10 md:w-16 md:h-16 bg-gradient-to-r from-yellow-200 to-orange-200 rounded-full opacity-12"
            animate={{
              y: [0, -15, 0],
              x: [0, 8, 0],
              rotate: [0, 90, 180, 270, 360],
            }}
            transition={{
              duration: 11,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          
          <motion.div
            className="absolute bottom-16 right-1/4 w-8 h-8 md:w-12 md:h-12 bg-gradient-to-r from-red-200 to-pink-200 rounded-full opacity-15"
            animate={{
              scale: [1, 1.3, 1],
              y: [0, -20, 0],
            }}
            transition={{
              duration: 9,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
          />

          {/* Enhanced Route Lines */}
          <motion.div
            className="absolute top-1/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-25"
            animate={{
              scaleX: [0, 1, 0],
              opacity: [0, 0.5, 0],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              delay: 1,
            }}
          />
          <motion.div
            className="absolute bottom-1/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-green-400 to-transparent opacity-25"
            animate={{
              scaleX: [0, 1, 0],
              opacity: [0, 0.5, 0],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              delay: 3,
            }}
          />
          
          {/* Diagonal Lines */}
          <motion.div
            className="absolute top-1/4 left-1/4 w-20 md:w-32 h-px bg-gradient-to-r from-transparent via-purple-300 to-transparent opacity-20 transform rotate-45"
            animate={{
              scaleX: [0, 1, 0],
              opacity: [0, 0.4, 0],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              delay: 2,
            }}
          />
          
          {/* Reduced Particle Effects */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-blue-400 rounded-full opacity-30"
              style={{
                left: `${Math.random() * 90}%`,
                top: `${Math.random() * 90}%`,
              }}
              animate={{
                y: [0, -15, 0],
                opacity: [0.1, 0.6, 0.1],
                scale: [0.5, 1.2, 0.5],
              }}
              transition={{
                duration: 5 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 4,
              }}
            />
          ))}
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center w-full">
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 1 }}
              className="lg:pr-8 w-full"
            >
              {/* Enhanced Title with Better Animation */}
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold mb-6 font-poppins leading-tight">
                  <motion.span
                    animate={{
                      backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                    }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="bg-gradient-to-r from-blue-600 via-green-500 to-purple-600 bg-clip-text text-transparent bg-300% leading-tight"
                  >
                    CargoCrazee - Smart Logistics for Modern Business
                  </motion.span>
                </h1>
              </motion.div>

              <motion.p 
                className="text-lg sm:text-xl lg:text-2xl mb-8 text-gray-600 leading-relaxed"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                AI-powered route optimization, shared truck pooling, and micro-warehousing 
                for efficient, cost-effective deliveries across Delhi NCR.
              </motion.p>
              {/* Animated Subtitle Change */}
              <motion.div className="mb-8">
                <motion.p
                  className="text-base sm:text-lg text-gray-500"
                  initial={{ opacity: 1 }}
                  animate={{ opacity: [1, 0, 0, 1] }}
                  transition={{ 
                    duration: 6, 
                    repeat: Infinity,
                    repeatDelay: 2,
                    times: [0, 0.3, 0.7, 1]
                  }}
                >
                  The Future of Logistics, Today
                </motion.p>
                <motion.p
                  className="text-base sm:text-lg text-blue-600 font-medium"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 1, 0] }}
                  transition={{ 
                    duration: 6, 
                    repeat: Infinity,
                    repeatDelay: 2,
                    times: [0, 0.3, 0.7, 1]
                  }}
                >
                  AI-Driven Logistics Revolution
                </motion.p>
              </motion.div>
              {/* Enhanced CTA Buttons */}
              <motion.div 
                className="flex flex-col sm:flex-row gap-4 mb-8 w-full"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <Link
                  to="/signup"
                  className="bg-gradient-to-r from-blue-500 to-green-400 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg hover:from-blue-600 hover:to-green-500 transition-all duration-200 text-center group shadow-lg hover:shadow-xl relative overflow-hidden w-full sm:w-auto"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-white to-transparent opacity-0 group-hover:opacity-20"
                    animate={{
                      x: ["-100%", "100%"],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: 0.5,
                    }}
                  />
                  <span className="relative z-10 flex items-center justify-center">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
                <Link
                  to="/features"
                  className="border-2 border-gray-300 text-gray-700 px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg hover:bg-gray-100 hover:border-gray-400 transition-all duration-200 text-center group w-full sm:w-auto"
                >
                  <span className="flex items-center justify-center">
                    Learn More
                    <motion.div
                      className="ml-2"
                      animate={{
                        x: [0, 5, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      →
                    </motion.div>
                  </span>
                </Link>
              </motion.div>
            </motion.div>
            {/* Right side: Modern Logo centerpiece with glow and logistics icons background */}
            <div className="flex items-center justify-center relative min-h-[280px] sm:min-h-[320px] -mt-8 w-full">
              <div className="absolute inset-0 flex items-center justify-center w-full">
                {/* Soft glow background */}
                <div className="w-48 h-48 sm:w-64 sm:h-64 rounded-full bg-gradient-to-br from-blue-200 via-green-200 to-purple-200 blur-3xl opacity-60 animate-pulse"></div>
              </div>
              
              {/* Floating animated elements */}
              <motion.div
                className="absolute top-8 left-8 w-4 h-4 sm:w-6 sm:h-6 bg-blue-400 rounded-full opacity-60"
                animate={{
                  y: [0, -20, 0],
                  x: [0, 10, 0],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <motion.div
                className="absolute top-16 right-8 sm:right-12 w-3 h-3 sm:w-4 sm:h-4 bg-green-400 rounded-full opacity-70"
                animate={{
                  y: [0, 15, 0],
                  x: [0, -8, 0],
                  rotate: [0, 180, 360],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1,
                }}
              />
              <motion.div
                className="absolute bottom-20 left-12 sm:left-16 w-3 h-3 sm:w-5 sm:h-5 bg-purple-400 rounded-full opacity-50"
                animate={{
                  y: [0, -10, 0],
                  x: [0, 12, 0],
                  scale: [1, 1.3, 1],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 2,
                }}
              />
              <motion.div
                className="absolute bottom-12 right-6 sm:right-8 w-2 h-2 sm:w-3 sm:h-3 bg-orange-400 rounded-full opacity-80"
                animate={{
                  y: [0, 20, 0],
                  x: [0, -15, 0],
                  rotate: [0, -180, -360],
                }}
                transition={{
                  duration: 3.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5,
                }}
              />
              
              {/* Animated connecting lines */}
              <motion.div
                className="absolute top-1/3 left-1/4 w-20 sm:w-32 h-px bg-gradient-to-r from-transparent via-blue-300 to-transparent opacity-40"
                animate={{
                  scaleX: [0, 1, 0],
                  opacity: [0, 0.6, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  delay: 1,
                }}
              />
              <motion.div
                className="absolute bottom-1/3 right-1/4 w-16 sm:w-24 h-px bg-gradient-to-r from-transparent via-green-300 to-transparent opacity-40"
                animate={{
                  scaleX: [0, 1, 0],
                  opacity: [0, 0.6, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: 2,
                }}
              />
              
              <div className="relative z-10 flex flex-col items-center w-full">
                <motion.div
                  animate={{
                    y: [0, -8, 0],
                    rotate: [0, 2, -2, 0],
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <Logo size="xl" animated={true} />
                </motion.div>
                
                <motion.div 
                  className="mt-6 flex gap-3 sm:gap-4 opacity-70"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 0.7, y: 0 }}
                  transition={{ duration: 1, delay: 0.5 }}
                >
                  <motion.div
                    animate={{
                      y: [0, -5, 0],
                      rotate: [0, 5, 0],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <Package className="h-8 w-8 sm:h-10 sm:w-10 text-blue-400" />
                  </motion.div>
                  <motion.div
                    animate={{
                      y: [0, 5, 0],
                      rotate: [0, -5, 0],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 1,
                    }}
                  >
                    <Route className="h-8 w-8 sm:h-10 sm:w-10 text-green-400" />
                  </motion.div>
                  <motion.div
                    animate={{
                      y: [0, -3, 0],
                      rotate: [0, 3, 0],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 2,
                    }}
                  >
                    <Globe className="h-8 w-8 sm:h-10 sm:w-10 text-purple-400" />
                  </motion.div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1, delay: 1 }}
                >
                  <motion.span 
                    className="mt-4 text-sm sm:text-base text-gray-500 font-medium block text-center"
                    animate={{
                      backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                    }}
                    transition={{ duration: 4, repeat: Infinity }}
                    style={{
                      background: "linear-gradient(90deg, #6B7280, #10B981, #8B5CF6, #6B7280)",
                      backgroundSize: "300% 100%",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    Delivering Smarter, Greener, Faster
                  </motion.span>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* Enhanced Stats Section */}
      <section className="py-16 bg-gradient-to-r from-gray-50 to-blue-50 w-full overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-4 font-poppins">
              How CargoCrazee Transforms Your Logistics
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              From traditional delivery challenges to AI-powered smart solutions
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 w-full">
            {/* Traditional Logistics Problems */}
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border-l-4 border-red-500 w-full"
            >
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-full flex items-center justify-center mr-3 sm:mr-4">
                  <span className="text-red-600 text-lg sm:text-xl font-bold">!</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800">Traditional Logistics Challenges</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-semibold text-gray-800 text-sm sm:text-base">High Operational Costs</h4>
                    <p className="text-gray-600 text-xs sm:text-sm">40% of revenue spent on fuel, maintenance, and inefficient routes</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-semibold text-gray-800 text-sm sm:text-base">Poor Route Planning</h4>
                    <p className="text-gray-600 text-xs sm:text-sm">Manual route optimization leads to longer delivery times and higher costs</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-semibold text-gray-800 text-sm sm:text-base">No Real-time Tracking</h4>
                    <p className="text-gray-600 text-xs sm:text-sm">Customers and businesses lack visibility into shipment status</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-semibold text-gray-800 text-sm sm:text-base">Empty Return Trips</h4>
                    <p className="text-gray-600 text-xs sm:text-sm">Trucks return empty, wasting fuel and increasing carbon footprint</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* CargoCrazee Solutions */}
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border-l-4 border-green-500 w-full"
            >
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center mr-3 sm:mr-4">
                  <span className="text-green-600 text-lg sm:text-xl font-bold">✓</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800">CargoCrazee Smart Solutions</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-semibold text-gray-800 text-sm sm:text-base">AI Route Optimization</h4>
                    <p className="text-gray-600 text-xs sm:text-sm">Machine learning algorithms find the most efficient routes, reducing costs by 30%</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-semibold text-gray-800 text-sm sm:text-base">Shared Truck Pooling</h4>
                    <p className="text-gray-600 text-xs sm:text-sm">Connect with other businesses to share transportation costs and reduce empty trips</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-semibold text-gray-800 text-sm sm:text-base">Real-time GPS Tracking</h4>
                    <p className="text-gray-600 text-xs sm:text-sm">Live tracking with IoT sensors for complete shipment visibility</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-semibold text-gray-800 text-sm sm:text-base">Micro-Warehousing Network</h4>
                    <p className="text-gray-600 text-xs sm:text-sm">Strategic storage locations across Delhi for faster last-mile delivery</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Key Benefits */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-12 bg-gradient-to-r from-blue-600 to-green-500 rounded-2xl p-6 sm:p-8 text-white w-full"
          >
            <h3 className="text-xl sm:text-2xl font-bold mb-6 text-center">Why Delhi MSMEs Choose CargoCrazee</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl sm:text-2xl">💰</span>
                </div>
                <h4 className="font-semibold mb-2 text-sm sm:text-base">Cost Reduction</h4>
                <p className="text-blue-100 text-xs sm:text-sm">Save up to 30% on logistics costs through AI optimization and shared resources</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl sm:text-2xl">🌱</span>
                </div>
                <h4 className="font-semibold mb-2 text-sm sm:text-base">Environmental Impact</h4>
                <p className="text-blue-100 text-xs sm:text-sm">Reduce carbon footprint by 25% through efficient routing and shared transportation</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl sm:text-2xl">⚡</span>
                </div>
                <h4 className="font-semibold mb-2 text-sm sm:text-base">Faster Deliveries</h4>
                <p className="text-blue-100 text-xs sm:text-sm">Improve delivery times by 40% with optimized routes and micro-warehousing</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section className="py-16 sm:py-20 bg-white w-full overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-gray-800 mb-6 font-poppins">
              Smart Solutions for Modern Logistics
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Leverage cutting-edge technology to optimize your delivery operations, 
              reduce costs, and improve customer satisfaction.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 w-full">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ y: 50, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -10 }}
                  className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group w-full"
                >
                  <div className={`bg-gradient-to-r ${feature.color} p-3 rounded-lg w-fit mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm sm:text-base">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="py-16 sm:py-20 bg-gradient-to-r from-blue-600 to-green-500 relative overflow-hidden w-full">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <motion.div
            className="absolute inset-0"
            animate={{
              backgroundPosition: ["0% 0%", "100% 100%"],
            }}
            transition={{
              duration: 30,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{
              backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
              backgroundSize: "50px 50px",
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 w-full">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-white mb-6 font-poppins">
              Ready to Transform Your Logistics?
            </h2>
            <p className="text-lg sm:text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join hundreds of businesses already saving costs and improving efficiency 
              with CargoCrazee's smart logistics platform.
            </p>
            <Link
              to="/signup"
              className="bg-white text-blue-600 px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg hover:bg-gray-100 transition-all duration-200 inline-flex items-center group shadow-lg hover:shadow-xl"
            >
              Start Your Free Trial
              <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>
    </motion.div>
  );
};

export default Home;