#!/usr/bin/env bash

./homolog.sh
aws s3 cp ./build s3://static-homolog.back4app.com --recursive
