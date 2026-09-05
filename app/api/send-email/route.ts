import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// ✅ Initialize Resend only if API key is available
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

export async function POST(request: Request) {
  try {
    const { email, subject, message, userName, userEmail, source } = await request.json();

    // Validate required fields
    if (!email || !subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // ✅ Check if Resend is configured
    if (!resend) {
      console.warn('⚠️ Resend API key not configured. Email will not be sent.');
      
      // ✅ Still return success for development/testing
      if (process.env.NODE_ENV === 'development') {
        return NextResponse.json({ 
          success: true, 
          message: 'Email would be sent in production (dev mode)',
          devMode: true
        });
      }
      
      return NextResponse.json(
        { error: 'Email service not configured. Please try again later.' },
        { status: 500 }
      );
    }

    // ✅ Send email using Resend
    const { data, error } = await resend.emails.send({
      from: `MANUSTRY <${process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'}>`,
      to: ['always.begin.with.god@gmail.com'],
      replyTo: userEmail || email,
      subject: `📧 MANUSTRY Contact Form: ${subject}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333; }
            .header { background: #C9A84C; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .header h1 { color: #0F1318; margin: 0; font-size: 24px; }
            .content { background: #f5f0eb; padding: 30px; border-radius: 0 0 8px 8px; }
            .label { font-weight: bold; color: #C9A84C; }
            .message-box { background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #C9A84C; margin: 15px 0; }
            .footer { text-align: center; padding: 20px; color: #888; font-size: 12px; }
            .badge { display: inline-block; background: #C9A84C; color: #0F1318; padding: 2px 12px; border-radius: 12px; font-size: 10px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>✝️ MANUSTRY</h1>
            <p style="color: #1A1F2E; margin: 0;">New Contact Form Submission</p>
          </div>
          <div class="content">
            <p><span class="badge">${source || 'contact'}</span></p>
            <p><span class="label">📧 From:</span> ${userEmail || email}</p>
            <p><span class="label">👤 Name:</span> ${userName || 'Not provided'}</p>
            <p><span class="label">📝 Subject:</span> ${subject}</p>
            <div class="message-box">
              <p style="margin: 0; white-space: pre-wrap;">${message}</p>
            </div>
            <p style="color: #888; font-size: 14px;">
              Reply to: <a href="mailto:${userEmail || email}" style="color: #C9A84C;">${userEmail || email}</a>
            </p>
          </div>
          <div class="footer">
            <p>This email was sent from MANUSTRY contact form.</p>
            <p>© ${new Date().getFullYear()} MANUSTRY - A Hand in Ministry</p>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('Email error:', error);
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Email sent successfully!',
      id: data?.id 
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}