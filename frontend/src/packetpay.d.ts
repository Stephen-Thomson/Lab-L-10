declare module '@packetpay/js' {
    // Declare the PacketPay class and its constructor options
    interface PacketPayOptions {
      dojoURL: string;
      amount: number;
    }
  
    class PacketPay {
      constructor(options: PacketPayOptions);
      pay(): Promise<void>;
    }
  
    export = PacketPay;
  }