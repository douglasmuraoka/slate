#!/usr/bin/env bash

./build.sh
aws s3 cp ./build s3://static.back4app.com --recursive
