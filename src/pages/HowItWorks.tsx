import { motion } from 'framer-motion';
import { Package, MapPin, Eye, CheckCircle, Users } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      icon: Package,
      title: 'Add Your Delivery',
      description: 'Enter pickup and delivery details, package information, and preferred delivery time.',
      details: ['Pickup location', 'Delivery address', 'Package details', 'Time preferences'],
    },
    {
      icon: MapPin,
      title: 'AI Route Suggestion',
      description: 'Our AI algorithm analyzes traffic, distance, and delivery windows to suggest optimal routes.',
      details: ['Real-time traffic analysis', 'Multiple route options', 'Cost estimation', 'Time optimization'],
    },
    {
      icon: Users,
      title: 'Shared Truck Matching',
      description: 'Get matched with other businesses for shared transportation to reduce costs.',
      details: ['Smart matching algorithm', 'Compatible delivery routes', 'Cost sharing benefits', 'Instant confirmation'],
    },
    {
      icon: Eye,
      title: 'Live Tracking',
      description: 'Track your shipment in real-time with GPS and IoT sensors for complete visibility.',
      details: ['GPS location updates', 'Temperature monitoring', 'Delivery notifications', 'Photo confirmations'],
    },
    {
      icon: CheckCircle,
      title: 'Delivery Confirmation',
      description: 'Receive confirmation and feedback once your delivery is completed successfully.',
      details: ['Proof of delivery', 'Customer feedback', 'Performance analytics', 'Invoice generation'],
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
              How CargoCrazee Works
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From order to delivery, our platform streamlines every step of your logistics process 
              with smart technology and seamless integrations.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-20">
            {steps.map((step, index) => {
              const Icon = step.icon;
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
                    <div className="flex items-center space-x-4">
                      <div className="bg-gradient-to-r from-blue-500 to-green-400 p-4 rounded-full">
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                      <div className="text-lg font-semibold text-gray-500">
                        Step {index + 1}
                      </div>
                    </div>
                    
                    <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 font-poppins">
                      {step.title}
                    </h2>
                    
                    <p className="text-xl text-gray-600 leading-relaxed">
                      {step.description}
                    </p>
                    
                    <ul className="space-y-3">
                      {step.details.map((detail, detailIndex) => (
                        <li key={detailIndex} className="flex items-center space-x-3">
                          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                          <span className="text-gray-700">{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Visual */}
                  <div className="flex-1 flex justify-center">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="relative"
                    >
                      <div className="w-80 h-80 bg-gradient-to-br from-blue-100 to-green-100 rounded-3xl flex items-center justify-center shadow-xl">
                        <div className="w-64 h-64 bg-white rounded-2xl shadow-lg flex items-center justify-center">
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
                      
                      {/* Step number */}
                      <div className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-r from-blue-500 to-green-400 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                        {index + 1}
                      </div>
                      
                      {/* Additional Floating Icons around the card */}
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
                    </motion.div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-green-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h2 className="text-3xl lg:text-5xl font-bold text-white mb-8 font-poppins">
              Why Choose CargoCrazee?
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              {[
                { number: '30%', label: 'Cost Reduction', desc: 'Through shared logistics' },
                { number: '50%', label: 'Time Savings', desc: 'With AI optimization' },
                { number: '25%', label: 'CO₂ Reduction', desc: 'Environmental impact' },
              ].map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0.5, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="text-5xl font-bold text-white mb-2">
                    {benefit.number}
                  </div>
                  <div className="text-xl font-semibold text-blue-100 mb-2">
                    {benefit.label}
                  </div>
                  <div className="text-blue-200">
                    {benefit.desc}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </motion.div>
  );
};

export default HowItWorks;