FROM debian:bullseye

ENV PACKETBEAT_VERSION=7.9.1

# Download and install packetbeat
RUN apt-get update && \
	apt-get install -y curl bash libc6 libpcap0.8 && \
	curl -L -O https://artifacts.elastic.co/downloads/beats/packetbeat/packetbeat-oss-${PACKETBEAT_VERSION}-amd64.deb && \
	dpkg -i packetbeat-oss-${PACKETBEAT_VERSION}-amd64.deb

COPY packetbeat.yml /etc/packetbeat/packetbeat.yml
RUN chmod go-w /etc/packetbeat/packetbeat.yml

CMD packetbeat -e
