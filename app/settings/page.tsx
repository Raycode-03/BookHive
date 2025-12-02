"use client"
import React, { useState, useEffect } from 'react'
import { toast } from 'sonner';
import { Camera } from 'lucide-react';
import Image from 'next/image';

function SettingsPage() {
  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [loading, setLoading] = useState({
    profile: false,
    password: false,
    fetch: true
  });

  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    email: '',
    password: ''
  });

  const [notifications, setNotifications] = useState({
    push: false,
    email: false,
    sms: true
  });

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/users/profile');
      const result = await response.json();

      if (response.ok && result.success) {
        const userData = result.data;
        setFormData({
          name: userData.name || '',
          phoneNumber: userData.phoneNumber || '',
          email: userData.email || '',
          password: ''
        });
        
        if (userData.image) {
          setImage(userData.image);
        }
      } else {
        toast.error('Failed to load profile data');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Error loading profile');
    } finally {
      setLoading(prev => ({ ...prev, fetch: false }));
    }
  };

  if (loading.fetch) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleNotification = (type: 'push' | 'email' | 'sms') => {
    setNotifications({
      ...notifications,
      [type]: !notifications[type]
    });
  };

  const handleUploadImage = async () => {
    if (!image || !image.startsWith('data:image')) {
      toast.error('Please select an image first');
      return;
    }

    setUploadingImage(true);

    try {
      const response = await fetch('/api/users/profile/image', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('Profile picture updated successfully!');
        setImageFile(null);
        if (result.data?.image) {
          setImage(result.data.image);
        }
      } else {
        toast.error('Failed to upload image: ' + result.error);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Error uploading image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!formData.name.trim() || !formData.phoneNumber.trim()) {
      toast.error('Please fill in all profile fields');
      return;
    }

    setLoading(prev => ({ ...prev, profile: true }));

    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          phoneNumber: formData.phoneNumber,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('Profile updated successfully!');
      } else {
        toast.error('Failed to update profile: ' + result.error);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Error updating profile');
    } finally {
      setLoading(prev => ({ ...prev, profile: false }));
    }
  };

  const handleResetPassword = async () => {
    if (!formData.password.trim()) {
      toast.error('Please enter a new password');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password should be at least 6 characters long');
      return;
    }

    setLoading(prev => ({ ...prev, password: true }));
    try {
      const response = await fetch('/api/users/profile/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password: formData.password
        }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('Password reset successfully!');
        setFormData(prev => ({ ...prev, password: '' }));
      } else {
        toast.error('Failed to reset password: ' + result.error);
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      toast.error('Error resetting password');
    } finally {
      setLoading(prev => ({ ...prev, password: false }));
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <h1 className="text-xl sm:text-2xl font-semibold dark:text-gray-100 mb-6 sm:mb-8">Personal Details</h1>

        {/* Personal Info Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800 p-4 sm:p-6 md:p-8 mb-6">
          <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6 mb-6 sm:mb-8">
            {/* Avatar Section */}
            <div className="flex flex-col items-center gap-3 w-full sm:w-auto">
              <div className="relative w-20 h-20 sm:w-16 sm:h-16 group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  id="avatar-upload"
                />
                <label htmlFor="avatar-upload" className="cursor-pointer">
                  <div className="w-full h-full bg-gray-100 rounded-full flex items-center justify-center overflow-hidden border-2 border-gray-200 group-hover:border-green-500 transition-colors">
                    {image ? (
                      <Image
                        src={image}
                        alt="Profile"
                        className="object-cover w-full h-full"
                        width={160}
                        height={160}
                      />
                    ) : (
                      <span className="text-gray-600 font-semibold text-lg">
                        {formData.name.charAt(0).toUpperCase() || 'U'}
                      </span>
                    )}
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-green-600 rounded-full p-1.5 group-hover:bg-green-700 transition-colors">
                    <Camera className="w-3 h-3 text-white" />
                  </div>
                </label>
              </div>
              
              {imageFile && (
                <button
                  onClick={handleUploadImage}
                  disabled={uploadingImage}
                  className="text-xs bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-sm w-full sm:w-auto"
                >
                  {uploadingImage ? (
                    <span className="flex items-center justify-center gap-1">
                      <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Uploading...
                    </span>
                  ) : (
                    'Upload Image'
                  )}
                </button>
              )}
            </div>

            {/* Personal Fields */}
            <div className="flex-1 w-full">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <div className="col-span-full sm:col-span-2 lg:col-span-1">
                  <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                    Full name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter full name"
                    className="w-full px-4 py-3 sm:py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-600 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div className="col-span-full sm:col-span-2 lg:col-span-1">
                  <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                    Phone number
                  </label>
                  <input
                    type="text"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    placeholder="Enter phone number"
                    className="w-full px-4 py-3 sm:py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-600 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div className="col-span-full sm:col-span-2 lg:col-span-1">
                  <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                    Email address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter email"
                      disabled
                      className="w-full px-4 py-3 sm:py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-600 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500 bg-gray-50 dark:bg-gray-800 cursor-not-allowed"
                    />
                    <button
                      onClick={handleUpdateProfile}
                      disabled={loading.profile}
                      className="absolute right-2 top-2 bg-green-600 hover:bg-green-700 text-white text-xs font-medium px-3 sm:px-4 py-1.5 sm:py-1.5 rounded-md transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed mt-1"
                    >
                      {loading.profile ? 'Saving...' : 'Edit'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Password & Notifications Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800 p-4 sm:p-6 md:p-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
            {/* Password */}
            <div className="w-full lg:flex-1 lg:max-w-xs">
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter new password"
                  className="w-full px-4 py-3 sm:py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-600 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <button
                  onClick={handleResetPassword}
                  disabled={loading.password || !formData.password}
                  className="absolute right-2 top-2 bg-green-600 hover:bg-green-700 text-white text-xs font-medium px-3 sm:px-4 py-1.5 sm:py-1.5 rounded-md transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed mt-1"
                >
                  {loading.password ? 'Resetting...' : 'Reset'}
                </button>
              </div>
              {formData.password && formData.password.length < 6 && (
                <p className="text-xs text-red-500 mt-2">Password must be at least 6 characters</p>
              )}
            </div>

            {/* Notifications */}
            <div className="w-full lg:flex-1 lg:max-w-sm">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-4">Notifications</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Get push notification</span>
                  <button
                    onClick={() => toggleNotification('push')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notifications.push ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notifications.push ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Email notifications</span>
                  <button
                    onClick={() => toggleNotification('email')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notifications.email ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notifications.email ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">SMS notification</span>
                  <button
                    onClick={() => toggleNotification('sms')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notifications.sms ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notifications.sms ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage