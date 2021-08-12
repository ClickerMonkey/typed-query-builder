# Dependencies:
#   brew install docker

set -e

# Stop any related containers
RUNNING=$(docker ps -a -q --filter ancestor=tqb-mssql --format="{{.ID}}")
if [[ $RUNNING =~ [^\s] ]]; then 
  STOPPED=$(docker stop $RUNNING)
  if [[ $STOPPED =~ [^\s] ]]; then 
    docker rm $STOPPED
  fi
fi

# Build the tqb-mssql image via Dockerfile
docker build -t tqb-mssql .

# Run the tqb-mssql image
CONTAINER_ID=$(docker run -d -p 1433:1433 tqb-mssql)

# Wait until database is running
. ../../../scripts/wait-until "docker exec -u root $CONTAINER_ID /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P password#1 -d tqb -q 'SELECT 1'"

# Run the tests
cd ..
npm run test:jest -- "$@"

# Stop the container and cleanup
docker stop $CONTAINER_ID