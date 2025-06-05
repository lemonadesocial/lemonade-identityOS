# syntax=docker/dockerfile:1
### manifest
FROM public.ecr.aws/docker/library/node:20-alpine as manifest

COPY package.json yarn.lock /tmp/
RUN sed -e 's/"version": "[^"]\+",/"version": "0.0.0",/' -i /tmp/package.json

### builder
FROM public.ecr.aws/docker/library/node:20-alpine as builder
WORKDIR /app

RUN apk add --no-cache git
COPY --from=manifest /tmp/package.json /tmp/yarn.lock ./
RUN yarn install --frozen-lockfile --ignore-optional --production && \
    rm -rf /usr/local/share/.cache/yarn

### build
FROM builder as build

COPY . .
ARG APP_ENV
ARG ASSET_PREFIX
ARG SENTRY_AUTH_TOKEN
ARG SENTRY_ORG
ARG SENTRY_PROJECT
ARG SENTRY_RELEASE
RUN NEXT_TELEMETRY_DISABLED=1 yarn build

### upload
FROM public.ecr.aws/aws-cli/aws-cli:2.9.21 as upload

COPY --from=build /app/.next/static _next/static
COPY --from=build /app/public .
ARG ASSET_BUCKET_NAME
ARG AWS_ACCESS_KEY_ID
ARG AWS_DEFAULT_REGION
ARG AWS_SECRET_ACCESS_KEY
ARG AWS_SESSION_TOKEN
RUN aws s3 sync . s3://$ASSET_BUCKET_NAME --acl public-read --size-only

### app
FROM public.ecr.aws/docker/library/node:20-alpine as app
WORKDIR /app

COPY --from=build /app/.next/standalone .
COPY --from=build /app/public public

ARG SENTRY_RELEASE
ENV SENTRY_RELEASE=$SENTRY_RELEASE
ENV NEXT_TELEMETRY_DISABLED=1
CMD ["node", "server.js"]
