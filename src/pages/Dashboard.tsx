
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMsal } from '@/hooks/useMsal';
import { Navbar } from '@/components/Navbar';
import { LeaveBalance } from '@/components/LeaveBalance';
import { LeaveHistory } from '@/components/LeaveHistory';
import { ApplyLeave } from '@/components/ApplyLeave';
import { ManagerApprovals } from '@/components/ManagerApprovals';
import { AdminDashboard } from '@/components/AdminDashboard';
import { DepartmentManagement } from '@/components/DepartmentManagement';
import { LeaveCalendar } from '@/components/LeaveCalendar';
import { ReportGeneration } from '@/components/ReportGeneration';
import { toast } from '@/hooks/use-toast';

const Dashboard = () => {
  const { isAuthenticated, employeeId, isManager, isAdmin, userDetails } = useMsal();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('balance');

  useEffect(() => {
    // Redirect if not authenticated
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // Show welcome toast once on login
  useEffect(() => {
    if (userDetails && isAuthenticated) {
      toast({
        title: `Welcome, ${userDetails.name}!`,
        description: "You've successfully logged into the Leave Management System.",
      });
    }
  }, [isAuthenticated, userDetails]);

  if (!isAuthenticated || !employeeId) {
    return <div>Loading...</div>;
  }

  // Calculate the number of tabs to determine the grid columns
  let tabCount = 5; // Default tabs
  if (isManager) tabCount++;
  if (isAdmin) tabCount += 3; // Admin, Departments, Reports

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Employee Dashboard</CardTitle>
              <CardDescription>
                Manage your leave applications and view your leave balance
              </CardDescription>
            </CardHeader>
          </Card>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className={`grid w-full grid-cols-2 md:grid-cols-${Math.min(tabCount, 8)}`}>
              <TabsTrigger value="balance">Leave Balance</TabsTrigger>
              <TabsTrigger value="apply">Apply for Leave</TabsTrigger>
              <TabsTrigger value="history">Leave History</TabsTrigger>
              <TabsTrigger value="calendar">Leave Calendar</TabsTrigger>
              <TabsTrigger value="team">Team View</TabsTrigger>
              {isManager && (
                <TabsTrigger value="manager">Manager Approvals</TabsTrigger>
              )}
              {isAdmin && (
                <>
                  <TabsTrigger value="admin">Admin Panel</TabsTrigger>
                  <TabsTrigger value="departments">Departments</TabsTrigger>
                  <TabsTrigger value="reports">Reports</TabsTrigger>
                </>
              )}
            </TabsList>
            
            <TabsContent value="balance" className="mt-6">
              <LeaveBalance employeeId={employeeId} />
            </TabsContent>
            
            <TabsContent value="apply" className="mt-6">
              <ApplyLeave employeeId={employeeId} />
            </TabsContent>
            
            <TabsContent value="history" className="mt-6">
              <LeaveHistory employeeId={employeeId} />
            </TabsContent>
            
            <TabsContent value="calendar" className="mt-6">
              <LeaveCalendar />
            </TabsContent>
            
            <TabsContent value="team" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Team View</CardTitle>
                  <CardDescription>View your team members' leave status</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    This feature will show a calendar view of your team members' leave status.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
            
            {isManager && (
              <TabsContent value="manager" className="mt-6">
                <ManagerApprovals />
              </TabsContent>
            )}
            
            {isAdmin && (
              <>
                <TabsContent value="admin" className="mt-6">
                  <AdminDashboard />
                </TabsContent>
                
                <TabsContent value="departments" className="mt-6">
                  <DepartmentManagement />
                </TabsContent>
                
                <TabsContent value="reports" className="mt-6">
                  <ReportGeneration />
                </TabsContent>
              </>
            )}
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
