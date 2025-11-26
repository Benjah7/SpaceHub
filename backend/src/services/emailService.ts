import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export class EmailService {
    /**
     * Send welcome email
     */
    static async sendWelcomeEmail(to: string, name: string) {
        try {
            await sgMail.send({
                to,
                from: process.env.SENDGRID_FROM_EMAIL!,
                subject: 'Welcome to Space Hub',
                html: `
          <h1>Welcome to Space Hub, ${name}!</h1>
          <p>Thank you for joining Kenya's premier commercial property marketplace.</p>
          <p>Start exploring available retail spaces in Nairobi today!</p>
        `
            });
        } catch (error) {
            console.error('Email send error:', error);
        }
    }

    /**
     * Send inquiry notification to owner
     */
    static async sendInquiryNotification(
        to: string,
        propertyName: string,
        tenantName: string,
        message: string
    ) {
        try {
            await sgMail.send({
                to,
                from: process.env.SENDGRID_FROM_EMAIL!,
                subject: `New Inquiry: ${propertyName}`,
                html: `
          <h2>You have a new inquiry</h2>
          <p><strong>Property:</strong> ${propertyName}</p>
          <p><strong>From:</strong> ${tenantName}</p>
          <p><strong>Message:</strong></p>
          <p>${message}</p>
          <p><a href="${process.env.FRONTEND_URL}/dashboard/inquiries">View and Respond</a></p>
        `
            });
        } catch (error) {
            console.error('Email send error:', error);
        }
    }

    /**
     * Send inquiry response notification to tenant
     */
    static async sendInquiryResponse(
        to: string,
        propertyName: string,
        response: string
    ) {
        try {
            await sgMail.send({
                to,
                from: process.env.SENDGRID_FROM_EMAIL!,
                subject: `Response to Your Inquiry: ${propertyName}`,
                html: `
          <h2>You have a response to your inquiry</h2>
          <p><strong>Property:</strong> ${propertyName}</p>
          <p><strong>Response:</strong></p>
          <p>${response}</p>
          <p><a href="${process.env.FRONTEND_URL}/inquiries">View Details</a></p>
        `
            });
        } catch (error) {
            console.error('Email send error:', error);
        }
    }

    /**
     * Send payment confirmation
     */
    static async sendPaymentConfirmation(
        to: string,
        propertyName: string,
        amount: number,
        receiptNumber: string
    ) {
        try {
            await sgMail.send({
                to,
                from: process.env.SENDGRID_FROM_EMAIL!,
                subject: 'Payment Confirmation - Space Hub',
                html: `
          <h2>Payment Confirmed</h2>
          <p><strong>Property:</strong> ${propertyName}</p>
          <p><strong>Amount:</strong> KES ${amount.toLocaleString()}</p>
          <p><strong>Receipt Number:</strong> ${receiptNumber}</p>
          <p>Thank you for your payment!</p>
        `
            });
        } catch (error) {
            console.error('Email send error:', error);
        }
    }

    /**
     * Send saved search alert
     */
    static async sendSavedSearchAlert(
        to: string,
        searchName: string,
        newPropertiesCount: number
    ) {
        try {
            await sgMail.send({
                to,
                from: process.env.SENDGRID_FROM_EMAIL!,
                subject: `New Properties Match Your Saved Search: ${searchName}`,
                html: `
          <h2>New Properties Available</h2>
          <p>${newPropertiesCount} new properties match your saved search "${searchName}".</p>
          <p><a href="${process.env.FRONTEND_URL}/search">View Properties</a></p>
        `
            });
        } catch (error) {
            console.error('Email send error:', error);
        }
    }

/**
 * Send verification approval email
 */
    static async sendVerificationApproval(email: string, name: string): Promise<void> {
        const msg = {
            to: email,
            from: process.env.SENDGRID_FROM_EMAIL!,
            subject: '✓ Your Space Hub Account is Verified',
            html: `
            <h2>Congratulations, ${name}!</h2>
            <p>Your Space Hub account has been verified.</p>
            <p><strong>Benefits of verification:</strong></p>
            <ul>
                <li>✓ Verified badge on your listings</li>
                <li>✓ Increased tenant trust</li>
                <li>✓ Higher visibility in search results</li>
                <li>✓ Priority support</li>
            </ul>
            <p>Your properties will now display the verified badge to potential tenants.</p>
            <p>
                <a href="${process.env.FRONTEND_URL}/dashboard" 
                   style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                    Go to Dashboard
                </a>
            </p>
        `
        };

        try {
            await sgMail.send(msg);
        } catch (error) {
            console.error('Error sending verification approval email:', error);
        }
    }

    /**
     * Send verification rejection email
     */
    static async sendVerificationRejection(
        email: string,
        name: string,
        reason: string
    ): Promise<void> {
        const msg = {
            to: email,
            from: process.env.SENDGRID_FROM_EMAIL!,
            subject: 'Space Hub Verification Update',
            html: `
            <h2>Hello ${name},</h2>
            <p>We've reviewed your verification request and need you to make some updates.</p>
            <p><strong>Reason:</strong></p>
            <p style="background-color: #FEF2F2; padding: 12px; border-left: 4px solid #DC2626; margin: 16px 0;">
                ${reason}
            </p>
            <p><strong>Next Steps:</strong></p>
            <ol>
                <li>Review the feedback above</li>
                <li>Update your verification documents</li>
                <li>Resubmit your verification request</li>
            </ol>
            <p>
                <a href="${process.env.FRONTEND_URL}/dashboard/verification" 
                   style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                    Update Documents
                </a>
            </p>
            <p style="color: #6B7280; font-size: 14px;">
                If you have questions, please contact our support team.
            </p>
        `
        };

        try {
            await sgMail.send(msg);
        } catch (error) {
            console.error('Error sending verification rejection email:', error);
        }
    }
}