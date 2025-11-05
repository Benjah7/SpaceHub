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
}