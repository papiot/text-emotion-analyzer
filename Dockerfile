# specify the node base image with your desired version node:<version>
FROM node:10

WORKDIR /workspace
# replace this with your application's default port
EXPOSE 4000