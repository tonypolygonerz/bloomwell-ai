import { Resend } from 'resend';

const apiKey = process.env.RESEND_API_KEY;
// Initialize client only if API key is present to avoid build/test failures
const resend = apiKey ? new Resend(apiKey) : null;

export async function sendVerificationEmail(
  email: string,
  name: string,
  verificationToken: string
) {
  try {
    const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify-email?token=${verificationToken}`;

    if (!resend) {
      // Fallback for CI/local without API key
      console.log('Resend not configured. Skipping sendVerificationEmail.');
      return { success: true, messageId: 'skipped-no-api-key' };
    }

    const { data, error } = await resend.emails.send({
      from: 'Bloomwell AI <noreply@bloomwell-ai.com>',
      to: [email],
      subject: 'Welcome to Bloomwell AI - Verify your email',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #10B981; font-size: 28px; margin: 0;">Welcome to Bloomwell AI!</h1>
            <p style="color: #6B7280; font-size: 16px; margin: 10px 0 0 0;">Your AI-powered grant discovery platform</p>
          </div>
          
          <div style="background: #F9FAFB; padding: 30px; border-radius: 8px; margin-bottom: 30px;">
            <h2 style="color: #111827; font-size: 20px; margin: 0 0 15px 0;">Hi ${name}!</h2>
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
              Thank you for joining Bloomwell AI! We're excited to help your organization discover more funding opportunities.
            </p>
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
              To get started with your 14-day free trial, please verify your email address by clicking the button below:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background: #10B981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
                Verify Email Address
              </a>
            </div>
            
            <p style="color: #6B7280; font-size: 14px; margin: 20px 0 0 0;">
              If the button doesn't work, copy and paste this link into your browser:<br>
              <a href="${verificationUrl}" style="color: #10B981; word-break: break-all;">${verificationUrl}</a>
            </p>
          </div>
          
          <div style="background: #ECFDF5; padding: 20px; border-radius: 8px; border-left: 4px solid #10B981;">
            <h3 style="color: #065F46; font-size: 16px; margin: 0 0 10px 0;">What's next?</h3>
            <ul style="color: #047857; font-size: 14px; margin: 0; padding-left: 20px;">
              <li>Access to 73,000+ federal grants</li>
              <li>AI-powered grant matching</li>
              <li>Proposal writing assistance</li>
              <li>Deadline tracking and reminders</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #E5E7EB;">
            <p style="color: #6B7280; font-size: 12px; margin: 0;">
              This email was sent to ${email}. If you didn't create an account, you can safely ignore this email.
            </p>
            <p style="color: #6B7280; font-size: 12px; margin: 5px 0 0 0;">
              © 2024 Bloomwell AI. All rights reserved.
            </p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      throw new Error('Failed to send verification email');
    }

    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error('Email sending error:', error);
    throw new Error('Failed to send verification email');
  }
}

export async function sendWelcomeEmail(email: string, name: string) {
  try {
    if (!resend) {
      console.log('Resend not configured. Skipping sendWelcomeEmail.');
      return { success: true, messageId: 'skipped-no-api-key' };
    }

    const { data, error } = await resend.emails.send({
      from: 'Bloomwell AI <noreply@bloomwell-ai.com>',
      to: [email],
      subject: 'Welcome to Bloomwell AI - Your trial has started!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #10B981; font-size: 28px; margin: 0;">Welcome to Bloomwell AI!</h1>
            <p style="color: #6B7280; font-size: 16px; margin: 10px 0 0 0;">Your 14-day free trial is now active</p>
          </div>
          
          <div style="background: #F9FAFB; padding: 30px; border-radius: 8px; margin-bottom: 30px;">
            <h2 style="color: #111827; font-size: 20px; margin: 0 0 15px 0;">Hi ${name}!</h2>
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
              Your email has been verified and your 14-day free trial is now active! You now have full access to:
            </p>
            
            <div style="background: #ECFDF5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #065F46; font-size: 16px; margin: 0 0 15px 0;">🎉 What you can do now:</h3>
              <ul style="color: #047857; font-size: 14px; margin: 0; padding-left: 20px;">
                <li>Search through 73,000+ federal grants</li>
                <li>Get AI-powered grant recommendations</li>
                <li>Access proposal writing assistance</li>
                <li>Set up deadline tracking and reminders</li>
                <li>Connect with your organization's grant history</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXTAUTH_URL}/dashboard" 
                 style="background: #10B981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
                Start Exploring Grants
              </a>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #E5E7EB;">
            <p style="color: #6B7280; font-size: 12px; margin: 0;">
              Questions? Reply to this email or visit our help center.
            </p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      throw new Error('Failed to send welcome email');
    }

    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error('Email sending error:', error);
    throw new Error('Failed to send welcome email');
  }
}

export async function sendPasswordResetEmail(
  email: string,
  name: string,
  resetToken: string
) {
  try {
    const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`;

    if (!resend) {
      console.log('Resend not configured. Skipping sendPasswordResetEmail.');
      return { success: true, messageId: 'skipped-no-api-key' };
    }

    const { data, error } = await resend.emails.send({
      from: 'Bloomwell AI <noreply@bloomwell-ai.com>',
      to: [email],
      subject: 'Reset your Bloomwell AI password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #10B981; font-size: 28px; margin: 0;">Password Reset Request</h1>
            <p style="color: #6B7280; font-size: 16px; margin: 10px 0 0 0;">Bloomwell AI</p>
          </div>
          
          <div style="background: #F9FAFB; padding: 30px; border-radius: 8px; margin-bottom: 30px;">
            <h2 style="color: #111827; font-size: 20px; margin: 0 0 15px 0;">Hi ${name}!</h2>
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
              We received a request to reset your password for your Bloomwell AI account.
            </p>
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
              Click the button below to create a new password. This link will expire in 1 hour for security reasons.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background: #10B981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
                Reset Password
              </a>
            </div>
            
            <p style="color: #6B7280; font-size: 14px; margin: 20px 0 0 0;">
              If the button doesn't work, copy and paste this link into your browser:<br>
              <a href="${resetUrl}" style="color: #10B981; word-break: break-all;">${resetUrl}</a>
            </p>
          </div>
          
          <div style="background: #FEF2F2; padding: 20px; border-radius: 8px; border-left: 4px solid #EF4444;">
            <p style="color: #991B1B; font-size: 14px; margin: 0;">
              <strong>Didn't request this?</strong><br>
              If you didn't request a password reset, you can safely ignore this email. Your password will not be changed.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #E5E7EB;">
            <p style="color: #6B7280; font-size: 12px; margin: 0;">
              This email was sent to ${email}. For security reasons, this link will expire in 1 hour.
            </p>
            <p style="color: #6B7280; font-size: 12px; margin: 5px 0 0 0;">
              © 2024 Bloomwell AI. All rights reserved.
            </p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      throw new Error('Failed to send password reset email');
    }

    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error('Email sending error:', error);
    throw new Error('Failed to send password reset email');
  }
}
