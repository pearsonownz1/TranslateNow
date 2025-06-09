import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, Download } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

// Define interfaces for different quote types
interface WebQuote {
  id: string;
  created_at: string;
  full_name: string;
  email: string;
  phone_number?: string;
  document_type: string;
  source_language: string;
  target_language: string;
  turnaround_time: string;
  additional_notes?: string;
  status: 'pending' | 'reviewed' | 'quoted' | 'rejected' | 'converted_to_order';
  price?: number;
  file_path?: string;
  file_name?: string;
}

interface ApiQuote {
  id: string;
  created_at: string;
  api_key_id: string;
  user_id: string;
  applicant_name: string;
  country_of_education: string;
  college_attended: string;
  degree_received: string;
  year_of_graduation: number;
  status: 'pending' | 'reviewed' | 'completed' | 'failed' | 'rejected';
  us_equivalent?: string;
  unable_to_provide?: boolean;
  rejection_reason?: string;
  notes?: string;
}

interface ClioQuote {
  id: string;
  created_at: string;
  user_id: string;
  clio_matter_id?: string;
  clio_contact_id?: string;
  clio_document_id?: string;
  clio_subject_type?: string;
  subject_description?: string;
  status: 'pending' | 'reviewed' | 'completed' | 'failed' | 'rejected';
}

type QuoteDetails = WebQuote | ApiQuote | ClioQuote;

