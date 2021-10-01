const amqp = require('amqplib/callback_api');

amqp.connect('amqp://localhost', function (connectionError, connection) {
  if (connectionError) throw connectionError;

  connection.createChannel(function (error1, channel) {
    if (error1) {
      throw error1;
    }
    const queueName = 'hello_world';

    channel.assertQueue(queueName, {
      durable: true,
    });

    console.log(
      ' [*] Waiting for messages in %s. To exit press CTRL+C',
      queueName,
    );

    channel.consume(
      queueName,
      function (msg) {
        console.log(' [x] Received %s', msg.content.toString());
      },
      {
        noAck: true,
      },
    );
  });
});
