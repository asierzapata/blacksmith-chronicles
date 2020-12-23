FROM node:erbium-alpine3.10

COPY ./entry_points/city_api /app/city_api
COPY ./src/city /app/src/city
COPY ./src/shared_kernel /app/src/shared_kernel

WORKDIR /app/city_api
RUN yarn install --frozen-lockfile

EXPOSE 80
CMD ["node", "index.js"]
