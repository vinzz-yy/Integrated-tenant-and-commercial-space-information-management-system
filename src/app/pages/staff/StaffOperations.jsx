// StaffOperations.jsx - Staff view for operation requests
// Displays operation requests assigned to the staff member

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext.jsx';
import { Layout } from '../../components/Layout.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import api from '../../services/api.js';

export function StaffOperations() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // State for storing operation requests
  const [requests, setRequests] = useState([]);

  // Redirect if not staff
  useEffect(() => {
    if (user?.role !== 'staff') navigate('/');
  }, [user, navigate]);

  // Load operation requests
  useEffect(() => {
    const load = async () => {
      const resp = await api.operations.getRequests();
      setRequests(resp.results || []);
    };
    load();
  }, []);

  return (
    <Layout role="staff">
      <div className="space-y-6">
        {/* Header */}
        <h1 className="text-3xl font-bold">Operations</h1>
        
        {/* Requests table */}
        <Card>
          <CardHeader>
            <CardTitle>My Assigned Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell className="font-medium">{req.title}</TableCell>
                    <TableCell>{req.type}</TableCell>
                    <TableCell>
                      <Badge variant={req.priority === 'high' ? 'destructive' : 'default'}>
                        {req.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{(req.status || '').replace('_', ' ')}</Badge>
                    </TableCell>
                    <TableCell>{req.createdAt}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}