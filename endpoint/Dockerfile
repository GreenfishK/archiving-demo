FROM node:lts

# Get repos
RUN cd /opt && git clone https://github.com/dkw-aau/comunica-feature-versioning.git
RUN cd /opt && git clone --branch dev --recurse-submodules https://github.com/dkw-aau/ostrich-node.git

# Prepare ostrich-node
RUN apt-get update && apt-get -y install cmake libboost-iostreams-dev
RUN cd /opt/ostrich-node && ./install-kc-ci.sh
RUN cd /opt/ostrich-node && yarn install && yarn link

# Install Comunica
RUN cd /opt/comunica-feature-versioning && yarn link ostrich-bindings && yarn install

# Expose the port used by the Endpoint
EXPOSE 42564

# Entrypoint
ENTRYPOINT [ "node", "/opt/comunica-feature-versioning/engines/query-sparql-ostrich/bin/http.js", "-p 42564", "-t 480", "-l debug", "ostrichFile@/var/ostrich" ]
