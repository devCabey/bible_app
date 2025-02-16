#!/bin/sh

# Check if the database has already been populated
if [ ! -f "/app/.db_populated" ]; then
    echo "Populating the database..."
    yarn database:populate
    touch /app/.db_populated
else
    echo "Database already populated. Skipping..."
fi

# Start the application
exec yarn start
