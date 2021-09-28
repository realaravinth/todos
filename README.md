# Demo task manager app

Tasks manager app is implemented on three different architectures:

1. **client-server architecture:** requires a server to be hosted somewhere
   on the internet and users are required to sign up for the service.
   Data is stored on the server

2. **client-local:** no sign up required, a static website is hosted
   somewhere on the internet and all data is stored on the browser's
   local storage. Multi-device synchronisation is achieved by manually
   exporting state through a file and importing it on the other device.

3. **client-p2p:** no sign up required, a static website is hosted
   somewhere on the internet. This implementation uses textile.io's
   [ThreadDB](https://docs.textile.io/threads/), an IPFS based
   technology. Synchronisation is achieved by exporting the private key
   of the user(~128 bytes) and importing it on the other device. Users
   can also migrate their 'silo' from one provider to another or just
   self-host.

These are demo implementations and shouldn't be used as references. The
whole thing was put together in under a day so they are not idiomatic.
I'm surprised it even works :D
