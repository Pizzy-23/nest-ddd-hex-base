# nest-ddd-hex-base

This repository presents a base architecture for NestJS applications, implementing the principles of Domain-Driven Design (DDD) and Hexagonal Architecture. The goal is to provide a robust and scalable structure for developing microservices and APIs, promoting separation of concerns, maintainability, and testability of the code. This project serves as a starting point for teams looking to build high-quality applications that are adaptable to changing requirements.

## Overview

`nest-ddd-hex-base` is a project template that integrates the powerful NestJS framework with software design best practices, such as DDD and Hexagonal Architecture. This combination aims to create applications that are not only efficient and performant but also easy to understand, modify, and extend. The proposed architecture focuses on the clarity of the business domain, isolating core logic from infrastructure and interface concerns.

## Key Features

This base architecture offers:

- **Clear Separation of Concerns**: Isolates business logic from technical details using Hexagonal Architecture.
- **Domain-Driven Design (DDD)**: Focuses on a rich domain model, including Entities, Value Objects, Aggregates, and Domain Services.
- **Robust and Scalable Structure**: Designed for building maintainable microservices and APIs.
- **High Testability**: Allows isolated testing of domain components, reducing external dependencies.
- **Flexibility and Adaptability**: Facilitates swapping infrastructure components (e.g., databases) without impacting the core domain.
- **Modern Technology Stack**: Leverages NestJS, TypeScript, TypeORM, and other widely adopted tools.
- **Comprehensive Testing Setup**: Includes configurations for unit and end-to-end tests with Jest.
- **API Documentation**: Integrates Swagger for automatic and interactive API documentation.

## Technologies Used

The project is built upon a solid foundation of modern and widely adopted technologies in the Node.js ecosystem:

- **NestJS**: A progressive Node.js framework for building efficient and scalable server-side applications. It uses TypeScript and combines elements of OOP (Object-Oriented Programming), FP (Functional Programming), and FRP (Functional Reactive Programming).
- **TypeScript**: A programming language that adds static typing to JavaScript, improving code quality, error detection during development, and maintainability of large codebases.
- **Node.js**: A JavaScript runtime environment that allows JavaScript code to be executed on the server side.
- **Yarn**: A fast, reliable, and secure package manager for JavaScript.
- **Jest**: A JavaScript testing framework with a focus on simplicity, used for unit and integration tests.
- **TypeORM**: An ORM (Object-Relational Mapper) that supports popular databases and helps write platform-independent database code.
- **SQLite**: A relational database management system contained in a small C library. It is often used for local development and testing due to its simplicity and serverless nature.
- **Swagger (OpenAPI)**: A tool for documenting RESTful APIs, allowing developers and API consumers to understand services without accessing the source code.
- **JWT (JSON Web Tokens)**: An open standard (RFC 7519) that defines a compact and self-contained way for securely transmitting information between parties as a JSON object. Used for authentication and authorization.
- **Bcrypt**: A password hashing function designed to be slow and resistant to brute-force attacks, ensuring the security of user passwords.
- **Cache Manager**: A library for managing cache in Node.js applications, improving performance by storing frequently accessed data.

## Architecture

This project adopts an architectural approach that combines Domain-Driven Design (DDD) and Hexagonal Architecture (also known as Ports and Adapters). This combination aims to create robust, flexible, and easy-to-maintain systems with a clear separation of concerns.

### Domain-Driven Design (DDD)

DDD is a software development approach that focuses on connecting the implementation to an evolving model of the core domain. In the context of this project, DDD is applied through the following concepts:

- **Rich Domain**: The heart of the application is the domain, which encapsulates business logic and rules autonomously, independent of technical details.
- **Entities**: Objects that have an identity and a lifecycle, representing business concepts with attributes and behaviors.
- **Value Objects**: Objects that describe characteristics of something but do not have their own conceptual identity. They are immutable and compared by their values.
- **Aggregates**: A cluster of Entities and Value Objects treated as a single transactional unit. An Aggregate has a root (Aggregate Root) that ensures the consistency of the Aggregate.
- **Domain Services**: Operations that do not naturally fit into Entities or Value Objects but represent important business logic.
- **Repositories**: Abstractions for data persistence, allowing the domain to interact with data storage without knowing the implementation details.
- **Ubiquitous Language**: The development team and domain experts use the same language to describe the system, minimizing ambiguities.

### Application Layer

The Application Layer sits between the Domain Layer and the Infrastructure Layer. Its primary responsibility is to orchestrate the execution of business logic, acting as a facade to the domain. It defines the use cases or commands that the application supports, translating external requests into domain operations and coordinating the flow of data.

