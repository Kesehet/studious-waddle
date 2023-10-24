#!/bin/bash

# Set an interval for checking updates, for example, every 10 minutes
INTERVAL=10

while true; do
    # Navigate to your repository
    cd .

    # Fetch updates from the remote repository
    git fetch

    # Check if origin/master is a valid reference
    git rev-parse --verify origin/master > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        # Check for updates from the remote repository
        UPDATES=$(git diff HEAD..origin/master)

        # If there are updates, pull and rebase the changes
        if [ ! -z "$UPDATES" ]; then
            git pull --rebase
        fi
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
