import app from './app.js';

const PORT = process.env.PORT || 3000;

// Ana route'u app.js'e taşıyoruz
app.get('/', async (request, reply) => {
  reply.send({ message: 'Welcome to the Pong Game API!' });
});

app.listen({ port: PORT }, (err, address) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
  console.log(`🚀 Server running at ${address}`);
});
