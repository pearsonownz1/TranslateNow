import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { supabase } from "@/lib/supabase"; // Import supabase client
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Loader2 } from "lucide-react";
// Removed: Separator, Upload, FileText, RadioGroup, RadioGroupItem, uuidv4
import { useToast } from "../ui/use-toast"; // Import useToast
import countries from "@/lib/countries.json"; // Import the full country list


const QuoteRequestPage = () => {
  const navigate = useNavigate(); // Initialize navigate
  const { toast } = useToast(); // Initialize toast
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>(""); // Add state for user name
  // New state for the form fields
  const [country, setCountry] = useState<string>("");
  const [graduationYear, setGraduationYear] = useState<string>("");
  const [degreeReceived, setDegreeReceived] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  // Removed state: translationType, sourceLanguage, targetLanguage, files

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Error fetching session:", error);
        toast({ title: "Error", description: "Could not fetch user session.", variant: "destructive" });
      } else if (session?.user) {
        // *** Log the ID found on initial fetch ***
        const user = session.user;
        const email = user.email || "";
        // *** Log the ID found on initial fetch ***
        console.log(`[QuoteRequestPage useEffect] Initial session fetch found user ID: ${user.id}, Email: ${email}`);
        setUserId(user.id);
        setUserEmail(email);

        // Fetch and set user name
        const firstName = user.user_metadata?.first_name;
        const lastName = user.user_metadata?.last_name;
        const name = (firstName && lastName)
                     ? `${firstName} ${lastName}`
                     : user.email?.split('@')[0] // Fallback to part of email
                     || "User"; // Final fallback
        setUserName(name);
        console.log(`[QuoteRequestPage useEffect] User name set to: ${name}`);

      } else {
        console.warn("No active session found in QuoteRequestPage.");
        setUserName(""); // Clear name if no session
      }
    };

    // Get initial session
    fetchUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        // *** Log the ID found on auth state change ***
        const user = session.user;
        const email = user.email || "";
        // *** Log the ID found on auth state change ***
        console.log(`[QuoteRequestPage onAuthStateChange] Auth change event '${event}' found user ID: ${user.id}, Email: ${email}`);
        setUserId(user.id);
        setUserEmail(email);

        // Update user name on auth change
        const firstName = user.user_metadata?.first_name;
        const lastName = user.user_metadata?.last_name;
        const name = (firstName && lastName)
                     ? `${firstName} ${lastName}`
                     : user.email?.split('@')[0]
                     || "User";
        setUserName(name);

      } else {
        // *** Log when session becomes null ***
        console.log(`[QuoteRequestPage onAuthStateChange] Auth change event '${event}' resulted in null session.`);
        setUserId(null);
        setUserEmail(null);
        setUserName(""); // Clear name on logout
      }
    });

    return () => subscription.unsubscribe(); // Unsubscribe on unmount
  }, [toast]);

  // Removed: handleFileChange, removeFile, uploadFile

  const handleQuoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      toast({ title: "Error", description: "Cannot submit quote without user identification.", variant: "destructive" });
      return;
    }
    // Basic validation for new fields
    if (!country || !graduationYear || !degreeReceived) {
       toast({ title: "Missing Information", description: "Please fill in Country, Year of Graduation, and Degree Received.", variant: "destructive" });
       return;
    }

    setIsLoading(true);

    // Removed file upload logic

    console.log("Submitting quote with userId:", userId, "and userEmail:", userEmail); // Add logging

    // Prepare data for Supabase insertion with NEW fields
    // **NOTE:** Assumes 'api_quote_requests' table has columns like 'applicant_name', 'country_of_education', etc.
    const quoteData = {
      user_id: userId,
      applicant_name: userName, // Add user's name here
      country_of_education: country, // New field
      year_of_graduation: parseInt(graduationYear, 10), // New field (assuming integer)
      degree_received: degreeReceived, // New field
      notes: notes,
      status: 'pending_review', // Initial status
      // Removed: source_language, target_language, document_paths, service_options
      // Add other fields based on your 'quotes' table schema if needed
    };

    console.log("Submitting quote data:", quoteData);
    console.log(`[Quote Submit] Attempting to insert quote for user_id: ${userId}`);

    // Insert into Supabase 'api_quote_requests' table
    // **Ensure 'api_quote_requests' table schema matches quoteData**
    const { data, error } = await supabase
      .from('api_quote_requests') // Changed target table to api_quote_requests
      .insert([quoteData])
      .select();

    setIsLoading(false);

    if (error) {
      console.error("Error saving quote request:", error);
      toast({ title: "Submission Error", description: `Failed to submit quote request: ${error.message}`, variant: "destructive" });
    } else {
       console.log("Quote request saved successfully:", data);
       const savedQuote = data[0];

       // Trigger notification email (fire and forget) - **Update API endpoint and payload**
       fetch('/api/send-quote-notification', { // **Consider renaming API endpoint, e.g., /api/send-credential-quote-notification**
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
           quoteId: savedQuote.id,
           userEmail: userEmail,
           country: quoteData.country_of_education, // Send new data
           graduationYear: quoteData.year_of_graduation, // Send new data
           degreeReceived: quoteData.degree_received, // Send new data
           notes: quoteData.notes,
           // Removed: sourceLanguage, targetLanguage, documentPaths, translationType
         }),
       })
       .then(async (res) => {
           if (!res.ok) {
               const errorData = await res.json();
               console.error("Failed to send quote notification email:", errorData);
           } else {
               console.log("Quote notification email API call successful.");
           }
       })
       .catch(emailError => {
            console.error("Error calling quote notification email API:", emailError);
            // Don't block navigation even if email fails, but log it.
        });

       // Navigate back to My Quotes page with a success state flag
       navigate('/dashboard/my-quotes', { state: { quoteSubmitted: true } });

       // Resetting fields might not be strictly necessary if navigating away,
       // but can be good practice if the user might navigate back quickly.
       // setCountry("");
       // setGraduationYear("");
       // setDegreeReceived("");
       // setNotes("");
    }
  };


  return (
    <div className="p-4 md:p-6 lg:p-8">
       <h1 className="text-2xl font-semibold mb-6">Request Credential Evaluation Quote</h1> {/* Updated Title */}
       <form onSubmit={handleQuoteSubmit}>

         {/* Removed Translation Type Card */}
         {/* Removed Language Pair Card */}

         {/* New Card for Credential Details */}
         <Card className="shadow-md mb-6">
           <CardHeader>
             <CardTitle className="text-xl">
               Education Details
             </CardTitle>
           </CardHeader>
           <CardContent className="space-y-4">
              <div>
                 <Label htmlFor="country-select" className="mb-2 block">
                   Country of Education
                 </Label>
                 <Select
                   value={country}
                   onValueChange={setCountry}
                   required
                 >
                   <SelectTrigger id="country-select">
                     <SelectValue placeholder="Select country" />
                   </SelectTrigger>
                   <SelectContent>
                     {countries.map((c) => (
                       <SelectItem
                         key={c.code}
                         value={c.name} // Store full name or code based on backend needs
                       >
                         {c.name}
                       </SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
               </div>
               <div>
                 <Label htmlFor="graduation-year" className="mb-2 block">
                   Year of Graduation
                 </Label>
                 <Input
                   id="graduation-year"
                   type="number" // Use number type for year
                   placeholder="e.g., 2020"
                   value={graduationYear}
                   onChange={(e) => setGraduationYear(e.target.value)}
                   required
                   min="1900" // Basic validation
                   max={new Date().getFullYear() + 1} // Allow current/next year
                 />
               </div>
                <div>
                 <Label htmlFor="degree-received" className="mb-2 block">
                   Degree Received
                 </Label>
                 <Input
                   id="degree-received"
                   type="text"
                   placeholder="e.g., Bachelor of Science in Computer Science"
                   value={degreeReceived}
                   onChange={(e) => setDegreeReceived(e.target.value)}
                   required
                 />
               </div>
           </CardContent>
         </Card>

         {/* Removed Upload Documents Card */}

         <Card className="shadow-md mb-6">
            <CardHeader>
                <CardTitle className="text-xl">Notes</CardTitle> {/* Kept Notes Card */}
            </CardHeader>
            <CardContent>
                <Textarea
                    placeholder="Include any specific instructions or details relevant to your evaluation request." // Updated placeholder
                    className="min-h-[100px]"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                />
            </CardContent>
         </Card>

         {/* Removed Optional Services Placeholder */}

         <div className="flex justify-end">
           {/* Updated disabled condition */}
           <Button type="submit" size="lg" disabled={isLoading || !userId || !country || !graduationYear || !degreeReceived}>
             {isLoading ? (
               <>
                 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                 Submitting...
               </>
             ) : (
               "Submit Quote Request"
             )}
           </Button>
         </div>
       </form>
     </div>
  );
};

export default QuoteRequestPage;
