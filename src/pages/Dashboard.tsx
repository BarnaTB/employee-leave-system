
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
            <TabsList className="grid w-full grid-cols-3 md:grid-cols-5">
              <TabsTrigger value="balance">Leave Balance</TabsTrigger>
              <TabsTrigger value="apply">Apply for Leave</TabsTrigger>
              <TabsTrigger value="history">Leave History</TabsTrigger>
              {isManager && (
                <TabsTrigger value="manager">Manager Approvals</TabsTrigger>
              )}
              {isAdmin && (
                <TabsTrigger value="admin">Admin Panel</TabsTrigger>
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
            
            {isManager && (
              <TabsContent value="manager" className="mt-6">
                <ManagerApprovals />
              </TabsContent>
            )}
            
            {isAdmin && (
              <TabsContent value="admin" className="mt-6">
                <AdminDashboard />
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
