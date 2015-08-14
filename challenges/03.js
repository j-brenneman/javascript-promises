var db = require('monk')('localhost/stocks-example')
var Post = db.get('posts')
var Comment = db.get('comments')

// delete all posts and
// then insert 4 different posts
// then when all posts have been inserted
// then close the database connection with db.close()

Post.remove({}).then(function () {
  return Promise.all([
    Post.insert({one: 1}),
    Post.insert({two: 2}),
    Post.insert({three: 3}),
    Post.insert({four: 4})
  ])
}).then(function (data) {
  console.log(data);
  db.close()
})
