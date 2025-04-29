import React, { useState, useEffect } from "react"; // Added useEffect
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, Copy, Check, Loader2, Trash2, ExternalLink, CheckCircle, XCircle } from "lucide-react"; // Added icons
// Removed incorrect Next.js import
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"; // Added AlertDialog components

// Define interface for API Key data
interface ApiKey {
  id: string;
  key_prefix: string;
  created_at: string;
  revoked: boolean;
  last_used_at: string | null;
}


// Define Clio connection status type
type ClioConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

const IntegrationsPage = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false); // For generating API key
  const [isFetchingKeys, setIsFetchingKeys] = useState(true); // For fetching API keys
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]); // State for existing API keys
  const [fetchKeysError, setFetchKeysError] = useState<string | null>(null); // State for API key fetch error
  const [newApiKey, setNewApiKey] = useState<string | null>(null); // State for newly generated API key
  const [generateKeyError, setGenerateKeyError] = useState<string | null>(null); // For generating API key error
  const [copied, setCopied] = useState(false); // For API key copy status
  const [revokingKeyId, setRevokingKeyId] = useState<string | null>(null); // State for loading indicator on API key revoke button
  const [isRevokeDialogOpen, setIsRevokeDialogOpen] = useState(false); // State for API key revoke dialog
  const [keyToRevoke, setKeyToRevoke] = useState<ApiKey | null>(null); // State for API key being revoked

  // --- Clio Integration State ---
  const [clioConnectionStatus, setClioConnectionStatus] = useState<ClioConnectionStatus>('disconnected'); // Initial status
  const [isClioConnecting, setIsClioConnecting] = useState(false); // Loading state for connect/disconnect
  const [clioError, setClioError] = useState<string | null>(null); // Error message for Clio actions

  // --- Effects ---

  // Check for Clio status from redirect callback
  useEffect(() => {
    // This is a simplified way assuming client-side routing updates URL
    // If using standard React Router, use useLocation() and URLSearchParams
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get('clio_status');
    const errorMsg = urlParams.get('clio_error');

    if (status === 'success') {
      setClioConnectionStatus('connected');
      setClioError(null);
      toast({ title: "Clio Connected", description: "Successfully connected your Clio account." });
      // Clean the URL query parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (status === 'error') {
      setClioConnectionStatus('error');
      setClioError(errorMsg || "An unknown error occurred during Clio connection.");
      toast({ title: "Clio Connection Failed", description: errorMsg || "Please try again.", variant: "destructive" });
      // Clean the URL query parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    // TODO: Add logic here to fetch the actual connection status from your backend
    // This effect should run once on mount to check the initial status
    // fetch('/api/clio/status').then(...).then(status => setClioConnectionStatus(status));

  }, []); // Run once on mount


  // Fetch existing API keys on component mount
  useEffect(() => {
    const fetchKeys = async () => {
      setIsFetchingKeys(true);
      setFetchKeysError(null);
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session) {
          throw new Error(sessionError?.message || "Authentication session not found.");
        }

        const response = await fetch('/api/get-api-keys', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || `API Error fetching keys: ${response.statusText}`);
        }

        setApiKeys(result.keys || []); // Set the fetched keys

      } catch (err) {
        const message = err instanceof Error ? err.message : "An unexpected error occurred while fetching keys.";
        console.error("Failed to fetch API keys:", message);
        setFetchKeysError(message);
        // Optionally show a toast for fetch error too
        // toast({ title: "Error Fetching Keys", description: message, variant: "destructive" });
      } finally {
        setIsFetchingKeys(false);
      }
    };

    fetchKeys();
  }, []); // Empty dependency array ensures this runs only once on mount


  const handleGenerateKey = async () => {
    setIsLoading(true);
    setNewApiKey(null); // Clear previous key
    setGenerateKeyError(null); // Clear previous error
    setCopied(false); // Reset copied state

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        throw new Error(sessionError?.message || "Authentication session not found.");
      }

      const response = await fetch('/api/generate-api-key', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `API Error: ${response.statusText}`);
      }

      setNewApiKey(result.apiKey);
      toast({
        title: "API Key Generated",
        description: "Your new API key has been generated successfully. Copy it now!",
      });

    } catch (err) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred.";
      console.error("Failed to generate API key:", message);
      setGenerateKeyError(message);
      toast({
        title: "Error Generating API Key",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevokeKey = async (keyId: string) => {
    setRevokingKeyId(keyId); // Show loading on the specific button
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        throw new Error(sessionError?.message || "Authentication session not found.");
      }

      const response = await fetch('/api/revoke-api-key', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keyId }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `API Error revoking key: ${response.statusText}`);
      }

      // Update the local state to reflect the revocation
      setApiKeys(prevKeys =>
        prevKeys.map(key =>
          key.id === keyId ? { ...key, revoked: true } : key
        )
      );

      toast({
        title: "API Key Revoked",
        description: "The API key has been successfully revoked.",
      });

    } catch (err) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred while revoking the key.";
      console.error("Failed to revoke API key:", message);
      toast({
        title: "Error Revoking Key",
        description: message,
        variant: "destructive",
      });
    } finally {
      setRevokingKeyId(null); // Hide loading indicator
      setIsRevokeDialogOpen(false); // Close the dialog
      setKeyToRevoke(null); // Clear the key to revoke
    }
  };


  const handleCopyKey = () => {
    if (newApiKey) {
      navigator.clipboard.writeText(newApiKey).then(() => {
        setCopied(true);
        toast({ title: "API Key Copied!" });
        setTimeout(() => setCopied(false), 2000); // Reset icon after 2 seconds
      }).catch(err => {
        console.error("Failed to copy API key:", err);
        toast({ title: "Copy Failed", description: "Could not copy key to clipboard.", variant: "destructive" });
      });
    }
  };

  // --- Clio Actions ---
  const handleClioConnect = async () => { // Make async to get session
    // Set loading/connecting state immediately
    setIsClioConnecting(true);
    setClioError(null);
    setClioConnectionStatus('connecting');

    try {
        // Get current session to retrieve the access token
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session) {
            console.error("Clio Connect: Error getting session or no active session.", sessionError);
            toast({
                title: "Authentication Error",
                description: "Could not verify your session. Please log in again.",
                variant: "destructive",
            });
            setIsClioConnecting(false);
            setClioConnectionStatus('disconnected'); // Reset status
            // Optionally redirect to login: window.location.href = '/login';
            return;
        }

        // Construct URL with access token as query parameter
        const startUrl = `/api/clio/auth/start?access_token=${encodeURIComponent(session.access_token)}`;

        // Directly navigate the browser to the backend endpoint with the token
        window.location.href = startUrl;

    } catch (err) {
         // Catch errors during session retrieval
         console.error("Clio Connect: Failed to get session before navigation:", err);
         const message = err instanceof Error ? err.message : "An unexpected error occurred.";
         setClioError(message);
         setClioConnectionStatus('error');
         toast({
             title: "Clio Connection Error",
             description: message,
             variant: "destructive",
         });
         setIsClioConnecting(false);
    }
    // No need for finally block as navigation happens on success
    // Error handling for the *initiation itself* happens if the user returns
    // to this page with error parameters in the URL (handled by useEffect).
    // The loading state ('connecting') will persist until the page reloads
    // after the OAuth flow completes or fails.
  };

  const handleClioDisconnect = async () => {
    setIsClioConnecting(true);
    setClioError(null);
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        throw new Error(sessionError?.message || "Authentication session not found.");
      }

      const response = await fetch('/api/clio/disconnect', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `Failed to disconnect Clio: ${response.statusText}`);
      }

      setClioConnectionStatus('disconnected');
      toast({ title: "Clio Disconnected", description: "Your Clio account has been disconnected." });

    } catch (err) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred during disconnection.";
      console.error("Failed to disconnect Clio:", message);
      setClioError(message);
      // Optionally set status back to 'connected' or 'error' depending on desired UX
      setClioConnectionStatus('connected'); // Revert to connected on error, as disconnect failed
      toast({
        title: "Clio Disconnect Failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsClioConnecting(false);
    }
  };


  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Integrations</h1>
      <p className="text-muted-foreground">
        Manage API keys and view documentation for integrating with our quote request system.
      </p>

      <Separator />

      {/* API Key Management Section */}
      <Card>
        <CardHeader>
          <CardTitle>API Key Management</CardTitle>
          <CardDescription>Generate and manage your API keys for accessing the quote request API.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Display Existing Keys Table */}
          <h3 className="text-lg font-medium">Your API Keys</h3>
          {isFetchingKeys ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Loading keys...</span>
            </div>
          ) : fetchKeysError ? (
            <Alert variant="destructive">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Error Fetching Keys</AlertTitle>
              <AlertDescription>{fetchKeysError}</AlertDescription>
            </Alert>
          ) : apiKeys.length === 0 ? (
            <p className="text-sm text-muted-foreground">You haven't generated any API keys yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Prefix</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Last Used</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apiKeys.map((key) => (
                  <TableRow key={key.id}>
                    <TableCell className="font-mono">{key.key_prefix}...</TableCell>
                    <TableCell>{new Date(key.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>{key.last_used_at ? new Date(key.last_used_at).toLocaleString() : 'Never'}</TableCell>
                    <TableCell>
                      <Badge variant={key.revoked ? "destructive" : "secondary"}>
                        {key.revoked ? "Revoked" : "Active"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <AlertDialog open={isRevokeDialogOpen && keyToRevoke?.id === key.id} onOpenChange={(open) => { if (!open) { setIsRevokeDialogOpen(false); setKeyToRevoke(null); } }}>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={key.revoked || revokingKeyId === key.id}
                            title="Revoke Key"
                            onClick={() => { setKeyToRevoke(key); setIsRevokeDialogOpen(true); }} // Set key and open dialog
                          >
                            {revokingKeyId === key.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                          </Button>
                        </AlertDialogTrigger>
                        {/* Content moved outside the map loop, rendered conditionally */}
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          <Separator className="my-4" /> {/* Add separator */}

          {/* Display newly generated key */}
          {newApiKey && (
             <Alert> {/* Removed variant="success" */}
              <Terminal className="h-4 w-4" />
              <AlertTitle>New API Key Generated - Copy it now!</AlertTitle>
              <AlertDescription className="flex items-center justify-between break-all">
                <code>{newApiKey}</code>
                <Button variant="ghost" size="icon" onClick={handleCopyKey} className="ml-2">
                  {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </AlertDescription>
              <p className="text-xs text-destructive mt-2">
                This is the only time you will see this key. Store it securely.
              </p>
            </Alert>
          )}

           {/* Display API Key Generation Error */}
          {generateKeyError && (
            <Alert variant="destructive">
              <Terminal className="h-4 w-4" />
              <AlertTitle>API Key Generation Error</AlertTitle>
              <AlertDescription>{generateKeyError}</AlertDescription>
            </Alert>
          )}

          <Button onClick={handleGenerateKey} disabled={isLoading}>
            {isLoading ? "Generating..." : "Generate New API Key"}
          </Button>
          {/* Placeholder for revoke/regenerate actions */}
        </CardContent>
      </Card>

      {/* API Key Revoke Confirmation Dialog */}
      {keyToRevoke && (
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently revoke the API key
              starting with <code className="font-mono bg-muted px-1 rounded">{keyToRevoke.key_prefix}</code>.
              Any applications using this key will no longer be able to access the API.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => { setIsRevokeDialogOpen(false); setKeyToRevoke(null); }}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleRevokeKey(keyToRevoke.id)}
              disabled={revokingKeyId === keyToRevoke.id}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {revokingKeyId === keyToRevoke.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Revoke Key
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      )}

      <Separator />

      {/* External Integrations Section */}
      <Card>
        <CardHeader>
          <CardTitle>External Integrations</CardTitle>
          <CardDescription>Connect your account to third-party services like Clio.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Clio Integration */}
          <div className="flex items-center justify-between p-4 border rounded-md">
            <div className="flex items-center space-x-3">
              {/* Placeholder for Clio Logo */}
              <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center text-white font-bold">C</div>
              <div>
                <h4 className="font-semibold">Clio</h4>
                <p className="text-sm text-muted-foreground">Manage legal practice data.</p>
              </div>
            </div>
            <div>
              {clioConnectionStatus === 'disconnected' && (
                <Button
                  onClick={handleClioConnect}
                  disabled={isClioConnecting}
                >
                  {isClioConnecting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ExternalLink className="mr-2 h-4 w-4" />}
                  Connect
                </Button>
              )}
              {clioConnectionStatus === 'connecting' && (
                 <Button disabled>
                   <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                   Connecting...
                 </Button>
              )}
              {clioConnectionStatus === 'connected' && (
                <div className="flex items-center space-x-2">
                   <Badge variant="secondary" className="bg-green-100 text-green-800">
                     <CheckCircle className="mr-1 h-4 w-4" /> Connected
                   </Badge>
                   <Button
                     variant="outline"
                     size="sm"
                     onClick={handleClioDisconnect}
                     disabled={isClioConnecting}
                   >
                     {isClioConnecting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />} {/* Changed icon */}
                     Disconnect
                   </Button>
                </div>
              )}
               {clioConnectionStatus === 'error' && (
                 <div className="flex items-center space-x-2">
                    <Badge variant="destructive">
                      <XCircle className="mr-1 h-4 w-4" /> Error
                    </Badge>
                   <Button
                     onClick={handleClioConnect} // Retry uses the same connect logic
                     disabled={isClioConnecting}
                   >
                     {isClioConnecting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ExternalLink className="mr-2 h-4 w-4" />}
                     Retry Connect
                   </Button>
                 </div>
               )}
            </div>
          </div>
           {/* Display Clio Error */}
           {clioError && (
            <Alert variant="destructive" className="mt-2">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Clio Connection Error</AlertTitle>
              <AlertDescription>{clioError}</AlertDescription>
            </Alert>
          )}
          {/* Add other integrations here */}
        </CardContent>
      </Card>


      {/* API Documentation Section */}
      <Card>
        <CardHeader>
          <CardTitle>Quote Request API Documentation</CardTitle>
          <CardDescription>Details for submitting quote requests via the API.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <h3 className="font-semibold">API Endpoint</h3>
          <pre className="p-4 border rounded-md bg-muted overflow-x-auto">
            {/* TODO: Consider making this dynamic based on environment or config */}
            <code>POST https://api.openeval.com/v1/quote-requests</code> {/* Updated Domain */}
          </pre>

          <h3 className="font-semibold">Authentication</h3>
          <p>Include your API key in the Authorization header:</p>
          <pre className="p-4 border rounded-md bg-muted overflow-x-auto">
            <code>Authorization: Bearer YOUR_API_KEY</code>
          </pre>

          <h3 className="font-semibold">Request Payload Example (JSON)</h3>
          <pre className="p-4 border rounded-md bg-muted overflow-x-auto">
            <code>
{`{
  "applicant_name": "Jane Doe",
  "country_of_education": "India",
  "degree_received": "Bachelor of Engineering",
  "year_of_graduation": 2020,
  "notes": "Optional notes about the applicant or request."
}`}
            </code>
          </pre>

           <h3 className="font-semibold">Response Payload Example (Callback - JSON)</h3>
           <p className="text-sm text-muted-foreground">Your callback URL will receive a POST request with the following payload upon completion or rejection:</p>
          <pre className="p-4 border rounded-md bg-muted overflow-x-auto">
            <code>
{`// Example: Success
{
  "quote_request_id": "abc123xyz",
  "applicant_name": "Jane Doe",
  "status": "completed",
  "us_equivalent": "Bachelor’s Degree in Engineering",
  "unable_to_provide": false
}

// Example: Rejected
{
  "quote_request_id": "def456uvw",
  "applicant_name": "John Smith",
  "status": "rejected",
  "unable_to_provide": true,
  "rejection_reason": "Documentation provided is insufficient for evaluation."
}`}
            </code>
          </pre>
          {/* Placeholder for cURL example */}
        </CardContent>
      </Card>

      {/* Activity Log Section */}
      <Card>
        <CardHeader>
          <CardTitle>API Activity Log</CardTitle>
          <CardDescription>Recent activity related to your API keys.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Placeholder for activity log table/list */}
          <div className="p-4 border rounded-md bg-muted text-muted-foreground">
            API activity log will be displayed here. (Functionality to be implemented)
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IntegrationsPage;
