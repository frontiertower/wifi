import { Resend } from 'resend';

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

class EmailService {
  private async getResendClient() {
    try {
      const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
      const xReplitToken = process.env.REPL_IDENTITY 
        ? 'repl ' + process.env.REPL_IDENTITY 
        : process.env.WEB_REPL_RENEWAL 
        ? 'depl ' + process.env.WEB_REPL_RENEWAL 
        : null;

      if (!xReplitToken) {
        console.log('⚠️  Resend not configured - X_REPLIT_TOKEN not found');
        return null;
      }

      const connectionSettings = await fetch(
        'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=resend',
        {
          headers: {
            'Accept': 'application/json',
            'X_REPLIT_TOKEN': xReplitToken
          }
        }
      ).then(res => res.json()).then(data => data.items?.[0]);

      if (!connectionSettings || !connectionSettings.settings.api_key) {
        console.log('⚠️  Resend not connected - please set up the Resend integration');
        return null;
      }

      return {
        client: new Resend(connectionSettings.settings.api_key),
        fromEmail: connectionSettings.settings.from_email || 'noreply@thefrontiertower.com'
      };
    } catch (error) {
      console.error('❌ Failed to get Resend client:', error);
      return null;
    }
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const resend = await this.getResendClient();
      
      if (!resend) {
        console.log('⚠️  Email not sent - Resend integration not configured');
        console.log(`   Would have sent: ${options.subject} to ${options.to}`);
        return false;
      }

      const { data, error } = await resend.client.emails.send({
        from: resend.fromEmail,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });

      if (error) {
        console.error('❌ Failed to send email via Resend:', error);
        return false;
      }

      console.log('✅ Email sent successfully via Resend:', data?.id);
      return true;
    } catch (error) {
      console.error('❌ Failed to send email:', error);
      return false;
    }
  }

  async sendTourBookingNotification(booking: {
    name: string;
    company?: string | null;
    phone: string;
    email: string;
    linkedIn?: string | null;
    referredBy?: string | null;
    tourDate: Date;
    tourTime: string;
    interestedInPrivateOffice?: boolean | null;
    numberOfPeople?: number | null;
  }): Promise<boolean> {
    const subject = `New Tour Booking: ${booking.name}`;
    
    const text = `
New Tour Booking Received

Name: ${booking.name}
${booking.company ? `Company: ${booking.company}` : ""}
Phone: ${booking.phone}
Email: ${booking.email}
${booking.linkedIn ? `LinkedIn: ${booking.linkedIn}` : ""}
${booking.referredBy ? `Referred By: ${booking.referredBy}` : ""}

Tour Date: ${booking.tourDate.toLocaleDateString()}
Tour Time: ${booking.tourTime}

${booking.interestedInPrivateOffice ? `Interested in Private Office: Yes` : ""}
${booking.numberOfPeople ? `Number of People: ${booking.numberOfPeople}` : ""}

---
This is an automated notification from Frontier Tower WiFi Portal.
    `.trim();

    const html = `
      <h2>New Tour Booking Received</h2>
      <table style="border-collapse: collapse; width: 100%; max-width: 600px;">
        <tr>
          <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #ddd;">Name:</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${booking.name}</td>
        </tr>
        ${booking.company ? `
        <tr>
          <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #ddd;">Company:</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${booking.company}</td>
        </tr>
        ` : ""}
        <tr>
          <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #ddd;">Phone:</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${booking.phone}</td>
        </tr>
        <tr>
          <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #ddd;">Email:</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${booking.email}</td>
        </tr>
        ${booking.linkedIn ? `
        <tr>
          <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #ddd;">LinkedIn:</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${booking.linkedIn}</td>
        </tr>
        ` : ""}
        ${booking.referredBy ? `
        <tr>
          <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #ddd;">Referred By:</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${booking.referredBy}</td>
        </tr>
        ` : ""}
        <tr>
          <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #ddd;">Tour Date:</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${booking.tourDate.toLocaleDateString()}</td>
        </tr>
        <tr>
          <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #ddd;">Tour Time:</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${booking.tourTime}</td>
        </tr>
        ${booking.interestedInPrivateOffice ? `
        <tr>
          <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #ddd;">Interested in Private Office:</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">Yes</td>
        </tr>
        ` : ""}
        ${booking.numberOfPeople ? `
        <tr>
          <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #ddd;">Number of People:</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${booking.numberOfPeople}</td>
        </tr>
        ` : ""}
      </table>
      <p style="color: #666; font-size: 12px; margin-top: 20px;">
        This is an automated notification from Frontier Tower WiFi Portal.
      </p>
    `;

    return this.sendEmail({
      to: "events@thefrontiertower.com",
      subject,
      text,
      html,
    });
  }

  async sendMembershipApplicationNotification(application: {
    name: string;
    email: string;
    phone: string;
    telegram?: string | null;
    linkedIn?: string | null;
    company?: string | null;
    website?: string | null;
  }): Promise<boolean> {
    const subject = `New Membership Application: ${application.name}`;
    
    const text = `
New Membership Application Received

Name: ${application.name}
Email: ${application.email}
Phone: ${application.phone}
${application.company ? `Company: ${application.company}` : ""}
${application.telegram ? `Telegram: ${application.telegram}` : ""}
${application.linkedIn ? `LinkedIn: ${application.linkedIn}` : ""}
${application.website ? `Website: ${application.website}` : ""}

---
This is an automated notification from Frontier Tower WiFi Portal.
    `.trim();

    const html = `
      <h2>New Membership Application Received</h2>
      <table style="border-collapse: collapse; width: 100%; max-width: 600px;">
        <tr>
          <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #ddd;">Name:</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${application.name}</td>
        </tr>
        <tr>
          <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #ddd;">Email:</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${application.email}</td>
        </tr>
        <tr>
          <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #ddd;">Phone:</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${application.phone}</td>
        </tr>
        ${application.company ? `
        <tr>
          <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #ddd;">Company:</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${application.company}</td>
        </tr>
        ` : ""}
        ${application.telegram ? `
        <tr>
          <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #ddd;">Telegram:</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${application.telegram}</td>
        </tr>
        ` : ""}
        ${application.linkedIn ? `
        <tr>
          <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #ddd;">LinkedIn:</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${application.linkedIn}</td>
        </tr>
        ` : ""}
        ${application.website ? `
        <tr>
          <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #ddd;">Website:</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${application.website}</td>
        </tr>
        ` : ""}
      </table>
      <p style="color: #666; font-size: 12px; margin-top: 20px;">
        This is an automated notification from Frontier Tower WiFi Portal.
      </p>
    `;

    return this.sendEmail({
      to: "events@thefrontiertower.com",
      subject,
      text,
      html,
    });
  }
}

export const emailService = new EmailService();