Key aspects of the Application Layer:

- **Use Cases/Application Services**: These classes encapsulate specific application functionalities. They receive input (DTOs or commands), validate them, invoke domain objects (entities, aggregates, domain services) to perform business logic, and manage transactions. They do not contain business rules themselves but orchestrate the domain to execute them.
- **DTOs (Data Transfer Objects)**: Used to transfer data between the application layer and the presentation/infrastructure layers. They define the shape of input and output data for application services.
- **Orchestration**: The application layer coordinates interactions between different domain objects and external services (via driven ports), ensuring that business processes are executed correctly.
- **Transaction Management**: It is responsible for defining transactional boundaries, ensuring that a series of domain operations are treated as a single atomic unit.

### Hexagonal Architecture (Ports and Adapters)

Hexagonal Architecture aims to isolate the core business logic (the domain) from its external concerns, such as databases, user interfaces, and external services. This is achieved through the definition of 'ports' and 'adapters':

- **Ports**: These are interfaces that define how the domain interacts with the outside world. There are two main types of ports:
  - **Driving Ports**: Define how external agents (such as API controllers, user interfaces) interact with the application. For example, an interface for an application service that receives commands.
  - **Driven Ports**: Define how the application interacts with external agents (such as databases, email services, other microservices). For example, an interface for a data repository.
- **Adapters**: These are concrete implementations of the ports. They translate calls from the outside world into the format the domain understands and vice versa.
  - **Driving Adapters**: Implement the driving ports. For example, a REST controller that calls an application service.
  - **Driven Adapters**: Implement the driven ports. For example, a repository implementation using TypeORM to interact with a database.

#### Benefits of the Combined Architecture:

- **Separation of Concerns**: The domain remains clean and focused on business logic, without being polluted by infrastructure details.
- **Testability**: Domain components can be tested in isolation, without the need to configure databases or user interfaces.
- **Flexibility**: Infrastructure can be easily swapped (e.g., switching from an SQLite database to PostgreSQL) without affecting business logic.
- **Maintainability**: The code is easier to understand and maintain, as responsibilities are clearly defined.
- **Scalability**: Facilitates the evolution of the application, allowing the addition of new functionalities or adaptation to new requirements with less impact.

## Project Structure

The project structure is organized to reflect the principles of Hexagonal Architecture and DDD, ensuring a clear separation of responsibilities and facilitating code navigation and maintenance. Below is an overview of the main directories and their purposes:

```bash
nest-ddd-hex-base/
├── src/ # Application source code
│ ├── application/ # Application Layer - Defines use cases, orchestrates domain logic
│ │ ├── dtos/ # Data Transfer Objects for input/output of application services
│ │ ├── modules/ # NestJS modules that group related application functionalities
│ │ └── use-cases/ # Specific application use cases, invoking domain objects
│ ├── domain/ # Domain Layer (Core Domain) - Pure business logic, infrastructure-independent
│ │ ├── base/ # Base classes or interfaces for domain objects (e.g., AggregateRoot, Entity)
│ │ ├── constants/ # Domain-specific constants
│ │ ├── domain-events/ # Definitions of domain events
│ │ ├── entities/ # Domain Entities with identity and lifecycle
│ │ ├── repositories/ # Interfaces for data persistence (driven ports)
│ │ ├── services/ # Domain Services for business logic that doesn't fit entities/value objects
│ │ └── vos/ # Value Objects, immutable objects representing descriptive aspects
│ ├── infrastructure/ # Infrastructure Layer - Concrete implementations for persistence, external communication
│ │ ├── common/ # Shared infrastructure utilities and modules
│ │ ├── database/ # Database configurations, TypeORM entities, migrations, and repository implementations (driven adapters)
│ │ └── http/ # HTTP controllers (driving adapters), DTOs, authentication, middlewares
│ ├── app.module.ts # Root application module, orchestrating main modules
│ └── main.ts # NestJS application entry point
├── test/ # Tests (unit, e2e)
│ ├── unit/ # Unit tests for domain and application logic
│ ├── e2e/ # End-to-end tests for APIs and complete flows
│ └── jest-e2e.json # Jest configuration for e2e tests
├── tools/ # Auxiliary tools and scripts
│ └── generate/ # Scripts for file generation (e.g., modules, components)
├── package.json # Project metadata and dependencies
├── nest-cli.json # Nest CLI configuration
├── tsconfig.json # TypeScript configuration
├── jest-unit.json # Jest configuration for unit tests
├── populate-templates.sh # Script to populate templates (if any)
├── README.md # Original project README (will be replaced by this one)
└── yarn.lock # Yarn dependency lock file
```

