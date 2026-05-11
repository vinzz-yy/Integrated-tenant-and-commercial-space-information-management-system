import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext.jsx';
import { Layout } from '../../components/Layout.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card.jsx';
import { Button } from '../../components/ui/button.jsx';
import { Input } from '../../components/ui/input.jsx';
import { Label } from '../../components/ui/label.jsx';
import { Alert, AlertDescription } from '../../components/ui/alert.jsx';
import { Checkbox } from '../../components/ui/checkbox.jsx';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar.jsx';
import { Camera, User, Mail, Phone, Building, Save, X, Settings, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import connection from '../../connected/connection.js';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog.jsx';

export function TenantSettings() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    currentPassword: '',
    newPassword: '',
  });

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [saveStatus, setSaveStatus] = useState(''); // '', 'saving', 'saved', 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const [showForcePasswordModal, setShowForcePasswordModal] = useState(false);
  const [showPasswordChangedModal, setShowPasswordChangedModal] = useState(false);
  const [suppressForcePasswordModal, setSuppressForcePasswordModal] = useState(false);
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);

  const [preferences, setPreferences] = useState(() => {
    try {
      const raw = localStorage.getItem('tenantSettingsPreferences');
      return raw ? JSON.parse(raw) : { showSecurityTips: true };
    } catch {
      return { showSecurityTips: true };
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('tenantSettingsPreferences', JSON.stringify(preferences));
    } catch {
      // ignore
    }
  }, [preferences]);

  useEffect(() => {
    if (user?.role !== 'tenant') navigate('/');
  }, [user, navigate]);

  const mustChangePassword =
    Boolean(user?.mustChangePassword) ||
    Boolean(user?.must_change_password) ||
    Boolean(user?.profile?.must_change_password);

  useEffect(() => {
    if (suppressForcePasswordModal) return;
    if ((mustChangePassword || location.state?.forcedPasswordChange) && !showPasswordChangedModal) {
      setShowForcePasswordModal(true);
    }
  }, [mustChangePassword, location.state, suppressForcePasswordModal, showPasswordChangedModal]);

  // Keep form in sync if user context refreshes
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        currentPassword: '',
        newPassword: '',
      });
      setConfirmNewPassword('');
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

    const wantsPasswordChange = Boolean(formData.newPassword);
    if (wantsPasswordChange) {
      if (!formData.currentPassword) {
        setErrorMessage('Please enter your current password.');
        setSaveStatus('error');
        setTimeout(() => {
          setSaveStatus('');
          setErrorMessage('');
        }, 3000);
        return;
      }
      if (String(formData.newPassword).length < 8) {
        setErrorMessage('New password must be at least 8 characters.');
        setSaveStatus('error');
        setTimeout(() => {
          setSaveStatus('');
          setErrorMessage('');
        }, 3000);
        return;
      }
      if (formData.newPassword !== confirmNewPassword) {
        setErrorMessage('New password and confirmation do not match.');
        setSaveStatus('error');
        setTimeout(() => {
          setSaveStatus('');
          setErrorMessage('');
        }, 3000);
        return;
      }
    }

    if ((mustChangePassword || location.state?.forcedPasswordChange) && !formData.newPassword) {
      setErrorMessage('Please set a new password to continue.');
      setSaveStatus('error');
      setTimeout(() => {
        setSaveStatus('');
        setErrorMessage('');
      }, 3000);
      return;
    }
    try {
      setSaveStatus('saving');
      const saved = await connection.auth.updateCurrentUser({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
      updateUser({
        firstName: saved.first_name || formData.firstName,
        lastName: saved.last_name || formData.lastName,
        email: saved.email || formData.email,
        phone: saved.phone || formData.phone,
        mustChangePassword: saved.mustChangePassword ?? false,
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
      setConfirmNewPassword('');
      setSaveStatus('saved');
      if (wantsPasswordChange) {
        // Ensure the force-password modal does not come back after a successful change
        updateUser({ mustChangePassword: false });
        setSuppressForcePasswordModal(true);
        setShowForcePasswordModal(false);
        setShowPasswordChangedModal(true);
        if (location.state?.forcedPasswordChange) {
          navigate('/tenant/settings', { replace: true, state: {} });
        }
      }
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
    <Layout role="tenant">
      <Dialog open={showForcePasswordModal} onOpenChange={setShowForcePasswordModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#2E3192]">Change your password</DialogTitle>
            <DialogDescription>
              Your account is using a default password. Please set a new password to continue using the system.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button className="bg-[#2E3192] hover:bg-[#1f2170] text-white" onClick={() => setShowForcePasswordModal(false)}>
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showPasswordChangedModal} onOpenChange={setShowPasswordChangedModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#2E3192]">Password change successful</DialogTitle>
            <DialogDescription>Your password has been changed successfully.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button className="bg-[#2E3192] hover:bg-[#1f2170] text-white" onClick={() => setShowPasswordChangedModal(false)}>
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#2E3192] flex items-center gap-2">
              <Settings className="h-7 w-7" />
              Settings
            </h1>
            <p className="text-gray-600 mt-1">Manage your account and personal information</p>
          </div>
          <div className="text-xs text-gray-500">
            Changes save to your account immediately.
          </div>
        </div>

        {(saveStatus === 'saved' || saveStatus === 'error') && (
          <Alert
            className={
              saveStatus === 'saved'
                ? 'border-green-200 bg-green-50 text-green-800'
                : 'border-red-200 bg-red-50 text-red-800'
            }
          >
            <AlertDescription>
              {saveStatus === 'saved'
                ? 'Saved successfully.'
                : (errorMessage || 'Failed to save. Please try again.')}
            </AlertDescription>
          </Alert>
        )}

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
                    <Building className="h-3.5 w-3.5" />
                    Unit {user?.unitNumber || 'N/A'}
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
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-2 border-transparent hover:border-[#F9E81B] transition-colors">
                <CardHeader>
                  <CardTitle className="text-[#2E3192] flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5" /> Account Overview
                  </CardTitle>
                  <CardDescription>Quick details about your tenant account.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="rounded-lg border border-gray-200 bg-white p-3">
                    <p className="text-xs text-gray-500">Role</p>
                    <p className="font-semibold text-[#2E3192] capitalize">{user?.role || 'tenant'}</p>
                  </div>
                  <div className="rounded-lg border border-gray-200 bg-white p-3">
                    <p className="text-xs text-gray-500">User ID</p>
                    <p className="font-semibold text-[#2E3192]">{user?.id ?? '-'}</p>
                  </div>
                  <div className="rounded-lg border border-gray-200 bg-white p-3">
                    <p className="text-xs text-gray-500">Unit</p>
                    <p className="font-semibold text-[#2E3192]">{user?.unitNumber || 'Not assigned'}</p>
                  </div>
                  <div className="rounded-lg border border-gray-200 bg-white p-3">
                    <p className="text-xs text-gray-500">Last login</p>
                    <p className="font-semibold text-[#2E3192]">
                      {(() => {
                        const v = sessionStorage.getItem('lastLogin');
                        if (!v) return '-';
                        try { return new Date(v).toLocaleString(); } catch { return String(v); }
                      })()}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-transparent hover:border-[#F9E81B] transition-colors">
                <CardHeader>
                  <CardTitle className="text-[#2E3192]">Profile Information</CardTitle>
                  <CardDescription>Keep your contact details up to date.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                {/* Name row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tn-firstName" className="text-[#2E3192] font-medium flex items-center gap-2">
                      <User className="h-4 w-4" /> First Name <span className="text-[#ED1C24]">*</span>
                    </Label>
                    <Input
                      id="tn-firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      placeholder="Enter your first name"
                      className="h-11 border-gray-200 focus:border-[#F9E81B] focus:ring-[#F9E81B]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tn-lastName" className="text-[#2E3192] font-medium flex items-center gap-2">
                      <User className="h-4 w-4" /> Last Name <span className="text-[#ED1C24]">*</span>
                    </Label>
                    <Input
                      id="tn-lastName"
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
                    <Label htmlFor="tn-email" className="text-[#2E3192] font-medium flex items-center gap-2">
                      <Mail className="h-4 w-4" /> Email Address <span className="text-[#ED1C24]">*</span>
                    </Label>
                    <Input
                      id="tn-email"
                      type="email"
                      value={formData.email}
                      disabled
                      className="h-11 border-gray-200 bg-gray-50 text-gray-500"
                    />
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      Email cannot be changed by tenant. Contact administration for updates.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tn-phone" className="text-[#2E3192] font-medium flex items-center gap-2">
                      <Phone className="h-4 w-4" /> Phone Number
                    </Label>
                    <Input
                      id="tn-phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="Enter your phone number"
                      className="h-11 border-gray-200 focus:border-[#F9E81B] focus:ring-[#F9E81B]"
                    />
                  </div>
                </div>

                {/* Assigned Unit — read-only */}
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <Label htmlFor="tn-unitNumber" className="text-[#2E3192] font-medium flex items-center gap-2 mb-2">
                    <Building className="h-4 w-4" /> Assigned Unit
                  </Label>
                  <Input id="tn-unitNumber" value={user?.unitNumber || 'Not assigned'} disabled className="bg-white" />
                  <p className="text-xs text-gray-500 mt-1">Contact administration to change your unit assignment</p>
                </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-transparent hover:border-[#F9E81B] transition-colors">
                <CardHeader>
                  <CardTitle className="text-[#2E3192] flex items-center gap-2">
                    <Lock className="h-5 w-5" /> Security
                  </CardTitle>
                  <CardDescription>Update your password to keep your account secure.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {preferences.showSecurityTips && (
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
                      Tip: Use a unique password you don’t use on other sites.
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="tn-currentPassword" className="text-[#2E3192] font-medium">Current Password</Label>
                      <div className="relative">
                        <Input
                          id="tn-currentPassword"
                          type={showPasswords ? 'text' : 'password'}
                          value={formData.currentPassword}
                          onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                          placeholder="••••••••"
                          className="h-11 border-gray-200 focus:border-[#F9E81B] focus:ring-[#F9E81B] pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords((v) => !v)}
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                          aria-label={showPasswords ? 'Hide password' : 'Show password'}
                        >
                          {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tn-newPassword" className="text-[#2E3192] font-medium">New Password</Label>
                      <Input
                        id="tn-newPassword"
                        type={showPasswords ? 'text' : 'password'}
                        value={formData.newPassword}
                        onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                        placeholder="Enter a strong password"
                        className="h-11 border-gray-200 focus:border-[#F9E81B] focus:ring-[#F9E81B]"
                      />
                      <p className="text-xs text-gray-500">Use at least 8 characters.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="tn-confirmNewPassword" className="text-[#2E3192] font-medium">Confirm New Password</Label>
                      <Input
                        id="tn-confirmNewPassword"
                        type={showPasswords ? 'text' : 'password'}
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        placeholder="Re-enter new password"
                        className="h-11 border-gray-200 focus:border-[#F9E81B] focus:ring-[#F9E81B]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[#2E3192] font-medium">Preferences</Label>
                      <div className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-3">
                        <Checkbox
                          checked={Boolean(preferences.showSecurityTips)}
                          onCheckedChange={(v) => setPreferences((p) => ({ ...p, showSecurityTips: v === true }))}
                        />
                        <div>
                          <p className="text-sm font-medium text-[#2E3192]">Show security tips</p>
                          <p className="text-xs text-gray-500">Helpful reminders on this page.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <Button
                      type="submit"
                      disabled={saveStatus === 'saving'}
                      className="bg-[#F9E81B] hover:bg-[#e6d619] text-[#2E3192] font-semibold h-11 px-6"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {saveStatus === 'saving' ? 'Saving...' : 'Save Changes'}
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
                  </div>
                </CardContent>
              </Card>

            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
}
