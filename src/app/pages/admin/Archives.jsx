import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext.jsx';
import { Layout } from '../../components/Layout.jsx';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card.jsx';
import { Button } from '../../components/ui/button.jsx';
import { Badge } from '../../components/ui/badge.jsx';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog.jsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table.jsx';
import { Archive, Trash2, RotateCcw, Users, Building, AlertTriangle, MoreVertical } from 'lucide-react';
import connection from '../../connected/connection.js';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/dropdown-menu.jsx';

//Level / Tab config 
const TABS = [
  { key: 'user', label: 'Users', icon: Users,    color: '#2E3192' },
  { key: 'unit', label: 'Units', icon: Building, color: '#7C3AED' },
];

// Human-readable summary of a record's stored data
function RecordSummary({ record }) {
  const d = record.data || {};
  if (record.record_type === 'user') {
    return (
      <div>
        <p className="font-semibold text-sm text-[#2E3192]">
          {d.firstName || d.first_name || ''} {d.lastName || d.last_name || ''}
        </p>
        <p className="text-xs text-gray-500">{d.email}</p>
        <Badge className={
          d.role === 'staff'
            ? 'bg-[#2E3192] text-white text-xs mt-1'
            : 'bg-[#F9E81B]/40 text-[#2E3192] text-xs mt-1'
        }>
          {d.role}
        </Badge>
      </div>
    );
  }
  if (record.record_type === 'transaction') {
    return (
      <div>
        <p className="font-semibold text-sm text-emerald-700">
          ₱{Number(d.amount || 0).toLocaleString()}
        </p>
        <p className="text-xs text-gray-500">{d.payment_method} · {d.status}</p>
        <p className="text-xs text-gray-400">{d.payment_date}</p>
      </div>
    );
  }
  if (record.record_type === 'unit') {
    return (
      <div>
        <p className="font-semibold text-sm text-purple-700">Unit {d.number}</p>
        <p className="text-xs text-gray-500">{d.type} · Floor {d.floor}</p>
      </div>
    );
  }
  return <span className="text-xs text-gray-400">No preview</span>;
}

