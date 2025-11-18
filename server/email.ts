import nodemailer from "nodemailer";

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private initialized = false;

  async initialize() {
    if (this.initialized) return;

    try {
      // Check if SMTP credentials are configured
      if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        // Use configured SMTP server
        this.transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || "587"),
          secure: process.env.SMTP_SECURE === "true",
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });
        console.log("✅ Email service initialized with SMTP configuration");
      } else {
        // Use Ethereal test account for development
        const testAccount = await nodemailer.createTestAccount();
        this.transporter = nodemailer.createTransport({
          host: "smtp.ethereal.email",
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });
        console.log("⚠️  Email service using test account (emails won't be delivered)");
        console.log("   Configure SMTP_HOST, SMTP_USER, SMTP_PASS environment variables for production");
      }

      this.initialized = true;
    } catch (error) {
      console.error("❌ Failed to initialize email service:", error);
      this.transporter = null;
    }
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.initialized) {
      await this.initialize();
    }

    if (!this.transporter) {
      console.error("❌ Email service not initialized - cannot send email");
      return false;
    }

    try {
      const info = await this.transporter.sendMail({
        from: process.env.FROM_EMAIL || process.env.SMTP_USER || "noreply@frontiertower.com",
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });

      // If using Ethereal test account, log preview URL
      if (process.env.SMTP_HOST !== "smtp.ethereal.email" && !process.env.SMTP_HOST) {
        const previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) {
          console.log("📧 Email preview URL:", previewUrl);
        }
      }

      console.log("✅ Email sent successfully:", info.messageId);
      return true;
    } catch (error) {
      console.error("❌ Failed to send email:", error);
      return false;
    }
  }

  async sendTourBookingNotification(booking: {
    name: string;
    company?: string;
    phone: string;
    email: string;
    linkedIn?: string;
    referredBy?: string;
    tourDate: Date;
    tourTime: string;
    interestedInPrivateOffice?: boolean;
    numberOfPeople?: number;
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
    telegram?: string;
    linkedIn?: string;
    company?: string;
    website?: string;
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
