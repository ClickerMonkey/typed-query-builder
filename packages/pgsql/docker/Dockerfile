FROM postgis/postgis

ENV POSTGRES_DB tqb
ENV POSTGRES_PASSWORD postgres
ENV POSTGRES_USER postgres

COPY setup.sql /docker-entrypoint-initdb.d/setup.sql

EXPOSE 5432