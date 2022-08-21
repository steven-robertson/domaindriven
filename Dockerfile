FROM caddy:2 AS base
COPY Caddyfile /etc/caddy/Caddyfile

FROM node:16 AS npmbuild
WORKDIR /project
COPY . .
RUN npm install
RUN npm run sass
RUN npm run copyfiles
RUN npm run build
RUN npm run jest

FROM base AS final
COPY --from=npmbuild /project/public /srv
RUN sed -i "s|ver=0|"ver=`date +"%s"`"|g" /srv/index.html
