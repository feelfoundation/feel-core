FROM node:10-alpine3.9 AS builder

ARG REGISTRY_URL
ARG REGISTRY_AUTH_TOKEN

RUN apk --no-cache upgrade && \
    apk --no-cache add alpine-sdk python2 libtool autoconf automake

RUN addgroup -g 1100 feel && \
    adduser -h /home/feel -s /bin/bash -u 1100 -G feel -D feel
COPY --chown=feel:feel . /home/feel/feel/
RUN if [ -n "$REGISTRY_URL" ]; then \
      echo -e "registry=$REGISTRY_URL/\n${REGISTRY_URL#*:}/:_authToken=$REGISTRY_AUTH_TOKEN" >/home/feel/.npmrc; \
    fi

USER feel
WORKDIR /home/feel/feel

RUN npm ci && \
    npm run build
RUN npm ci --production && \
    git rev-parse HEAD >REVISION && \
    rm -rf .git && \
    date --utc "+%Y-%m-%dT%H:%M:%S.000Z" >.build


FROM node:10-alpine3.9

ENV NODE_ENV=production
ENV WFI_COMMIT=e34c502a3efe0e8b8166ea6148d55b73da5c8401
ENV WFI_SHA=0f75de5c9d9c37a933bb9744ffd710750d5773892930cfe40509fa505788835c

RUN apk --no-cache upgrade && \
    apk --no-cache add bash curl jq

RUN addgroup -g 1100 feel && \
    adduser -h /home/feel -s /bin/bash -u 1100 -G feel -D feel
COPY --from=builder --chown=feel:feel /home/feel/feel/ /home/feel/feel/
RUN mkdir -p /home/feel/feel/logs && \
    chown feel:feel /home/feel/feel/logs

ADD https://raw.githubusercontent.com/vishnubob/wait-for-it/${WFI_COMMIT}/wait-for-it.sh /home/feel/wait-for-it.sh
RUN if [ x"$( sha256sum /home/feel/wait-for-it.sh |awk '{print $1}' )" = x"${WFI_SHA}" ]; then \
      chmod 0755 /home/feel/wait-for-it.sh; \
    else \
      rm -f /home/feel/wait-for-it.sh; \
      echo "Checksum verification failed."; \
      exit 1; \
    fi

USER feel
WORKDIR /home/feel/feel

ENTRYPOINT ["node", "/home/feel/feel/dist/index.js"]
CMD ["-n", "mainnet"]
