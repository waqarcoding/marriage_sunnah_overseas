# This mounts your source code into the container so changes reflect instantly with hot reload on http://localhost:3000.

docker compose -f docker-compose.dev.yml up
docker compose -f docker-compose.dev.yml up --build
docker compose -f docker-compose.dev.yml down
docker compose -f docker-compose.dev.yml logs -f
docker logs -f marriage-backend





# If CHanged Database field in sequilize model then run in terminal to update mysql database 

docker exec marriage-backend node -e "
const { sequelize } = require('./models');
sequelize.sync({ alter: true })
  .then(() => { console.log('Database synced ✅'); process.exit(0); })
  .catch((err) => { console.error('Error:', err); process.exit(1); });
"


docker ps
#All containers are running. Now test if backend is reachable from frontend:
docker exec marriage-frontend wget -qO- http://marriage-backend:5000

#!/bin/bash
# ============================================================
#              DOCKER COMMANDS CHEAT SHEET
# ============================================================


# ------------------------------------------------------------
# CONTAINERS
# ------------------------------------------------------------

docker ps                             # list running containers
docker ps -a                          # list all containers (including stopped)
docker start <name>                   # start a container
docker stop <name>                    # stop a container
docker restart <name>                 # restart a container
docker rm <name>                      # delete a stopped container
docker rm -f <name>                   # force delete a running container
docker inspect <name>                 # detailed info about a container
docker logs <name>                    # view container logs
docker logs -f <name>                 # live/follow container logs
docker logs --tail 100 <name>         # last 100 lines of logs
docker exec -it <name> sh             # enter container shell (alpine)
docker exec -it <name> bash           # enter container shell (ubuntu/debian)
docker cp <name>:/path ./local        # copy file from container to host
docker cp ./local <name>:/path        # copy file from host to container
docker stats                          # live CPU/memory usage of containers


# ------------------------------------------------------------
# DOCKER COMPOSE
# ------------------------------------------------------------

docker compose up -d                  # start all containers in background
docker compose up -d --build          # rebuild images and start containers
docker compose down                   # stop and remove containers
 
docker compose restart                # restart all containers
docker compose restart <service>      # restart a specific service
docker compose ps                     # status of all services
docker compose logs -f                # live logs for all services
docker compose logs -f <service>      # live logs for a specific service
docker compose build                  # build images without starting
docker compose pull                   # pull latest images
docker compose exec <service> sh      # enter a running service shell
docker compose config                 # validate and view compose file


# ------------------------------------------------------------
# IMAGES
# ------------------------------------------------------------

docker images                         # list all images
docker pull <image>                   # download an image
docker rmi <image>                    # delete an image
docker rmi -f <image>                 # force delete an image
docker build -t <name> .              # build image from Dockerfile
docker tag <image> <new_name>         # tag/rename an image
docker push <image>                   # push image to Docker Hub
docker image inspect <image>          # detailed info about an image
docker history <image>                # show image layers


# ------------------------------------------------------------
# VOLUMES
# ------------------------------------------------------------

docker volume ls                      # list all volumes
docker volume create <name>           # create a volume
docker volume rm <name>               # delete a volume
docker volume inspect <name>          # detailed info about a volume
docker volume prune -f                # delete all unused volumes


# ------------------------------------------------------------
# NETWORKS
# ------------------------------------------------------------

docker network ls                     # list all networks
docker network create <name>          # create a network
docker network rm <name>              # delete a network
docker network inspect <name>         # detailed info about a network
docker network connect <net> <cont>   # connect container to network
docker network disconnect <net> <cont># disconnect container from network


# ------------------------------------------------------------
# CLEANUP
# ------------------------------------------------------------

docker system df                      # show Docker disk usage
docker system prune -a -f             # remove all unused containers, images, networks
docker builder prune -a -f            # remove all build cache
docker container prune -f             # remove all stopped containers
docker image prune -a -f              # remove all unused images
docker volume prune -f                # remove all unused volumes
docker network prune -f               # remove all unused networks


# ------------------------------------------------------------
# YOUR APP - marriage_sunnah_overseas
# ------------------------------------------------------------

# View logs
docker logs -f marriage-backend       # backend live logs
docker logs -f marriage-frontend      # frontend live logs
docker logs -f marriage-db            # database live logs
docker logs -f marriage-phpmyadmin    # phpmyadmin live logs

# Enter containers
docker exec -it marriage-backend sh   # enter backend shell
docker exec -it marriage-frontend sh  # enter frontend shell
docker exec -it marriage-db bash      # enter database shell

# Restart individual containers
docker restart marriage-backend       # restart backend only
docker restart marriage-frontend      # restart frontend only
docker restart marriage-db            # restart database only

# Rebuild and restart
cd /var/www/marriage_sunnah_overseas
docker compose up -d --build          # full rebuild and restart

# Check disk usage
docker system df                      # Docker disk usage
df -h                                 # overall disk usage
du -sh /var/lib/docker                # Docker folder size
du -sh /var/lib/containerd            # containerd folder size

# Clean before build (run when disk is full)
docker system prune -a -f && docker builder prune -a -f


# ------------------------------------------------------------
# DATABASE - marriage_sunna_overseas
# ------------------------------------------------------------

# Login to MySQL inside container
docker exec -it marriage-db mysql -u root -pRoot123Root

# Login directly to your database
docker exec -it marriage-db mysql -u waqarcoding -pRoot123Root marriage_sunna_overseas

# Login as root to your database
docker exec -it marriage-db mysql -u root -pRoot123Root marriage_sunna_overseas

# Useful MySQL commands (run after logging in)
# SHOW DATABASES;                    # list all databases
# USE marriage_sunna_overseas;       # switch to your database
# SHOW TABLES;                       # list all tables
# DESCRIBE <table_name>;             # show table structure
# SELECT * FROM <table_name>;        # view all rows in a table
# EXIT;                              # exit MySQL shell

# Backup your database
docker exec marriage-db mysqldump -u root -pRoot123Root marriage_sunna_overseas > /root/backup.sql

# Restore your database
docker exec -i marriage-db mysql -u root -pRoot123Root marriage_sunna_overseas < /root/backup.sql

# Access via phpMyAdmin (open in browser)
# http://137.184.195.52:8080
# Username: waqarcoding
# Password: Root123Root
