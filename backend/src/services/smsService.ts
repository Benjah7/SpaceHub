import AfricasTalking from 'africastalking';

const client = AfricasTalking({
    apiKey: process.env.AT_API_KEY!,
    username: process.env.AT_USERNAME!
});

const sms = client.SMS;

export class SMSService {
    /**
     * Send SMS notification
     */
    static async sendSMS(to: string, message: string): Promise<any> {
        try {
            const result = await sms.send({
                to: [to],
                message,
                from: 'SPACEHUB'
            });

            return result;
        } catch (error) {
            console.error('SMS send error:', error);
            throw error;
        }
    }

    /**
     * Send inquiry notification
     */
    static async sendInquiryNotification(to: string, propertyName: string, tenantName: string) {
        const message = `New inquiry for ${propertyName} from ${tenantName}. Check Space Hub to respond.`;
        return this.sendSMS(to, message);
    }

    /**
     * Send payment confirmation
     */
    static async sendPaymentConfirmation(to: string, amount: number, receiptNumber: string) {
        const message = `Payment of KES ${amount} confirmed. Receipt: ${receiptNumber}. Thank you for using Space Hub!`;
        return this.sendSMS(to, message);
    }

    /**
     * Send viewing reminder
     */
    static async sendViewingReminder(to: string, propertyName: string, date: string) {
        const message = `Reminder: Property viewing at ${propertyName} on ${date}. Contact owner if you need to reschedule.`;
        return this.sendSMS(to, message);
    }

    /**
     * Send saved search alert
     */
    static async sendSavedSearchAlert(to: string, newPropertiesCount: number) {
        const message = `${newPropertiesCount} new properties match your saved search on Space Hub. Visit app to view.`;
        return this.sendSMS(to, message);
    }
}