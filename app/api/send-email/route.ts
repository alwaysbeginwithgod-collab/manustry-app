import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// ✅ Initialize Resend with your API key
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

export async function POST(request: Request) {
  try {
    const { email, subject, message, userName, userEmail, source } = await request.json();

    console.log('📧 Email request received:', { email, subject, source });

    // Validate required fields
    if (!email || !subject || !message) {
      console.log('❌ Missing fields:', { email: !!email, subject: !!subject, message: !!message });
      return NextResponse.json(
        { error: 'Please fill in all fields' },
        { status: 400 }
      );
    }

    // ✅ Check if Resend is configured
    if (!resend) {
      console.error('❌ Resend API key not configured');
      return NextResponse.json(
        { error: 'Email service not configured. Please try again later.' },
        { status: 500 }
      );
    }

    // ✅ Send email using Resend
    console.log('📧 Sending email via Resend...');
    
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
              <p style="margin: 0; white-space: pre-wrap;">${message.replace(/\n/g, '<br>')}</p>
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
      console.error('❌ Resend error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to send email' },
        { status: 500 }
      );
    }

    console.log('✅ Email sent successfully:', data?.id);
    return NextResponse.json({ 
      success: true, 
      message: 'Email sent successfully!',
      id: data?.id 
    });

  } catch (error) {
    console.error('❌ Server error:', error);
    return NextResponse.json(
      { error: 'Internal server error. Please try again.' },
      { status: 500 }
    );
  }
}