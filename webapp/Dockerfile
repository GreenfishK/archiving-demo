FROM node:lts

# Copy source and data
COPY data /opt/demo/data
COPY src /opt/demo/src
COPY public /opt/demo/public
COPY package.json /opt/demo/
COPY tsconfig.json /opt/demo/

# Install server node
RUN cd /opt/demo/ && npm install && npm run build

# Expose server port
EXPOSE 3000

# Node to production
ENV NODE_ENV=production

# Entrypoint
WORKDIR /opt/demo/
ENTRYPOINT [ "node", "./build/index.js" ]
