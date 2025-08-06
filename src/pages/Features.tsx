import React from 'react';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Eye, 
  Users, 
  Warehouse, 
  Leaf, 
  BarChart3, 
  Shield, 
  Clock,
  Smartphone,
  Zap,
  TrendingDown,
  Globe
} from 'lucide-react';

const Features = () => {
  const mainFeatures = [
    {
      icon: MapPin,
      title: 'AI Route Optimization',
      description: 'Advanced algorithms analyze traffic patterns, delivery windows, and vehicle capacity to create the most efficient routes.',
      benefits: ['30% faster deliveries', 'Reduced fuel consumption', 'Real-time route adjustments', 'Multi-stop optimization'],
      gradient: 'from-blue-500 to-purple-600',
    },
    {
      icon: Eye,
      title: 'IoT Live Tracking',
      description: 'Real-time monitoring with GPS, temperature sensors, and delivery confirmations for complete shipment visibility.',
      benefits: ['Live GPS tracking', 'Temperature monitoring', 'Photo confirmations', 'Instant notifications'],
      gradient: 'from-green-500 to-blue-500',
    },
    {
      icon: Users,
      title: 'Shared Truck Pooling',
      description: 'Connect with other businesses to share transportation costs while maintaining delivery quality and timing.',
      benefits: ['40% cost reduction', 'Eco-friendly shipping', 'Smart business matching', 'Flexible scheduling'],
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      icon: Warehouse,
      title: 'Micro-Warehousing',
      description: 'Strategic storage locations across Delhi NCR for faster last-mile delivery and inventory management.',
      benefits: ['Same-day delivery', 'Reduced storage costs', 'Strategic locations', 'Inventory management'],
      gradient: 'from-orange-500 to-red-500',
    },
  ];

  const additionalFeatures = [
    {
      icon: Leaf,
      title: 'Carbon Footprint Tracker',
      description: 'Monitor and reduce your environmental impact with detailed emissions tracking.',
    },
    {
      icon: BarChart3,
      title: 'Analytics Dashboard',
      description: 'Comprehensive insights into delivery performance and cost optimization.',
    },
    {
      icon: Shield,
      title: 'Secure Payments',
      description: 'End-to-end encrypted transactions with multiple payment options.',
    },
    {
      icon: Clock,
      title: '24/7 Support',
      description: 'Round-the-clock customer support for all your logistics needs.',
    },
    {
      icon: Smartphone,
      title: 'Mobile App',
      description: 'Manage deliveries on-the-go with our intuitive mobile application.',
    },
    {
      icon: Zap,
      title: 'Quick Setup',
      description: 'Get started in minutes with our streamlined onboarding process.',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pt-16"
    >
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-green-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-800 mb-6 font-poppins">
              Powerful Features for 
              <span className="text-blue-600"> Modern Logistics</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover how CargoCrazee's comprehensive suite of features can transform 
              your delivery operations and drive business growth.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-20">
            {mainFeatures.map((feature, index) => {
              const Icon = feature.icon;
              const isEven = index % 2 === 0;
              
              return (
                <motion.div
                  key={index}
                  initial={{ y: 100, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-12`}
                >
                  {/* Content */}
                  <div className="flex-1 space-y-6">
                    <div className={`bg-gradient-to-r ${feature.gradient} p-4 rounded-full w-fit`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    
                    <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 font-poppins">
                      {feature.title}
                    </h2>
                    
                    <p className="text-xl text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {feature.benefits.map((benefit, benefitIndex) => (
                        <div key={benefitIndex} className="flex items-center space-x-3">
                          <TrendingDown className="h-5 w-5 text-green-500 flex-shrink-0" />
                          <span className="text-gray-700">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Visual */}
                  <div className="flex-1 flex justify-center">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="relative"
                    >
                      <div className={`w-80 h-80 bg-gradient-to-br ${feature.gradient} rounded-3xl flex items-center justify-center shadow-2xl opacity-10`}>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-64 h-64 bg-white rounded-2xl shadow-xl flex items-center justify-center">
                          <motion.div
                            animate={{ 
                              rotate: [0, 5, -5, 0],
                              scale: [1, 1.1, 1]
                            }}
                            transition={{ 
                              duration: 4, 
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                          >
                            <Icon className="h-24 w-24 text-blue-500" />
                          </motion.div>
                        </div>
                      </div>
                      
                      {/* Floating Icons around the card */}
                      <motion.div
                        className="absolute -top-6 -left-6 bg-gradient-to-r from-purple-400 to-pink-400 text-white p-2 rounded-full shadow-lg"
                        animate={{
                          y: [0, -8, 0],
                          rotate: [0, 180, 360],
                        }}
                        transition={{
                          y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                          rotate: { duration: 8, repeat: Infinity, ease: "linear" }
                        }}
                      >
                        <div className="w-4 h-4 flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      </motion.div>
                      
                      <motion.div
                        className="absolute -bottom-6 -right-6 bg-gradient-to-r from-yellow-400 to-orange-400 text-white p-2 rounded-full shadow-lg"
                        animate={{
                          x: [0, 8, 0],
                          scale: [1, 1.1, 1],
                        }}
                        transition={{
                          duration: 5,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: 1,
                        }}
                      >
                        <div className="w-4 h-4 flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      </motion.div>
                      
                      <motion.div
                        className="absolute top-1/4 -right-12 bg-gradient-to-r from-cyan-400 to-blue-400 text-white p-2 rounded-full shadow-lg"
                        animate={{
                          y: [0, -10, 0],
                          rotate: [0, 360],
                        }}
                        transition={{
                          y: { duration: 6, repeat: Infinity, ease: "easeInOut" },
                          rotate: { duration: 10, repeat: Infinity, ease: "linear" }
                        }}
                      >
                        <div className="w-4 h-4 flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      </motion.div>
                      
                      <motion.div
                        className="absolute bottom-1/4 -left-12 bg-gradient-to-r from-green-400 to-emerald-400 text-white p-2 rounded-full shadow-lg"
                        animate={{
                          x: [0, -8, 0],
                          scale: [1, 1.2, 1],
                        }}
                        transition={{
                          duration: 7,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: 2,
                        }}
                      >
                        <div className="w-4 h-4 flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      </motion.div>
                      
                      {/* Additional floating elements based on feature type */}
                      {feature.title.includes('AI') && (
                        <motion.div
                          className="absolute top-1/6 -left-16 bg-gradient-to-r from-indigo-400 to-purple-400 text-white p-2 rounded-full shadow-lg"
                          animate={{
                            y: [0, -12, 0],
                            rotate: [0, 180, 360],
                          }}
                          transition={{
                            y: { duration: 5, repeat: Infinity, ease: "easeInOut" },
                            rotate: { duration: 10, repeat: Infinity, ease: "linear" }
                          }}
                        >
                          <div className="text-xs font-bold">AI</div>
                        </motion.div>
                      )}
                      
                      {feature.title.includes('IoT') && (
                        <motion.div
                          className="absolute bottom-1/6 -right-16 bg-gradient-to-r from-teal-400 to-green-400 text-white p-2 rounded-full shadow-lg"
                          animate={{
                            x: [0, 12, 0],
                            scale: [1, 1.1, 1],
                          }}
                          transition={{
                            duration: 7,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 2,
                          }}
                        >
                          <div className="text-xs font-bold">IoT</div>
                        </motion.div>
                      )}
                      
                      {feature.title.includes('Shared') && (
                        <motion.div
                          className="absolute top-1/3 -right-20 bg-gradient-to-r from-pink-400 to-red-400 text-white p-2 rounded-full shadow-lg"
                          animate={{
                            y: [0, -10, 0],
                            rotate: [0, 360],
                          }}
                          transition={{
                            y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                            rotate: { duration: 8, repeat: Infinity, ease: "linear" }
                          }}
                        >
                          <div className="text-xs font-bold">SHARE</div>
                        </motion.div>
                      )}
                      
                      {feature.title.includes('Micro') && (
                        <motion.div
                          className="absolute bottom-1/3 -left-20 bg-gradient-to-r from-orange-400 to-red-400 text-white p-2 rounded-full shadow-lg"
                          animate={{
                            x: [0, -8, 0],
                            scale: [1, 1.2, 1],
                          }}
                          transition={{
                            duration: 6,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 1.5,
                          }}
                        >
                          <div className="text-xs font-bold">WAREHOUSE</div>
                        </motion.div>
                      )}
                    </motion.div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Additional Features Grid */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-800 mb-6 font-poppins">
              More Features to Power Your Business
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Every feature is designed to help modern businesses compete more effectively 
              in today's fast-paced logistics landscape.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {additionalFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ y: 50, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -10 }}
                  className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <div className="bg-gradient-to-r from-blue-500 to-green-400 p-3 rounded-lg w-fit mb-6">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Integration Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-green-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <Globe className="h-16 w-16 text-white mx-auto mb-6" />
            <h2 className="text-3xl lg:text-5xl font-bold text-white mb-8 font-poppins">
              Seamless Integrations
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-12">
              Connect with your existing systems and popular business tools 
              for a unified logistics management experience.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {['ERP Systems', 'E-commerce', 'Accounting', 'CRM Tools'].map((integration, index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0.5, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-6 text-center"
                >
                  <div className="text-white font-semibold">{integration}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </motion.div>
  );
};

export default Features;