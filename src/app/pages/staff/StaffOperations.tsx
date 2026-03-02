import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { Layout } from '../../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { mockOperationRequests } from '../../services/mockData';

export function StaffOperations() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role !== 'staff') navigate('/');
  }, [user, navigate]);

  return (
    <Layout role="staff">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Operations</h1>
        <Card>
          <CardHeader><CardTitle>My Assigned Requests</CardTitle></CardHeader>
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
                {mockOperationRequests.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell className="font-medium">{req.title}</TableCell>
                    <TableCell>{req.type}</TableCell>
                    <TableCell>
                      <Badge variant={req.priority === 'high' ? 'destructive' : 'default'}>
                        {req.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{req.status.replace('_', ' ')}</Badge>
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
