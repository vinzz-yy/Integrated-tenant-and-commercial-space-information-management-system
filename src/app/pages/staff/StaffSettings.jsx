import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext.jsx';
import { Layout } from '../../components/Layout.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card.jsx';
import { Button } from '../../components/ui/button.jsx';
import { Input } from '../../components/ui/input.jsx';
import { Label } from '../../components/ui/label.jsx';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar.jsx';
import { Camera, User, Mail, Phone, Briefcase, Save, X, Settings, Lock } from 'lucide-react';
import connection from '../../connected/connection.js';

export function StaffSettings() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    department: user?.department || '',
    currentPassword: '',
    newPassword: '',
  });

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [saveStatus, setSaveStatus] = useState(''); // '', 'saving', 'saved', 'error'
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (user?.role !== 'staff') navigate('/');
  }, [user, navigate]);

  // Keep form in sync if user context refreshes
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        department: user.department || '',
        currentPassword: '',
        newPassword: '',
      });
    }
  }, [user]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert('File size must be less than 5MB'); return; }
    if (!file.type.startsWith('image/')) { alert('Please upload an image file'); return; }
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleChangePhotoClick = () => fileInputRef.current?.click();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.email) {
      alert('Please fill in all required fields');
      return;
    }
    try {
      setSaveStatus('saving');
      const saved = await connection.auth.updateCurrentUser({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        department: formData.department,
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
      updateUser({
        firstName: saved.first_name || formData.firstName,
        lastName: saved.last_name || formData.lastName,
        email: saved.email || formData.email,
        phone: saved.phone || formData.phone,
        department: saved.department || formData.department,
      });
      if (avatarFile) {
        const newAvatarUrl = avatarPreview || user?.avatar;
        const savedAvatar = await connection.auth.updateCurrentUser({ avatar: newAvatarUrl });
        updateUser({ avatar: savedAvatar.avatar || newAvatarUrl });
      }
      setAvatarFile(null);
      setAvatarPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '' }));
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(''), 2500);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to save. Please try again.');
      setSaveStatus('error');
      setTimeout(() => {
        setSaveStatus('');
        setErrorMessage('');
      }, 3000);
    }
  };

  return (
    <Layout role="staff">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-[#2E3192] flex items-center gap-2">
            <Settings className="h-7 w-7" />
            Settings
          </h1>
          <p className="text-gray-600 mt-1">Manage your account and personal information</p>
        </div>

        {/* Section label */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-[#2E3192] uppercase tracking-wider">My Profile</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left — Avatar card */}
            <Card className="lg:col-span-1 h-fit border-2 border-transparent hover:border-[#F9E81B] transition-colors">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="relative group">
                    <Avatar className="h-32 w-32 border-4 border-[#F9E81B] shadow-lg">
                      <AvatarImage src={avatarPreview || user?.avatar} alt={user?.firstName} />
                      <AvatarFallback className="text-2xl bg-[#2E3192] text-white">
                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <button
                      type="button"
                      onClick={handleChangePhotoClick}
                      className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <Camera className="h-8 w-8 text-white" />
                    </button>
                  </div>

                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />

                  <h2 className="mt-4 text-xl font-bold text-[#2E3192]">
                    {user?.firstName} {user?.lastName}
                  </h2>
                  <span className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full bg-[#F9E81B]/30 text-[#2E3192] text-sm font-medium">
                    <Briefcase className="h-3.5 w-3.5" />
                    {user?.department || 'Staff Member'}
                  </span>

                  <div className="mt-4 w-full space-y-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleChangePhotoClick}
                      className="w-full border-[#2E3192] text-[#2E3192] hover:bg-[#2E3192] hover:text-white"
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Change Photo
                    </Button>
                    {avatarFile && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-700 font-medium truncate">{avatarFile.name}</p>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => { setAvatarFile(null); setAvatarPreview(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                          className="mt-1 h-7 text-xs text-[#ED1C24] hover:text-[#ED1C24] hover:bg-red-50"
                        >
                          <X className="h-3 w-3 mr-1" /> Remove
                        </Button>
                      </div>
                    )}
                  </div>
                  <p className="mt-3 text-xs text-gray-500">Max file size: 5MB. Supported: JPG, PNG, GIF</p>
                </div>
              </CardContent>
            </Card>

            {/* Right — Form fields */}
            <Card className="lg:col-span-2 border-2 border-transparent hover:border-[#F9E81B] transition-colors">
              <CardHeader>
                <CardTitle className="text-[#2E3192]">Profile Information</CardTitle>
                <CardDescription>Update your personal details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Name row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sf-firstName" className="text-[#2E3192] font-medium flex items-center gap-2">
                      <User className="h-4 w-4" /> First Name <span className="text-[#ED1C24]">*</span>
                    </Label>
                    <Input
                      id="sf-firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      placeholder="Enter your first name"
                      className="h-11 border-gray-200 focus:border-[#F9E81B] focus:ring-[#F9E81B]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sf-lastName" className="text-[#2E3192] font-medium flex items-center gap-2">
                      <User className="h-4 w-4" /> Last Name <span className="text-[#ED1C24]">*</span>
                    </Label>
                    <Input
                      id="sf-lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      placeholder="Enter your last name"
                      className="h-11 border-gray-200 focus:border-[#F9E81B] focus:ring-[#F9E81B]"
                    />
                  </div>
                </div>

                {/* Contact row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sf-email" className="text-[#2E3192] font-medium flex items-center gap-2">
                      <Mail className="h-4 w-4" /> Email Address <span className="text-[#ED1C24]">*</span>
                    </Label>
                    <Input
                      id="sf-email"
                      type="email"
                      value={formData.email}
                      disabled
                      className="h-11 border-gray-200 bg-gray-50 text-gray-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sf-phone" className="text-[#2E3192] font-medium flex items-center gap-2">
                      <Phone className="h-4 w-4" /> Phone Number
                    </Label>
                    <Input
                      id="sf-phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="Enter your phone number"
                      className="h-11 border-gray-200 focus:border-[#F9E81B] focus:ring-[#F9E81B]"
                    />
                  </div>
                </div>

                {/* Department — read-only */}
                <div className="space-y-2">
                  <Label htmlFor="sf-department" className="text-[#2E3192] font-medium flex items-center gap-2">
                    <Briefcase className="h-4 w-4" /> Department
                  </Label>
                  <Input
                    id="sf-department"
                    value={formData.department}
                    disabled
                    className="h-11 border-gray-200 bg-gray-50 text-gray-500"
                  />
                </div>

                {/* Change Password Section */}
                <div className="pt-4 border-t border-gray-100">
                  <h3 className="text-sm font-semibold text-[#2E3192] uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Lock className="h-4 w-4" /> Change Password
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="sf-currentPassword" title="Current Password" className="text-[#2E3192] font-medium flex items-center gap-2">
                        Current Password
                      </Label>
                      <Input
                        id="sf-currentPassword"
                        type="password"
                        value={formData.currentPassword}
                        onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                        placeholder="••••••••"
                        className="h-11 border-gray-200 focus:border-[#F9E81B] focus:ring-[#F9E81B]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sf-newPassword" title="New Password" className="text-[#2E3192] font-medium flex items-center gap-2">
                        New Password
                      </Label>
                      <Input
                        id="sf-newPassword"
                        type="password"
                        value={formData.newPassword}
                        onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                        placeholder="••••••••"
                        className="h-11 border-gray-200 focus:border-[#F9E81B] focus:ring-[#F9E81B]"
                      />
                      <p className="text-[10px] text-gray-500 mt-1">Leave blank if you don't want to change password</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                  <Button
                    type="submit"
                    disabled={saveStatus === 'saving'}
                    className="bg-[#F9E81B] hover:bg-[#e6d619] text-[#2E3192] font-semibold h-11 px-6"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? '✓ Saved!' : 'Save Changes'}
                  </Button>
                  {avatarFile && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => { setAvatarFile(null); setAvatarPreview(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                      className="border-gray-300 text-gray-700 hover:bg-gray-50 h-11"
                    >
                      Cancel Photo Change
                    </Button>
                  )}
                  {saveStatus === 'error' && (
                    <p className="text-sm text-[#ED1C24] self-center">{errorMessage}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </form>
      </div>
    </Layout>
  );
}
