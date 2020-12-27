FROM debian:bullseye

ENV FILEBEAT_VERSION=7.9.1

# Download and install filebeat
RUN apt-get update && \
	apt-get install -y curl libc6 && \
	curl -L -O https://artifacts.elastic.co/downloads/beats/filebeat/filebeat-oss-${FILEBEAT_VERSION}-amd64.deb && \
	dpkg -i filebeat-oss-${FILEBEAT_VERSION}-amd64.deb

COPY filebeat.yml /etc/filebeat/filebeat.yml
RUN chmod go-w /etc/filebeat/filebeat.yml

COPY filebeat_credentials.txt filebeat_credentials.txt
RUN cat filebeat_credentials.txt | filebeat keystore add ES_PWD --stdin --force

CMD filebeat -e
