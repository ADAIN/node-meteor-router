#!/usr/bin/env bash

export PORT=4000
ulimit -n 65536
forever start -l ${PWD}/router.log -a server.js
tail -f ${PWD}/router.log