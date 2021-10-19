const amqp = require('amqplib/callback_api');

const httpServer = require('http').createServer();
const io = require('socket.io')(httpServer);

const users = [];

let user = {
  id: null,
  socket: null,
};

io.on('connection', (socket) => {
  socket.on('disconnect', () => {
    console.log('socket disconnected');
  });
  socket.on('teste', (t) => {
    console.log(t);
  });
  console.log('connected');
  const userId = socket.handshake.query.userId;
  if (userId === user.id) {
    console.log(`User ${user.id} already connected, skipping...`);
    user.socket = socket;
    return;
  }

  user.id = userId;
  user.socket = socket;
  users.push(user);
  console.log('New user connected: ', user.id);
});

io.on('disconnect', () => {
  console.log('disconnected');
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

    channel.prefetch(1);

    channel.consume(
      queueName,
      function (msg) {
        console.log(' [x] Received %s', msg.content.toString());
        if (user.socket) {
          console.log(' [x] Emitting %s', msg.content.toString());
          user.socket.emit('ws_sfa::STEP', msg.content.toString());
        }
        setTimeout(() => channel.ack(msg), 500);
      },
      {
        noAck: false,
      },
    );
  });
});
