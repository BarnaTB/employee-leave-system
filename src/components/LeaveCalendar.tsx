
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { departmentApi } from '@/services/api';
import { toast } from '@/hooks/use-toast';

interface EmployeeOnLeave {
  employeeId: number;
  employeeName: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
}

interface Department {
  id: number;
  name: string;
}

export function LeaveCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<number | null>(null);
  const [employeesOnLeave, setEmployeesOnLeave] = useState<EmployeeOnLeave[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch departments
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await departmentApi.getAllDepartments();
        setDepartments(response.data);
        if (response.data.length > 0) {
          setSelectedDepartment(response.data[0].id);
        }
      } catch (error) {
        console.error('Error fetching departments:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load departments.",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchDepartments();
  }, []);

  // Fetch employees on leave when department changes
  useEffect(() => {
    if (!selectedDepartment) return;
    
    const fetchEmployeesOnLeave = async () => {
      setLoading(true);
      try {
        const response = await departmentApi.getEmployeesOnLeaveByDepartment(selectedDepartment);
        setEmployeesOnLeave(response.data);
      } catch (error) {
        console.error('Error fetching employees on leave:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load employees on leave.",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchEmployeesOnLeave();
  }, [selectedDepartment]);

  // For demonstration, generate some dates with employees on leave
  const getEmployeesOnLeaveForDate = (date: Date) => {
    return employeesOnLeave.filter(employee => {
      const startDate = new Date(employee.startDate);
      const endDate = new Date(employee.endDate);
      return date >= startDate && date <= endDate;
    });
  };

  // Calendar day rendering to highlight days with employees on leave
  const dayWithLeaves = (date: Date) => {
    const employees = getEmployeesOnLeaveForDate(date);
    const hasEmployees = employees.length > 0;
    
    return (
      <div className="relative w-full h-full">
        <div className="absolute left-0 right-0 bottom-0 h-1 flex">
          {hasEmployees && <div className="bg-red-500 w-full h-full rounded-sm" />}
        </div>
      </div>
    );
  };

  // Selected day details - who's on leave
  const selectedDayEmployees = selectedDate ? getEmployeesOnLeaveForDate(selectedDate) : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Department Leave Calendar</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-[300px_1fr] gap-6">
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="department">Department</Label>
              <Select 
                onValueChange={(value) => setSelectedDepartment(Number(value))}
                value={selectedDepartment?.toString()}
              >
                <SelectTrigger>
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
            </div>
            
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border shadow pointer-events-auto"
              components={{
                DayContent: (props) => (
                  <>
                    <div>{props.day.day}</div>
                    {dayWithLeaves(props.date)}
                  </>
                ),
              }}
            />
            
            <div className="flex items-center text-sm text-muted-foreground">
              <div className="w-3 h-3 rounded-sm bg-red-500 mr-2" />
              <span>Employees on leave</span>
            </div>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>
                  {selectedDate ? (
                    `Employees on Leave: ${selectedDate.toLocaleDateString()}`
                  ) : (
                    'Select a date to view employees on leave'
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
                  </div>
                ) : selectedDayEmployees.length > 0 ? (
                  <ul className="space-y-3">
                    {selectedDayEmployees.map((employee, index) => (
                      <li key={index} className="border rounded-lg p-4">
                        <div className="font-medium">{employee.employeeName}</div>
                        <div className="text-sm text-muted-foreground">
                          <span className="font-medium">Leave Type:</span> {employee.leaveType}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <span className="font-medium">Duration:</span>{' '}
                          {new Date(employee.startDate).toLocaleDateString()} to{' '}
                          {new Date(employee.endDate).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <span className="font-medium">Reason:</span> {employee.reason}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No employees on leave for the selected date.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
