import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { getAllUsers, deleteUser } from "../../lib/admin-auth";
import { toast } from "../ui/use-toast";
import CreateTestUserForm from "./CreateTestUserForm";

type User = {
  id: string;
  email?: string;
  created_at: string;
  user_metadata: {
    full_name?: string;
  };
};

export default function TestUsersPanel() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const { users } = await getAllUsers();
      setUsers(users || []);
    } catch (error: any) {
      toast({
        title: "Error fetching users",
        description: error.message || "An unknown error occurred",
        variant: "destructive",
      });
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteUser = async (userId: string) => {
    setIsDeleting(userId);
    try {
      await deleteUser(userId);
      toast({
        title: "User deleted",
        description: "The user has been successfully deleted",
      });
      // Refresh the user list
      fetchUsers();
    } catch (error: any) {
      toast({
        title: "Error deleting user",
        description: error.message || "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="space-y-8">
      <CreateTestUserForm />

      <Card>
        <CardHeader>
          <CardTitle>Test Users</CardTitle>
          <CardDescription>
            Manage your test users created with the admin API
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Loading users...</div>
          ) : users.length === 0 ? (
            <div className="text-center py-4">No users found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4">Name</th>
                    <th className="text-left py-2 px-4">Email</th>
                    <th className="text-left py-2 px-4">Created</th>
                    <th className="text-right py-2 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-4">
                        {user.user_metadata?.full_name || "N/A"}
                      </td>
                      <td className="py-2 px-4">{user.email || "N/A"}</td>
                      <td className="py-2 px-4">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-2 px-4 text-right">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id)}
                          disabled={isDeleting === user.id}
                        >
                          {isDeleting === user.id ? "Deleting..." : "Delete"}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
