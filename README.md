# Promises

## Objectives

By the end of this lesson you should be able to:

- Use `arguments` to inspect the arguments that are passed to `then`
- Refactor async code (that supports promises) to use promises instead of callbacks using `then`
- Describe how `then` is _chainable_ and how data moves from one `then` to the next, especially when `then` returns a promise
- Write chained `then` promises
- Use `Promise.all` to wait for an array of promises to resolve

## Set the stage

_Why_?:  Callbacks can become difficult to work with when you are making several asynchronous calls.  Promises are a common and _awesome_ way to help make asynchronous code easier to work with.

Promises can be challenging to reason about at first.  Keep a sunny disposition and calmly and methodically work your way through.  Pause to come up with your own examples, refactor existing code to promises, find an watch new videos etc...  Just sort of _live_ in and around promises for a little while.  If this takes you a week - no worries!

Promises are becoming as fundamental as Strings or other data types in JavaScript.  They appear in almost every JavaScript framework and will play an increasingly important role in JavaScript in the future.

## Activities

**#1 - Read up a _little_**

* Read https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise - especially the diagram near the top
* Read over http://www.html5rocks.com/en/tutorials/es6/promises/
  - Pay attention to anything related to `then`
* Watch https://www.youtube.com/watch?v=wc72cyYt8-c

OK - so promises make it so you can turn this code:

```js
$.getJSON('/stuff', function (data) { })
```

Into this:

```js
$.getJSON('/stuff').then(function (data) { })
```

See the difference?  The second one has a subtle, but incredible powerful difference.  This might make it clearer.  Take this code:

```js
var makeRequest = function (cb) {
  $.getJSON('/stuff', function (data) {
    cb(data)
  })
}

makeRequest(function (data) {
  // do stuff with data
})
```

```js
var makeRequest = function () {
  $.getJSON('/stuff')
}

var promise = makeRequest();
promise.then(function (data) { })
```

See what happened there?  You can now _return_ a promise, which means you don't have to pass in a callback.

> **Astute Developer**: Uh... big deal right?  You just changed where the callbacks were.  Seems like you are rearranging deck chairs on the Titanic here.

---

> **Seasoned Developer**: Be patient little grasshopper.  I _promise_ you'll see (yuk! yuk!).  See what I did there?  I said "I _promise_"...

---

> **Astute Developer**: oh brother...  OK, move on please


**#2 - Understand `then` by experimentation**

Imagine a Mongo / Monk script that needs to:

- Remove all records
- Once all records are removed, add a new record
- Once that record is inserted, find all records and print them out

That code will look like this:

```js
users.remove({}, function (err) {
  users.insert({name: 'Joe'}, function (err, result) {
    users.find({}, function (err, results) {
      db.close()
    })
  })
})
```

