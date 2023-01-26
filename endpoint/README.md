# OSTRICH SPARQL Endpoint Docker

This folder contains a Dockerfile and instructions to run an OSTRICH SPARQL Endpoint.

## Installation

To build the system, run (use *sudo* if needed):

```bash
docker build -t ostrich-endpoint .
```

## Running the Endpoint

The endpoint is run with the following command (use *sudo* if needed):

```bash
docker run --rm -it --volume path_to_ostrich_directory:/var/ostrich -p 42564:42564 ostrich-endpoint
```

The OSTRICH files should be mounted with the "*--volume*" argument to "*/var/ostrich*".
