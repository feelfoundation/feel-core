# Using docker-compose

## Copy sample .env file

Choose one of the sample `.env.*` file and copy it to `.env`.
You should set `ENV_FEEL_VERSION` to the version of Feel and can change the database configuration.
Note: to configure Feel Core itself, see below.

## Run docker-compose

You can run docker-compose directly

```
docker-compose up -d
docker-compose ps
docker-compose logs
```
(see https://docs.docker.com/compose/reference/overview/)

or use the `Makefile` (you will need to install `make`) for convenience:

```
make            # will run `docker-compose up` for you
make coldstart  # will download and restore a blockchain snapshot for you
```

# Configure Feel Core

Edit the `docker-compose.override.yml` (not `docker-compose.yml`) file to customize your setup.
Some command examples can be found below. All supported environment variables can be found in the [top-level README](../README.md#command-line-options)

(see https://docs.docker.com/compose/extends/#multiple-compose-files)

## Examples

Do not expose ports:

(see https://docs.docker.com/compose/compose-file/#ports)

```
version: "3"
services:

  feel:
    ports:
      - ${ENV_FEEL_HTTP_PORT}
      - ${ENV_FEEL_WS_PORT}
```

Increase log level to debug, enable public API:

(see https://docs.docker.com/compose/compose-file/#environment)

```
version: "3"
services:

  feel:
    environment:
      - FEEL_CONSOLE_LOG_LEVEL=debug
      - FEEL_API_PUBLIC=true
```

Add forging delegates and whitelist IPs:

(see https://docs.docker.com/compose/compose-file/#environment)

```
version: "3"
services:

  feel:
    environment:
      - FEEL_FORGING_DELEGATES=publicKey1|encryptedPassphrase1,publicKey2|encryptedPassphrase2
      - FEEL_API_WHITELIST=127.0.0.1,172.17.0.1
      - FEEL_FORGING_WHITELIST=127.0.0.1,172.17.0.1
```

## For advanced users

### Use redis for caching

Caching using redis can be enabled with the `docker-compose.redis.yml` file, e.g.:

`docker-compose -f docker-compose.yml -f docker-compose.override.yml -f docker-compose.redis.yml up -d`

Note that this could be done in the `docker-compose.override.yml` as well.
