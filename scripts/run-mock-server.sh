#!/usr/bin/env bash
set -e

# Script to run a Redis server using Docker and fill it with mock data

echo "🚀 Starting mock Redis server with Docker..."
docker run -d --name mock-redis -p 6379:6379 redis:8.2.2-alpine
echo "✅ Mock Redis server is running on port 6379."

echo "🧪 Filling Redis with mock data..."
tempfile=$(mktemp)
# Generate 100 string key-value pairs
for i in $(seq 1 100); do
    echo "SET key-$i value-$i" >> $tempfile
done
# Generate 100 string key-value pairs in group1
for i in $(seq 1 100); do
    echo "SET group1:key-$i group1-value-$i" >> $tempfile
done
docker exec -i mock-redis redis-cli --pipe < $tempfile
rm -f $tempfile
echo "✅ Mock data has been loaded into Redis."

# On script exit, stop and remove the Docker container
cleanup() {
    echo "🧼 Cleaning up..."
    docker stop mock-redis >/dev/null
    docker rm mock-redis >/dev/null
    echo "✅ Cleanup completed."
}

trap cleanup EXIT

# Keep the script alive
echo "ℹ️  Press Ctrl+C to stop the mock server."
while true; do sleep 60; done