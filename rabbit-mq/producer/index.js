const amqp = require('amqplib/callback_api');

function init(error, connection) {
  if (error) throw error;

  connection.createChannel(function (channelError, channel) {
    if (channelError) throw channelError;

    const queue = 'hello_world';
    const msg = process.argv.slice(2).join(' ') || 'EMPTY';

    channel.assertQueue(queue, {
      durable: true,
    });

    channel.sendToQueue(queue, Buffer.from(msg), {
      persistent: true,
    });

    console.log(" [x] Sent '%s' to queue '%s", msg, queue);

    // closeConnection
    setTimeout(function () {
      connection.close();
      process.exit(0);
    }, 500);
  });
}

amqp.connect('amqp://localhost', init);
