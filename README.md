# echo-bin

This is a bin for storing and retrieving temporary data. It's like the public request bins,
but even simpler! We built this to assist our customers who need to share data between different
bots, or virtual users, when running a load test with [Loadster](https://loadster.app).

You can store data with a POST to any path, and retrieve it with a GET to the same path. The
bin also remembers the content type.

```
$ curl -H 'Content-Type: text/plain' -d '131497' http://localhost:3000/video-session-id

$ curl http://localhost:3000/video-session-id
131497
```

The paths are totally arbitrary and you can make anything up.

There are a few intentional limitations, which are easy to bypass when running your own bin:

* The bin can only store 500 items.
* No item can be larger than 1MB.
* Items older than 4 hours are automatically removed.

There's no authentication, so don't store sensitive data! Consider adding a hard-to-guess 
token to your paths if you are at all worried about people guessing them or to prevent collisions.

Once again... this is meant as a simple bin for storing temporary test data, and nothing more.
