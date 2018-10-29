#!/usr/bin/env bash

if ! type "ruby"
then
	sudo apt update
	sudo apt install ruby-full
	ruby --version
fi
bundle install
env=dev bundle exec middleman server
