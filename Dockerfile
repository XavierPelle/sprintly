FROM node:24.9.0-alpine3.21

WORKDIR /app

COPY . .

RUN npm install

EXPOSE 3000

#CMD ["npm", "run", "dev"]
CMD ["tail", "-f", "/dev/null"]