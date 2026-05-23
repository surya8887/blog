import amqp from 'amqplib';

class MessageBroker {
  private connection?: amqp.Connection;
  private channel?: amqp.Channel;

  async connect(url: string) {
    try {
      this.connection = await amqp.connect(url);
      this.channel = await this.connection.createChannel();
      console.log('RabbitMQ connected');
    } catch (error) {
      console.error('RabbitMQ connection failed:', error);
      throw error;
    }
  }

  getChannel() {
    if (!this.channel) {
      throw new Error('Channel not initialized. Call connect() first.');
    }
    return this.channel;
  }
}

export const broker = new MessageBroker();
