import React, { useState } from 'react';
import { Layout } from '../../components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Upload, Search, Download, Eye, FileText, File, Shield, Receipt, BarChart3 } from 'lucide-react';
import { mockDocuments, mockUsers } from '../../data/mockData';

export const AdminDocuments: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const filteredDocuments = mockDocuments.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || doc.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const getTypeIcon = (type: string) => {
    const icons: { [key: string]: React.ElementType } = {
      contract: FileText,
      permit: Shield,
      compliance: File,
      invoice: Receipt,
      report: BarChart3,
    };
    const Icon = icons[type] || FileText;
    return <Icon className="w-5 h-5" />;
  };

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: 'success' | 'warning' | 'destructive' } = {
      approved: 'success',
      pending: 'warning',
      rejected: 'destructive',
    };
    return <Badge variant={variants[status]}>{status.toUpperCase()}</Badge>;
  };

  const documentTypes = [
    { label: 'All', value: 'all' },
    { label: 'Contracts', value: 'contract' },
    { label: 'Permits', value: 'permit' },
    { label: 'Compliance', value: 'compliance' },
    { label: 'Invoices', value: 'invoice' },
    { label: 'Reports', value: 'report' },
  ];

  return (
    <Layout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">Document Management</h1>
            <p className="text-gray-600 mt-1">Upload and manage system documents</p>
          </div>
          <Button>
            <Upload className="w-4 h-4 mr-2" />
            Upload Document
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-gray-600">Total Documents</p>
              <p className="text-3xl font-semibold text-gray-900 mt-2">
                {mockDocuments.length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-gray-600">Contracts</p>
              <p className="text-3xl font-semibold text-blue-600 mt-2">
                {mockDocuments.filter(d => d.type === 'contract').length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-gray-600">Permits</p>
              <p className="text-3xl font-semibold text-green-600 mt-2">
                {mockDocuments.filter(d => d.type === 'permit').length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-3xl font-semibold text-orange-600 mt-2">
                {mockDocuments.filter(d => d.status === 'pending').length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-gray-600">Approved</p>
              <p className="text-3xl font-semibold text-green-600 mt-2">
                {mockDocuments.filter(d => d.status === 'approved').length}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <CardTitle>All Documents ({filteredDocuments.length})</CardTitle>
              <div className="flex items-center gap-4">
                <div className="flex gap-2">
                  {documentTypes.map(type => (
                    <Button
                      key={type.value}
                      variant={filterType === type.value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilterType(type.value)}
                    >
                      {type.label}
                    </Button>
                  ))}
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search documents..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Document</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Type</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Uploaded By</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Upload Date</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Related To</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDocuments.map((doc) => {
                    const uploader = mockUsers.find(u => u.id === doc.uploadedBy);
                    const relatedUser = doc.relatedTo ? mockUsers.find(u => u.id === doc.relatedTo) : null;
                    
                    return (
                      <tr key={doc.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                              {getTypeIcon(doc.type)}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{doc.name}</p>
                              <p className="text-xs text-gray-500">.pdf</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-gray-600 capitalize">{doc.type}</span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">{uploader?.name}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{doc.uploadedAt}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {relatedUser?.name || '-'}
                        </td>
                        <td className="py-3 px-4">{getStatusBadge(doc.status)}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};
