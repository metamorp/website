# website
A Node.js server for http://metamorp.com and https://metamorp.com,
using [LetsEncrypt](https://letsencrypt.org) for a certificate, 
and [acme-tiny](https://github.com/diafygi/acme-tiny) to prove ourselves to LetsEncrypt.

We use an unprivileged user to serve the webpage to ports 3000 and 3443, which are
rerouted through ports 80 and 443 using iptables (use `sudo` or as `root`):

```
# reroute port 80 to 3000
iptables -A PREROUTING -t nat -p tcp --dport 80 -j REDIRECT --to-port 3000
# reroute port 443 to 3443
iptables -A PREROUTING -t nat -p tcp --dport 443 -j REDIRECT --to-port 3443
```

To make these changes effective on reboot, I save those commands in a file `iptables.rc` 
and run this script:

```
sudo iptables --flush
sudo sh iptables.rc
sudo su -c 'iptables-save > /etc/iptables/rules.v4'
```

To configure the rest for your own server, as the unprivileged user,
clone [acme-tiny](https://github.com/diafygi/acme-tiny) into the unprivileged user's home directory, 
and clone this repository to `your-website.com` (wherever the unprivileged user wants it).

Look at (and modify as necessary) the scripts `get_cert.sh` and `renew_cert.sh`, 
which can be run by the unprivileged user to get the first https://LetsEncrypt.org certificate, and
then renew it (which needs to happen at least every 90 days).  You may want a cron job for that.

Then `sudo npm install -g nodemon`, `npm install` (in this directory), 
and `./start_serving.sh` to start serving the webpage.
