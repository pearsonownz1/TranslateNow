import { Resend } from "resend";

// Initialize Resend with API key
const resendApiKey = "re_HJMiqSNz_ADPQA6epMcs1NLSuXzeRw6Zr";
const resend = new Resend(resendApiKey);

// Email templates
export const sendOrderConfirmationEmail = async ({
  to,
  orderNumber,
  documentType,
  sourceLanguage,
  targetLanguage,
  serviceLevel,
  totalPrice,
  estimatedDelivery,
}: {
  to: string;
  orderNumber: string;
  documentType: string;
  sourceLanguage: string;
  targetLanguage: string;
  serviceLevel: string;
  totalPrice: number;
  estimatedDelivery: string;
}) => {
  try {
    const data = await resend.emails.send({
      from: "PingTranslate <notifications@pingtranslate.com>",
      to: [to],
      subject: `Order Confirmation: ${orderNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
            <h1 style="color: #3b82f6;">Your Translation Order is Confirmed</h1>
          </div>
          
          <div style="padding: 20px;">
            <p>Thank you for your order with PingTranslate. We're excited to help you with your translation needs.</p>
            
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h2 style="margin-top: 0;">Order Summary</h2>
              <p><strong>Order Number:</strong> ${orderNumber}</p>
              <p><strong>Document Type:</strong> ${documentType}</p>
              <p><strong>Language Pair:</strong> ${sourceLanguage} → ${targetLanguage}</p>
              <p><strong>Service Level:</strong> ${serviceLevel}</p>
              <p><strong>Total Price:</strong> $${totalPrice.toFixed(2)}</p>
              <p><strong>Estimated Delivery:</strong> ${estimatedDelivery}</p>
            </div>
            
            <p>Our translators will begin working on your document immediately. You'll receive email updates about your translation progress.</p>
            
            <p>Once completed, you'll receive a notification to download your translated document.</p>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="https://pingtranslate.com/dashboard" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Order in Dashboard</a>
            </div>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #6b7280;">
            <p>© 2023 PingTranslate. All rights reserved.</p>
            <p>If you have any questions, please contact our support team at support@pingtranslate.com</p>
          </div>
        </div>
      `,
    });

    return { success: true, data };
  } catch (error) {
    console.error("Failed to send order confirmation email:", error);
    return { success: false, error };
  }
};

export const sendRegistrationEmail = async ({
  to,
  name,
}: {
  to: string;
  name: string;
}) => {
  try {
    const data = await resend.emails.send({
      from: "PingTranslate <welcome@pingtranslate.com>",
      to: [to],
      subject: "Welcome to PingTranslate",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
            <h1 style="color: #3b82f6;">Welcome to PingTranslate!</h1>
          </div>
          
          <div style="padding: 20px;">
            <p>Hello ${name},</p>
            
            <p>Thank you for creating an account with PingTranslate. We're excited to have you join our community of global communicators.</p>
            
            <p>With your new account, you can:</p>
            <ul>
              <li>Order professional translations</li>
              <li>Track the status of your orders</li>
              <li>Access your translated documents</li>
              <li>Manage your payment information</li>
            </ul>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="https://pingtranslate.com/dashboard" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Go to Your Dashboard</a>
            </div>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #6b7280;">
            <p>© 2023 PingTranslate. All rights reserved.</p>
            <p>If you have any questions, please contact our support team at support@pingtranslate.com</p>
          </div>
        </div>
      `,
    });

    return { success: true, data };
  } catch (error) {
    console.error("Failed to send registration email:", error);
    return { success: false, error };
  }
};

export const sendOrderCompletionEmail = async ({
  to,
  orderNumber,
  documentType,
  downloadLink,
}: {
  to: string;
  orderNumber: string;
  documentType: string;
  downloadLink: string;
}) => {
  try {
    const data = await resend.emails.send({
      from: "PingTranslate <notifications@pingtranslate.com>",
      to: [to],
      subject: `Your Translation is Ready: ${orderNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
            <h1 style="color: #3b82f6;">Your Translation is Ready!</h1>
          </div>
          
          <div style="padding: 20px;">
            <p>Great news! Your translation order (${orderNumber}) has been completed and is ready for download.</p>
            
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h2 style="margin-top: 0;">Order Details</h2>
              <p><strong>Order Number:</strong> ${orderNumber}</p>
              <p><strong>Document Type:</strong> ${documentType}</p>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="${downloadLink}" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Download Your Translation</a>
            </div>
            
            <p style="margin-top: 30px;">You can also access your translation from your dashboard at any time.</p>
            
            <div style="text-align: center; margin-top: 20px;">
              <a href="https://pingtranslate.com/dashboard" style="color: #3b82f6; text-decoration: none;">Go to Dashboard</a>
            </div>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #6b7280;">
            <p>© 2023 PingTranslate. All rights reserved.</p>
            <p>If you have any questions, please contact our support team at support@pingtranslate.com</p>
          </div>
        </div>
      `,
    });

    return { success: true, data };
  } catch (error) {
    console.error("Failed to send order completion email:", error);
    return { success: false, error };
  }
};

export const sendPasswordResetEmail = async ({
  to,
  resetLink,
}: {
  to: string;
  resetLink: string;
}) => {
  try {
    const data = await resend.emails.send({
      from: "PingTranslate <security@pingtranslate.com>",
      to: [to],
      subject: "Reset Your PingTranslate Password",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
            <h1 style="color: #3b82f6;">Reset Your Password</h1>
          </div>
          
          <div style="padding: 20px;">
            <p>We received a request to reset your PingTranslate password. If you didn't make this request, you can safely ignore this email.</p>
            
            <p>To reset your password, click the button below:</p>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="${resetLink}" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
            </div>
            
            <p style="margin-top: 30px;">This link will expire in 1 hour for security reasons.</p>
            
            <p>If you're having trouble with the button above, copy and paste the URL below into your web browser:</p>
            <p style="word-break: break-all; color: #6b7280;">${resetLink}</p>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #6b7280;">
            <p>© 2023 PingTranslate. All rights reserved.</p>
            <p>If you have any questions, please contact our support team at support@pingtranslate.com</p>
          </div>
        </div>
      `,
    });

    return { success: true, data };
  } catch (error) {
    console.error("Failed to send password reset email:", error);
    return { success: false, error };
  }
};
