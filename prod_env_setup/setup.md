# push images to docker from local:

0) cd to local repo path
1) login: "doctl registry login"
2) build and tag the image in local env: "docker-compose build"
2) push the docker image tag: "docker push registry.digitalocean.com/auto-canon/auto-canon-fe"
//private github for a docker image