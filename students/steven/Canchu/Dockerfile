# Step 1: Build the Node.js application image
FROM node:14-alpine as build

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install application dependencies
RUN npm install

# Copy the entire application code
COPY . .

# Expose the port on which the application will run
EXPOSE 3000

# Set the entry point command to start your Node.js application
CMD ["node", "server.js"]
