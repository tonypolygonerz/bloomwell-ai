interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    content: string;
    contentType: string;
  }>;
}

interface RSVPEmailData {
  userName: string;
  webinarTitle: string;
  webinarDate: string;
  joinUrl: string;
  calendarInvite?: string;
}

interface ReminderEmailData {
  userName: string;
  webinarTitle: string;
  webinarDate: string;
  joinUrl: string;
  timeUntilEvent: string;
}

export class EmailService {
  private static async sendEmail(emailData: EmailData): Promise<boolean> {
    try {
      // For now, we'll use a simple console log approach
      // In production, you would integrate with an email service like SendGrid, Resend, or AWS SES

      console.log('📧 Email would be sent:', {
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.html.substring(0, 100) + '...',
        hasAttachments: !!emailData.attachments?.length,
      });

      // Simulate email sending
      await new Promise(resolve => setTimeout(resolve, 100));

      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }

  static async sendRSVPConfirmation(data: RSVPEmailData): Promise<boolean> {
    const { userName, webinarTitle, webinarDate, joinUrl, calendarInvite } =
      data;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Webinar Registration Confirmation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .event-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🎉 You're Registered!</h1>
          <p>Bloomwell AI Webinar</p>
        </div>
        
        <div class="content">
          <h2>Hi ${userName},</h2>
          <p>Thank you for registering for our upcoming webinar! We're excited to have you join us.</p>
          
          <div class="event-details">
            <h3>📅 Event Details</h3>
            <p><strong>Title:</strong> ${webinarTitle}</p>
            <p><strong>Date & Time:</strong> ${new Date(
              webinarDate
            ).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              timeZoneName: 'short',
            })}</p>
          </div>
          
          <p>We'll send you reminder emails 24 hours and 1 hour before the event.</p>
          
          <div style="text-align: center;">
            <a href="${joinUrl}" class="button">View Event Details</a>
          </div>
          
          <div class="footer">
            <p>Questions? Reply to this email or visit our <a href="https://bloomwell-ai.com">website</a></p>
            <p>© 2024 Bloomwell AI. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Hi ${userName},
      
      Thank you for registering for our upcoming webinar!
      
      Event Details:
      Title: ${webinarTitle}
      Date & Time: ${new Date(webinarDate).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short',
      })}
      
      View event details: ${joinUrl}
      
      We'll send you reminder emails 24 hours and 1 hour before the event.
      
      Questions? Reply to this email or visit our website at https://bloomwell-ai.com
      
      © 2024 Bloomwell AI. All rights reserved.
    `;

    return this.sendEmail({
      to: data.userName.includes('@')
        ? data.userName
        : `${data.userName}@example.com`, // Fallback for demo
      subject: `You're registered for ${webinarTitle} - Bloomwell AI`,
      html,
      text,
      attachments: calendarInvite
        ? [
            {
              filename: 'webinar.ics',
              content: calendarInvite,
              contentType: 'text/calendar',
            },
          ]
        : undefined,
    });
  }

  static async sendReminderEmail(
    data: ReminderEmailData,
    type: '24h' | '1h' | '15m'
  ): Promise<boolean> {
    const { userName, webinarTitle, webinarDate, joinUrl, timeUntilEvent } =
      data;

    let subject = '';
    let timeText = '';

    switch (type) {
      case '24h':
        subject = `Tomorrow: ${webinarTitle}`;
        timeText = 'Tomorrow';
        break;
      case '1h':
        subject = `Starting soon: ${webinarTitle}`;
        timeText = 'In 1 hour';
        break;
      case '15m':
        subject = `Join now: ${webinarTitle}`;
        timeText = 'Starting now!';
        break;
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Webinar Reminder</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .event-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
          .urgent { background: #fff3cd; border-left-color: #ffc107; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🔔 Webinar Reminder</h1>
          <p>Bloomwell AI</p>
        </div>
        
        <div class="content">
          <h2>Hi ${userName},</h2>
          <p>Just a friendly reminder about your upcoming webinar!</p>
          
          <div class="event-details ${type === '15m' ? 'urgent' : ''}">
            <h3>📅 ${timeText}</h3>
            <p><strong>Title:</strong> ${webinarTitle}</p>
            <p><strong>Date & Time:</strong> ${new Date(
              webinarDate
            ).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              timeZoneName: 'short',
            })}</p>
          </div>
          
          <div style="text-align: center;">
            <a href="${joinUrl}" class="button">${type === '15m' ? 'Join Live Now' : 'View Event Details'}</a>
          </div>
          
          <div class="footer">
            <p>Questions? Reply to this email or visit our <a href="https://bloomwell-ai.com">website</a></p>
            <p>© 2024 Bloomwell AI. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Hi ${userName},
      
      Just a friendly reminder about your upcoming webinar!
      
      ${timeText}
      Title: ${webinarTitle}
      Date & Time: ${new Date(webinarDate).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short',
      })}
      
      ${type === '15m' ? 'Join live now' : 'View event details'}: ${joinUrl}
      
      Questions? Reply to this email or visit our website at https://bloomwell-ai.com
      
      © 2024 Bloomwell AI. All rights reserved.
    `;

    return this.sendEmail({
      to: data.userName.includes('@')
        ? data.userName
        : `${data.userName}@example.com`,
      subject,
      html,
      text,
    });
  }

  static generateCalendarInvite(webinar: {
    title: string;
    description: string;
    scheduledDate: string;
    duration: number;
    jitsiRoomUrl?: string;
  }): string {
    const startDate = new Date(webinar.scheduledDate);
    const endDate = new Date(
      startDate.getTime() + webinar.duration * 60 * 1000
    );

    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    return [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Bloomwell AI//Webinar//EN',
      'BEGIN:VEVENT',
      `DTSTART:${formatDate(startDate)}`,
      `DTEND:${formatDate(endDate)}`,
      `SUMMARY:${webinar.title}`,
      `DESCRIPTION:${webinar.description}`,
      `LOCATION:${webinar.jitsiRoomUrl || 'Online Event'}`,
      'STATUS:CONFIRMED',
      'SEQUENCE:0',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');
  }
}
