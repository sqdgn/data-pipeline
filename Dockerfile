FROM node:16 AS node

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install


COPY . .

FROM hasura/graphql-engine:v2.44.0

ENV HASURA_GRAPHQL_METADATA_DATABASE_URL=${METADATA_DATABASE_URL}
ENV PG_DATABASE_URL=${DATABASE_URL}
ENV HASURA_GRAPHQL_ENABLE_CONSOLE=true
ENV HASURA_GRAPHQL_DEV_MODE=false
ENV HASURA_GRAPHQL_ENABLED_LOG_TYPES="startup,http-log,webhook-log,websocket-log,query-log"
ENV HASURA_GRAPHQL_ADMIN_SECRET=${HASURA_ADMIN_SECRET}
ENV HASURA_GRAPHQL_METADATA_DEFAULTS='{"backend_configs":{"dataconnector":{"athena":{"uri":"http://data-connector-agent:8081/api/v1/athena"},"mariadb":{"uri":"http://data-connector-agent:8081/api/v1/mariadb"},"mysql8":{"uri":"http://data-connector-agent:8081/api/v1/mysql"},"oracle":{"uri":"http://data-connector-agent:8081/api/v1/oracle"},"snowflake":{"uri":"http://data-connector-agent:8081/api/v1/snowflake"}}}}'

EXPOSE 9090

RUN apt-get update && apt-get install -y supervisor

COPY --from=node /app /app

COPY supervisord.conf /etc/supervisord.conf
CMD ["supervisord", "-c", "/etc/supervisord.conf"]

