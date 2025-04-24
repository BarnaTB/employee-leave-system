
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { leaveApi } from '@/services/api';
import { toast } from '@/hooks/use-toast';

interface LeaveApplication {
  id: number;
  employeeName: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: string;
}

export function ManagerApprovals() {
  const [applications, setApplications] = useState<LeaveApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<{ [key: number]: string }>({});
  const [processingIds, setProcessingIds] = useState<number[]>([]);

  // This would be fetched from a real API
  useEffect(() => {
    // Simulate API call to fetch pending manager approvals
    setTimeout(() => {
      setApplications([
        {
          id: 1,
          employeeName: "John Doe",
          leaveType: "Annual Leave",
          startDate: "2025-05-01",
          endDate: "2025-05-05",
          reason: "Family vacation",
          status: "PENDING_MANAGER_APPROVAL"
        },
        {
          id: 2,
          employeeName: "Jane Smith",
          leaveType: "Sick Leave",
          startDate: "2025-04-28",
          endDate: "2025-04-29",
          reason: "Doctor appointment",
          status: "PENDING_MANAGER_APPROVAL"
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const handleCommentChange = (id: number, value: string) => {
    setComments(prev => ({ ...prev, [id]: value }));
  };

  const handleApprove = async (id: number) => {
    try {
      setProcessingIds(prev => [...prev, id]);
      
      // Call the API
      await leaveApi.approveLeaveByManager(id, {
        approverComments: comments[id] || "Approved by manager"
      });
      
      // Update the UI
      setApplications(prev => 
        prev.map(app => 
          app.id === id ? { ...app, status: 'PENDING_ADMIN_APPROVAL' } : app
        )
      );
      
      toast({
        title: "Leave Approved",
        description: "The leave application has been successfully approved and sent for admin approval.",
      });
    } catch (error) {
      console.error('Error approving leave:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to approve leave application. Please try again.",
      });
    } finally {
      setProcessingIds(prev => prev.filter(itemId => itemId !== id));
    }
  };

  const handleReject = async (id: number) => {
    try {
      setProcessingIds(prev => [...prev, id]);
      
      // Call the API
      await leaveApi.rejectLeave(id, {
        approverComments: comments[id] || "Rejected by manager"
      });
      
      // Update the UI
      setApplications(prev => 
        prev.map(app => 
          app.id === id ? { ...app, status: 'REJECTED' } : app
        )
      );
      
      toast({
        title: "Leave Rejected",
        description: "The leave application has been rejected.",
      });
    } catch (error) {
      console.error('Error rejecting leave:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to reject leave application. Please try again.",
      });
    } finally {
      setProcessingIds(prev => prev.filter(itemId => itemId !== id));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Leave Approvals</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No pending leave applications.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Leave Type</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Comments</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell>{app.employeeName}</TableCell>
                    <TableCell>{app.leaveType}</TableCell>
                    <TableCell>
                      {formatDate(app.startDate)} to {formatDate(app.endDate)}
                    </TableCell>
                    <TableCell>{app.reason}</TableCell>
                    <TableCell>
                      <Badge className={
                        app.status === 'PENDING_MANAGER_APPROVAL' ? 'bg-yellow-500' : 
                        app.status === 'PENDING_ADMIN_APPROVAL' ? 'bg-blue-500' : 
                        app.status === 'APPROVED' ? 'bg-green-500' : 'bg-red-500'
                      }>
                        {app.status.replace(/_/g, ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Textarea
                        placeholder="Add comments..."
                        value={comments[app.id] || ''}
                        onChange={(e) => handleCommentChange(app.id, e.target.value)}
                        className="min-h-[80px] text-sm"
                        disabled={app.status !== 'PENDING_MANAGER_APPROVAL'}
                      />
                    </TableCell>
                    <TableCell>
                      {app.status === 'PENDING_MANAGER_APPROVAL' && (
                        <div className="flex flex-col space-y-2">
                          <Button
                            onClick={() => handleApprove(app.id)}
                            disabled={processingIds.includes(app.id)}
                            size="sm"
                            className="bg-green-500 hover:bg-green-600 text-white"
                          >
                            {processingIds.includes(app.id) ? 'Processing...' : 'Approve'}
                          </Button>
                          <Button
                            onClick={() => handleReject(app.id)}
                            disabled={processingIds.includes(app.id)}
                            size="sm"
                            className="bg-red-500 hover:bg-red-600 text-white"
                          >
                            {processingIds.includes(app.id) ? 'Processing...' : 'Reject'}
                          </Button>
                        </div>
                      )}
                      {app.status !== 'PENDING_MANAGER_APPROVAL' && (
                        <span className="text-sm text-muted-foreground">
                          {app.status === 'PENDING_ADMIN_APPROVAL' ? 'Waiting for admin' : 
                           app.status === 'APPROVED' ? 'Approved' : 'Rejected'}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
