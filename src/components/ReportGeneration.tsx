
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { reportApi } from '@/services/api';
import { toast } from '@/hooks/use-toast';
import { FileDown } from 'lucide-react';

interface Department {
  id: number;
  name: string;
}

interface Employee {
  id: number;
  name: string;
}

interface LeaveType {
  id: number;
  name: string;
}

export function ReportGeneration() {
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [selectedLeaveType, setSelectedLeaveType] = useState<string | null>(null);
  const [generatingReport, setGeneratingReport] = useState(false);
  
  // Mock data for demo
  const departments: Department[] = [
    { id: 1, name: 'Engineering' },
    { id: 2, name: 'HR' },
    { id: 3, name: 'Finance' }
  ];
  
  const employees: Employee[] = [
    { id: 1, name: 'John Doe' },
    { id: 2, name: 'Jane Smith' },
    { id: 3, name: 'Mike Johnson' }
  ];
  
  const leaveTypes: LeaveType[] = [
    { id: 1, name: 'Annual Leave' },
    { id: 2, name: 'Sick Leave' },
    { id: 3, name: 'Parental Leave' }
  ];

  const downloadCSV = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleEmployeeReport = async () => {
    if (!selectedEmployee) return;
    
    setGeneratingReport(true);
    try {
      const response = await reportApi.generateEmployeeLeaveReport(parseInt(selectedEmployee));
      downloadCSV(response.data, `employee-${selectedEmployee}-leave-report.csv`);
      toast({
        title: "Report Generated",
        description: "Employee leave report has been downloaded.",
      });
    } catch (error) {
      console.error('Error generating employee report:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate employee report.",
      });
    } finally {
      setGeneratingReport(false);
    }
  };

  const handleDepartmentReport = async () => {
    if (!selectedDepartment) return;
    
    setGeneratingReport(true);
    try {
      const response = await reportApi.generateDepartmentLeaveReport(parseInt(selectedDepartment));
      downloadCSV(response.data, `department-${selectedDepartment}-leave-report.csv`);
      toast({
        title: "Report Generated",
        description: "Department leave report has been downloaded.",
      });
    } catch (error) {
      console.error('Error generating department report:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate department report.",
      });
    } finally {
      setGeneratingReport(false);
    }
  };

  const handleLeaveTypeReport = async () => {
    if (!selectedLeaveType) return;
    
    setGeneratingReport(true);
    try {
      const response = await reportApi.generateLeaveTypeReport(parseInt(selectedLeaveType));
      downloadCSV(response.data, `leave-type-${selectedLeaveType}-report.csv`);
      toast({
        title: "Report Generated",
        description: "Leave type report has been downloaded.",
      });
    } catch (error) {
      console.error('Error generating leave type report:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate leave type report.",
      });
    } finally {
      setGeneratingReport(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Generate Leave Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="employee-report">Employee Leave Report</Label>
                <div className="flex space-x-2">
                  <Select onValueChange={setSelectedEmployee}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((emp) => (
                        <SelectItem key={emp.id} value={emp.id.toString()}>
                          {emp.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button 
                    onClick={handleEmployeeReport}
                    disabled={!selectedEmployee || generatingReport}
                  >
                    <FileDown className="mr-2 h-4 w-4" />
                    Generate
                  </Button>
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="department-report">Department Leave Report</Label>
                <div className="flex space-x-2">
                  <Select onValueChange={setSelectedDepartment}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id.toString()}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button 
                    onClick={handleDepartmentReport}
                    disabled={!selectedDepartment || generatingReport}
                  >
                    <FileDown className="mr-2 h-4 w-4" />
                    Generate
                  </Button>
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="leave-type-report">Leave Type Report</Label>
                <div className="flex space-x-2">
                  <Select onValueChange={setSelectedLeaveType}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select leave type" />
                    </SelectTrigger>
                    <SelectContent>
                      {leaveTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id.toString()}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button 
                    onClick={handleLeaveTypeReport}
                    disabled={!selectedLeaveType || generatingReport}
                  >
                    <FileDown className="mr-2 h-4 w-4" />
                    Generate
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
