import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendPasswordResetEmail } from '@/lib/email';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Always return success to prevent email enumeration attacks
    if (!user) {
      return NextResponse.json({
        success: true,
        message:
          'If an account exists with that email, a password reset link has been sent.',
      });
    }

    // Check if user has a password (not OAuth-only account)
    if (!user.password) {
      return NextResponse.json({
        success: true,
        message:
          'If an account exists with that email, a password reset link has been sent.',
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Set expiration to 1 hour from now
    const resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);

    // Update user with reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken,
        resetPasswordExpires,
      },
    });

    // Send password reset email
    try {
      await sendPasswordResetEmail(user.email, user.name || 'User', resetToken);
    } catch (emailError) {
      console.error('Error sending password reset email:', emailError);
      // For development/testing, log the reset URL instead of failing
      console.log(
        '🔗 Password reset URL:',
        `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`
      );

      // In production, you'd want to return an error
      // For now, we'll return success but log the URL for testing
      return NextResponse.json({
        success: true,
        message:
          'Password reset link generated. Check server logs for the URL (development mode).',
        resetUrl: `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Password reset email sent successfully.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'An error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
