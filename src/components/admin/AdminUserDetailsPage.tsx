import React, { useState, useEffect } from 'react';
import { useParams, Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { Loader2, AlertCircle, User as UserIcon, KeyRound, FileText as BillingIcon } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Using Tabs for layout
import { Button } from '@/components/ui/button';
import ClientBillingDetails from './ClientBillingDetails'; // Import the billing component
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Added Alert imports

// Placeholder components for other tabs
const EditUserInfoPlaceholder = ({ userId }: { userId: string }) => (
    <div className="p-4 border rounded-md bg-gray-50 text-gray-500">
        Edit User Info section for User ID: {userId}. (Functionality to be implemented)
        {/* Add form elements here */}
         <Button disabled className="mt-4">Save Changes (Disabled)</Button>
    </div>
);

const ApiKeyManagementPlaceholder = ({ userId }: { userId: string }) => (
     <div className="p-4 border rounded-md bg-gray-50 text-gray-500">
        API Key Management section for User ID: {userId}. (Functionality to be implemented: fetch keys, generate, revoke)
         <Button disabled className="mt-4 mr-2">Generate New Key (Disabled)</Button>
         <Button variant="destructive" disabled>Revoke Selected (Disabled)</Button>
         {/* Add table for keys here */}
    </div>
);


// Define user type (can be expanded)
interface UserDetails extends SupabaseUser {
    // Add profile fields if needed
}

const AdminUserDetailsPage = () => {
    const { userId } = useParams<{ userId: string }>();
    const location = useLocation();
    const navigate = useNavigate();
    const [user, setUser] = useState<UserDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Determine active tab based on URL path, default to 'details'
    const getActiveTab = () => {
        if (location.pathname.endsWith('/billing')) return 'billing';
        if (location.pathname.endsWith('/api-keys')) return 'api-keys';
        return 'details'; // Default tab
    };
    const [activeTab, setActiveTab] = useState(getActiveTab());

     // Update active tab state if URL changes (e.g., browser back/forward)
    useEffect(() => {
        setActiveTab(getActiveTab());
    }, [location.pathname]);


    useEffect(() => {
        const fetchUserDetails = async () => {
            if (!userId) {
                setError("User ID not found in URL.");
                setLoading(false);
                return;
            }
            setLoading(true);
            setError(null);
            try {
                // Call the secure Edge Function instead of the admin API directly
                const { data: userData, error: functionError } = await supabase.functions.invoke('get-user-details', {
                    body: { userId }, // Pass userId in the request body
                });

                if (functionError) {
                    // Handle potential function invocation errors (network, etc.)
                    // or errors returned explicitly by the function (like 403 Forbidden, 404 Not Found)
                    console.error("Error invoking get-user-details function:", functionError);
                    // Try to parse the error message from the function if available
                    let errorMessage = functionError.message;
                    try {
                        // Supabase function errors often have a nested structure
                        const parsedError = JSON.parse(functionError.context?.responseText || '{}');
                        if (parsedError.error) {
                            errorMessage = parsedError.error;
                        }
                    } catch (parseErr) {
                        // Ignore parsing error, use original message
                    }
                    throw new Error(errorMessage || "Unknown error calling function");
                }

                // The function returns the user object directly on success
                if (!userData) throw new Error("User not found or function returned no data.");

                setUser(userData as UserDetails); // Set the user state with the data returned by the function

            } catch (err: any) {
                console.error("Error fetching user details via function:", err);
                // Use the error message thrown from the try block
                setError(`Failed to load user details: ${err.message}`);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        fetchUserDetails();
    }, [userId]);

     // Handle tab changes by updating URL
    const handleTabChange = (value: string) => {
        setActiveTab(value);
        // Update URL without full page reload
        navigate(`/admin/users/${userId}/${value}`, { replace: true });
    };

    // Helper to get user name
     const getUserName = (usr: UserDetails | null): string => {
        if (!usr) return 'N/A';
        const firstName = usr.user_metadata?.first_name || '';
        const lastName = usr.user_metadata?.last_name || '';
        const fullName = `${firstName} ${lastName}`.trim();
        return fullName || usr.email || 'N/A';
    };


    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    if (error) {
        return (
            <Alert variant="destructive" className="m-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        );
    }

     if (!user) {
        return <div className="p-4 text-center">User not found.</div>;
    }


    return (
        <div className="space-y-6">
            <Link to="/admin/users" className="text-sm text-blue-600 hover:underline">&larr; Back to Users List</Link>
            <h1 className="text-2xl font-bold tracking-tight">User Details: {getUserName(user)}</h1>
            <p className="text-sm text-muted-foreground">ID: {user.id}</p>
            <p className="text-sm text-muted-foreground">Email: {user.email}</p>

             <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="details"><UserIcon className="mr-2 h-4 w-4 inline-block"/>Edit Info</TabsTrigger>
                    <TabsTrigger value="api-keys"><KeyRound className="mr-2 h-4 w-4 inline-block"/>API Keys</TabsTrigger>
                    <TabsTrigger value="billing"><BillingIcon className="mr-2 h-4 w-4 inline-block"/>Billing</TabsTrigger>
                </TabsList>
                <TabsContent value="details" className="mt-4">
                   <EditUserInfoPlaceholder userId={userId!} />
                </TabsContent>
                <TabsContent value="api-keys" className="mt-4">
                   <ApiKeyManagementPlaceholder userId={userId!} />
                </TabsContent>
                <TabsContent value="billing" className="mt-4">
                    {/* Render the existing billing component */}
                    <ClientBillingDetails />
                </TabsContent>
            </Tabs>

            {/* Outlet might be used if we have nested routes *within* these tabs, but for now, conditional rendering is simpler */}
            {/* <Outlet /> */}
        </div>
    );
};

export default AdminUserDetailsPage;
