#!/bin/bash

# Set an interval for checking updates, for example, every 10 minutes
INTERVAL=600

while true; do
    # Navigate to your repository
    cd /path/to/your/repo

    # Fetch updates from the remote repository
    git fetch

    # Check for updates from the remote repository
    UPDATES=$(git rev-list HEAD...origin/master --count)

    # If there are updates, pull the changes
    if [ "$UPDATES" -ne 0 ]; then
        git pull
    fi

    # Check for file changes in the local repository
    CHANGES=$(git status --porcelain)

    # If there are changes, add, commit, and push the changes
    if [ ! -z "$CHANGES" ]; then
        git add .
        git commit -m "Automated commit"
        git push
    fi

    # Sleep for the defined interval before checking again
    sleep $INTERVAL
done
