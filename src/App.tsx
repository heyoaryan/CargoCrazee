import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import LoadingScreen from './components/LoadingScreen';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import HowItWorks from './pages/HowItWorks';
import Features from './pages/Features';
import About from './pages/About';
import Contact from './pages/Contact';
import SignUp from './pages/SignUp';
import SignIn from './pages/SignIn';
import Dashboard from './pages/Dashboard';
import AddDelivery from './pages/AddDelivery';
import SharedTruckMatches from './pages/SharedTruckMatches';
import MicroWarehouse from './pages/MicroWarehouse';
import Alerts from './pages/Alerts';
import Profile from './pages/Profile';
import Chatbot from './components/Chatbot';

// Global alert interface
export interface Alert {
  id: number;
  type: 'delay' | 'success' | 'warning' | 'info';
  title: string;
  message: string;
  time: string;
  status: 'active' | 'pending' | 'completed';
  priority: 'high' | 'medium' | 'low';
  shipmentId: string;
  route: string;
  read: boolean;
}

// Global alert context
export const AlertContext = React.createContext<{
  alerts: Alert[];
  addAlert: (alert: Omit<Alert, 'id'>) => void;
  markAsRead: (id: number) => void;
  archiveAlert: (id: number) => void;
  deleteAlert: (id: number) => void;
  unreadCount: number;
}>({
  alerts: [],
  addAlert: () => {},
  markAsRead: () => {},
  archiveAlert: () => {},
  deleteAlert: () => {},
  unreadCount: 0,
});

// Component to conditionally render navbar
const AppContent = ({ isAuthenticated, user, onLogout, onLogin }: {
  isAuthenticated: boolean;
  user: { name: string; email: string } | null;
  onLogout: () => void;
  onLogin: (userData: { name: string; email: string }) => void;
}) => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/signup' || location.pathname === '/signin';
  
  // Check if user is trying to access protected routes without authentication
  const isProtectedRoute = ['/dashboard', '/add-delivery', '/shared-trucks', '/micro-warehouse', '/alerts'].includes(location.pathname);
  
  return (
    <div className="min-h-screen bg-white w-full overflow-x-hidden">
      {/* Only show navbar if not on auth pages */}
      {!isAuthPage && (
        <Navbar 
          isAuthenticated={isAuthenticated} 
          user={user} 
          onLogout={onLogout} 
        />
      )}
      
      <AnimatePresence mode="wait">
        <Routes>
          {!isAuthenticated ? (
            <>
              <Route path="/" element={<Home />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/features" element={<Features />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/signup" element={<SignUp onSignUp={onLogin} />} />
              <Route path="/signin" element={<SignIn onSignIn={onLogin} />} />
              {/* Redirect protected routes to home if not authenticated */}
              <Route path="/dashboard" element={<Navigate to="/" replace />} />
              <Route path="/add-delivery" element={<Navigate to="/" replace />} />
              <Route path="/shared-trucks" element={<Navigate to="/" replace />} />
              <Route path="/micro-warehouse" element={<Navigate to="/" replace />} />
              <Route path="/alerts" element={<Navigate to="/" replace />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          ) : (
            <>
              <Route path="/dashboard" element={<Dashboard user={user} />} />
              <Route path="/add-delivery" element={<AddDelivery />} />
              <Route path="/shared-trucks" element={<SharedTruckMatches />} />
              <Route path="/micro-warehouse" element={<MicroWarehouse />} />
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/profile" element={<Profile user={user} onUserUpdate={onLogin} />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </>
          )}
        </Routes>
      </AnimatePresence>

      {/* Footer - Only for specific before login pages */}
      {!isAuthenticated && (
        window.location.pathname === '/' ||
        window.location.pathname === '/how-it-works' ||
        window.location.pathname === '/features' ||
        window.location.pathname === '/about' ||
        window.location.pathname === '/contact'
      ) && <Footer />}
    </div>
  );
};

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    // Check for existing authentication on app load
    const savedAuth = localStorage.getItem('isAuthenticated');
    const savedUser = localStorage.getItem('user');
    const savedAlerts = localStorage.getItem('alerts');
    
    if (savedAuth === 'true' && savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setIsAuthenticated(true);
        setUser(userData);
      } catch (error) {
        console.error('Error parsing saved user data:', error);
        // Clear invalid data
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('user');
      }
    }

    // Load saved alerts
    if (savedAlerts) {
      try {
        const parsedAlerts = JSON.parse(savedAlerts);
        setAlerts(parsedAlerts);
      } catch (error) {
        console.error('Error parsing saved alerts:', error);
        localStorage.removeItem('alerts');
      }
    }

    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // Save alerts to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('alerts', JSON.stringify(alerts));
  }, [alerts]);

  const addAlert = (alert: Omit<Alert, 'id'>) => {
    const newAlert: Alert = {
      ...alert,
      id: Date.now(),
    };
    setAlerts(prev => [newAlert, ...prev]);
  };

  const markAsRead = (id: number) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === id ? { ...alert, read: true } : alert
    ));
  };

  const archiveAlert = (id: number) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  const deleteAlert = (id: number) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  const unreadCount = alerts.filter(alert => !alert.read).length;

  const handleLogin = (userData: { name: string; email: string }) => {
    setIsAuthenticated(true);
    setUser(userData);
    
    // Save to localStorage
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setAlerts([]); // Clear alerts on logout
    
    // Clear from localStorage
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
    localStorage.removeItem('alerts');
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <AlertContext.Provider value={{
      alerts,
      addAlert,
      markAsRead,
      archiveAlert,
      deleteAlert,
      unreadCount,
    }}>
      <Router>
        <AppContent 
          isAuthenticated={isAuthenticated} 
          user={user} 
          onLogout={handleLogout} 
          onLogin={handleLogin}
        />
      </Router>
      {/* Show Chatbot only after login */}
      {isAuthenticated && <Chatbot user={user} />}
    </AlertContext.Provider>
  );
}

export default App;