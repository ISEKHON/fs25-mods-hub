import nodemailer from 'nodemailer'

// Create email transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  })
}

// Send mod submission notification to admin
export const sendModSubmissionEmail = async (submission) => {
  if (!process.env.SMTP_USER || !process.env.ADMIN_EMAIL) {
    console.log('Email not configured, skipping notification')
    return
  }

  try {
    const transporter = createTransporter()
    
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: process.env.ADMIN_EMAIL,
      subject: `New Mod Submission: ${submission.title}`,
      html: `
        <h2>New Mod Submission Received</h2>
        <h3>${submission.title}</h3>
        <p><strong>Author:</strong> ${submission.author_name}</p>
        <p><strong>Email:</strong> ${submission.contact_email}</p>
        <p><strong>Category:</strong> ${submission.category}</p>
        <p><strong>Version:</strong> ${submission.version}</p>
        <p><strong>Pricing:</strong> ${submission.pricing_type === 'paid' ? `$${submission.price} ${submission.currency}` : 'Free'}</p>
        
        <h4>Description:</h4>
        <p>${submission.description}</p>
        
        <h4>Download Link:</h4>
        <a href="${submission.download_link}">${submission.download_link}</a>
        
        <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
        
        <p>Please review this submission in the admin panel.</p>
      `
    }
    
    await transporter.sendMail(mailOptions)
    console.log('Submission notification sent successfully')
  } catch (error) {
    console.error('Failed to send submission notification:', error)
  }
}

// Send approval/rejection notification to submitter
export const sendStatusNotification = async (submission, status, adminNotes = '', rejectionReason = '') => {
  if (!process.env.SMTP_USER) {
    console.log('Email not configured, skipping notification')
    return
  }

  try {
    const transporter = createTransporter()
    
    let subject, html
    
    if (status === 'approved') {
      subject = `Mod Approved: ${submission.title}`
      html = `
        <h2>🎉 Congratulations! Your Mod Has Been Approved</h2>
        <h3>${submission.title}</h3>
        <p>Your mod has been approved and is now live on FS25 Mods Hub!</p>
        ${adminNotes ? `<p><strong>Admin Notes:</strong> ${adminNotes}</p>` : ''}
        <p>Thank you for contributing to the FS25 community!</p>
        <p>You can view your mod at: <a href="${process.env.FRONTEND_URL}">FS25 Mods Hub</a></p>
      `
    } else if (status === 'rejected') {
      subject = `Mod Submission Update: ${submission.title}`
      html = `
        <h2>Mod Submission Status Update</h2>
        <h3>${submission.title}</h3>
        <p>Unfortunately, your mod submission has been rejected.</p>
        ${rejectionReason ? `<p><strong>Reason:</strong> ${rejectionReason}</p>` : ''}
        ${adminNotes ? `<p><strong>Admin Notes:</strong> ${adminNotes}</p>` : ''}
        <p>You can resubmit your mod after addressing the issues mentioned above.</p>
        <p>Submit again at: <a href="${process.env.FRONTEND_URL}/upload">Upload Page</a></p>
      `
    }
    
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: submission.contact_email,
      subject,
      html
    }
    
    await transporter.sendMail(mailOptions)
    console.log(`${status} notification sent successfully`)
  } catch (error) {
    console.error(`Failed to send ${status} notification:`, error)
  }
}

// Send welcome email to new developers
export const sendWelcomeEmail = async (developer) => {
  if (!process.env.SMTP_USER) {
    console.log('Email not configured, skipping welcome email')
    return
  }

  try {
    const transporter = createTransporter()
    
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: developer.email,
      subject: 'Welcome to FS25 Mods Hub!',
      html: `
        <h2>Welcome to FS25 Mods Hub, ${developer.name}! 🚀</h2>
        <p>Thank you for joining our community of Farming Simulator 25 modders.</p>
        <p>Your developer profile has been created and you can now:</p>
        <ul>
          <li>Submit mods for review and approval</li>
          <li>Manage your published mods</li>
          <li>Interact with the community</li>
          <li>Track your mod statistics</li>
        </ul>
        <p>Start by submitting your first mod: <a href="${process.env.FRONTEND_URL}/upload">Upload a Mod</a></p>
        <p>Best regards,<br>The FS25 Mods Hub Team</p>
      `
    }
    
    await transporter.sendMail(mailOptions)
    console.log('Welcome email sent successfully')
  } catch (error) {
    console.error('Failed to send welcome email:', error)
  }
}

// Individual email functions for different types
export const sendModApprovalEmail = async (email, data) => {
  return sendStatusNotification({ author_email: email, ...data }, 'approved', data.reviewNotes || '')
}

export const sendModRejectionEmail = async (email, data) => {
  return sendStatusNotification({ author_email: email, ...data }, 'rejected', '', data.reviewNotes || '')
}
