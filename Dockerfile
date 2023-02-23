FROM node:17
#working Dir 
WORKDIR /app

#copy package.json files
COPY package*.json ./


#Install Files
RUN npm install 

#Copy Source Files 
COPY . /app

EXPOSE 3000

CMD ["npm", "start"]