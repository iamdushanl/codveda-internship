# TaskFlow Requirements

## Task Management

### User Stories

#### Create Task

As a user,
I want to create a task,
so that I can keep track of work that needs to be completed.

#### View Tasks

As a user,
I want to view my tasks,
so that I can see the work that needs to be completed.

#### View a Task

As a user,
I want to view a specific task,
so that I can see its details.

#### Update Task

As a user,
I want to update a task,
so that I can change its information or status.

#### Delete Task

As a user,
I want to delete a task,
so that I can remove tasks that are no longer needed.

## Acceptance Criteria

### Create Task

- A task must have a title.
- A task may have a description.
- A task must have a valid status.
- A task must have a valid priority.
- The system must generate a unique task ID.
- The system must store creation and update timestamps.

### Read Tasks

- The API must return existing tasks.
- The API must return an appropriate HTTP status.
- The API must return a consistent response structure.

### Read Single Task

- A valid task ID must return the corresponding task.
- An invalid task ID must return a client error.
- A task that does not exist must return `404 Not Found`.

### Update Task

- The task must exist before updating.
- Only valid fields may be updated.
- Updated timestamps must be maintained.

### Delete Task

- The task must exist before deletion.
- A successfully deleted task must return an appropriate success response.
- A nonexistent task must return `404 Not Found`.