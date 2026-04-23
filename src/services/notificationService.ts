/**
 * Notification Service Helper
 * 
 * Provides utilities for sending bookings notifications via multiple channels:
 * - Website (in-app notification)
 * - WhatsApp (optional via Twilio or WhatsApp Cloud API)
 * - Email (optional via SendGrid or AWS SES)
 * 
 * Usage:
 * const notificationService = new NotificationService();
 * await notificationService.sendBookingConfirmation(booking);
 */

interface BookingNotificationPayload {
  bookingId: string;
  toPhone: string;
  toEmail: string;
  customerName: string;
  serviceTitle: string;
  date: string;
  slot: string;
  message: string;
}

interface NotificationResult {
  channel: string;
  success: boolean;
  message?: string;
  error?: string;
}

export class NotificationService {
  private whatsappApiUrl: string | undefined;
  private whatsappApiToken: string | undefined;
  private emailWebhookUrl: string | undefined;
  private emailWebhookToken: string | undefined;

  constructor() {
    this.whatsappApiUrl = process.env.WHATSAPP_API_URL;
    this.whatsappApiToken = process.env.WHATSAPP_API_TOKEN;
    this.emailWebhookUrl = process.env.EMAIL_WEBHOOK_URL;
    this.emailWebhookToken = process.env.EMAIL_WEBHOOK_TOKEN;
  }

  /**
   * Parse HTTP Basic Auth token (Twilio format)
   * Input: "Basic base64(accountSid:authToken)"
   * Returns: { accountSid, authToken }
   */
  private parseBasicAuth(token: string): { accountSid: string; authToken: string } | null {
    try {
      if (!token.startsWith('Basic ')) return null;
      const decoded = Buffer.from(token.slice(6), 'base64').toString('utf-8');
      const [accountSid, authToken] = decoded.split(':');
      return { accountSid, authToken };
    } catch {
      return null;
    }
  }

  /**
   * Send WhatsApp notification
   * Supports: Twilio, WhatsApp Cloud API
   */
  private async sendWhatsApp(payload: BookingNotificationPayload): Promise<NotificationResult> {
    if (!this.whatsappApiUrl || !this.whatsappApiToken) {
      return { channel: 'whatsapp', success: false, error: 'WhatsApp API not configured' };
    }

    try {
      // Format the message nicely
      const message = `Hi ${payload.customerName}!\n\n${payload.message}\n\nService: ${payload.serviceTitle}\nDate: ${payload.date}\nTime: ${payload.slot}\n\nThank you! - Street Saloon`;

      // Determine API type and format accordingly
      const isTwilio = this.whatsappApiUrl.includes('twilio');
      
      let body: any;
      let headers: Record<string, string> = { 'Content-Type': 'application/json' };

      if (isTwilio) {
        // Twilio WhatsApp format
        const basicAuth = this.parseBasicAuth(this.whatsappApiToken);
        if (basicAuth) {
          const authString = Buffer.from(`${basicAuth.accountSid}:${basicAuth.authToken}`).toString('base64');
          headers['Authorization'] = `Basic ${authString}`;
        }

        body = new URLSearchParams({
          From: process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155552368',
          To: `whatsapp:+${payload.toPhone.replace(/\D/g, '')}`,
          Body: message,
        });
      } else {
        // WhatsApp Cloud API format (Meta/Facebook)
        headers['Authorization'] = `${this.whatsappApiToken.startsWith('Bearer') ? '' : 'Bearer '}${this.whatsappApiToken}`;
        
        body = {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: payload.toPhone.replace(/\D/g, ''),
          type: 'text',
          text: { body: message },
        };
      }

      const response = await fetch(this.whatsappApiUrl, {
        method: 'POST',
        headers,
        body: isTwilio ? body as any : JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`WhatsApp API error: ${response.status} - ${errorData}`);
      }

      return { channel: 'whatsapp', success: true, message: 'WhatsApp message sent' };
    } catch (error: any) {
      console.error('[WhatsApp Notification Error]', error.message);
      return { channel: 'whatsapp', success: false, error: error.message };
    }
  }