export function Archives() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab]     = useState('user');
  const [records, setRecords]         = useState([]);
  const [loading, setLoading]         = useState(false);

  // Restore dialog
  const [restoreTarget, setRestoreTarget] = useState(null);
  const [isRestoring, setIsRestoring]     = useState(false);

  // Permanent delete dialog
  const [purgeTarget, setPurgeTarget]   = useState(null);
  const [isPurging, setIsPurging]       = useState(false);

  // Result snackbar
  const [toast, setToast] = useState(null);

  // Redirect non-admins
  useEffect(() => {
    if (user?.role !== 'admin') navigate('/');
  }, [user, navigate]);

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  const loadRecords = useCallback(async (type) => {
    setLoading(true);
    try {
      const data = await connection.archives.getArchives(type);
      setRecords(Array.isArray(data) ? data : []);
    } catch {
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRecords(activeTab);
  }, [activeTab, loadRecords]);

  // Restore
  const handleRestore = async () => {
    if (!restoreTarget) return;
    setIsRestoring(true);
    try {
      await connection.archives.restore(restoreTarget.id);
      showToast('Record restored successfully!');
      setRecords(prev => prev.filter(r => r.id !== restoreTarget.id));
    } catch (e) {
      showToast(e.message || 'Restore failed.', false);
    } finally {
      setIsRestoring(false);
      setRestoreTarget(null);
    }
  };

  // Permanent Delete 
  const handlePurge = async () => {
    if (!purgeTarget) return;
    setIsPurging(true);
    try {
      await connection.archives.permanentDelete(purgeTarget.id);
      showToast('Record permanently deleted.');
      setRecords(prev => prev.filter(r => r.id !== purgeTarget.id));
    } catch (e) {
      showToast(e.message || 'Delete failed.', false);
    } finally {
      setIsPurging(false);
      setPurgeTarget(null);
    }
  };

  const activeTabConfig = TABS.find(t => t.key === activeTab);

  return (
    <Layout role="admin">
      <div className="space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#2E3192]/10">
            <Archive className="h-7 w-7 text-[#2E3192]" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[#2E3192]">Archives</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              Deleted records are stored here. Restore or permanently remove them.
            </p>
          </div>
        </div>

        {/* Level Tabs */}
        <div className="flex gap-2 flex-wrap">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all border-2 ${
                  active
                    ? 'border-[#2E3192] bg-[#2E3192] text-white shadow-md'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-[#F9E81B] hover:text-[#2E3192]'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Records Table */}
        <Card className="border-2 border-transparent hover:border-[#F9E81B]/50 transition-colors">
          <CardHeader className="pb-3">
            <CardTitle className="text-[#2E3192] flex items-center gap-2">
              {activeTabConfig && <activeTabConfig.icon className="h-5 w-5" />}
              Archived {activeTabConfig?.label} ({records.length})
            </CardTitle>
            <CardDescription>
              Records deleted by admin. You can restore or permanently remove them.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-16 text-center text-gray-400 animate-pulse">Loading archives…</div>
            ) : records.length === 0 ? (
              <div className="py-16 flex flex-col items-center gap-3 text-gray-400">
                <Archive className="h-12 w-12 opacity-30" />
                <p className="text-sm">No archived {activeTabConfig?.label.toLowerCase()} found.</p>
              </div>
            ) : (
              <div className="rounded-md border border-gray-200 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="text-[#2E3192] font-semibold">Record</TableHead>
                      <TableHead className="text-[#2E3192] font-semibold">Original ID</TableHead>
                      <TableHead className="text-[#2E3192] font-semibold">Deleted By</TableHead>
                      <TableHead className="text-[#2E3192] font-semibold">Deleted At</TableHead>
                      <TableHead className="text-right text-[#2E3192] font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {records.map(record => (
                      <TableRow key={record.id} className="hover:bg-[#F9E81B]/5 group">
                        <TableCell>
                          <RecordSummary record={record} />
                        </TableCell>
                        <TableCell>
                          <span className="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded">
                            #{record.original_id}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {record.deleted_by || 'System'}
                        </TableCell>
                        <TableCell className="text-xs text-gray-500 whitespace-nowrap">
                          {new Date(record.deleted_at).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4 text-[#2E3192]" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[160px]">
                              <DropdownMenuItem 
                                onClick={() => setRestoreTarget(record)}
                                className="cursor-pointer"
                              >
                                <RotateCcw className="mr-2 h-4 w-4 text-[#2E3192]" />
                                <span>Restore</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => setPurgeTarget(record)}
                                className="cursor-pointer text-[#ED1C24] focus:text-[#ED1C24] focus:bg-[#ED1C24]/10"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>Remove</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Restore Confirm Dialog */}
      <Dialog open={!!restoreTarget} onOpenChange={() => setRestoreTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#2E3192] flex items-center gap-2">
              <RotateCcw className="h-5 w-5" /> Restore Record
            </DialogTitle>
            <DialogDescription className="pt-2">
              This will restore the archived record back to the system. Are you sure?
            </DialogDescription>
          </DialogHeader>
          {restoreTarget && (
            <div className="bg-[#2E3192]/5 rounded-lg p-3 border border-[#2E3192]/20">
              <RecordSummary record={restoreTarget} />
            </div>
          )}
          <DialogFooter className="gap-2 pt-2">
            <Button variant="outline" onClick={() => setRestoreTarget(null)}>Cancel</Button>
            <Button
              className="bg-[#2E3192] hover:bg-[#24277a] text-white gap-1"
              onClick={handleRestore}
              disabled={isRestoring}
            >
              <RotateCcw className="h-4 w-4" />
              {isRestoring ? 'Restoring…' : 'Yes, Restore'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Permanent Delete Confirm Dialog */}
      <Dialog open={!!purgeTarget} onOpenChange={() => setPurgeTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#ED1C24] flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" /> Permanently Delete
            </DialogTitle>
            <DialogDescription className="pt-2">
              <span className="font-semibold text-[#ED1C24]">This cannot be undone.</span>{' '}
              The record will be permanently erased from the system.
            </DialogDescription>
          </DialogHeader>
          {purgeTarget && (
            <div className="bg-red-50 rounded-lg p-3 border border-red-200">
              <RecordSummary record={purgeTarget} />
            </div>
          )}
          <DialogFooter className="gap-2 pt-2">
            <Button variant="outline" onClick={() => setPurgeTarget(null)}>Cancel</Button>
            <Button
              className="bg-[#ED1C24] hover:bg-[#c41920] text-white gap-1"
              onClick={handlePurge}
              disabled={isPurging}
            >
              <Trash2 className="h-4 w-4" />
              {isPurging ? 'Deleting…' : 'Yes, Delete Forever'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-xl text-white text-sm font-medium transition-all animate-in slide-in-from-bottom-2 ${
          toast.ok ? 'bg-emerald-600' : 'bg-[#ED1C24]'
        }`}>
          {toast.msg}
        </div>
      )}
    </Layout>
  );
}
