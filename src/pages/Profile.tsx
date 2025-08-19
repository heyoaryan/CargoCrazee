import React, { useState, useContext, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
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
import { apiService } from '../services/api';

interface ProfileProps {
  user?: { name: string; email: string; avatarUrl?: string | null } | null;
  onUserUpdate?: (userData: { name: string; email: string; avatarUrl?: string | null }) => void;
}

const Profile = ({ user, onUserUpdate }: ProfileProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatarUrl || null);
  const [isEditingSecurity, setIsEditingSecurity] = useState(false);
  const [totalDeliveries, setTotalDeliveries] = useState<number>(0);
  const [documentsCount, setDocumentsCount] = useState<number>(Number(localStorage.getItem('uploadedDocuments') || '0'));
  
  const { addAlert } = useContext(AlertContext);

  // Load saved profile data from localStorage
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    businessName: '',
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

  // Fetch actual totals for account statistics
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const overview = await apiService.getDashboardOverview();
        setTotalDeliveries(overview.totalDeliveries || 0);
      } catch (err) {
        console.error('Failed to load dashboard overview:', err);
      }
      try {
        const docs = Number(localStorage.getItem('uploadedDocuments') || '0');
        setDocumentsCount(docs);
      } catch (err) {
        console.error('Failed to load documents count:', err);
      }
    };
    fetchStats();
  }, []);

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
        avatarUrl: avatarPreview || null,
      });
    }

    setIsEditing(false);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && isEditing) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // File uploaded silently
    }
  };

  // Document types for one-by-one uploads
  const documentTypes: { key: string; label: string }[] = [
    { key: 'gstCertificate', label: 'GST Certificate' },
    { key: 'companyPan', label: 'Company PAN' },
    { key: 'incorporationCertificate', label: 'Certificate of Incorporation' },
    { key: 'addressProof', label: 'Registered Address Proof' },
    { key: 'bankProof', label: 'Cancelled Cheque / Bank Proof' },
  ];

  const [selectedDocs, setSelectedDocs] = useState<Record<string, File | null>>({});

  const onSelectDocument = (key: string, file: File | null) => {
    setSelectedDocs(prev => ({ ...prev, [key]: file }));
  };

  const onUploadDocument = async (key: string) => {
    const file = selectedDocs[key];
    if (!file) return;
    try {
      // TODO: Replace with real API call when backend endpoint is available
      await new Promise(res => setTimeout(res, 600));
      addAlert({
        type: 'success',
        title: 'Document Uploaded',
        message: `${documentTypes.find(d => d.key === key)?.label} uploaded: ${file.name}`,
        time: new Date().toISOString(),
        status: 'completed',
        priority: 'low',
        shipmentId: '-',
        route: '-',
        read: false,
      });
      setSelectedDocs(prev => ({ ...prev, [key]: null }));
      const currentCount = Number(localStorage.getItem('uploadedDocuments') || '0');
      const next = currentCount + 1;
      localStorage.setItem('uploadedDocuments', String(next));
      setDocumentsCount(next);
    } catch (e) {
      console.error(e);
      addAlert({
        type: 'error',
        title: 'Upload Failed',
        message: `Could not upload ${documentTypes.find(d => d.key === key)?.label}. Please try again.`,
        time: new Date().toISOString(),
        status: 'pending',
        priority: 'medium',
        shipmentId: '-',
        route: '-',
        read: false,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="flex-1 overflow-auto">
        <div className="p-4 lg:p-6 max-w-5xl mx-auto">
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
              className="order-2 lg:order-1 lg:col-span-2 space-y-6"
            >
              {/* Basic Information (order-2 on mobile, after avatar) */}
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

              {/* Business Details removed as requested */}

              {/* Security Settings (order-3 on mobile) */}
              <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Security Settings</h2>
                  </div>
                  <button
                    onClick={() => setIsEditingSecurity(!isEditingSecurity)}
                    className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors duration-200"
                  >
                    <Edit className="h-4 w-4" />
                    <span className="text-sm font-medium">{isEditingSecurity ? 'Cancel' : 'Edit'}</span>
                  </button>
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
                        disabled={!isEditingSecurity}
                        className="w-full px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base disabled:bg-gray-50"
                        placeholder="Enter current password"
                      />
                      <button
                        type="button"
                        onClick={() => isEditingSecurity && setShowPassword(!showPassword)}
                        disabled={!isEditingSecurity}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" /> : <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                          disabled={!isEditingSecurity}
                          className="w-full px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base disabled:bg-gray-50"
                          placeholder="Enter new password"
                        />
                        <button
                          type="button"
                          onClick={() => isEditingSecurity && setShowNewPassword(!showNewPassword)}
                          disabled={!isEditingSecurity}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 disabled:opacity-40 disabled:cursor-not-allowed"
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
                        disabled={!isEditingSecurity}
                        className="w-full px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base disabled:bg-gray-50"
                        placeholder="Confirm new password"
                      />
                    </div>
                  </div>

                  {isEditingSecurity && (
                    <button className="bg-gradient-to-r from-blue-500 to-green-400 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-green-500 transition-all duration-200 w-full sm:w-auto">
                      Update Password
                    </button>
                  )}
                </div>
              </div>

              {/* Company Documents moved to full-width section below */}
            </motion.div>

            {/* Right sidebar: Avatar + Account Stats */}
            <div className="order-1 lg:order-2 lg:col-span-1 space-y-6 lg:sticky lg:top-6">
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
                  <div className="flex items-center space-x-2 mb-6">
                    <Image className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Profile Picture</h2>
                  </div>

                  <div className="text-center">
                    <div className="relative inline-block mb-4">
                      <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-r from-blue-500 to-green-400 rounded-full flex items-center justify-center text-white text-2xl sm:text-4xl font-bold ring-4 ring-white shadow">
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
                    {avatarPreview && isEditing && (
                      <div className="mt-3">
                        <button
                          onClick={() => setAvatarPreview(null)}
                          className="px-3 py-2 bg-red-50 text-red-600 rounded-lg text-xs sm:text-sm font-medium hover:bg-red-100"
                        >
                          Remove Photo
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="bg-gradient-to-r from-blue-600 to-green-500 rounded-2xl p-4 sm:p-6 text-white">
                  <h3 className="text-base sm:text-lg font-semibold mb-4">Account Statistics</h3>
                  <div className="space-y-3 text-sm sm:text-base">
                    <div className="flex justify-between">
                      <span>Member Since</span>
                      <span className="font-medium">{new Date(localStorage.getItem('userCreatedAt') || Date.now()).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Deliveries</span>
                      <span className="font-medium">{totalDeliveries}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Documents</span>
                      <span className="font-medium">{documentsCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Last Login</span>
                      <span className="font-medium">{new Date(localStorage.getItem('lastLogin') || Date.now()).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Full-width Company Documents section */}
          <section className="mt-8">
            <div className="bg-white rounded-2xl shadow-lg p-5 sm:p-6 lg:p-8">
              <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Company Documents</h2>
                </div>
              </div>

              <div className="space-y-4">
                {documentTypes.map(doc => (
                  <div key={doc.key} className="border border-gray-200 rounded-xl p-4 sm:p-5 hover:shadow-md transition-shadow">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex items-start space-x-3 min-w-0">
                        <Upload className="h-4 w-4 text-gray-500 mt-1.5" />
                        <div>
                          <div className="text-base font-medium text-gray-800 leading-tight">{doc.label}</div>
                          <div className="text-xs text-gray-500">Upload a clear PDF or image</div>
                          {selectedDocs[doc.key] && (
                            <div className="mt-2 text-xs text-gray-600 break-all">
                              Selected: <span className="font-medium">{selectedDocs[doc.key]?.name}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 md:shrink-0">
                        <input
                          type="file"
                          id={`doc-${doc.key}`}
                          className="hidden"
                          onChange={(e) => onSelectDocument(doc.key, e.target.files?.[0] || null)}
                          accept=".pdf,image/*"
                        />
                        <label
                          htmlFor={`doc-${doc.key}`}
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 cursor-pointer whitespace-nowrap"
                        >
                          Choose
                        </label>
                        <button
                          onClick={() => onUploadDocument(doc.key)}
                          disabled={!selectedDocs[doc.key]}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                        >
                          Upload
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Profile; 