  /**
   * Send Email notification
   * Supports: SendGrid, AWS SES
   */
  private async sendEmail(payload: BookingNotificationPayload): Promise<NotificationResult> {
    if (!this.emailWebhookUrl || !this.emailWebhookToken) {
      return { channel: 'email', success: false, error: 'Email API not configured' };
    }

    try {
      const isSendGrid = this.emailWebhookUrl.includes('sendgrid');
      
      let body: any;
      let headers: Record<string, string> = { 'Content-Type': 'application/json' };

      if (isSendGrid) {
        // SendGrid API format
        headers['Authorization'] = `${this.emailWebhookToken.startsWith('Bearer') ? '' : 'Bearer '}${this.emailWebhookToken}`;
        
        body = {
          personalizations: [
            {
              to: [{ email: payload.toEmail, name: payload.customerName }],
              subject: `Booking Confirmed - ${payload.serviceTitle} on ${payload.date}`,
            },
          ],
          from: { email: process.env.SMTP_FROM_EMAIL || 'notifications@streetsaloon.com', name: 'Street Saloon' },
          content: [
            {
              type: 'text/html',
              value: this.generateEmailHTML(payload),
            },
          ],
        };
      } else {
        // Generic webhook format
        headers['Authorization'] = `${this.emailWebhookToken.startsWith('Bearer') ? '' : 'Bearer '}${this.emailWebhookToken}`;
        
        body = {
          to: payload.toEmail,
          to_name: payload.customerName,
          subject: `Booking Confirmed - ${payload.serviceTitle} on ${payload.date}`,
          html: this.generateEmailHTML(payload),
          text: this.generateEmailText(payload),
        };
      }

      const response = await fetch(this.emailWebhookUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Email API error: ${response.status} - ${errorData}`);
      }

      return { channel: 'email', success: true, message: 'Email sent' };
    } catch (error: any) {
      console.error('[Email Notification Error]', error.message);
      return { channel: 'email', success: false, error: error.message };
    }
  }

  /**
   * Generate HTML email template
   */
  private generateEmailHTML(payload: BookingNotificationPayload): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #d4af37, #f0e68c); padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
            .header h1 { color: #000; margin: 0; font-size: 28px; }
            .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
            .details { background: #fff; padding: 15px; border-left: 4px solid #d4af37; margin: 15px 0; }
            .detail-row { margin: 10px 0; }
            .detail-label { font-weight: bold; color: #d4af37; }
            .footer { background: #333; color: #fff; padding: 15px; text-align: center; font-size: 12px; border-radius: 0 0 8px 8px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✓ Booking Confirmed!</h1>
            </div>
            <div class="content">
              <p>Hi <strong>${payload.customerName}</strong>,</p>
              <p>${payload.message}</p>
              
              <div class="details">
                <div class="detail-row">
                  <span class="detail-label">Service:</span> ${payload.serviceTitle}
                </div>
                <div class="detail-row">
                  <span class="detail-label">Date:</span> ${payload.date}
                </div>
                <div class="detail-row">
                  <span class="detail-label">Time:</span> ${payload.slot}
                </div>
                <div class="detail-row">
                  <span class="detail-label">Booking ID:</span> ${payload.bookingId}
                </div>
              </div>

              <p>We're excited to see you! If you need to reschedule or have any questions, please contact us.</p>
              <p>Thank you for choosing <strong>Street Saloon</strong>!</p>
            </div>
            <div class="footer">
              <p>&copy; 2026 Street Saloon. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Generate plain text email
   */
  private generateEmailText(payload: BookingNotificationPayload): string {
    return `
Hi ${payload.customerName},

${payload.message}

Service: ${payload.serviceTitle}
Date: ${payload.date}
Time: ${payload.slot}
Booking ID: ${payload.bookingId}

We're excited to see you! If you need to reschedule or have any questions, please contact us.

Thank you for choosing Street Saloon!

---
Street Saloon © 2026
    `.trim();
  }

  /**
   * Send booking confirmation across all available channels
   */
  async sendBookingConfirmation(payload: BookingNotificationPayload): Promise<{
    channels: string[];
    results: NotificationResult[];
  }> {
    const results: NotificationResult[] = [];
    const channels: string[] = ['website']; // Website notification is always included

    console.log(`[NOTIFICATION] Sending confirmation for booking ${payload.bookingId}`);

    // Send to configured optional channels
    const optionalChannels = [
      { name: 'whatsapp', handler: () => this.sendWhatsApp(payload) },
      { name: 'email', handler: () => this.sendEmail(payload) },
    ];

    // Send all notifications in parallel but don't fail if one fails
    const promises = optionalChannels.map(async ({ name, handler }) => {
      const result = await handler();
      results.push(result);
      if (result.success) {
        channels.push(name);
        console.log(`[✓ ${name.toUpperCase()}] ${result.message}`);
      } else {
        console.warn(`[✗ ${name.toUpperCase()}] ${result.error}`);
      }
    });

    await Promise.allSettled(promises);

    return { channels, results };
  }

  /**
   * Get notification status summary
   */
  getConfiguredChannels(): {
    website: boolean;
    whatsapp: boolean;
    email: boolean;
  } {
    return {
      website: true, // Always available
      whatsapp: !!(this.whatsappApiUrl && this.whatsappApiToken),
      email: !!(this.emailWebhookUrl && this.emailWebhookToken),
    };
  }
}

export default NotificationService;
