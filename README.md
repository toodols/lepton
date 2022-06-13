# Lepton

Built using next.js, mongodb, socket.io, redis

# How to run your own lepton
```
git clone https://github.com/toodols/lepton.git && cd lepton
npm run installstuff
echo > .env.local
```
In .env.local put in
```
MONGODB_URI = mongodb:// url here
JWT_SECRET = just put something random here
REDIS_URI = redis:// url here
```

then run
```
npm run dev
```

# CONTRIBUTE PLEASE
Make issue if bug.
Make fix if issue.
Make pull request if fix.
Will merge.