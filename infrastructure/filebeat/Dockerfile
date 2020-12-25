FROM alpine:3.10

ENV FILEBEAT_VERSION=7.9.1

# Download and install filebeat
RUN apk add --update-cache curl bash libc6-compat && \
	rm -rf /var/cache/apk/* && \
	curl https://artifacts.elastic.co/downloads/beats/filebeat/filebeat-oss-${FILEBEAT_VERSION}-linux-x86_64.tar.gz -o filebeat.tar.gz && \
	tar xzvf filebeat.tar.gz && \
	rm filebeat.tar.gz && \
	mv filebeat-${FILEBEAT_VERSION}-linux-x86_64 filebeat && \
	cd filebeat && \
	cp filebeat /usr/bin && \
	rm -rf /filebeat/filebeat.yml

RUN mkdir /tmp/LogDir && touch /tmp/LogDir/output.log
COPY filebeat.yml /filebeat/filebeat.yml
RUN chmod go-w /filebeat/filebeat.yml

WORKDIR /filebeat/
CMD ["filebeat","-e","-c", "filebeat.yml"]
