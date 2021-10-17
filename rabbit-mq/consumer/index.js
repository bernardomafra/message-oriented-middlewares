const amqp = require('amqplib/callback_api');

const httpServer = require('http').createServer();
const io = require('socket.io')(httpServer);

io.on('connection', (socket) => {
  console.log('connected: ', socket.id, socket.handshake.query);
  socket.emit('teste', '1234');
  // ...
});

httpServer.listen(3030);

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
      ' [*] Waiting for messages in queue "%s". To exit press CTRL+C',
      queueName,
    );

    channel.consume(
      queueName,
      function (msg) {
        console.log(' [x] Received %s', msg.content.toString());
        io.emit('ws_sfa::STEP', msg.content.toString());
      },
      {
        noAck: true,
      },
    );
  });
});
