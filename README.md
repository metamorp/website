# website
[metamorp.com] without the keys

Here's the way we setup metamorp.com to serve webpages via Express (Node.js) 
over https using LetsEncrypt.org, using [acme-tiny](https://github.com/diafygi/acme-tiny).

We use an unprivileged user to serve the webpage to ports 3000 and 3443, which are
rerouted through ports 80 and 443 using iptables:

```
# reroute port 80 to 3000
iptables -A PREROUTING -t nat -p tcp --dport 80 -j REDIRECT --to-port 3000
# reroute port 443 to 3443
iptables -A PREROUTING -t nat -p tcp --dport 443 -j REDIRECT --to-port 3443
```

To make this work for your own server, clone [acme-tiny](https://github.com/diafygi/acme-tiny)
into the unprivileged user's home directory, and clone this repository to `your-website.com`
(also in the home directory).

Look at (and modify as necessary) the scripts `get_cert.sh` and `renew_cert.sh`, 
which can be run by the unprivileged user to get the first LetsEncrypt.org certificate, and
then renew it (which needs to happen at least every 90 days).  You may want a cron job for that.

Then `sudo npm install -g nodemon`, `npm install` (in this directory), 
and `./start_serving.sh` to start serving the webpage.
