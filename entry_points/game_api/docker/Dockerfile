FROM node:erbium-alpine3.10

# We add curl for the health checks
RUN apk add --update-cache curl

COPY ./entry_points/game_api /app/game_api
COPY ./src/city /app/src/city
COPY ./src/shared_kernel /app/src/shared_kernel

WORKDIR /app/game_api
RUN yarn install --frozen-lockfile

EXPOSE 80
CMD node index.js 2>&1 | tee /tmp/LogDir/output.log
