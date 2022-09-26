# Lepton

Built using next.js, mongodb, socket.io, redis

# How to run your own lepton
```
git clone https://github.com/toodols/lepton.git && cd lepton
npm run installstuff # Installs npm packages
npm run build-markup # Builds rust markup. You will need to install wasm-pack and by extension rust.
npm run compile # Compiles typescript
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

# Structure
During development mode, the client side is hosted on 3000 to leverage fast refresh while the api, written in rust, is hosted on 3001. In production, since the client is built to static files, they will be able to share the same port.