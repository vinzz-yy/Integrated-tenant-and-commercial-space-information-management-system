import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { Layout } from '../../components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { toast } from 'sonner';

// DJANGO BACKEND INTEGRATION POINT
// Profile APIs:
// - GET /api/users/{user.id}/ - Get user profile
// - PATCH /api/users/{user.id}/ - Update user profile
// - POST /api/users/{user.id}/avatar/ - Upload user avatar

export function StaffProfile() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    department: user?.department || '',
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    if (user?.role !== 'staff') {
      navigate('/');
    }
  }, [user, navigate]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      setAvatarFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChangePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate required fields
      if (!formData.firstName || !formData.lastName || !formData.email) {
        toast.error('Please fill in all required fields');
        return;
      }

      // Update user profile data
      updateUser(formData);

      // DJANGO BACKEND INTEGRATION POINT
      // If there's a new avatar file, upload it
      if (avatarFile) {
        // In a real implementation, you would upload the file to your backend
        // const formData = new FormData();
        // formData.append('avatar', avatarFile);
        // await fetch(`/api/users/${user?.id}/avatar/`, {
        //   method: 'POST',
        //   body: formData,
        // });
        
        // For now, we'll simulate a successful upload
        console.log('Uploading avatar:', avatarFile.name);
        
        // Update the user's avatar in the auth context
        // This would typically be returned from the API
        const newAvatarUrl = avatarPreview || user?.avatar;
        updateUser({ ...formData, avatar: newAvatarUrl });
      }

      toast.success('Profile updated successfully');
      
      // Clear the file input after successful upload
      setAvatarFile(null);
      setAvatarPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  return (
    <Layout role="staff">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Profile</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your personal information
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your personal details</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24 border-2 border-gray-200 dark:border-gray-700">
                  <AvatarImage 
                    src={avatarPreview || user?.avatar} 
                    alt={user?.firstName}
                  />
                  <AvatarFallback className="text-lg">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleChangePhotoClick}
                  >
                    Change Photo
                  </Button>
                  <p className="text-xs text-gray-500">
                    Max file size: 5MB. Supported: JPG, PNG, GIF
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    placeholder="Enter your first name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    placeholder="Enter your last name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter your email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Enter your phone number"
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="Enter your department"
                  />
                </div>
              </div>

              {avatarFile && (
                <div className="text-sm text-green-600">
                  New photo selected: {avatarFile.name}
                </div>
              )}

              <div className="flex gap-3">
                <Button type="submit">Save Changes</Button>
                {avatarFile && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setAvatarFile(null);
                      setAvatarPreview(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    }}
                  >
                    Cancel Photo Change
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}