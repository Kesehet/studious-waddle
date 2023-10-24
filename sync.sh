#!/bin/bash

# Set an interval for checking updates, for example, every 10 minutes
INTERVAL=10

while true; do
    # Navigate to your repository
    cd .

    # Fetch updates from the remote repository
    git fetch

    # Rebase to ensure local branch is up-to-date with remote branch
    git pull --rebase

    # Check for file changes in the local repository
    CHANGES=$(git status --porcelain)

    # If there are changes, add, commit
    if [ ! -z "$CHANGES" ]; then
        git add .
        git commit -m "Automated commit"
    fi

    # Rebase again to ensure local branch is up-to-date with remote branch
    git pull --rebase

    # Now push the changes
    git push

    # Sleep for the defined interval before checking again
    sleep $INTERVAL
done
