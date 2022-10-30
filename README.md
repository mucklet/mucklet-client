<h2 align="center"><b>Mucklet Web Client</b></h2>

Web client for Mucklet.com, a textual world of roleplay.

# Quick start

Install [git](https://git-scm.com/downloads) and [node 14](https://nodejs.org/download/release/v14.20.1/)[^1], and run the following commands:

```text
git clone https://bitbucket.org/anisus/mucklet-client
cd mucklet-client
npm install
npm run client:realm:test
```

Open a browser and go to the URL below, but replace `<USER>` and `<PASS>` with the
username and password of your Mucklet developer account:
```text
http://localhost:6450/?login.player=<USER>&login.pass=<PASS>
```

[^1]: The npm package [node-sass v4.14](https://www.npmjs.com/package/node-sass) dependency requires Node 14.
