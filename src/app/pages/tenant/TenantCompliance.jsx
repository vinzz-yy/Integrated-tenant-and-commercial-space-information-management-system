import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext.jsx';
import { Layout } from '../../components/Layout.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card.jsx';
import { Button } from '../../components/ui/button.jsx';
import { Input } from '../../components/ui/input.jsx';
import { Label } from '../../components/ui/label.jsx';
import { Badge } from '../../components/ui/badge.jsx';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select.jsx';
import { Upload, FileText } from 'lucide-react';
import connection from '../../connected/connection.js';
import { Skeleton } from '../../components/ui/skeleton.jsx';
import { toast } from 'sonner';

export function TenantCompliance() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // State for documents
  const [documents, setDocuments] = useState([]);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ documentType: '', file: null });
  const [loading, setLoading] = useState(false);

  // Redirect if not tenant
  useEffect(() => {
    if (user?.role !== 'tenant') navigate('/');
  }, [user, navigate]);

  // Load tenant's documents
  useEffect(() => {
    const load = async () => {
      if (!user?.id) return;
      try {
        setLoading(true);
        const resp = await connection.documents.getDocuments({ tenant_id: user?.id });
        setDocuments(Array.isArray(resp) ? resp : (resp.results || []));
      } catch (err) {
        toast.error('Failed to load documents');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  // Handle document upload
  const handleUpload = async () => {
    // Validate required fields
    if (!formData.documentType || !formData.file) {
      toast.warning('Please select a type and file');
      return;
    }

    // Create FormData for file upload
    const data = new FormData();
    data.append('file', formData.file);
    data.append('document_type', formData.documentType);
    data.append('tenant', String(user?.id || ''));

    try {
      await connection.documents.uploadDocument(data);
      toast.success('Document uploaded');
      setIsUploadDialogOpen(false);

      // Refresh document list
      const resp = await connection.documents.getDocuments({ tenant_id: user?.id });
      setDocuments(Array.isArray(resp) ? resp : (resp.results || []));

      // Reset form
      setFormData({ documentType: '', file: null });
    } catch (err) {
      console.error("Upload error: ", err);
      toast.error(err.message || 'Upload failed');
    }
  };

  return (
    <Layout role="tenant">
      <div className="space-y-6">
        {/* Header with upload button */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Documents</h1>
            <p className="text-gray-600 mt-1">
              Upload and manage compliance documents
            </p>
          </div>
          <Button onClick={() => setIsUploadDialogOpen(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Upload Document
          </Button>
        </div>

        {/* Documents list */}
        <Card>
          <CardHeader>
            <CardTitle>My Compliance Documents</CardTitle>
            <CardDescription>All your uploaded documents</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                // Loading skeletons
                <>
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </>
              ) : documents.length === 0 ? (
                // Empty state
                <div className="text-center text-gray-500 py-8">
                  <p className="font-medium">No documents uploaded</p>
                </div>
              ) : (
                // Document list
                documents.map((doc) => {
                  const url = doc.fileUrl || doc.file_url || doc.file || '';
                  const fullUrl = url.startsWith('/') ? `http://localhost:8000${url}` : url;
                  const isImage = String(url).match(/\.(jpeg|jpg|gif|png)$/i);
                  
                  let badgeVariant = 'secondary';
                  let statusText = doc.status || 'pending';
                  if (statusText === 'approved' || statusText === 'accepted') { badgeVariant = 'default'; statusText = 'Accepted'; }
                  else if (statusText === 'rejected') { badgeVariant = 'destructive'; statusText = 'Rejected'; }
                  else if (statusText === 'pending') { statusText = 'Under Validation'; }
                  
                  return (
                  <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-start gap-4">
                      {isImage ? (
                        <div className="w-16 h-16 rounded-md overflow-hidden bg-gray-100 flex-shrink-0 border">
                          <img src={fullUrl} alt={doc.documentType || doc.document_type} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-md bg-gray-100 flex items-center justify-center flex-shrink-0 border">
                          <FileText className="h-6 w-6 text-blue-600" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{doc.documentType || doc.document_type}</p>
                        <a href={fullUrl} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline mt-1 block">
                          {doc.fileName || doc.file_name || 'View Document'}
                        </a>
                        <p className="text-xs text-gray-500 mt-1">
                          Uploaded: {new Date(doc.uploadDate || doc.upload_date).toLocaleDateString()}
                          {doc.expiryDate && ` • Expires: ${new Date(doc.expiryDate).toLocaleDateString()}`}
                        </p>
                      </div>
                    </div>
                    <Badge variant={badgeVariant} className="capitalize">
                      {statusText}
                    </Badge>
                  </div>
                )})
              )}
            </div>
          </CardContent>
        </Card>

        {/* Upload Document Dialog */}
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Document</DialogTitle>
              <DialogDescription>Upload a compliance document</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {/* Document type select */}
              <div className="space-y-2">
                <Label>Document Type</Label>
                <Select
                  value={formData.documentType}
                  onValueChange={(value) => setFormData({ ...formData, documentType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Business License">Business License</SelectItem>
                    <SelectItem value="Insurance Certificate">Insurance Certificate</SelectItem>
                    <SelectItem value="Fire Safety Certificate">Fire Safety Certificate</SelectItem>
                    <SelectItem value="Health Permit">Health Permit</SelectItem>
                    <SelectItem value="Valid ID">Valid ID</SelectItem>
                    <SelectItem value="Storefront Photo">Storefront Photo</SelectItem>
                    <SelectItem value="Other Image">Other Image</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* File input */}
              <div className="space-y-2">
                <Label>File</Label>
                <Input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,image/*"
                  onChange={(e) => setFormData({ ...formData, file: e.target.files?.[0] || null })}
                />

                {/* Image Preview */}
                {formData.file && formData.file.type.startsWith('image/') && (
                  <div className="mt-4 rounded-md overflow-hidden border bg-gray-50 flex items-center justify-center p-2">
                    <img
                      src={URL.createObjectURL(formData.file)}
                      alt="Preview"
                      className="max-w-full h-auto max-h-48 object-contain"
                    />
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleUpload}>Upload</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}