So how do you convert that to use promises?  It turns out that secretly Monk already returns promises!  Actually, it's not so secret - it's [right there](https://github.com/Automattic/monk#promises) in the docs.  What does that mean?

Go into `01_playground.js`, add the following line and run the file:

```js
console.log(users.remove({}));
```

The output will look something like:

```js
{ col:
   { manager:
      { driver: [Object],
        helper: [Object],
        collections: [Object],
        options: [Object] },
     driver:
      { _construct_args: [],
    //...
```

That output isn't _too_ helpful, but it proves something.  It proves that `users.remove()` _returns_ something - which is key.  What does it return?  Let's go to the docs to find out:

[https://github.com/Automattic/monk#promises](https://github.com/Automattic/monk#promises)

Hmm... Promises should have a `then` method, but those docs don't show any `then` method.  Let's be brave and see if one exists.  Add the following to the top of `01_playground.js`

```js
var promise = users.remove()
console.log(promise.then.toString());
```

What's happening in that snippet?  Take a second to write out what you think is going on:

> YOUR ANSWER HERE

So it turns out that Monk methods do indeed return a promise that supports `then`, so we can make use of that by changing the callback to a `then`:

```js
users.remove({}, function (err) { })

// becomes

users.remove({}).then(function () { })
```

What gets passed to `then`??  Monk isn't clear at all about that (in fact, there are NO references to the word "then" anywhere in the docs).  So let's find out by inspecting the `arguments` object that's available in every method:


```js
users.remove({}).then(function () {
  console.log(arguments);
})
// prints { '0': 1 }

users.insert({name: 'Harry'}).then(function () {
  console.log(arguments);
})
// { '0': { name: 'Harry', _id: 55ae69439c31b8a2228f9780 } }
```

In both cases the `then` function is being passed a single argument (which you can see because the `arguments` object has a single key in both cases: `"0"`).  

> NOTE: if you forgot what `arguments` is, read up on arguments over at https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/arguments and then come back...

So now you know, just from experimentation, that you can add a parameter to your callback function:

```js
users.remove({}).then(function (x) {
  console.log(x);
})
// 1 (or 0 or some other number...)

users.insert({name: 'Harry'}).then(function (x) {
  console.log(x);
})
// { name: 'Harry', _id: 55ae69439c31b8a2228f9780 }
```

Now you should figure out what to name those variables.  In order to name a variable, you need to know what it represents.  In the `remove` case, what do you _think_ that number `1` means?  Well, you know this is coming from an underlying Mongo command "remove", so check the docs for remove here: [http://docs.mongodb.org/manual/reference/method/db.collection.remove/#db.collection.remove](http://docs.mongodb.org/manual/reference/method/db.collection.remove/#db.collection.remove)

What does `remove` _return_ in Mongo?  Look around that page until you find it.  Look carefully and you'll see that it returns a `writeResult` - but what's that?  Go read the docs for [writeResult](http://docs.mongodb.org/manual/reference/method/db.collection.remove/#writeresults-remove) and then come back.

So it _looks_ like the callback you pass to `users.remove().then()` gets called with the _number of records that were removed_.  Let's experiment with that by inserting two records and seeing the results:

```js
users.insert({name: 'Harry'}).then(function () {
  users.insert({name: 'Sally'}).then(function () {
    users.remove({}).then(function () {
      console.log(arguments);
    })
  })
})
```

Yup.  When you call `then` on `users.remove` it returns the number of records that were deleted.  What about the callback you pass to `insert`?  What does _that_ return?

```js
{ name: 'Harry', _id: 55ae69439c31b8a2228f9780 }
```

That looks like the whole doc.  SO - now you know via experimentation that the `then` callback will get called with _different arguments_ based on the specific call you are making, and you know that when in doubt, you can use the `arguments` object to inspect those.

**#3 - Reflect**

From reading and experimenting, what do you know about Promises and `then`?  Take a minute to write your emerging understanding here:

> YOUR THOUGHTS HERE

**#4 - Convert simple callbacks**

Ready to code yet?  Awesome!

1. Run `02_monk.js` and inspect the output
1. Open `02_monk.js` and change the code from callbacks to promises.

Each Monk command returns a promise.  So the first iteration might look like this:

```js
users.remove({}).then(function (err) {
  users.insert({name: 'Joe'}, function (err, result) {
    users.insert({name: 'Sue'}, function (err, result) {
      users.insert({name: 'Tim'}, function (err, result) {
        users.insert({name: 'Kim'}, function (err, result) {
          users.find({}, function (err, results) {
            console.log("\nSuccess! The records are: \n");
            console.log(results);
            db.close()
          })
        })
      })
    })
  })
})
```

Once they are all using `.then` instead of callbacks, run the file to make sure the output looks the same, and then move on.

**Chain'em up!**

Unlike callbacks, you can _chain_ promises if you do it right.  Here's an example:

```js
users.remove({}).then(function () {
  return users.insert({name: 'Joe'})
}).then(function () {
  return users.insert({name: 'Sue'})
}).then(function (records) {
  console.log(records);
  db.close()
})
```

What's going on there?  You could say:

"Remove all users.  _When_ the records are removed, _then_ insert Joe.  _When_ joe is done being inserted, _then_ insert Sue etc..."

Using similar language, how would you describe the following code?

```js
messages.remove({}).then(function () {
  return users.remove({})
}).then(function () {
  return users.insert({name: 'Joe'})
}).then(function (joe) {
  return messages.insert({senderId: joe._id})
}).then(function (message) {
  console.log("Message was inserted!", message);
  db.close()
})
```

> YOUR ANSWER HERE.  

Take a look at your answer above.  Does it account for the fact that the third callback gets `joe` passed to it?  How did that happen?

If you had to describe chained `thens` to another beginning developer, how would you do it based on the code above?

**Refactoring AJAX Calls**

One very common usage of Promises is to refactor AJAX calls.  Let's get started!

Setup

1. Start your server with `http-server -c-1 -o`
1. Open the console.

Click each link, look at the output on the page and look at the console output.  The goal of a refactor is that it _doens't change_ the way the app works - it's just a pure code reorganization.  You have 3 challenges here:

1. Refactor all `$.getJSON` functions to take advantage of the fact that `$.getJSON` returns a promise
1. Refactor the "Get First" and "Get Last" functions to use _chained_ promises
1. Remove the duplication from "Get First" and "Get Last" by writing your own function that _returns_ a promise that has access to all the data needed.

THIS IS NOT SIMPLE!  If you are new to Promises, those three challenges will ramp up steeply in difficulty.  Make a new branch, spend some time on it, try to figure it out.  Come to instructors if the instructions aren't clear, and then if you still can't get it, we'll do a workshop on it :)

**Promise.all**

Another common scenario is that you have multiple things happening concurrently.  This is a great use for Promise.all

* Read https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all
* Refactor `04_promise_all.js` to use Promise.all

**Optional: Write your own**

Ready for more?  You can write your own promises (instead of just _using_ promises returned by other frameworks).

See https://www.promisejs.org/ for more details.  Then refactor all of the functions in HTML to use `XMLHttpRequest` instead of `$.getJSON`, by writing your own promise wrapper around `XMLHttpRequest`

Have fun!

## Reflect

Go back to the objectives.  How would you rate yourself on each?  If it's less than a 3-out-of-4, let's talk!

## Reflect: New Questions

What new questions do you have?  Write down _at least_ 4 (c'mon, I _know_ you have them):

1. _____
1. _____
1. _____
1. _____

## Look into the future

https://www.youtube.com/watch?v=DqMFX91ToLw
