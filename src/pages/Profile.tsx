import React, { useState, useContext, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Building, 
  Camera, 
  Upload, 
  Eye, 
  EyeOff,
  Save,
  Edit,
  Shield,
  FileText,
  Image
} from 'lucide-react';
import { AlertContext } from '../App';

interface ProfileProps {
  user?: { name: string; email: string } | null;
  onUserUpdate?: (userData: { name: string; email: string }) => void;
}

const Profile = ({ user, onUserUpdate }: ProfileProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  
  const { addAlert } = useContext(AlertContext);

  // Load saved profile data from localStorage
  const [profileData, setProfileData] = useState({
    name: user?.name || 'John Doe',
    email: user?.email || 'john.doe@example.com',
    businessName: 'Delhi Logistics Co.',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Update profile data when user prop changes
  useEffect(() => {
    if (user) {
      setProfileData(prev => ({
        ...prev,
        name: user.name,
        email: user.email,
      }));
    }
  }, [user]);

  // Load saved profile data on component mount
  useEffect(() => {
    const savedProfile = localStorage.getItem('profileData');
    if (savedProfile) {
      try {
        const parsedProfile = JSON.parse(savedProfile);
        setProfileData(prev => ({ ...prev, ...parsedProfile }));
      } catch (error) {
        console.error('Error parsing saved profile data:', error);
      }
    }
  }, []);

  // Save profile data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('profileData', JSON.stringify(profileData));
  }, [profileData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    // Update global user state if callback is provided
    if (onUserUpdate) {
      onUserUpdate({
        name: profileData.name,
        email: profileData.email,
      });
    }

    // Simulate saving
    addAlert({
      type: 'success',
      title: 'Profile Updated Successfully!',
      message: 'Your profile information has been saved successfully.',
      time: 'Just now',
      status: 'active',
      priority: 'low',
      shipmentId: 'Profile',
      route: 'Settings',
      read: false,
    });
    setIsEditing(false);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && isEditing) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
        // Save avatar to localStorage
        localStorage.setItem('avatarPreview', e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      addAlert({
        type: 'success',
        title: 'Document Uploaded Successfully!',
        message: `${file.name} has been uploaded to your profile.`,
        time: 'Just now',
        status: 'active',
        priority: 'low',
        shipmentId: 'Document',
        route: 'Profile',
        read: false,
      });
    }
  };

  // Load saved avatar on component mount
  useEffect(() => {
    const savedAvatar = localStorage.getItem('avatarPreview');
    if (savedAvatar) {
      setAvatarPreview(savedAvatar);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="flex-1 overflow-auto">
        <div className="p-4 lg:p-6 max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-2 font-poppins">
              Profile Settings
            </h1>
            <p className="text-gray-600">
              Manage your account information, security settings, and business details
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Information */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-2 space-y-6"
            >
              {/* Basic Information */}
              <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-3 sm:space-y-0">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Basic Information</h2>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="flex items-center justify-center sm:justify-start space-x-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors duration-200 w-full sm:w-auto"
                  >
                    <Edit className="h-4 w-4" />
                    <span className="text-sm font-medium">{isEditing ? 'Cancel' : 'Edit'}</span>
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                      <input
                        type="text"
                        name="name"
                        value={profileData.name}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full pl-10 sm:pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 text-sm sm:text-base"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                      <input
                        type="email"
                        name="email"
                        value={profileData.email}
                        disabled={true}
                        className="w-full pl-10 sm:pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 text-sm sm:text-base cursor-not-allowed"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Email address cannot be changed</p>
                  </div>

                  {isEditing && (
                    <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 pt-4">
                      <button
                        onClick={handleSave}
                        className="flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-500 to-green-400 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-green-500 transition-all duration-200 w-full sm:w-auto"
                      >
                        <Save className="h-4 w-4" />
                        <span>Save Changes</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Security Settings */}
              <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
                <div className="flex items-center space-x-2 mb-6">
                  <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Security Settings</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="currentPassword"
                        value={profileData.currentPassword}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                        placeholder="Enter current password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" /> : <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        name="newPassword"
                        value={profileData.newPassword}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                        placeholder="Enter new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" /> : <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={profileData.confirmPassword}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                      placeholder="Confirm new password"
                    />
                  </div>

                  <button className="bg-gradient-to-r from-blue-500 to-green-400 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-green-500 transition-all duration-200 w-full sm:w-auto">
                    Update Password
                  </button>
                </div>
              </div>

              {/* Document Upload */}
              <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
                <div className="flex items-center space-x-2 mb-6">
                  <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Document Upload</h2>
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 text-center">
                  <Upload className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-base sm:text-lg font-medium text-gray-700 mb-2">Upload Documents</h3>
                  <p className="text-sm sm:text-base text-gray-500 mb-4">Upload business documents, licenses, or other important files</p>
                  <input
                    type="file"
                    onChange={handleDocumentUpload}
                    className="hidden"
                    id="document-upload"
                    multiple
                  />
                  <label
                    htmlFor="document-upload"
                    className="bg-gradient-to-r from-blue-500 to-green-400 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-green-500 transition-all duration-200 cursor-pointer inline-block"
                  >
                    Choose Files
                  </label>
                </div>
              </div>
            </motion.div>

            {/* Avatar Section */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              {/* Avatar */}
              <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
                <div className="flex items-center space-x-2 mb-6">
                  <Image className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Profile Picture</h2>
                </div>

                <div className="text-center">
                  <div className="relative inline-block mb-4">
                    <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-r from-blue-500 to-green-400 rounded-full flex items-center justify-center text-white text-2xl sm:text-4xl font-bold">
                      {avatarPreview ? (
                        <img
                          src={avatarPreview}
                          alt="Profile"
                          className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover"
                        />
                      ) : (
                        profileData.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    {isEditing && (
                      <label
                        htmlFor="avatar-upload"
                        className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg cursor-pointer hover:shadow-xl transition-shadow duration-200"
                      >
                        <Camera className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                      </label>
                    )}
                    <input
                      type="file"
                      id="avatar-upload"
                      onChange={handleAvatarChange}
                      accept="image/*"
                      className="hidden"
                      disabled={!isEditing}
                    />
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500">
                    {isEditing ? 'Click the camera icon to change your profile picture' : 'Profile picture can only be changed in edit mode'}
                  </p>
                </div>
              </div>

              {/* Account Stats */}
              <div className="bg-gradient-to-r from-blue-600 to-green-500 rounded-2xl p-4 sm:p-6 text-white">
                <h3 className="text-base sm:text-lg font-semibold mb-4">Account Statistics</h3>
                <div className="space-y-3 text-sm sm:text-base">
                  <div className="flex justify-between">
                    <span>Member Since</span>
                    <span className="font-medium">March 2024</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Deliveries</span>
                    <span className="font-medium">247</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Documents</span>
                    <span className="font-medium">12</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Last Login</span>
                    <span className="font-medium">Today</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile; 