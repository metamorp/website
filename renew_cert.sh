#!/bin/bash

# get full path to website directory:
WEBDIR=$(realpath "$(pwd)/$(dirname $0)")

# set the parent directory name to the name of your website, with extension (.com, .org, etc.)
if [ $WEBDIR == "/" ]; then
    >&2 echo "website can't be in root directory"
    exit 1
fi
WEBSITE=${WEBDIR##*/} 

echo "renewing keys/certificate for website $WEBSITE"

python ~/acme-tiny/acme_tiny.py --account-key $WEBDIR/keys/account.key --csr $WEBDIR/keys/domain.csr --acme-dir $WEBDIR/public/.well-known/acme-challenge > $WEBDIR/keys/signed.crt
if [ $? -ne 0 ]; then
    >&2 echo "error!  letsencrypt could not validate.  check if keys exist, 'website name' = 'directory name', and try again with 'renew_cert.sh'"
    exit 1
fi

exit 0
