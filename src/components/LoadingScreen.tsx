import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Package, Route, Zap, Globe, Shield } from 'lucide-react';

const LoadingScreen = () => {
  const features = [
    { icon: MapPin, text: 'Route Optimization' },
    { icon: Package, text: 'Smart Logistics' },
    { icon: Route, text: 'Real-time Tracking' },
    { icon: Zap, text: 'AI-Powered' },
    { icon: Globe, text: 'Global Network' },
    { icon: Shield, text: 'Secure & Reliable' },
  ];

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0">
        {/* Animated Grid Pattern */}
        <div className="absolute inset-0 opacity-10">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-px h-full bg-blue-400"
              style={{
                left: `${(i * 5) % 100}%`,
              }}
              animate={{
                opacity: [0.1, 0.3, 0.1],
                scaleY: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 4 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 3,
              }}
            />
          ))}
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i + 20}
              className="absolute w-full h-px bg-green-400"
              style={{
                top: `${(i * 7) % 100}%`,
              }}
              animate={{
                opacity: [0.1, 0.3, 0.1],
                scaleX: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        {/* Floating Particles */}
        {[...Array(25)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-blue-400 rounded-full opacity-60"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, Math.random() * 20 - 10, 0],
              opacity: [0.3, 1, 0.3],
              scale: [0.5, 1.5, 0.5],
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 4,
            }}
          />
        ))}
        
        {/* Route Lines with Enhanced Animation */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-40 h-px bg-gradient-to-r from-transparent via-green-400 to-transparent opacity-40"
          animate={{
            scaleX: [0, 1, 0],
            opacity: [0, 0.8, 0],
            x: [0, 20, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: 0.5,
          }}
        />
        <motion.div
          className="absolute top-3/4 right-1/4 w-32 h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-40"
          animate={{
            scaleX: [0, 1, 0],
            opacity: [0, 0.8, 0],
            x: [0, -15, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: 1.5,
          }}
        />
        
        {/* Diagonal Route Lines */}
        <motion.div
          className="absolute top-1/3 left-1/3 w-24 h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent opacity-30 transform rotate-45"
          animate={{
            scaleX: [0, 1, 0],
            opacity: [0, 0.6, 0],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            delay: 2,
          }}
        />

        {/* Floating Feature Icons */}
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={index}
              className="absolute text-blue-300 opacity-30"
              style={{
                left: `${20 + (index * 12) % 80}%`,
                top: `${30 + (index * 8) % 60}%`,
              }}
              animate={{
                y: [0, -20, 0],
                rotate: [0, 360],
                opacity: [0.2, 0.5, 0.2],
              }}
              transition={{
                duration: 8 + index * 0.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: index * 0.3,
              }}
            >
              <Icon className="h-8 w-8" />
            </motion.div>
          );
        })}
      </div>

      {/* Main Content with Enhanced Animations */}
      <div className="text-center relative z-20">
        {/* Enhanced Logo Text */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8, duration: 1 }}
        >
          <motion.h1 
            className="text-5xl font-bold text-white mb-3 font-poppins"
            animate={{
              textShadow: [
                "0 0 15px rgba(255, 255, 255, 0.6)",
                "0 0 25px rgba(59, 130, 246, 0.8)",
                "0 0 15px rgba(34, 197, 94, 0.8)",
                "0 0 15px rgba(255, 255, 255, 0.6)",
              ],
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            CargoCrazee
          </motion.h1>
          <motion.p 
            className="text-blue-200 text-xl font-medium mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 1 }}
          >
            AI-Driven Logistics Revolution
          </motion.p>
          <motion.p 
            className="text-blue-300 text-sm font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 1 }}
          >
            Next-Gen • Autonomous • Intelligent • Made for Delhi's MSMEs
          </motion.p>
        </motion.div>

        {/* Enhanced Loading Progress */}
        <motion.div
          className="mt-10 w-80 h-2 bg-slate-700 rounded-full overflow-hidden mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 via-green-400 to-purple-500 rounded-full relative"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 3, ease: "easeOut", delay: 1.5 }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
              animate={{
                x: ["-100%", "100%"],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: 1.5,
              }}
            />
          </motion.div>
        </motion.div>

        {/* Enhanced Loading Text */}
        <motion.div
          className="mt-6 text-blue-300 text-lg font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8 }}
        >
          <motion.span
            animate={{
              opacity: [1, 0.5, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          >
            Connecting CargoCrazee...
          </motion.span>
        </motion.div>
        
        {/* Loading Steps */}
        <motion.div
          className="mt-8 flex justify-center space-x-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.2 }}
        >
          {['Initializing', 'Loading Routes', 'Optimizing', 'Ready'].map((step, index) => (
            <motion.div
              key={index}
              className="text-xs text-blue-300"
              animate={{
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: index * 0.5,
              }}
            >
              {step}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default LoadingScreen;