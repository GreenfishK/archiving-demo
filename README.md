# OSTRICH Archiving Demo
Demo for querying RDF archives with versioned SPARQL queries.

## Docker Compose

You can use docker-compose to build and run everything.  
Simply run from the root directory of the project:
```bash
docker compose up
```
You will need to have the data (OSTRICH files) available in a *"./data"* directory under the root folder.

## Run the demo with Docker

Alternatively, you can build and run each docker images separately.

### Endpoint
First build the OSTRICH SPARQL endpoint:
```bash
cd ./endpoint
docker build -t ostrich-endpoint .
```
Start the endpoint using this command. Set the *"path_to_ostrich_directory"* appropriately for the path of your data.
```bash
docker run --rm -it --volume path_to_ostrich_directory:/var/ostrich -p 42564:42564 ostrich-endpoint
```

### Webapp
Build the webapp:
```bash
cd ./webapp
docker build -t ostrich-webapp .
```
Then, start the webapp with the following command:
```bash
docker run --rm -it -p 3000:3000 ostrich-webapp
```

### Usage

You can use the app by loading the page *"you-domain-name:3000"* in your favorite browser.
