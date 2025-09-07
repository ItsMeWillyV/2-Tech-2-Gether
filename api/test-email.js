const nodemailer = require('nodemailer');
require('dotenv').config();

// Create test email function
async function sendTestEmail() {
  try {
    // Create transporter object using SMTP transport
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false // For development/testing
      }
    });

    // Verify connection configuration
    console.log('Verifying email configuration...');
    await transporter.verify();
    console.log('✅ Email configuration is valid!');

    // Define email options
    const mailOptions = {
      from: {
        name: 'Tech2Gether Test',
        address: process.env.EMAIL_USER
      },
      to: 'itsmewillyv@gmail.com',
      subject: '🧪 Test Email from Tech2Gether API',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Tech2Gether</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Email Test Successful!</p>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-top: 0;">Hello Willy! 👋</h2>
            
            <p style="color: #555; line-height: 1.6; font-size: 16px;">
              This is a test email from your Tech2Gether API email configuration. If you're reading this, 
              your email setup is working perfectly!
            </p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">📧 Email Configuration Details:</h3>
              <ul style="color: #555; line-height: 1.8;">
                <li><strong>Host:</strong> ${process.env.EMAIL_HOST}</li>
                <li><strong>Port:</strong> ${process.env.EMAIL_PORT}</li>
                <li><strong>From:</strong> ${process.env.EMAIL_USER}</li>
                <li><strong>Date:</strong> ${new Date().toLocaleString()}</li>
              </ul>
            </div>
            
            <p style="color: #555; line-height: 1.6;">
              You can now use this email configuration for:
            </p>
            
            <ul style="color: #555; line-height: 1.8;">
              <li>User registration confirmations</li>
              <li>Password reset emails</li>
              <li>Event notifications</li>
              <li>Contact form submissions</li>
            </ul>
            
            <div style="text-align: center; margin-top: 30px;">
              <p style="color: #888; font-size: 14px;">
                Sent from Tech2Gether API • ${new Date().getFullYear()}
              </p>
            </div>
          </div>
        </div>
      `,
      text: `
Hello Willy!

This is a test email from your Tech2Gether API email configuration. 
If you're reading this, your email setup is working perfectly!

Email Configuration Details:
- Host: ${process.env.EMAIL_HOST}
- Port: ${process.env.EMAIL_PORT}
- From: ${process.env.EMAIL_USER}
- Date: ${new Date().toLocaleString()}

You can now use this email configuration for:
- User registration confirmations
- Password reset emails
- Event notifications
- Contact form submissions

Sent from Tech2Gether API • ${new Date().getFullYear()}
      `
    };

    // Send mail
    console.log('Sending test email...');
    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ Email sent successfully!');
    console.log('📧 Message ID:', info.messageId);
    console.log('📬 To:', mailOptions.to);
    console.log('📋 Subject:', mailOptions.subject);
    
    // Gmail specific info
    if (process.env.EMAIL_HOST === 'smtp.gmail.com') {
      console.log('🔗 Preview URL (Gmail):', `https://mail.google.com/`);
    }

  } catch (error) {
    console.error('❌ Error sending email:', error.message);
    
    // Provide helpful error messages
    if (error.code === 'EAUTH') {
      console.error('🔐 Authentication failed. Please check:');
      console.error('   - Your EMAIL_USER is correct');
      console.error('   - Your EMAIL_PASSWORD is an App Password (not your regular Gmail password)');
      console.error('   - 2-Factor Authentication is enabled on your Gmail account');
    } else if (error.code === 'ECONNECTION') {
      console.error('🌐 Connection failed. Please check:');
      console.error('   - Your internet connection');
      console.error('   - EMAIL_HOST and EMAIL_PORT settings');
    } else if (error.code === 'EMESSAGE') {
      console.error('📧 Message error. Please check:');
      console.error('   - Email addresses are valid');
      console.error('   - Message content is properly formatted');
    }
    
    console.error('\n💡 Current .env configuration:');
    console.error('   EMAIL_HOST:', process.env.EMAIL_HOST || 'NOT SET');
    console.error('   EMAIL_PORT:', process.env.EMAIL_PORT || 'NOT SET');
    console.error('   EMAIL_USER:', process.env.EMAIL_USER || 'NOT SET');
    console.error('   EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '***SET***' : 'NOT SET');
  }
}

// Run the test
console.log('🚀 Starting Tech2Gether Email Test...\n');
sendTestEmail();
