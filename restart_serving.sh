#!/bin/bash

pkill node
pkill npm
mv current-log old-log
nohup nodemon >current-log 2>&1
