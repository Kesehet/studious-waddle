#!/bin/bash

# Set an interval for checking updates, for example, every 10 minutes
INTERVAL=10

while true; do

    git pull --force

    # Sleep for the defined interval before checking again
    sleep $INTERVAL
done
