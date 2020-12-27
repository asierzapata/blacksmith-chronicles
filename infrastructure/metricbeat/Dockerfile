FROM debian:bullseye

ENV METRICBEAT_VERSION=7.9.1

# Download and install metricbeat
RUN apt-get update && \
	apt-get install -y curl bash libc6 && \
	curl -L -O https://artifacts.elastic.co/downloads/beats/metricbeat/metricbeat-oss-${METRICBEAT_VERSION}-amd64.deb && \
	dpkg -i metricbeat-oss-${METRICBEAT_VERSION}-amd64.deb

COPY metricbeat.yml /etc/metricbeat/metricbeat.yml
RUN chmod go-w /etc/metricbeat/metricbeat.yml

COPY docker.yml /etc/metricbeat/modules.d/docker.yml
RUN chmod go-w /etc/metricbeat/modules.d/docker.yml

RUN metricbeat modules enable docker

CMD metricbeat -e
