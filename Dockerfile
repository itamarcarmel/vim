# Use an official Node.js image as the base
FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock) to the container
COPY package*.json ./

# Install production dependencies
RUN npm install --only=production

# Copy the rest of the application code to the container
COPY . .

# Build the TypeScript code (assumes `tsc` is in your devDependencies)
RUN npm run build

# Expose the port the app runs on
EXPOSE 8080

# Command to start the application
CMD ["node", "dist/src/index.js"]