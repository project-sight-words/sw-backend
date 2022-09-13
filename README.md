<p align="center">
  <a href="https://github.com/project-sight-words/" target="blank"><img src="https://avatars.githubusercontent.com/u/111692176?s=200&v=4/" width="200" style="border-radius: 30%;" alt="Project Sight Words Logo" /></a>
</p>

<p align="center">
  Backend service for Project Sight Words built using <a href="https://nestjs.com/">NestJS</a>.
</p>

## Setting Up

This section describes the process of setting up and running the backend of
Project Sight Words on your local computer.

### Prerequisites

Before we begin the set up process, ensure that the following tools have been
installed in your local computer.

- [Git](https://git-scm.com/): Version control system
- [Docker Engine](https://docs.docker.com/engine/): Containerization
  - Install through [Docker Desktop](https://docs.docker.com/desktop/)
    (Recommended 👍)

### Guide

1. Clone the repository into your local computer and change your working
   directory to the project’s root folder.
   ```shell
   git clone https://github.com/project-sight-words/sw-backend.git
   cd sw-backend
   ```
2. Create a `.env` file that contains the environment variables used by the
   project. You can refer to `.env.example` as a guide.
3. Build and run the container images using docker compose.
   ```shell
   docker compose up
   ```

## Development

This section explains how to use this project on your local computer for
development purposes.

### Starting up

1. Ensure that you are in the root directory of the project on your computer.
2. Start the docker containers.
   ```shell
   docker compose up
   ```

### Shutting down

1. Ensure that you are in the root directory of the project on your computer.
2. Stop the docker containers.
   ```shell
   docker compose down
   ```

### Database schema migrations

1. Ensure that you are in the root directory of the project on your computer.
2. Run the migration script.
   ```shell
   yarn migrate
   ```
