
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { departmentApi } from '@/services/api';
import { toast } from '@/hooks/use-toast';

interface Department {
  id: number;
  name: string;
}

interface Employee {
  id: number;
  name: string;
  email: string;
  department?: string;
  departmentId?: number;
  role: string;
}

export function DepartmentManagement() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [newDepartmentName, setNewDepartmentName] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<number | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<number | null>(null);
  const [newRole, setNewRole] = useState<string>('EMPLOYEE');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch departments and employees
    const fetchData = async () => {
      setLoading(true);
      try {
        const departmentsResponse = await departmentApi.getAllDepartments();
        setDepartments(departmentsResponse.data);
        
        // This would typically come from a getEmployees endpoint
        // For now, we're using mock data
        setEmployees([
          { id: 1, name: 'John Doe', email: 'john.doe@example.com', department: 'HR', departmentId: 1, role: 'EMPLOYEE' },
          { id: 2, name: 'Jane Smith', email: 'jane.smith@example.com', department: 'Engineering', departmentId: 2, role: 'MANAGER' },
        ]);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load departments and employees.",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleCreateDepartment = async () => {
    if (!newDepartmentName.trim()) return;
    
    try {
      const response = await departmentApi.createDepartment({ name: newDepartmentName });
      setDepartments([...departments, response.data]);
      setNewDepartmentName('');
      toast({
        title: "Success",
        description: `Department "${newDepartmentName}" has been created.`,
      });
    } catch (error) {
      console.error('Error creating department:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create department.",
      });
    }
  };

  const handleAssignEmployee = async () => {
    if (!selectedEmployee || !selectedDepartment) return;
    
    try {
      await departmentApi.assignEmployeeToDepartment({
        employeeId: selectedEmployee,
        departmentId: selectedDepartment
      });
      
      // Update local state
      const updatedEmployees = employees.map(emp => 
        emp.id === selectedEmployee 
          ? { ...emp, departmentId: selectedDepartment, department: departments.find(d => d.id === selectedDepartment)?.name } 
          : emp
      );
      setEmployees(updatedEmployees);
      
      toast({
        title: "Success",
        description: "Employee assigned to department successfully.",
      });
    } catch (error) {
      console.error('Error assigning employee:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to assign employee to department.",
      });
    }
  };

  const handleUpdateRole = async (employeeId: number, role: string) => {
    try {
      await departmentApi.updateEmployeeRole(employeeId, role);
      
      // Update local state
      const updatedEmployees = employees.map(emp => 
        emp.id === employeeId ? { ...emp, role } : emp
      );
      setEmployees(updatedEmployees);
      
      toast({
        title: "Success",
        description: `Employee role updated to ${role}.`,
      });
    } catch (error) {
      console.error('Error updating role:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update employee role.",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create Department</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <div className="grid flex-1 gap-2">
              <Label htmlFor="department-name">Department Name</Label>
              <Input
                id="department-name"
                placeholder="Enter department name"
                value={newDepartmentName}
                onChange={(e) => setNewDepartmentName(e.target.value)}
              />
            </div>
            <Button 
              className="self-end"
              onClick={handleCreateDepartment}
            >
              Create
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Assign Employee to Department</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="employee">Employee</Label>
              <Select onValueChange={(value) => setSelectedEmployee(Number(value))}>
                <SelectTrigger>
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
            </div>

            <div className="grid gap-2">
              <Label htmlFor="department">Department</Label>
              <Select onValueChange={(value) => setSelectedDepartment(Number(value))}>
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

            <Button onClick={handleAssignEmployee}>Assign Employee</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Employees and Roles</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((emp) => (
                  <TableRow key={emp.id}>
                    <TableCell>{emp.name}</TableCell>
                    <TableCell>{emp.email}</TableCell>
                    <TableCell>{emp.department || 'Not assigned'}</TableCell>
                    <TableCell>
                      <Badge>{emp.role}</Badge>
                    </TableCell>
                    <TableCell>
                      <Select 
                        onValueChange={(value) => handleUpdateRole(emp.id, value)}
                        defaultValue={emp.role}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Change role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="EMPLOYEE">EMPLOYEE</SelectItem>
                          <SelectItem value="MANAGER">MANAGER</SelectItem>
                          <SelectItem value="ADMIN">ADMIN</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
