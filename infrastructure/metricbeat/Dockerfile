FROM alpine:3.10

ENV METRICBEAT_VERSION=7.9.1

# Download and install metricbeat
RUN apk add --update-cache curl bash libc6-compat && \
	rm -rf /var/cache/apk/* && \
	curl https://artifacts.elastic.co/downloads/beats/metricbeat/metricbeat-oss-${METRICBEAT_VERSION}-linux-x86_64.tar.gz -o metricbeat.tar.gz && \
	tar xzvf metricbeat.tar.gz && \
	rm metricbeat.tar.gz && \
	mv metricbeat-${METRICBEAT_VERSION}-linux-x86_64 metricbeat && \
	cd metricbeat && \
	cp metricbeat /usr/bin && \
	rm -rf /metricbeat/metricbeat.yml

RUN mkdir /tmp/LogDir && touch /tmp/LogDir/output.log
COPY metricbeat.yml /metricbeat/metricbeat.yml
RUN chmod go-w /metricbeat/metricbeat.yml

COPY docker.yml /etc/metricbeat/modules.d/docker.yml
RUN chmod go-w /etc/metricbeat/modules.d/docker.yml

RUN metricbeat modules enable docker -c /metricbeat/metricbeat.yml

WORKDIR /metricbeat/
CMD ["metricbeat","-e","-c", "metricbeat.yml"]
