import WebSocket from 'ws';

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJvemt5eWhhdGljZUBnbWFpbC5jb20iLCJ1c2VybmFtZSI6ImhvemtheWEiLCJpYXQiOjE3NTM2MTg0OTd9.CgIEoR3nUyhUZkUAw_BMIv5oIT5lulMhqsyU52_-MKg';
const ws1 = new WebSocket('ws://localhost:3000/ws', token);

const token2 = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJoYXRpY2Vvemt5MjhAZ21haWwuY29tIiwidXNlcm5hbWUiOiJza2F5bmFyIiwiaWF0IjoxNzUzNjE4Njg3fQ.21Ib9P4gSTnofjIQbY2w4-CUakMPhcOYsT0JArcOkdc';
const ws2 = new WebSocket('ws://localhost:3000/ws', token2);

ws1.on('open', () => {
  console.log('🎮 [User1] bağlandı');

  ws1.send(JSON.stringify({
    type: 'game',
    event: 'join',
    data: {}
  }));
});

ws2.on('open', () => {
  console.log('🎮 [User2] bağlandı');

  ws2.send(JSON.stringify({
    type: 'game',
    event: 'start',
    data: {}
  }));
  ws2.send(JSON.stringify({
        type: 'game',
        event: 'move',
        data: { direction: 'right' }
      }));
});



