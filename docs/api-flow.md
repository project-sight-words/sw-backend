# API Flow Reference

When an API endpoint is called, the general flow looks like:

```mermaid
flowchart LR
  controller{{Controller Layer}}
  request[[Request]]
  subgraph User Facing
    request --> controller
  end
  subgraph Backend
    controller --> service{{Service Layer}}
    service --> repository{{Repository Layer}}
    repository --> database[(PostgreSQL Database)]
    database --> repository
    repository --> service
    service --> controller
    controller --> request
  end
```

## Core design decisions

- Returning `404 Not Found` when an invalid UUID is given as a path parameter

## Students endpoint

### Entities

1. Student (Full) \[Return value object only]
   1. `id` — student UUID
   2. `email` — user email associated with student
   3. `name` — student’s name
   4. `studentId` (aliased to `student_id` in requests/responses) — student’s
      assigned id
2. Student (Create)
   1. `email` — user email associated with student
   2. `name` — student’s name
   3. `studentId` (aliased to `student_id` in requests/responses) — student’s
      assigned id
3. Student (Update)
   1. `name` — student’s name
   2. `studentId` (aliased to `student_id` in requests/responses) — student’s
      assigned id

### `GET /students/`

Returns all existing students in the system (excluding those that have already
been deactivated).

```mermaid
flowchart TD
  subgraph GET /students/
    get[[GET /students]] --> gs{{Get active students from database}}
    gs -- Nothing retrieved --> error[/Return 404 Not Found Exception/]
    gs -- At least 1 entry retrieved --> success[/Return 200 OK with resulting students/]
  end
```

Returns a JSON array of Student (Full) entities.

### `GET /students/:id`

Returns the matching student given the student UUID associated with the student.

```mermaid
flowchart TD
  subgraph GET /students/:id
    get[[GET /students/:id]] --> check{{Check given id is valid UUID}}
    check -- Invalid UUID --> error[/Return 400 Bad Request Exception/]
    check -- Valid UUID --> retrieve{{Attempt to search for the student given the index}}
    retrieve -- Found & Has User --> success[/Return 200 OK with resulting student/]
    retrieve -- Found & No User --> not_found[/Return 404 Not Found Exception/]
    retrieve -- Not found --> not_found
  end
```

Returns a Student (Full) entity.

### `POST /students/`

Creates new student records given a JSON array of Student (Create) entities.

The flowchart will attempt to run sequentially in a transaction block so
everything rolls back if there are errors.

The core idea is that when creating a new batch of students, if a student
already exists within the system, their core particulars cannot be changed. If
any changes are detected, the entire batch of students will not be created and
will instead be validated for further errors.

```mermaid
flowchart LR
  subgraph POST /students/
    direction TB
    post[[POST /students]] --> retrieve_user{{Retrieve user given email from request}}
    retrieve_user -- Found --> retrieve_student{{Retrieve student given student_id from request}}
    retrieve_user -- Not found --> create_user{{Create new user with given email}}
    create_user --> retrieve_student
    retrieve_student -- Not found --> create_student{{Create new student with given student id and name}}
    retrieve_student -- Found --> check_name{{Check if existing student's name matches given name}}
    check_name -- No match --> Validation
    check_name -- Match --> retrieve_link{{Retrieve user-student link}}
    retrieve_link -- Does not exist --> create_link{{Create user-student link}}
    create_link --> success[/Return 200 OK with newly created student/]

    retrieve_link -- Exists --> success
  end

  subgraph Validation
    direction TB
    TBC
  end
```

### `PUT /students/:id`

Updates a given student record that matches the given student UUID.

```mermaid
flowchart TD
  subgraph PUT /students/:id
    put[[PUT /students/:id]] --> check{{Check given id is valid UUID}}
    check -- Invalid UUID --> error[/Return 400 Bad Request Exception/]
    check -- Valid UUID --> retrieve{{Attempt to search for the student given the index}}
    retrieve -- Found & No User --> not_found[/Return 404 Not Found Exception/]
    retrieve -- Not found --> not_found
    retrieve -- Found & Has User --> update{{Attempt to update the student}}
    update -- Student ID conflict --> error
    update -- No conflict --> success[/Return 200 OK with updated student/]
  end
```
