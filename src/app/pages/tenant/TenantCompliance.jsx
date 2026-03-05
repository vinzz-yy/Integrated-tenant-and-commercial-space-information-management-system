import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext.jsx';
import { Layout } from '../../components/Layout.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Upload, FileText } from 'lucide-react';
import api from '../../services/api.js';
import { Skeleton } from '../../components/ui/skeleton.jsx';
import { toast } from 'sonner';

export function TenantCompliance() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ documentType: '', file: null });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.role !== 'tenant') navigate('/');
  }, [user, navigate]);

  useEffect(() => {
    const load = async () => {
      if (!user?.id) return;
      try {
        setLoading(true);
        const resp = await api.compliance.getDocuments({ tenant_id: user?.id });
        setDocuments(resp.results || []);
      } catch (err) {
        toast.error('Failed to load documents');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const handleUpload = async () => {
    if (!formData.documentType || !formData.file) {
      toast.warning('Please select a type and file');
      return;
    }
    const data = new FormData();
    data.append('file', formData.file);
    data.append('document_type', formData.documentType);
    data.append('tenant_id', String(user?.id || ''));
    try {
      await api.compliance.uploadDocument(data);
      toast.success('Document uploaded');
      setIsUploadDialogOpen(false);
      const resp = await api.compliance.getDocuments({ tenant_id: user?.id });
      setDocuments(resp.results || []);
      setFormData({ documentType: '', file: null });
    } catch (err) {
      toast.error('Upload failed');
    }
  };

  return (
    <Layout role="tenant">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Documents</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Upload and manage compliance documents</p>
          </div>
          <Button onClick={() => setIsUploadDialogOpen(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Upload Document
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>My Compliance Documents</CardTitle>
            <CardDescription>All your uploaded documents</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <>
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </>
              ) : documents.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <p className="font-medium">No documents uploaded</p>
                </div>
              ) : (
                documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-start gap-3">
                      <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="font-medium">{doc.documentType || doc.document_type}</p>
                        <p className="text-sm text-gray-500 mt-1">{doc.fileName || doc.file_name}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Uploaded: {doc.uploadDate || doc.upload_date} • Expires: {doc.expiryDate || doc.expiry_date}
                        </p>
                      </div>
                    </div>
                    <Badge variant={(doc.status || '').includes('approved') ? 'default' : 'secondary'}>
                      {(doc.status || '').replace('_', ' ')}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Document</DialogTitle>
              <DialogDescription>Upload a compliance document</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Document Type</Label>
                <Select value={formData.documentType} onValueChange={(value) => setFormData({ ...formData, documentType: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Business License">Business License</SelectItem>
                    <SelectItem value="Insurance Certificate">Insurance Certificate</SelectItem>
                    <SelectItem value="Fire Safety Certificate">Fire Safety Certificate</SelectItem>
                    <SelectItem value="Health Permit">Health Permit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>File</Label>
                <Input
                  type="file"
                  accept=".pdf,.jpg,.png"
                  onChange={(e) => setFormData({ ...formData, file: e.target.files?.[0] || null })}
                />
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
