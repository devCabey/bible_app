# AI Bible Quotation App

## Project Structure
The project consists of two main parts:
- **Server** (Backend) - Handles API requests, database interactions, and AI processing.
- **Client** (Frontend) - Provides the user interface for interaction.

## Requirements
- [Node.js](https://nodejs.org/)
- [Yarn](https://yarnpkg.com/)
- [Docker](https://www.docker.com/)

## Setup and Running the Application

### Server Setup
1. Navigate to the server directory:
   ```sh
   cd server
   ```
2. Install dependencies:
   ```sh
   yarn install
   ```
3. Ensure Docker is running in the background.
4. Start the database in Docker:
   ```sh
   yarn database:up
   ```
5. Start the server:
   ```sh
   yarn dev
   ```
   or
   ```sh
   yarn start
   ```
6. Populate the database with real data:
   ```sh
   yarn database:populate
   ```

The server runs on **port 5500**.

### Client Setup
1. Navigate to the client directory:
   ```sh
   cd client
   ```
2. Install dependencies:
   ```sh
   yarn install
   ```
3. Start the client:
   ```sh
   yarn dev
   ```

The client runs on **port 5173**.

### Database
- The database is running on **port 5432** inside Docker.

## Notes
- Ensure that Docker is running before starting the database.
- The server must be running before using the client.
- If you face any issues, check logs and dependencies.

## License
This project is licensed under [MIT License](LICENSE).
