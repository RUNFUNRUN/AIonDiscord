#!/bin/sh

if [ -d "./node_modules" ]; then
  echo "node_modules is exit"
else
  npm install
fi

