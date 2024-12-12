import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MessageCircle, Clock, Zap, DollarSign, TrendingUp, Smartphone } from 'lucide-react';

const LandingPage = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black"></div>
        <div className="absolute inset-0 opacity-30">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute bg-white rounded-full"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: `${Math.random() * 3}px`,
                height: `${Math.random() * 3}px`,
                animation: `twinkle ${Math.random() * 5 + 3}s infinite`,
              }}
            ></div>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-black bg-opacity-80 backdrop-filter backdrop-blur-lg' : ''}`}>
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="text-2xl font-bold flex items-center">
              <DollarSign className="mr-2" />
              WiseSpend
            </div>
            <div className="space-x-4">
              <Link to="/login" className="hover:text-gray-300 transition duration-300">Login</Link>
              <Link to="/register" className="bg-white text-black px-4 py-2 rounded-full hover:bg-gray-200 transition duration-300">Sign Up</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative container mx-auto px-6 pt-32 pb-16 text-center z-10">
        <h1 className="text-5xl md:text-7xl font-extrabold mb-4 leading-tight">
          Revolutionize Your <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">Financial Future</span>
        </h1>
        <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
          WiseSpend harnesses the power of AI to provide unparalleled insights for your financial journey.
        </p>
        <Link to="/register" className="inline-flex items-center bg-white text-black px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-200 transition duration-300 transform hover:scale-105">
          Start Your Financial Revolution
          <ArrowRight className="ml-2" />
        </Link>
      </header>

      {/* Features Section */}
      <section className="relative container mx-auto px-6 py-24 z-10">
        <h2 className="text-4xl md:text-5xl font-bold mb-16 text-center">Features</h2>
        <div className="grid md:grid-cols-3 gap-12">
          <FeatureCard
            icon={<MessageCircle size={48} />}
            title="AI-Powered Feedback"
            description="Our advanced AI algorithms analyze your spending patterns and provide personalized insights to optimize your financial decisions."
          />
          <FeatureCard
            icon={<Clock size={48} />}
            title="Optimize Your Time"
            description="Streamline your budgeting process and save time with efficient financial management."
          />
          <FeatureCard
            icon={<TrendingUp size={48} />}
            title="Predictive Budgeting"
            description="Our system helps you forecast your future expenses and income based on your summary report, enabling better financial planning."
          />
        </div>
      </section>

      
      {/* CTA Section */}
      <section className="relative container mx-auto px-6 py-24 text-center z-10">
        <h2 className="text-4xl md:text-5xl font-bold mb-4">Ready to Master Your Finances?</h2>
        <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
          Join the financial revolution and take control of your economic destiny with WiseSpend.
        </p>
        <Link to="/register" className="inline-flex items-center bg-white text-black px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-200 transition duration-300 transform hover:scale-105">
          Begin Your WiseSpend Journey
          <ArrowRight className="ml-2" />
        </Link>
      </section>

      {/* Footer */}
      <footer className="relative container mx-auto px-6 py-8 border-t border-gray-800 z-10">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm">&copy; 2023 WiseSpend. Empowering financial futures.</div>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="#" className="hover:text-gray-300 transition duration-300">Privacy Policy</a>
            <a href="#" className="hover:text-gray-300 transition duration-300">Terms of Service</a>
            <a href="#" className="hover:text-gray-300 transition duration-300">Contact Us</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => {
  return (
    <div className="bg-gray-900 p-6 rounded-lg text-center hover:bg-gray-800 transition duration-300 transform hover:scale-105">
      <div className="inline-block p-3 bg-white rounded-full text-black mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  );
};



export default LandingPage;

