# Use Node.js 20 LTS
FROM node:20-alpine

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy project files
COPY . .

# Expose Express port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]