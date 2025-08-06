import React from 'react';
import { motion } from 'framer-motion';
import { Target, Users, Award, TrendingUp, Heart, Globe } from 'lucide-react';

const About = () => {
  const problems = [
    'High logistics costs eating into MSME profits',
    'Lack of real-time visibility in shipments',
    'Inefficient route planning causing delays',
    'Limited access to shared transportation',
    'Environmental impact of individual deliveries',
  ];

  const solutions = [
    'AI-powered cost optimization reducing expenses by 30%',
    'Real-time IoT tracking for complete visibility',
    'Smart route optimization for faster deliveries',
    'Shared truck pooling connecting businesses',
    'Carbon footprint tracking for sustainable logistics',
  ];

  const values = [
    {
      icon: Target,
      title: 'Innovation',
      description: 'Leveraging cutting-edge technology to solve traditional logistics challenges.',
    },
    {
      icon: Users,
      title: 'Community',
      description: 'Building a connected ecosystem of Delhi MSMEs for mutual growth.',
    },
    {
      icon: Award,
      title: 'Excellence',
      description: 'Delivering exceptional service quality and reliability in every interaction.',
    },
    {
      icon: Heart,
      title: 'Sustainability',
      description: 'Committed to reducing environmental impact through shared logistics.',
    },
  ];

  const team = [
    {
      name: 'Rajesh Kumar',
      role: 'CEO & Founder',
      description: 'Former logistics executive with 15+ years experience in supply chain optimization.',
    },
    {
      name: 'Priya Sharma',
      role: 'CTO',
      description: 'AI/ML expert specializing in route optimization and predictive analytics.',
    },
    {
      name: 'Amit Singh',
      role: 'Head of Operations',
      description: 'Ground operations specialist with deep knowledge of Delhi logistics landscape.',
    },
    {
      name: 'Neha Gupta',
      role: 'Customer Success',
      description: 'Dedicated to ensuring every MSME achieves success with our platform.',
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
              Empowering Delhi's 
              <span className="text-blue-600"> MSME Community</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              CargoCrazee was born from a simple vision: to make world-class logistics 
              accessible to every small and medium business in India's capital.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Problem & Solution */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Problem */}
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-8 font-poppins">
                The Challenge We Address
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Delhi's MSMEs face significant logistics challenges that impact their growth and competitiveness:
              </p>
              <div className="space-y-4">
                {problems.map((problem, index) => (
                  <motion.div
                    key={index}
                    initial={{ x: -20, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="flex items-start space-x-3"
                  >
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-3 flex-shrink-0"></div>
                    <span className="text-gray-700">{problem}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Solution */}
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-8 font-poppins">
                Our Smart Solutions
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                CargoCrazee addresses each challenge with technology-driven solutions that deliver measurable results:
              </p>
              <div className="space-y-4">
                {solutions.map((solution, index) => (
                  <motion.div
                    key={index}
                    initial={{ x: 20, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="flex items-start space-x-3"
                  >
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-3 flex-shrink-0"></div>
                    <span className="text-gray-700">{solution}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-green-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 text-white">
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="text-center lg:text-left"
            >
              <Target className="h-16 w-16 text-white mb-6 mx-auto lg:mx-0" />
              <h2 className="text-3xl lg:text-4xl font-bold mb-6 font-poppins">Our Mission</h2>
              <p className="text-xl text-blue-100 leading-relaxed">
                To democratize logistics for Delhi's MSME community by providing access to 
                world-class technology, shared resources, and sustainable solutions that 
                drive business growth and environmental responsibility.
              </p>
            </motion.div>

            <motion.div
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-center lg:text-left"
            >
              <Globe className="h-16 w-16 text-white mb-6 mx-auto lg:mx-0" />
              <h2 className="text-3xl lg:text-4xl font-bold mb-6 font-poppins">Our Vision</h2>
              <p className="text-xl text-blue-100 leading-relaxed">
                To become India's leading MSME-focused logistics platform, creating a 
                connected ecosystem where small businesses can compete globally through 
                smart, sustainable, and cost-effective logistics solutions.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-800 mb-6 font-poppins">
              Our Core Values
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              These principles guide every decision we make and every solution we build.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ y: 50, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -10 }}
                  className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-center"
                >
                  <div className="bg-gradient-to-r from-blue-500 to-green-400 p-4 rounded-full w-fit mx-auto mb-6">
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">
                    {value.title}
                  </h3>
                  <p className="text-gray-600">
                    {value.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team */}
      {/* Meet Our Team section removed as per request */}

      {/* Stats */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-green-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6 font-poppins">
              Our Impact So Far
            </h2>
          </motion.div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { number: '500+', label: 'MSMEs Served' },
              { number: '10K+', label: 'Deliveries Made' },
              { number: '30%', label: 'Average Cost Savings' },
              { number: '25%', label: 'CO₂ Reduction' },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0.5, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl lg:text-5xl font-bold text-white mb-2">
                  {stat.number}
                </div>
                <div className="text-blue-100 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </motion.div>
  );
};

export default About;