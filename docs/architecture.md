# Architecture

## Architecture style
Clean Architecture (without framework dependency)

## Layers

### 1. Domain layer
Business logic, entities, rules.
NO database, NO HTTP, NO frameworks.

### 2. Application layer
Use cases (business operations).

### 3. Infrastructure layer
Database, file system, external APIs.

### 4. Presentation layer
Controllers / API / CLI interface

## Dependency rule
Outer layers depend on inner layers, NOT vice versa.

