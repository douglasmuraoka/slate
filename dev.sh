#!/usr/bin/env bash

if ! type "ruby"
then
	sudo apt update
	sudo apt install ruby-full
	ruby --version
fi
bundle install
bundle exec middleman server
