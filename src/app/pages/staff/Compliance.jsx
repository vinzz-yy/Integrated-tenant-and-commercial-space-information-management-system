import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext.jsx';
import { Layout } from '../../components/Layout.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card.jsx';
import { Badge } from '../../components/ui/badge.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select.jsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table.jsx';
import connection from '../../connected/connection.js';

export function Compliance() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // State for storing operation requests
  const [requests, setRequests] = useState([]);
  const formatDate = (d) => {
    if (!d) return '';
    try {
      return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
    } catch {
      return String(d).split('T')[0] || '';
    }
  };

  // Redirect if not staff
  useEffect(() => {
    if (user?.role !== 'staff') navigate('/');
  }, [user, navigate]);

  // Load operation requests
  useEffect(() => {
    const load = async () => {
      const data = await connection.compliance.getRequests();
      const list = Array.isArray(data) ? data : (data?.results || []);
      setRequests(list);
    };
    load();
  }, []);

  return (
    <Layout role="staff">
      <div className="space-y-6">
        {/* Header */}
        <h1 className="text-3xl font-bold">Compliance Management</h1>
        
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
                    <TableCell>{req.type || req.request_type}</TableCell>
                    <TableCell>
                      <Badge variant={req.priority === 'high' ? 'destructive' : 'default'}>
                        {req.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={req.status || 'pending'}
                        onValueChange={async (value) => {
                          try {
                            const updated = await connection.compliance.updateRequest(String(req.id), { status: value });
                            setRequests(requests.map(r => String(r.id) === String(req.id) ? updated : r));
                          } catch (e) {}
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>{formatDate(req.createdAt || req.created_at)}</TableCell>
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
