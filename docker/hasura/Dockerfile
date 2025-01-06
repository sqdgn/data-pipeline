FROM hasura/graphql-engine:v2.38.0.cli-migrations-v3

ENV LOKI_API=http://loki.monitoring:3100

COPY ./hasura/migrations /hasura-migrations
COPY ./hasura/metadata /hasura-metadata