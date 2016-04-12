#!/bin/bash

# get full path to website directory:
WEBDIR=$(realpath "$(pwd)/$(dirname $0)")

# set the parent directory name to the name of your website, with extension (.com, .org, etc.)
if [ $WEBDIR == "/" ]; then
    >&2 echo "website can't be in root directory"
    exit 1
fi
WEBSITE=${WEBDIR##*/} 

echo "generating keys/certificate for website $WEBSITE"

# create account key for letsencrypt:
openssl genrsa 4096 > $WEBDIR/keys/account.key
if [ $? -ne 0 ]; then
    >&2 echo "couldn't create account key.  does keys directory exist?"
    exit 1
fi
# generate a domain key for your websitE:
openssl genrsa 4096 > $WEBDIR/keys/domain.key
if [ $? -ne 0 ]; then
    >&2 echo "error!  couldn't create domain key."
    exit 1
fi

# create certificate:
# option 1:
# multisite certificate, www subdomain and root domain:
#openssl req -new -sha256 -key ~/$WEBSITE/keys/domain.key -subj "/" -reqexts SAN -config <(cat /etc/ssl/openssl.cnf <(printf "[SAN]\nsubjectAltName=DNS:${WEBSITE},DNS:www.${WEBSITE}")) > ~/$WEBSITE/keys/domain.csr
# option 2:
# if you have your www subdomain get redirected to root domain, then you only need one:
openssl req -new -sha256 -key $WEBDIR/keys/domain.key -subj "/CN=${WEBSITE}" > $WEBDIR/keys/domain.csr
if [ $? -ne 0 ]; then
    >&2 echo "error!  couldn't create certificate signing request."
    exit 1
fi

# do the acme challenge:
python ~/acme-tiny/acme_tiny.py --account-key $WEBDIR/keys/account.key --csr $WEBDIR/keys/domain.csr --acme-dir $WEBDIR/public/.well-known/acme-challenge > $WEBDIR/keys/signed.crt
if [ $? -ne 0 ]; then
    >&2 echo "error!  LetsEncrypt could not validate.  check if 'website name' = 'directory name' and try again with 'renew_cert.sh'"
    exit 1
fi

# the rest of the stuff is important for firefox and other ssl considerations

# get the intermediate certificate.  (this may need to be updated if letsencrypt changes things...)
wget -O $WEBDIR/keys/chain.pem https://letsencrypt.org/certs/lets-encrypt-x3-cross-signed.pem
if [ $? -ne 0 ]; then
    >&2 echo "could not download keys/chain.pem from\nhttps://letsencrypt.org/certs/lets-encrypt-x3-cross-signed.pem\nplease find the LetsEncrypt issuer certificate and download it to keys/chain.pem"
    exit 1
fi

cat $WEBDIR/keys/signed.crt $WEBDIR/keys/chain.pem > $WEBDIR/keys/fullchain.pem
if [ $? -ne 0 ]; then
    >&2 echo "should have been fine here concatenating the certificates."
    exit 1
fi

exit 0