**Explanation of Main Directories:**

- **`src/application`**: This layer contains the application services (use cases) that orchestrate the domain logic. It defines the specific functionalities the application offers, translating external requests into domain operations. It includes DTOs for data transfer and modules for grouping related application concerns.

- **`src/domain`**: This is the innermost and crucial layer, containing the core business logic. It is completely independent of any infrastructure technology. Here you will find domain definitions (entities, value objects, aggregates), repository interfaces, domain services, and domain events, ensuring a rich and isolated domain model.

- **`src/infrastructure`**: This layer contains the concrete implementations of the interfaces defined in the `domain` layer and handles external concerns. It includes adapters for databases (TypeORM, entities, migrations, and repository implementations), adapters for external interfaces (HTTP controllers, DTOs, authentication), and common infrastructure utilities. It is the layer that deals with the technical and external details of the application.

- **`test`**: Contains all project tests, divided into unit tests (to validate small units of code in isolation) and end-to-end tests (to verify the behavior of the application as a whole, through its APIs).

- **`tools`**: Stores auxiliary scripts and tools that can be used to automate development tasks, such as generating new modules or components, following the project structure.

## Installation

To set up and run the project locally, follow the steps below:

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/Pizzy-23/nest-ddd-hex-base.git
    cd nest-ddd-hex-base
    ```

2.  **Install dependencies:**
    This project uses `yarn` as its package manager. Make sure you have it installed globally (`npm install -g yarn`).

    ```bash
    yarn install
    ```

3.  **Environment Configuration (Optional):**
    If the project uses environment variables, create a `.env` file in the project root based on a potential `.env.example` (if available) and configure the necessary variables, such as database settings, API keys, etc.

## Running the Application

After installing dependencies, you can run the application in different modes:

- **Development Mode:**
  Starts the application in development mode, usually with hot-reloading for easier development.

  ```bash
  yarn run start:dev
  ```

- **Watch Mode:**
  Starts the application and automatically restarts it on every file change.

  ```bash
  yarn run start --watch
  ```

- **Production Mode:**
  Compiles the application for production and starts it. This mode is optimized for performance.

  ```bash
  yarn run start:prod
  ```

- **Debug Mode:**
  Starts the application in debug mode, allowing a debugger to connect.
  ```bash
  yarn run start:debug
  ```

## Testing

The project includes a comprehensive test suite to ensure code quality and functionality. Tests are divided into unit tests and end-to-end (e2e) tests.

- **Unit Tests:**
  Runs unit tests, focused on validating small units of code in isolation.

  ```bash
  yarn run test
  ```

- **End-to-End (E2E) Tests:**
  Runs e2e tests, which simulate end-user behavior to verify the integration of different parts of the application.

  ```bash
  yarn run test:e2e
  ```

- **Test Coverage:**
  Generates a test coverage report, indicating the percentage of code covered by tests.
  ```bash
  yarn run test:cov
  ```

## Useful Scripts

In addition to the run and test scripts, `package.json` defines other useful scripts for development:

- **`yarn run format`**: Formats the source code using Prettier to ensure consistent style.
- **`yarn run lint`**: Runs the linter (ESLint) to identify and fix style issues and potential errors in the code.
- **`yarn run generate:file --name (file-or-module-name)`**: A custom script to generate files (likely modules, components, etc.) in a standardized way, following the project structure. See `tools/generate/generate-file.js` for more details.

## Contributing

Contributions are welcome! If you wish to contribute to this project, please follow these guidelines:

1.  **Fork** the repository.
2.  Create a **branch** for your feature (`git checkout -b feature/your-feature`).
3.  Make your **changes** and **commit** (`git commit -m 'feat: Add new feature'`).
4.  Push your changes to your **fork** (`git push origin feature/your-feature`).
5.  Open a **Pull Request** detailing your changes and the problem they solve.

Ensure your commits follow a clear pattern and all tests pass before opening a Pull Request.

## License

This project is licensed under the MIT License. See the `LICENSE` file in the root of the repository for more details.

## Support

For questions, suggestions, or issues, please open an issue in this repository. The community and project maintainers will do their best to help.

## Credits and References

- **Author of `nest-ddd-hex-base`**: [Pizzy-23](https://github.com/Pizzy-23)
- **NestJS Framework**: This project is built upon the excellent [NestJS framework](https://nestjs.com/), originally created by [Kamil Myśliwiec](https://kamilmysliwiec.com).
- **NestJS Community**:
  - Website: [https://nestjs.com](https://nestjs.com/)
  - Twitter: [@nestframework](https://twitter.com/nestframework)
