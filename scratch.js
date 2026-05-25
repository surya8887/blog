const http = require('http');
http.get('http://localhost:5001/api/v1/posts?limit=1', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const post = JSON.parse(data).data.docs[0];
    if (!post) return console.log("No post found");
    console.log("Post ID:", post._id);
    http.get('http://localhost:5001/api/v1/posts/' + post._id, (res2) => {
      let data2 = '';
      res2.on('data', chunk => data2 += chunk);
      res2.on('end', () => {
        console.log("Single Post:", data2);
      });
    });
  });
});
