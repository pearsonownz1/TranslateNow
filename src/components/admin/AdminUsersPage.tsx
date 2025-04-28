import React, { useState, useEffect } from "react"; // Import useEffect
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
// Import necessary icons, including new ones for actions
import { Search, MoreHorizontal, KeyRound, LockKeyhole, Loader2, FileText as BillingIcon } from "lucide-react"; // Added BillingIcon
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { supabase } from "@/lib/supabase"; // Import Supabase client
import { Link } from "react-router-dom"; // Import Link
import { User } from "@supabase/supabase-js"; // Import User type for better typing

// Define the structure for the user data we expect after fetching
// Adjust based on your actual data structure (especially user_metadata)
interface FetchedUser extends User {
  // Add any custom profile fields if you fetch from a separate profiles table
}

const AdminUsersPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<FetchedUser[]>([]); // State for real users
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState<string | null>(null); // Error state

  // Fetch users from Supabase Edge Function
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        // Invoke the deployed Edge Function 'list-admin-users'
        const { data, error: invokeError } = await supabase.functions.invoke('list-admin-users');

        if (invokeError) {
          // Handle potential errors from the function invocation itself (network, function not found, etc.)
          setError(`Error invoking Edge Function: ${invokeError.message}`);
          throw invokeError;
        }

        // Check if the function execution itself returned an error (e.g., inside the function logic)
        // The Edge Function we wrote returns { error: message } on failure
        if (data?.error) {
           setError(`Edge Function returned error: ${data.error}`);
           throw new Error(data.error);
        }

        // Assuming the function returns the array of users directly in the 'data' field on success
        // Ensure data is an array before setting state
        if (Array.isArray(data)) {
            setUsers(data);
        } else {
            // Handle cases where data might not be in the expected format
            console.warn("Received unexpected data format from Edge Function:", data);
            setError("Received unexpected data format from server.");
            setUsers([]);
        }

      } catch (err: any) {
        console.error("Error fetching users via Edge Function:", err);
        // Error state is set within the try/catch blocks now
        if (!error) { // Set a generic error if not already set by specific checks
             setError(`An unexpected error occurred while fetching users: ${err.message || 'Unknown error'}`);
        }
        setUsers([]); // Clear users on error
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []); // Empty dependency array means this runs once on mount

  // Filter users based on search term
  const filteredUsers = users.filter(
    (user) =>
      (user.user_metadata?.first_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (user.user_metadata?.last_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  // Helper to get initials from user metadata or email
  const getInitials = (user: FetchedUser): string => {
    const firstName = user.user_metadata?.first_name || '';
    const lastName = user.user_metadata?.last_name || '';
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (firstName) {
      return firstName[0].toUpperCase();
    }
    if (user.email) {
      return user.email[0].toUpperCase();
    }
    return '?'; // Fallback
  };

   // Helper to get full name or fallback to email
   const getUserName = (user: FetchedUser): string => {
    const firstName = user.user_metadata?.first_name || '';
    const lastName = user.user_metadata?.last_name || '';
    const fullName = `${firstName} ${lastName}`.trim();
    return fullName || user.email || 'N/A'; // Fallback to email or N/A
  };


  // --- Action Handlers (Placeholders - Require Implementation) ---

  const handlePasswordReset = async (userId: string, userEmail?: string) => {
     if (!userEmail) {
       alert("Cannot reset password: User email is missing.");
       return;
     }
     alert(`Password reset requested for user: ${userEmail}. Implement Supabase admin call securely (e.g., via Edge Function).`);
    // Example Implementation (Needs secure environment like Edge Function):
    /*
    try {
      // This needs to be an Edge Function call now
      const { error } = await supabase.functions.invoke('reset-user-password', {
         body: { email: userEmail }
      });
      if (error) throw error;
      alert('Password reset initiated successfully.');
    } catch (error: any) {
      console.error('Error initiating password reset:', error);
      alert(`Error initiating password reset: ${error.message}`);
    }
    */
  };

  const handleManageApiKeys = (userId: string) => {
    alert(`Manage API Keys requested for user ID: ${userId}. Implement functionality (e.g., navigate to a dedicated page or open modal).`);
    // Example: navigate(`/admin/users/${userId}/api-keys`);
  };

  // --- Render Logic ---

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2">Loading users...</span>
      </div>
    );
  }

  if (error) {
     return (
       <div className="text-red-600 bg-red-100 border border-red-400 p-4 rounded-md">
         <strong>Error:</strong> {error}
       </div>
     );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Users</h1>
        {/* Consider if adding users manually is needed */}
        {/* <Button>Add New User</Button> */}
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {/* Removed Export button for now, can be added back if needed */}
        {/* <div className="flex gap-2">
          <Button variant="outline" size="sm">Export Users</Button>
        </div> */}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              {/* Removed Joined, Orders, Status columns */}
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={3} // Adjusted colspan
                  className="text-center py-8 text-muted-foreground"
                >
                  No users found matching your search.
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        {/* Use a generic seed or remove image if not available */}
                        <AvatarImage
                          src={`https://api.dicebear.com/7.x/initials/svg?seed=${getUserName(user)}`}
                          alt={getUserName(user)}
                        />
                        <AvatarFallback>
                          {getInitials(user)}
                        </AvatarFallback>
                      </Avatar>
                      {/* Link the user name/avatar div */}
                      <Link to={`/admin/users/${user.id}/details`} className="hover:underline">
                        {/* Display name from metadata or fallback */}
                        <div className="font-medium">{getUserName(user)}</div>
                      </Link>
                    </div>
                  </TableCell>
                  <TableCell>{user.email || 'N/A'}</TableCell>
                  {/* Removed Joined, Orders, Status cells */}
                  <TableCell className="text-right">
                     {/* Link the whole row or add a specific "View Details" button/icon */}
                     <Button variant="outline" size="sm" asChild>
                       <Link to={`/admin/users/${user.id}/details`}>View Details</Link>
                     </Button>
                    {/* Removed DropdownMenu from list view */}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminUsersPage;
