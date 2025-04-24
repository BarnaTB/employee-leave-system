
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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
  managerComments?: string;
}

interface LeaveType {
  id: number;
  name: string;
  description: string;
}

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('approvals');
  const [applications, setApplications] = useState<LeaveApplication[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [loadingApprovals, setLoadingApprovals] = useState(true);
  const [loadingLeaveTypes, setLoadingLeaveTypes] = useState(true);
  const [processingIds, setProcessingIds] = useState<number[]>([]);
  const [comments, setComments] = useState<{ [key: number]: string }>({});
  const [processingCarryover, setProcessingCarryover] = useState(false);
  
  // For new leave type creation/edit
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentLeaveType, setCurrentLeaveType] = useState<LeaveType | null>(null);
  const [newLeaveTypeName, setNewLeaveTypeName] = useState('');
  const [newLeaveTypeDescription, setNewLeaveTypeDescription] = useState('');

  // Fetch leave applications waiting for admin approval
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setApplications([
        {
          id: 1,
          employeeName: "John Doe",
          leaveType: "Annual Leave",
          startDate: "2025-05-01",
          endDate: "2025-05-05",
          reason: "Family vacation",
          status: "PENDING_ADMIN_APPROVAL",
          managerComments: "Approved by manager"
        },
        {
          id: 2,
          employeeName: "Jane Smith",
          leaveType: "Sick Leave",
          startDate: "2025-04-28",
          endDate: "2025-04-29",
          reason: "Doctor appointment",
          status: "PENDING_ADMIN_APPROVAL",
          managerComments: "Team capacity is covered"
        }
      ]);
      setLoadingApprovals(false);
    }, 1000);

    // Fetch leave types
    setTimeout(() => {
      setLeaveTypes([
        {
          id: 1,
          name: "Annual Leave",
          description: "Regular paid time off"
        },
        {
          id: 2,
          name: "Sick Leave",
          description: "Leave for medical reasons"
        },
        {
          id: 3,
          name: "Maternity Leave",
          description: "Leave for expecting mothers"
        }
      ]);
      setLoadingLeaveTypes(false);
    }, 800);
  }, []);

  const handleCommentChange = (id: number, value: string) => {
    setComments(prev => ({ ...prev, [id]: value }));
  };

  const handleApprove = async (id: number) => {
    try {
      setProcessingIds(prev => [...prev, id]);
      
      // Call the API
      await leaveApi.approveLeaveByAdmin(id, {
        approverComments: comments[id] || "Approved by admin"
      });
      
      // Update the UI
      setApplications(prev => 
        prev.map(app => 
          app.id === id ? { ...app, status: 'APPROVED' } : app
        )
      );
      
      toast({
        title: "Leave Approved",
        description: "The leave application has been successfully approved.",
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
        approverComments: comments[id] || "Rejected by admin"
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

  const handleProcessCarryover = async () => {
    try {
      setProcessingCarryover(true);
      
      // Call the API
      await leaveApi.processYearEndCarryover();
      
      toast({
        title: "Carryover Processed",
        description: "Year-end leave balance carryover has been processed successfully.",
      });
    } catch (error) {
      console.error('Error processing carryover:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to process year-end carryover. Please try again.",
      });
    } finally {
      setProcessingCarryover(false);
    }
  };

  const handleAddLeaveType = async () => {
    try {
      // Call the API
      await leaveApi.createLeaveType({
        name: newLeaveTypeName,
        description: newLeaveTypeDescription
      });
      
      // Add to the UI with a fake ID (would be returned by the API in a real app)
      const newId = Math.max(...leaveTypes.map(lt => lt.id), 0) + 1;
      setLeaveTypes(prev => [
        ...prev,
        {
          id: newId,
          name: newLeaveTypeName,
          description: newLeaveTypeDescription
        }
      ]);
      
      toast({
        title: "Leave Type Created",
        description: "New leave type has been successfully created.",
      });
      
      // Reset form and close dialog
      setNewLeaveTypeName('');
      setNewLeaveTypeDescription('');
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error('Error creating leave type:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create new leave type. Please try again.",
      });
    }
  };

  const handleEditLeaveType = async () => {
    if (!currentLeaveType) return;
    
    try {
      // Call the API
      await leaveApi.updateLeaveType(currentLeaveType.id, {
        name: newLeaveTypeName,
        description: newLeaveTypeDescription
      });
      
      // Update the UI
      setLeaveTypes(prev => 
        prev.map(lt => 
          lt.id === currentLeaveType.id 
            ? { ...lt, name: newLeaveTypeName, description: newLeaveTypeDescription }
            : lt
        )
      );
      
      toast({
        title: "Leave Type Updated",
        description: "Leave type has been successfully updated.",
      });
      
      // Reset form and close dialog
      setCurrentLeaveType(null);
      setNewLeaveTypeName('');
      setNewLeaveTypeDescription('');
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error('Error updating leave type:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update leave type. Please try again.",
      });
    }
  };

  const handleDeleteLeaveType = async (id: number) => {
    try {
      setProcessingIds(prev => [...prev, id]);
      
      // Call the API
      await leaveApi.deleteLeaveType(id);
      
      // Remove from UI
      setLeaveTypes(prev => prev.filter(lt => lt.id !== id));
      
      toast({
        title: "Leave Type Deleted",
        description: "Leave type has been successfully deleted.",
      });
    } catch (error) {
      console.error('Error deleting leave type:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete leave type. Please try again.",
      });
    } finally {
      setProcessingIds(prev => prev.filter(itemId => itemId !== id));
    }
  };

  const openEditDialog = (leaveType: LeaveType) => {
    setCurrentLeaveType(leaveType);
    setNewLeaveTypeName(leaveType.name);
    setNewLeaveTypeDescription(leaveType.description);
    setIsEditDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Admin Dashboard</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="approvals">Leave Approvals</TabsTrigger>
            <TabsTrigger value="leavetypes">Leave Types</TabsTrigger>
            <TabsTrigger value="yearend">Year-End Processing</TabsTrigger>
          </TabsList>

          {/* Leave Approvals Tab */}
          <TabsContent value="approvals" className="space-y-4 mt-6">
            {loadingApprovals ? (
              <div className="flex justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
              </div>
            ) : applications.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No pending leave applications for admin approval.</p>
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
                      <TableHead>Manager Comments</TableHead>
                      <TableHead>Admin Comments</TableHead>
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
                        <TableCell>{app.managerComments}</TableCell>
                        <TableCell>
                          <Textarea
                            placeholder="Add admin comments..."
                            value={comments[app.id] || ''}
                            onChange={(e) => handleCommentChange(app.id, e.target.value)}
                            className="min-h-[80px] text-sm"
                            disabled={app.status !== 'PENDING_ADMIN_APPROVAL'}
                          />
                        </TableCell>
                        <TableCell>
                          {app.status === 'PENDING_ADMIN_APPROVAL' && (
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
                          {app.status !== 'PENDING_ADMIN_APPROVAL' && (
                            <Badge className={
                              app.status === 'APPROVED' ? 'bg-green-500' : 'bg-red-500'
                            }>
                              {app.status}
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          {/* Leave Types Tab */}
          <TabsContent value="leavetypes" className="space-y-4 mt-6">
            <div className="flex justify-end mb-4">
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>Add New Leave Type</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Add New Leave Type</DialogTitle>
                    <DialogDescription>
                      Create a new leave type for employees to use.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label htmlFor="name" className="text-right text-sm font-medium">Name</label>
                      <Input
                        id="name"
                        value={newLeaveTypeName}
                        onChange={(e) => setNewLeaveTypeName(e.target.value)}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label htmlFor="description" className="text-right text-sm font-medium">Description</label>
                      <Textarea
                        id="description"
                        value={newLeaveTypeDescription}
                        onChange={(e) => setNewLeaveTypeDescription(e.target.value)}
                        className="col-span-3"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleAddLeaveType}>Create</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {loadingLeaveTypes ? (
              <div className="flex justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
              </div>
            ) : leaveTypes.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No leave types defined.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaveTypes.map((leaveType) => (
                      <TableRow key={leaveType.id}>
                        <TableCell>{leaveType.name}</TableCell>
                        <TableCell>{leaveType.description}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditDialog(leaveType)}
                              disabled={processingIds.includes(leaveType.id)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-500 border-red-200 hover:bg-red-50"
                              onClick={() => handleDeleteLeaveType(leaveType.id)}
                              disabled={processingIds.includes(leaveType.id)}
                            >
                              {processingIds.includes(leaveType.id) ? 'Deleting...' : 'Delete'}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Edit Leave Type Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Edit Leave Type</DialogTitle>
                  <DialogDescription>
                    Update the leave type details.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="edit-name" className="text-right text-sm font-medium">Name</label>
                    <Input
                      id="edit-name"
                      value={newLeaveTypeName}
                      onChange={(e) => setNewLeaveTypeName(e.target.value)}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="edit-description" className="text-right text-sm font-medium">Description</label>
                    <Textarea
                      id="edit-description"
                      value={newLeaveTypeDescription}
                      onChange={(e) => setNewLeaveTypeDescription(e.target.value)}
                      className="col-span-3"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleEditLeaveType}>Save Changes</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* Year-End Processing Tab */}
          <TabsContent value="yearend" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Year-End Leave Balance Carryover</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  This process will carry over unused leave balances to the next year based on company policy.
                  Make sure to run this at the end of the financial year.
                </p>
                <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
                  <p className="text-amber-800 font-medium">Warning</p>
                  <p className="text-amber-700 text-sm">
                    This action cannot be undone. Please ensure you have taken a backup of the current leave balances.
                  </p>
                </div>
                <Button 
                  onClick={handleProcessCarryover} 
                  disabled={processingCarryover}
                  className="w-full md:w-auto"
                >
                  {processingCarryover ? (
                    <>
                      <div className="h-4 w-4 mr-2 animate-spin rounded-full border-b-2 border-white"></div>
                      Processing...
                    </>
                  ) : (
                    "Process Year-End Carryover"
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
