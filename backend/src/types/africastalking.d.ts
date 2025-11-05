declare module 'africastalking' {
  interface ATConfig {
    apiKey: string;
    username: string;
  }
  
  interface SMSOptions {
    to: string[];
    message: string;
    from?: string;
  }

  interface SMSResult {
    SMSMessageData: {
      Message: string;
      Recipients: Array<{
        statusCode: number;
        number: string;
        status: string;
        cost: string;
        messageId: string;
      }>;
    };
  }
  
  interface SMS {
    send(options: SMSOptions): Promise<SMSResult>;
  }
  
  interface ATClient {
    SMS: SMS;
  }
  
  function AfricasTalking(config: ATConfig): ATClient;
  
  export = AfricasTalking;
}