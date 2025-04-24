
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { leaveApi } from '@/services/api';
import { toast } from '@/hooks/use-toast';

interface LeaveBalanceProps {
  employeeId: number;
}

interface LeaveBalanceType {
  leaveType: string;
  balance: number;
}

export function LeaveBalance({ employeeId }: LeaveBalanceProps) {
  const [balances, setBalances] = useState<LeaveBalanceType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaveBalance = async () => {
      try {
        const response = await leaveApi.getLeaveBalance(employeeId);
        setBalances(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching leave balance:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch leave balance. Please try again later.",
        });
        setLoading(false);
      }
    };

    fetchLeaveBalance();
  }, [employeeId]);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {loading ? (
        <div className="col-span-full flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
        </div>
      ) : balances.length === 0 ? (
        <div className="col-span-full text-center py-8">
          <p className="text-muted-foreground">No leave balance information available.</p>
        </div>
      ) : (
        balances.map((balance) => (
          <Card key={balance.leaveType}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{balance.leaveType}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{balance.balance} days</div>
              <p className="text-xs text-muted-foreground mt-1">Available balance</p>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
