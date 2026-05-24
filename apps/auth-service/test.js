import express from 'express';
const app = express();
app.listen(5001, () => console.log('Listening on 5001'));
setInterval(()=>console.log('hi'), 1000);
