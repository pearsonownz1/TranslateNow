import React, { useState, useEffect, useCallback } from "react"; // Import useCallback
import { useParams, Link, useNavigate } from "react-router-dom"; // Import useNavigate
import { supabase } from "@/lib/supabase";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // Import Input
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"; // Import Dialog components
import {
  ArrowLeft,
  Terminal,
  Download,
  Upload,
  Loader2,
  LinkIcon,
} from "lucide-react"; // Icons, added LinkIcon

// Re-use or define the type for the quote data
type ClioQuote = {
  id: number;
  created_at: string;
  user_id: string;
  status: string;
  clio_subject_id: string | null;
  clio_subject_type: string | null;
  client_name: string | null;
  client_email: string | null;
  subject_description: string | null;
  clio_matter_id: number | null; // <<< Added this field
  // Add other fields if they exist in your table
};

const AdminClioQuoteDetailsPage = () => {
  const { quoteId } = useParams<{ quoteId: string }>();
  const [quote, setQuote] = useState<ClioQuote | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<boolean>(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showAssignMatterModal, setShowAssignMatterModal] =
    useState<boolean>(false);
  const [matterIdInput, setMatterIdInput] = useState<string>("");
  const [assigningMatter, setAssigningMatter] = useState<boolean>(false);
  const [assignMatterError, setAssignMatterError] = useState<string | null>(
    null
  );
  const navigate = useNavigate(); // For potential refresh/navigation

  useEffect(() => {
    const fetchQuoteDetails = async () => {
      if (!quoteId) {
        setError("Quote ID is missing.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const { data, error: fetchError } = await supabase
          .from("clio_quotes")
          .select("*") // Select all columns for details page
          .eq("id", quoteId)
          .single(); // Fetch a single record

        if (fetchError) {
          if (fetchError.code === "PGRST116") {
            // Code for "No rows found"
            throw new Error(`Clio Quote with ID ${quoteId} not found.`);
          }
          throw fetchError;
        }
        console.log("clio data mel detail page", data);
        setQuote(data);
      } catch (err: any) {
        console.error("Error fetching Clio quote details:", err);
        setError(
          err.message ||
            "An unknown error occurred while fetching quote details."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchQuoteDetails();
  }, [quoteId]); // Re-fetch if quoteId changes

  // Function to handle downloading the original document
  const handleDownloadOriginal = async () => {
    if (!quote || !quote.id) return;

    setDownloading(true);
    setDownloadError(null);
    console.log(`Requesting download for Clio Quote ID: ${quote.id}`);

    try {
      // Construct the URL to your backend endpoint
      const downloadUrl = `/api/admin/clio/download-document?clioQuoteId=${quote.id}`;

      // Make the request
      const response = await fetch(downloadUrl); // Assumes admin auth is handled via cookies/session implicitly

      if (!response.ok) {
        let errorMsg = `Download failed with status: ${response.status}`;
        try {
          const errorJson = await response.json();
          errorMsg = errorJson.error || errorMsg; // Use specific error from backend if available
        } catch (_) {
          /* Ignore if response is not JSON */
        }
        throw new Error(errorMsg);
      }

      // Get filename from Content-Disposition header if available
      const disposition = response.headers.get("content-disposition");
      let filename =
        quote.subject_description ||
        `clio-document-${quote.clio_subject_id || quote.id}`; // Default filename
      if (disposition && disposition.indexOf("attachment") !== -1) {
        const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
        const matches = filenameRegex.exec(disposition);
        if (matches != null && matches[1]) {
          filename = matches[1].replace(/['"]/g, "");
        }
      }

      // Get the file blob
      const blob = await response.blob();

      // Create a temporary link to trigger the download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename); // Set the filename
      document.body.appendChild(link);
      link.click();

      // Clean up the temporary link and URL object
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error("Error downloading original Clio document:", err);
      setDownloadError(
        err.message || "An unknown error occurred during download."
      );
    } finally {
      setDownloading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
      setUploadError(null); // Clear previous upload errors when a new file is selected
    } else {
      setSelectedFile(null);
    }
  };

  const handleUploadEvaluation = async () => {
    if (!selectedFile || !quote) {
      setUploadError("Please select a file to upload.");
      return;
    }

    setUploading(true);
    setUploadError(null);
    console.log(`Uploading evaluation for Clio Quote ID: ${quote.id}`);

    const formData = new FormData();
    formData.append("evaluationFile", selectedFile);
    formData.append("clioQuoteId", quote.id.toString());

    try {
      const response = await fetch("/api/admin/clio/upload-evaluation", {
        method: "POST",
        // Content-Type is set automatically by browser for FormData
        body: formData,
        // Add authorization headers if your admin API requires them
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || `Upload failed with status: ${response.status}`
        );
      }

      console.log("Upload successful:", result);
      // Optionally refresh quote data or show success message
      alert("Evaluation uploaded successfully!"); // Simple success alert
      // You might want to update the quote status locally or re-fetch
      setQuote((prev) => (prev ? { ...prev, status: "completed" } : null));
      setSelectedFile(null); // Clear file input visually (though input element state needs reset too)
      // Reset the file input element itself for better UX
      const fileInput = document.getElementById(
        "evaluation-file-input"
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    } catch (err: any) {
      console.error("Error uploading evaluation:", err);
      setUploadError(err.message || "An unknown error occurred during upload.");
    } finally {
      setUploading(false);
    }
  };

  // Wrap fetchQuoteDetails in useCallback to avoid re-creating it on every render
  const fetchQuoteDetails = useCallback(async () => {
    if (!quoteId) {
      setError("Quote ID is missing.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from("clio_quotes")
        .select("*") // Select all columns for details page
        .eq("id", quoteId)
        .single(); // Fetch a single record

      if (fetchError) {
        if (fetchError.code === "PGRST116") {
          // Code for "No rows found"
          throw new Error(`Clio Quote with ID ${quoteId} not found.`);
        }
        throw fetchError;
      }

      setQuote(data);
    } catch (err: any) {
      console.error("Error fetching Clio quote details:", err);
      setError(
        err.message || "An unknown error occurred while fetching quote details."
      );
    } finally {
      setLoading(false);
    }
  }, [quoteId]); // Dependency array includes quoteId

  useEffect(() => {
    fetchQuoteDetails();
  }, [fetchQuoteDetails]); // Use the memoized function

  const handleSaveMatterId = async () => {
    if (!matterIdInput || !quote) {
      setAssignMatterError("Please enter a valid Matter ID.");
      return;
    }
    // Basic validation: check if it's a number
    if (isNaN(Number(matterIdInput))) {
      setAssignMatterError("Matter ID must be a number.");
      return;
    }

    setAssigningMatter(true);
    setAssigningMatter(true);
    setAssignMatterError(null);

    try {
      const response = await fetch(
        `/api/admin/clio-quotes/${quote.id}/assign-matter`,
        {
          method: "POST", // Ensure method is explicitly POST
          headers: { "Content-Type": "application/json" },
          // Send as number after validation
          body: JSON.stringify({ matter_id: Number(matterIdInput) }),
          // Add authorization headers if needed
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            `Failed to assign Matter ID (Status: ${response.status})`
        );
      }

      console.log("Matter ID assigned successfully:", result);
      setShowAssignMatterModal(false); // Close modal on success
      setMatterIdInput(""); // Clear input
      // Re-fetch quote details to reflect the change
      await fetchQuoteDetails();
      // Optionally show a success toast/message here
      alert("Matter ID assigned successfully!");
    } catch (err: any) {
      console.error("Error assigning Matter ID:", err);
      setAssignMatterError(err.message || "An unknown error occurred.");
    } finally {
      setAssigningMatter(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-10">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Button variant="outline" size="sm" asChild className="mb-4">
          <Link to="/admin/clio-quotes">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Clio Quotes
          </Link>
        </Button>
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error Loading Quote</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="p-6">
        <Button variant="outline" size="sm" asChild className="mb-4">
          <Link to="/admin/clio-quotes">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Clio Quotes
          </Link>
        </Button>
        <p>Quote not found.</p>
      </div>
    );
  }

  // Format date for display
  const formattedDate = quote.created_at
    ? new Date(quote.created_at).toLocaleString()
    : "N/A";

  return (
    <div className="p-6 space-y-6">
      <Button variant="outline" size="sm" asChild className="mb-4">
        <Link to="/admin/clio-quotes">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Clio Quotes
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Clio Quote Details - ID: {quote.id}</CardTitle>
          <CardDescription>Submitted on {formattedDate}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="font-semibold">Status:</span> {quote.status}
            </div>
            <div>
              <span className="font-semibold">User ID:</span> {quote.user_id}
            </div>
            <div>
              <span className="font-semibold">Clio Subject Type:</span>{" "}
              {quote.clio_subject_type || "N/A"}
            </div>
            <div>
              <span className="font-semibold">Clio Subject ID:</span>{" "}
              {quote.clio_subject_id || "N/A"}
            </div>
            <div>
              <span className="font-semibold">Client Name:</span>{" "}
              {quote.client_name || "N/A"}
            </div>
            <div>
              <span className="font-semibold">Client Email:</span>{" "}
              {quote.client_email || "N/A"}
            </div>
            <div className="md:col-span-2">
              <span className="font-semibold">Subject Description:</span>{" "}
              {quote.subject_description || "N/A"}
            </div>
          </div>

          {/* Section for Phase 2: Download Original */}
          {quote.clio_subject_type === "document" && quote.clio_subject_id && (
            <div className="pt-4 border-t">
              <h3 className="text-lg font-semibold mb-2">Original Document</h3>
              <Button onClick={handleDownloadOriginal} disabled={downloading}>
                {downloading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                {downloading ? "Downloading..." : "Download from Clio"}
              </Button>
              {downloadError && (
                <Alert variant="destructive" className="mt-2">
                  <Terminal className="h-4 w-4" />
                  <AlertTitle>Download Error</AlertTitle>
                  <AlertDescription>{downloadError}</AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Section for Phase 3: Upload Evaluation */}
          <div className="pt-4 border-t">
            <h3 className="text-lg font-semibold mb-2">Upload Evaluation</h3>

            {/* Warning if no Matter ID */}
            {quote.clio_matter_id === null && (
              <Alert
                variant="default"
                className="mb-4 border-yellow-500 text-yellow-700">
                {" "}
                {/* Use default variant, maybe add custom border/text color for emphasis */}
                <Terminal className="h-4 w-4" />
                <AlertTitle>Cannot Upload to Clio</AlertTitle>
                <AlertDescription>
                  This quote originated from a Clio item (Document or Folder)
                  that is not linked to a Matter. Uploading the evaluation back
                  to Clio requires a Matter association. Please ensure the
                  original item is correctly placed within a Matter in Clio if
                  upload is needed.
                </AlertDescription>
              </Alert>
            )}

            <div className="flex items-center space-x-2">
              {/* Consider using Shadcn UI Input component if available and styled */}
              <input
                id="evaluation-file-input" // Add ID for resetting
                type="file"
                onChange={handleFileChange}
                className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                // Disable if uploading, completed, OR if no matter ID exists
                disabled={
                  uploading ||
                  quote.status === "completed" ||
                  !quote.clio_matter_id
                }
              />
              <Button
                onClick={handleUploadEvaluation}
                // Disable if no file, uploading, completed, OR if no matter ID exists
                disabled={
                  !selectedFile ||
                  uploading ||
                  quote.status === "completed" ||
                  !quote.clio_matter_id
                }
                title={
                  !quote.clio_matter_id
                    ? "Upload disabled: Quote not linked to a Clio Matter."
                    : ""
                } // Add tooltip for clarity
              >
                {uploading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="mr-2 h-4 w-4" />
                )}
                {uploading ? "Uploading..." : "Upload & Send to Clio"}
              </Button>
            </div>
            {uploadError && (
              <Alert variant="destructive" className="mt-2">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Upload Error</AlertTitle>
                <AlertDescription>{uploadError}</AlertDescription>
              </Alert>
            )}

            {/* Assign Matter ID Button and Modal */}
            {quote.clio_matter_id === null && (
              <div className="mt-4">
                <Dialog
                  open={showAssignMatterModal}
                  onOpenChange={setShowAssignMatterModal}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <LinkIcon className="mr-2 h-4 w-4" />
                      Assign Matter ID
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Assign Clio Matter ID</DialogTitle>
                      <DialogDescription>
                        Manually enter the Clio Matter ID associated with this
                        quote request. Find the correct Matter ID within your
                        Clio account.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <Input
                        id="matter-id"
                        type="number" // Use number type for better input control
                        placeholder="Enter Clio Matter ID (Numbers only)"
                        value={matterIdInput}
                        onChange={(e) => setMatterIdInput(e.target.value)}
                        disabled={assigningMatter}
                      />
                      {assignMatterError && (
                        <p className="text-sm text-red-600">
                          {assignMatterError}
                        </p>
                      )}
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline" disabled={assigningMatter}>
                          Cancel
                        </Button>
                      </DialogClose>
                      <Button
                        type="button"
                        onClick={handleSaveMatterId}
                        disabled={!matterIdInput || assigningMatter}>
                        {assigningMatter ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        Save Matter ID
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminClioQuoteDetailsPage;
