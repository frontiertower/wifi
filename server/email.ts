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
    tourType: string;
    groupTourSelection?: string | null;
    groupTourUrl?: string | null;
    tourDate?: Date | null;
    tourTime?: string | null;
    interestedInPrivateOffice?: boolean | null;
    numberOfPeople?: number | null;
  }): Promise<boolean> {
    const subject = `New Tour Booking: ${booking.name}`;
    
    const tourInfo = booking.tourType === "custom" 
      ? `Custom Tour\nDate: ${booking.tourDate ? booking.tourDate.toLocaleDateString() : 'N/A'}\nTime: ${booking.tourTime || 'N/A'}`
      : `Group Tour\nEvent: ${booking.groupTourSelection || 'N/A'}\nLuma URL: ${booking.groupTourUrl || 'N/A'}`;
    
    const text = `
New Tour Booking Received

Name: ${booking.name}
${booking.company ? `Company: ${booking.company}` : ""}
Phone: ${booking.phone}
Email: ${booking.email}
${booking.linkedIn ? `LinkedIn: ${booking.linkedIn}` : ""}
${booking.referredBy ? `Referred By: ${booking.referredBy}` : ""}

${tourInfo}

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
          <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #ddd;">Tour Type:</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${booking.tourType === "custom" ? "Custom Tour" : "Group Tour"}</td>
        </tr>
        ${booking.tourType === "custom" ? `
        <tr>
          <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #ddd;">Tour Date:</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${booking.tourDate ? booking.tourDate.toLocaleDateString() : 'N/A'}</td>
        </tr>
        <tr>
          <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #ddd;">Tour Time:</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${booking.tourTime || 'N/A'}</td>
        </tr>
        ` : ""}
        ${booking.tourType !== "custom" && booking.groupTourSelection ? `
        <tr>
          <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #ddd;">Group Tour Event:</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${booking.groupTourSelection}</td>
        </tr>
        ` : ""}
        ${booking.tourType !== "custom" && booking.groupTourUrl ? `
        <tr>
          <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #ddd;">Luma URL:</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;"><a href="${booking.groupTourUrl}" style="color: #3b82f6;">${booking.groupTourUrl}</a></td>
        </tr>
        ` : ""}
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

  async sendPrivateOfficeRentalNotification(rental: {
    name: string;
    company?: string | null;
    phone: string;
    email: string;
    linkedIn?: string | null;
    referredBy?: string | null;
    preferredMoveInDate?: Date | null;
    numberOfPeople?: number | null;
    budgetRange?: string | null;
    officeRequirements?: string | null;
    notes?: string | null;
  }): Promise<boolean> {
    const subject = `New Private Office Rental Inquiry: ${rental.name}`;
    
    const text = `
New Private Office Rental Inquiry

Name: ${rental.name}
${rental.company ? `Company: ${rental.company}` : ""}
Phone: ${rental.phone}
Email: ${rental.email}
${rental.linkedIn ? `LinkedIn: ${rental.linkedIn}` : ""}
${rental.referredBy ? `Referred By: ${rental.referredBy}` : ""}

${rental.preferredMoveInDate ? `Preferred Move-In Date: ${rental.preferredMoveInDate.toLocaleDateString()}` : ""}
${rental.numberOfPeople ? `Number of People: ${rental.numberOfPeople}` : ""}
${rental.budgetRange ? `Budget Range: ${rental.budgetRange}` : ""}
${rental.officeRequirements ? `Office Requirements: ${rental.officeRequirements}` : ""}
${rental.notes ? `Notes: ${rental.notes}` : ""}

---
This is an automated notification from Frontier Tower WiFi Portal.
    `.trim();

    const html = `
      <h2>New Private Office Rental Inquiry</h2>
      <table style="border-collapse: collapse; width: 100%; max-width: 600px;">
        <tr>
          <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #ddd;">Name:</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${rental.name}</td>
        </tr>
        ${rental.company ? `
        <tr>
          <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #ddd;">Company:</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${rental.company}</td>
        </tr>
        ` : ""}
        <tr>
          <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #ddd;">Phone:</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${rental.phone}</td>
        </tr>
        <tr>
          <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #ddd;">Email:</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${rental.email}</td>
        </tr>
        ${rental.linkedIn ? `
        <tr>
          <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #ddd;">LinkedIn:</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${rental.linkedIn}</td>
        </tr>
        ` : ""}
        ${rental.referredBy ? `
        <tr>
          <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #ddd;">Referred By:</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${rental.referredBy}</td>
        </tr>
        ` : ""}
        ${rental.preferredMoveInDate ? `
        <tr>
          <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #ddd;">Preferred Move-In Date:</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${rental.preferredMoveInDate.toLocaleDateString()}</td>
        </tr>
        ` : ""}
        ${rental.numberOfPeople ? `
        <tr>
          <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #ddd;">Number of People:</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${rental.numberOfPeople}</td>
        </tr>
        ` : ""}
        ${rental.budgetRange ? `
        <tr>
          <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #ddd;">Budget Range:</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${rental.budgetRange}</td>
        </tr>
        ` : ""}
        ${rental.officeRequirements ? `
        <tr>
          <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #ddd;">Office Requirements:</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd; white-space: pre-wrap;">${rental.officeRequirements}</td>
        </tr>
        ` : ""}
        ${rental.notes ? `
        <tr>
          <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #ddd;">Notes:</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd; white-space: pre-wrap;">${rental.notes}</td>
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
    const subject = `New Membership Inquiry: ${application.name}`;
    
    const text = `
New Membership Inquiry Received

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
      <h2>New Membership Inquiry Received</h2>
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

  async sendChatInviteRequestNotification(request: {
    name: string;
    phone: string;
    email: string;
    telegram?: string | null;
    linkedIn?: string | null;
    message?: string | null;
  }): Promise<boolean> {
    const subject = `New Telegram Chat Invite Request: ${request.name}`;
    
    const text = `
New Telegram Chat Invite Request

Someone has requested an invite to the Frontier Tower Telegram group chat.

Name: ${request.name}
Phone: ${request.phone}
Email: ${request.email}
${request.telegram ? `Telegram: ${request.telegram}` : ""}
${request.linkedIn ? `LinkedIn: ${request.linkedIn}` : ""}
${request.message ? `\nMessage:\n${request.message}` : ""}

Please send them a text message with the Telegram invite link:
https://t.me/+M0KxFTd3LnJkNzky

---
This is an automated notification from Frontier Tower WiFi Portal.
    `.trim();

    const html = `
      <h2>New Telegram Chat Invite Request</h2>
      <p>Someone has requested an invite to the Frontier Tower Telegram group chat.</p>
      <table style="border-collapse: collapse; width: 100%; max-width: 600px;">
        <tr>
          <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #ddd;">Name:</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${request.name}</td>
        </tr>
        <tr>
          <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #ddd;">Phone:</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${request.phone}</td>
        </tr>
        <tr>
          <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #ddd;">Email:</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${request.email}</td>
        </tr>
        ${request.telegram ? `
        <tr>
          <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #ddd;">Telegram:</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${request.telegram}</td>
        </tr>
        ` : ""}
        ${request.linkedIn ? `
        <tr>
          <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #ddd;">LinkedIn:</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${request.linkedIn}</td>
        </tr>
        ` : ""}
        ${request.message ? `
        <tr>
          <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #ddd;">Message:</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd; white-space: pre-wrap;">${request.message}</td>
        </tr>
        ` : ""}
      </table>
      <p style="margin-top: 20px;">
        <strong>Please send them a text message with the Telegram invite link:</strong><br>
        <a href="https://t.me/+M0KxFTd3LnJkNzky" style="color: #0066cc;">https://t.me/+M0KxFTd3LnJkNzky</a>
      </p>
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

  async sendJobApplicationNotification(application: {
    name: string;
    location: string;
    email: string;
    phone: string;
    linkedinUrl?: string | null;
    resumeUrl?: string | null;
    minimumCompensation?: number | null;
    noticePeriodWeeks?: number | null;
    valuesAlignment?: boolean | null;
    startupYears?: number | null;
    paymentSystemsExperience?: string | null;
    taxAdvisorExperience?: string | null;
    contractInterpretationLevel?: number | null;
    investorRelationsExperience?: string | null;
    executiveCollaboration?: string | null;
    motivationStatement: string;
    referralSource?: string | null;
    portfolioUrl?: string | null;
  }): Promise<boolean> {
    const subject = `New Job Application: ${application.name}`;
    
    const text = `
New Job Application Received

A new job application has been submitted via the Personnel Data Input Terminal.

=== SECTION A: PERSONNEL IDENTIFICATION ===
Name: ${application.name}
Location: ${application.location}
Email: ${application.email}
Phone: ${application.phone}
${application.linkedinUrl ? `LinkedIn: ${application.linkedinUrl}` : ""}
${application.resumeUrl ? `Resume/CV: ${application.resumeUrl}` : ""}

=== SECTION B: OPERATIONAL EXPERIENCE ===
${application.minimumCompensation ? `Minimum Compensation: $${application.minimumCompensation}/year` : ""}
${application.noticePeriodWeeks ? `Notice Period: ${application.noticePeriodWeeks} weeks` : ""}
${application.valuesAlignment !== null ? `Values Alignment: ${application.valuesAlignment ? "CONFIRMED" : "Not confirmed"}` : ""}
${application.startupYears !== null ? `Startup Experience: ${application.startupYears} years` : ""}
${application.contractInterpretationLevel ? `Contract Interpretation Level: ${application.contractInterpretationLevel}/5` : ""}

${application.paymentSystemsExperience ? `Payment/Banking Systems Experience:\n${application.paymentSystemsExperience}\n` : ""}
${application.taxAdvisorExperience ? `Tax Advisor Coordination:\n${application.taxAdvisorExperience}\n` : ""}
${application.investorRelationsExperience ? `Investor Relations:\n${application.investorRelationsExperience}\n` : ""}
${application.executiveCollaboration ? `C-Level/Founder Collaboration:\n${application.executiveCollaboration}\n` : ""}

=== SECTION C: CANDIDATE MANIFESTO ===
Mission Motivation:
${application.motivationStatement}

${application.referralSource ? `Referral Source: ${application.referralSource}` : ""}
${application.portfolioUrl ? `Portfolio: ${application.portfolioUrl}` : ""}

---
This is an automated notification from Frontier Tower Personnel Data Terminal.
    `.trim();

    const html = `
      <div style="font-family: 'Courier New', monospace; background: #1a1a1a; color: #00ff00; padding: 20px;">
        <h2 style="color: #00ff00; border-bottom: 2px solid #00ff00; padding-bottom: 10px;">
          ⚡ NEW PERSONNEL DATA TRANSMISSION RECEIVED
        </h2>
        <p style="color: #88ff88;">A new job application has been submitted via the Personnel Data Input Terminal.</p>
        
        <h3 style="color: #00ff00; margin-top: 30px; border-left: 4px solid #00ff00; padding-left: 10px;">
          SECTION A: PERSONNEL IDENTIFICATION FILE
        </h3>
        <table style="border-collapse: collapse; width: 100%; max-width: 700px; margin-top: 15px;">
          <tr style="background: #0a2a0a;">
            <td style="padding: 12px; font-weight: bold; border: 1px solid #00ff00; color: #88ff88;">NAME:</td>
            <td style="padding: 12px; border: 1px solid #00ff00; color: #fff;">${application.name}</td>
          </tr>
          <tr>
            <td style="padding: 12px; font-weight: bold; border: 1px solid #00ff00; color: #88ff88;">LOCATION:</td>
            <td style="padding: 12px; border: 1px solid #00ff00; color: #fff;">${application.location}</td>
          </tr>
          <tr style="background: #0a2a0a;">
            <td style="padding: 12px; font-weight: bold; border: 1px solid #00ff00; color: #88ff88;">EMAIL:</td>
            <td style="padding: 12px; border: 1px solid #00ff00; color: #fff;">${application.email}</td>
          </tr>
          <tr>
            <td style="padding: 12px; font-weight: bold; border: 1px solid #00ff00; color: #88ff88;">PHONE:</td>
            <td style="padding: 12px; border: 1px solid #00ff00; color: #fff;">${application.phone}</td>
          </tr>
          ${application.linkedinUrl ? `
          <tr style="background: #0a2a0a;">
            <td style="padding: 12px; font-weight: bold; border: 1px solid #00ff00; color: #88ff88;">LINKEDIN:</td>
            <td style="padding: 12px; border: 1px solid #00ff00;"><a href="${application.linkedinUrl}" style="color: #00ffff;">${application.linkedinUrl}</a></td>
          </tr>
          ` : ""}
          ${application.resumeUrl ? `
          <tr>
            <td style="padding: 12px; font-weight: bold; border: 1px solid #00ff00; color: #88ff88;">RESUME/CV:</td>
            <td style="padding: 12px; border: 1px solid #00ff00;"><a href="${application.resumeUrl}" style="color: #00ffff;">${application.resumeUrl}</a></td>
          </tr>
          ` : ""}
        </table>

        <h3 style="color: #00ff00; margin-top: 30px; border-left: 4px solid #00ff00; padding-left: 10px;">
          SECTION B: OPERATIONAL EXPERIENCE MATRIX
        </h3>
        <table style="border-collapse: collapse; width: 100%; max-width: 700px; margin-top: 15px;">
          ${application.minimumCompensation ? `
          <tr style="background: #0a2a0a;">
            <td style="padding: 12px; font-weight: bold; border: 1px solid #00ff00; color: #88ff88;">MINIMUM COMPENSATION:</td>
            <td style="padding: 12px; border: 1px solid #00ff00; color: #fff;">$${application.minimumCompensation.toLocaleString()}/year</td>
          </tr>
          ` : ""}
          ${application.noticePeriodWeeks !== null && application.noticePeriodWeeks !== undefined ? `
          <tr>
            <td style="padding: 12px; font-weight: bold; border: 1px solid #00ff00; color: #88ff88;">NOTICE PERIOD:</td>
            <td style="padding: 12px; border: 1px solid #00ff00; color: #fff;">${application.noticePeriodWeeks} weeks</td>
          </tr>
          ` : ""}
          ${application.valuesAlignment !== null && application.valuesAlignment !== undefined ? `
          <tr style="background: #0a2a0a;">
            <td style="padding: 12px; font-weight: bold; border: 1px solid #00ff00; color: #88ff88;">VALUES ALIGNMENT:</td>
            <td style="padding: 12px; border: 1px solid #00ff00; color: ${application.valuesAlignment ? '#00ff00' : '#ff6600'}; font-weight: bold;">
              ${application.valuesAlignment ? '✓ CONFIRMED' : '✗ NOT CONFIRMED'}
            </td>
          </tr>
          ` : ""}
          ${application.startupYears !== null && application.startupYears !== undefined ? `
          <tr>
            <td style="padding: 12px; font-weight: bold; border: 1px solid #00ff00; color: #88ff88;">STARTUP YEARS:</td>
            <td style="padding: 12px; border: 1px solid #00ff00; color: #fff;">${application.startupYears} years</td>
          </tr>
          ` : ""}
          ${application.contractInterpretationLevel ? `
          <tr style="background: #0a2a0a;">
            <td style="padding: 12px; font-weight: bold; border: 1px solid #00ff00; color: #88ff88;">CONTRACT INTERPRETATION:</td>
            <td style="padding: 12px; border: 1px solid #00ff00; color: #fff;">${application.contractInterpretationLevel}/5</td>
          </tr>
          ` : ""}
        </table>

        ${application.paymentSystemsExperience || application.taxAdvisorExperience || application.investorRelationsExperience || application.executiveCollaboration ? `
        <div style="margin-top: 20px;">
          ${application.paymentSystemsExperience ? `
          <div style="margin-bottom: 15px;">
            <strong style="color: #88ff88;">PAYMENT/BANKING SYSTEMS:</strong>
            <div style="background: #0a2a0a; border: 1px solid #00ff00; padding: 12px; margin-top: 5px; color: #fff; white-space: pre-wrap;">${application.paymentSystemsExperience}</div>
          </div>
          ` : ""}
          ${application.taxAdvisorExperience ? `
          <div style="margin-bottom: 15px;">
            <strong style="color: #88ff88;">TAX ADVISOR COORDINATION:</strong>
            <div style="background: #0a2a0a; border: 1px solid #00ff00; padding: 12px; margin-top: 5px; color: #fff; white-space: pre-wrap;">${application.taxAdvisorExperience}</div>
          </div>
          ` : ""}
          ${application.investorRelationsExperience ? `
          <div style="margin-bottom: 15px;">
            <strong style="color: #88ff88;">INVESTOR RELATIONS:</strong>
            <div style="background: #0a2a0a; border: 1px solid #00ff00; padding: 12px; margin-top: 5px; color: #fff; white-space: pre-wrap;">${application.investorRelationsExperience}</div>
          </div>
          ` : ""}
          ${application.executiveCollaboration ? `
          <div style="margin-bottom: 15px;">
            <strong style="color: #88ff88;">C-LEVEL/FOUNDER COLLABORATION:</strong>
            <div style="background: #0a2a0a; border: 1px solid #00ff00; padding: 12px; margin-top: 5px; color: #fff; white-space: pre-wrap;">${application.executiveCollaboration}</div>
          </div>
          ` : ""}
        </div>
        ` : ""}

        <h3 style="color: #00ff00; margin-top: 30px; border-left: 4px solid #00ff00; padding-left: 10px;">
          SECTION C: CANDIDATE MANIFESTO
        </h3>
        <div style="background: #0a2a0a; border: 2px solid #00ff00; padding: 15px; margin-top: 15px;">
          <strong style="color: #88ff88; display: block; margin-bottom: 10px;">MISSION MOTIVATION:</strong>
          <div style="color: #fff; white-space: pre-wrap; line-height: 1.6;">${application.motivationStatement}</div>
        </div>

        ${application.referralSource || application.portfolioUrl ? `
        <table style="border-collapse: collapse; width: 100%; max-width: 700px; margin-top: 20px;">
          ${application.referralSource ? `
          <tr style="background: #0a2a0a;">
            <td style="padding: 12px; font-weight: bold; border: 1px solid #00ff00; color: #88ff88;">REFERRAL SOURCE:</td>
            <td style="padding: 12px; border: 1px solid #00ff00; color: #fff;">${application.referralSource}</td>
          </tr>
          ` : ""}
          ${application.portfolioUrl ? `
          <tr>
            <td style="padding: 12px; font-weight: bold; border: 1px solid #00ff00; color: #88ff88;">PORTFOLIO:</td>
            <td style="padding: 12px; border: 1px solid #00ff00;"><a href="${application.portfolioUrl}" style="color: #00ffff;">${application.portfolioUrl}</a></td>
          </tr>
          ` : ""}
        </table>
        ` : ""}

        <p style="color: #666; font-size: 11px; margin-top: 30px; border-top: 1px solid #00ff00; padding-top: 15px;">
          ⚡ AUTOMATED TRANSMISSION FROM FRONTIER TOWER PERSONNEL DATA TERMINAL ⚡
        </p>
      </div>
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
