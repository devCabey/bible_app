# AI Bible Quotation App

## Project Structure

The project consists of two main parts:

-   **Server** (Backend) - Handles API requests, database interactions, and AI processing.
-   **Client** (Frontend) - Provides the user interface for interaction.

## Requirements

-   [Docker](https://www.docker.com/)
-   [Docker Compose](https://docs.docker.com/compose/)

## Setup and Running the Application

### Running the Application with Docker Compose

1. Ensure Docker is running in the background.
2. Build and start the services (server, client, and database) using:
    ```sh
    docker-compose up --build -d
    ```
    This will:
    - Build the required images
    - Start the database, server, and client
    - Run the application in detached mode (`-d` for background execution)

### Stopping the Application

To stop all running services:

```sh
docker-compose down
```

### Logs and Debugging

To check logs for the server or client, run:

```sh
docker-compose logs -f server
```

```sh
docker-compose logs -f client
```

### Notes

-   The **server** runs on **port 5500** inside Docker.
-   The **client** runs on **port 3000**.
-   The **database** runs on **port 5432** inside Docker.
-   Ensure Docker is running before starting the application.
-   If you face any issues, check logs and container statuses using `docker ps` and `docker-compose logs`.

## License

This project is licensed under [MIT License](LICENSE).
