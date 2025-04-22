// api/send-order-confirmation.ts
import { Resend } from 'resend';

// IMPORTANT: Store your Resend API key in Vercel Environment Variables
const resend = new Resend(process.env.RESEND_API_KEY);

// Define expected request body structure
interface RequestBody {
    orderNumber: string;
    customerEmail: string;
    orderDetails: { // Mirror structure passed from frontend state
        contactInfo?: { fullName?: string; email?: string };
        documentLanguage?: { documentType?: string; sourceLanguage?: string; targetLanguage?: string; files?: any[] }; // files might just be count or names here
        serviceOptions?: { serviceId?: string };
        deliveryOptions?: { deliveryId?: string };
    };
    totalPrice: number; // Pass calculated total price
}

// Basic HTML email template (consider using a templating engine for more complex emails)
const createCustomerEmailHtml = (data: RequestBody): string => `
  <h1>Your OpenTranslate Order #${data.orderNumber} is Confirmed!</h1>
  <p>Hi ${data.orderDetails.contactInfo?.fullName || 'Customer'},</p>
  <p>Thank you for your order. Here's a summary:</p>
  <ul>
    <li><strong>Document Type:</strong> ${data.orderDetails.documentLanguage?.documentType || 'N/A'}</li>
    <li><strong>Language:</strong> ${data.orderDetails.documentLanguage?.sourceLanguage || 'N/A'} to ${data.orderDetails.documentLanguage?.targetLanguage || 'N/A'}</li>
    <li><strong>Service Level:</strong> ${data.orderDetails.serviceOptions?.serviceId || 'N/A'}</li>
    <li><strong>Delivery:</strong> ${data.orderDetails.deliveryOptions?.deliveryId || 'N/A'}</li>
    <li><strong>Files Submitted:</strong> ${data.orderDetails.documentLanguage?.files?.length || 0}</li>
    <li><strong>Total Price:</strong> $${data.totalPrice.toFixed(2)}</li>
  </ul>
  <p>We'll notify you once your translation is complete. You can view your order details in your dashboard.</p>
  <p>Thanks,<br/>The OpenTranslate Team</p>
`;

const createAdminEmailHtml = (data: RequestBody): string => `
  <h1>New Order Received: #${data.orderNumber}</h1>
  <p>A new order has been placed:</p>
  <ul>
    <li><strong>Order ID:</strong> ${data.orderNumber}</li>
    <li><strong>Customer Name:</strong> ${data.orderDetails.contactInfo?.fullName || 'N/A'}</li>
    <li><strong>Customer Email:</strong> ${data.customerEmail}</li>
    <li><strong>Document Type:</strong> ${data.orderDetails.documentLanguage?.documentType || 'N/A'}</li>
    <li><strong>Language:</strong> ${data.orderDetails.documentLanguage?.sourceLanguage || 'N/A'} to ${data.orderDetails.documentLanguage?.targetLanguage || 'N/A'}</li>
    <li><strong>Service Level:</strong> ${data.orderDetails.serviceOptions?.serviceId || 'N/A'}</li>
    <li><strong>Delivery:</strong> ${data.orderDetails.deliveryOptions?.deliveryId || 'N/A'}</li>
    <li><strong>Files Submitted:</strong> ${data.orderDetails.documentLanguage?.files?.length || 0}</li>
    <li><strong>Total Price:</strong> $${data.totalPrice.toFixed(2)}</li>
  </ul>
  <p>Please check the admin dashboard for details and uploaded files.</p>
`;


export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  try {
    const body: RequestBody = req.body;

    // Basic validation
    if (!body.orderNumber || !body.customerEmail || !body.orderDetails || typeof body.totalPrice !== 'number') {
        return res.status(400).json({ error: { message: 'Missing required order details for email.' }});
    }

    // Send email to customer
    const customerEmailData = await resend.emails.send({
      from: 'OpenTranslate <orders@mail.opentranslate.co>', // Use your verified Resend domain/sender
      to: [body.customerEmail],
      subject: `Your OpenTranslate Order Confirmation #${body.orderNumber}`,
      html: createCustomerEmailHtml(body),
    });
    console.log("Customer confirmation email sent:", customerEmailData);


    // Send email to admin
    const adminEmailData = await resend.emails.send({
        from: 'OpenTranslate Order System <orders@mail.opentranslate.co>', // Use your verified Resend domain/sender
        to: ['guy@gcs.org'], // Admin email
        subject: `New Translation Order Received: #${body.orderNumber}`,
        html: createAdminEmailHtml(body),
      });
    console.log("Admin notification email sent:", adminEmailData);


    // Check for errors from Resend (optional, but good practice)
    if (customerEmailData.error || adminEmailData.error) {
        console.error("Resend Error:", customerEmailData.error || adminEmailData.error);
        // Decide if you want to return an error to the frontend even if order was saved
        // For now, we'll just log it and return success as the order itself is placed.
    }

    res.status(200).json({ message: 'Confirmation emails sent successfully.' });

  } catch (err: any) {
    console.error("Error sending confirmation email:", err);
    // Don't block the user flow if email fails, just log the error
    res.status(500).json({ error: { message: err.message || 'Internal Server Error while sending email' } });
  }
}