const QuoteDetailsPage = () => {
  const { source, quoteId } = useParams<{ source: string; quoteId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [quoteDetails, setQuoteDetails] = useState<QuoteDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  // Function to generate signed URL for download (for web quotes with files)
  const generateDownloadUrl = async (filePath: string) => {
    setDownloadError(null);
    const { data, error } = await supabase.storage
      .from('quote-documents')
      .createSignedUrl(filePath, 60 * 60); // URL valid for 1 hour

    if (error) {
      console.error('Error generating signed URL:', error);
      setDownloadError('Could not generate download link.');
      setDownloadUrl(null);
    } else {
      setDownloadUrl(data.signedUrl);
    }
  };

  useEffect(() => {
    const fetchQuoteDetails = async () => {
      if (!quoteId || !source) {
        setError("Quote ID or source is missing.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      setDownloadUrl(null);
      setDownloadError(null);

      let tableName = '';
      
      // Determine which table to query based on source
      switch (source) {
        case 'web':
          tableName = 'quotes';
          break;
        case 'api':
          tableName = 'api_quote_requests';
          break;
        case 'clio':
          tableName = 'clio_quotes';
          break;
        default:
          setError("Invalid quote source.");
          setLoading(false);
          return;
      }

      const { data, error: fetchError } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', quoteId)
        .maybeSingle();

      if (fetchError) {
        console.error(`Error fetching ${source} quote details:`, fetchError);
        setError(`Failed to fetch quote details: ${fetchError.message}`);
        setQuoteDetails(null);
      } else if (data) {
        setQuoteDetails(data);

        // Generate download URL for web quotes with file_path
        if (source === 'web' && data.file_path) {
          generateDownloadUrl(data.file_path);
        }
      } else {
        setError(`Quote not found in ${tableName}.`);
        setQuoteDetails(null);
      }
      
      setLoading(false);
    };

    fetchQuoteDetails();
  }, [quoteId, source]);

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'PPpp');
    } catch (e) {
      return "Invalid Date";
    }
  };

  const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status?.toLowerCase()) {
      case 'pending':
      case 'reviewed':
      case 'completed':
        return 'secondary';
      case 'quoted':
        return 'default';
      case 'converted_to_order':
        return 'outline';
      case 'rejected':
      case 'failed':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const formatStatusText = (status: string): string => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'Pending Review';
      case 'reviewed': return 'Under Review';
      case 'quoted': return 'Quote Ready';
      case 'rejected': return 'Rejected';
      case 'converted_to_order': return 'Order Placed';
      case 'completed': return 'Completed';
      case 'failed': return 'Failed';
      default: return status?.toUpperCase() || 'UNKNOWN';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2">Loading quote details...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
        <strong className="font-bold">Error:</strong>
        <span className="block sm:inline"> {error}</span>
        <Button variant="outline" size="sm" onClick={() => navigate(-1)} className="ml-4">
          Go Back
        </Button>
      </div>
    );
  }

  if (!quoteDetails) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">Quote not found.</p>
        <Button variant="outline" size="sm" onClick={() => navigate(-1)} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
        </Button>
      </div>
    );
  }

  // Render different content based on quote source
  const renderQuoteContent = () => {
    switch (source) {
      case 'web':
        const webQuote = quoteDetails as WebQuote;
        return (
          <>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Quote Request Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Request ID</h3>
                    <p>{webQuote.id}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Date Submitted</h3>
                    <p>{formatDate(webQuote.created_at)}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                    <Badge variant={getStatusBadgeVariant(webQuote.status)}>
                      {formatStatusText(webQuote.status)}
                    </Badge>
                  </div>
                  {webQuote.price && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Quoted Price</h3>
                      <p className="font-bold text-green-600">${webQuote.price.toFixed(2)}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Translation Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Document Type</h3>
                    <p>{webQuote.document_type}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Languages</h3>
                    <p>{webQuote.source_language} to {webQuote.target_language}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Turnaround Time</h3>
                    <p>{webQuote.turnaround_time}</p>
                  </div>
                  {webQuote.file_path && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Uploaded File</h3>
                      {downloadUrl ? (
                        <Button variant="outline" size="sm" asChild>
                          <a href={downloadUrl} download={webQuote.file_name || 'download'}>
                            <Download className="mr-2 h-4 w-4" />
                            Download {webQuote.file_name || 'File'}
                          </a>
                        </Button>
                      ) : downloadError ? (
                        <span className="text-sm text-red-600">{downloadError}</span>
                      ) : (
                        <span className="text-sm text-muted-foreground">Generating link...</span>
                      )}
                    </div>
                  )}
                </div>
                {webQuote.additional_notes && (
                  <div className="pt-4 border-t mt-4">
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Additional Notes</h3>
                    <p className="text-sm bg-gray-50 p-3 rounded border">{webQuote.additional_notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Full Name</h3>
                    <p>{webQuote.full_name}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                    <p>{webQuote.email}</p>
                  </div>
                  {webQuote.phone_number && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Phone Number</h3>
                      <p>{webQuote.phone_number}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        );

      case 'api':
        const apiQuote = quoteDetails as ApiQuote;
        return (
          <>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>API Quote Request Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Request ID</h3>
                    <p>{apiQuote.id}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Date Submitted</h3>
                    <p>{formatDate(apiQuote.created_at)}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                    <Badge variant={getStatusBadgeVariant(apiQuote.status)}>
                      {formatStatusText(apiQuote.status)}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Education Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Applicant Name</h3>
                    <p>{apiQuote.applicant_name}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Country of Education</h3>
                    <p>{apiQuote.country_of_education}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">College Attended</h3>
                    <p>{apiQuote.college_attended}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Degree Received</h3>
                    <p>{apiQuote.degree_received}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Year of Graduation</h3>
                    <p>{apiQuote.year_of_graduation}</p>
                  </div>
                </div>
                {apiQuote.notes && (
                  <div className="pt-4 border-t mt-4">
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Additional Notes</h3>
                    <p className="text-sm bg-gray-50 p-3 rounded border">{apiQuote.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {(apiQuote.status === 'completed' || apiQuote.status === 'rejected') && (
              <Card>
                <CardHeader>
                  <CardTitle>Evaluation Result</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {apiQuote.status === 'completed' && apiQuote.us_equivalent && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">US Equivalent</h3>
                      <p className="text-green-700 font-medium">{apiQuote.us_equivalent}</p>
                    </div>
                  )}
                  {apiQuote.status === 'rejected' && apiQuote.unable_to_provide && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">Rejection Reason</h3>
                      <p className="text-red-600">{apiQuote.rejection_reason || 'No reason provided'}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </>
        );

      case 'clio':
        const clioQuote = quoteDetails as ClioQuote;
        return (
          <>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Clio Quote Request Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Request ID</h3>
                    <p>{clioQuote.id}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Date Submitted</h3>
                    <p>{formatDate(clioQuote.created_at)}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                    <Badge variant={getStatusBadgeVariant(clioQuote.status)}>
                      {formatStatusText(clioQuote.status)}
                    </Badge>
                  </div>
                  {clioQuote.clio_matter_id && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Clio Matter ID</h3>
                      <p>{clioQuote.clio_matter_id}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Document Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {clioQuote.clio_subject_type && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Document Type</h3>
                    <p>{clioQuote.clio_subject_type}</p>
                  </div>
                )}
                {clioQuote.subject_description && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                    <p>{clioQuote.subject_description}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        );

      default:
        return (
          <Card>
            <CardContent>
              <p className="text-center py-4">Unknown quote source type.</p>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6">
        <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Quotes
        </Button>
      </div>

      <h1 className="text-2xl font-semibold mb-6">Quote Request Details</h1>

      {renderQuoteContent()}
    </div>
  );
};

export default QuoteDetailsPage;
