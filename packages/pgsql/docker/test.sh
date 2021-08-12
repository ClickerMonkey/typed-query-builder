# Dependencies:
#   brew install docker

set -e

# Stop any related containers
RUNNING=$(docker ps -a -q --filter ancestor=tqb-pgsql --format="{{.ID}}")
if [[ $RUNNING =~ [^\s] ]]; then 
  STOPPED=$(docker stop $RUNNING)
  if [[ $STOPPED =~ [^\s] ]]; then 
    docker rm $STOPPED
  fi
fi

# Build the tqb-psql image via Dockerfile
docker build -t tqb-pgsql .

# Run the tqb-psql image
CONTAINER_ID=$(docker run -d -p 5438:5432 tqb-pgsql)

# Wait until database is running
. ../../../scripts/wait-until "docker exec -u postgres $CONTAINER_ID psql -U postgres tqb -c 'select 1'"

# Run the tests
cd ..
npm run test:jest -- "$@"

# Stop the container and cleanup
docker stop $CONTAINER_ID