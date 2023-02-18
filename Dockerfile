FROM node:17

#working Dir 
WORKDIR /app

#copy package.json files
COPY package*.json ./

#install Prettier(For our package's build function)
RUN npm install prettier -g

#Install Files
RUN npm install 

#Copy Source Files 
COPY . . 

#Build
RUN npm run build 

# Expose the API Port 
EXPOSE 3000

CMD ["node", "server.js"]