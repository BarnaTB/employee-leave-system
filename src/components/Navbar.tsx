
import { Button } from '@/components/ui/button';
import { useMsal } from '@/hooks/useMsal';

export function Navbar() {
  const { logout, userDetails } = useMsal();

  return (
    <header className="bg-white shadow">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-xl font-bold">Leave Management System</h1>
          </div>
          <div className="flex items-center space-x-4">
            {userDetails && (
              <div className="text-sm text-gray-700">
                {userDetails.name}
              </div>
            )}
            <Button variant="outline" onClick={logout}>
              Log out
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
