import { Resend } from "resend";

// Initialize Resend with API key
const resendApiKey = "re_HJMiqSNz_ADPQA6epMcs1NLSuXzeRw6Zr";
const resend = new Resend(resendApiKey);

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { from, to, subject, html } = req.body;

    if (!from || !to || !subject || !html) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const data = await resend.emails.send({
      from,
      to,
      subject,
      html,
    });

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Email sending error:", error);
    return res.status(500).json({ error: "Failed to send email" });
  }
}
