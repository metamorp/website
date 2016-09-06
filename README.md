# website
A simple Node.js server using [LetsEncrypt](https://letsencrypt.org) for a certificate, 
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

## Website setup + signing the HTTPS keys

To configure the rest for your own server, as the unprivileged user,
clone [acme-tiny](https://github.com/diafygi/acme-tiny) into the unprivileged user's home directory, 
and clone this repository to `your-website.com` (wherever the unprivileged user wants it).

Before starting the website, one can use `nodemon` (`sudo npm install -g nodemon`), 
but definitely `npm install` (in this directory), 

To generate some keys, run `./gen_keys.sh`, then startup the website (`./start_serving.sh`).
Make sure you can access the basic HTTP website online, then run `./sign_keys.sh` to get HTTPS
certification from LetsEncrypt.  You'll need to resign keys every 90 days (`./sign_keys.sh`), 
and may want a cron job for that.  After signing the keys, you may need to 
`./restart_serving.sh` to get the new keys in play.

