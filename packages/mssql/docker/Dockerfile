FROM mcr.microsoft.com/mssql/server:2019-latest

USER root

ENV ACCEPT_EULA Y
ENV SA_PASSWORD password#1

COPY setup.sql setup.sql
COPY import-data.sh import-data.sh
COPY entrypoint.sh entrypoint.sh

RUN chmod +x entrypoint.sh
RUN chmod +x import-data.sh

CMD /bin/bash ./entrypoint.sh

EXPOSE 1433