/**
 * Unit tests for taskController
 *
 * We mock the Task model and ApiResponse so we can test controller logic
 * in isolation — no database or HTTP server required.
 */

const {
  createTask,
  updateTask,
  getAllTasks,
  getTaskById,
  deleteTask,
} = require('../controllers/taskController');

// ── Mock the Task model ──────────────────────────────────
jest.mock('../models/Task');
const Task = require('../models/Task');

// ── Helpers ──────────────────────────────────────────────

/** Build a fake Express `res` with chainable `.status().json()` */
const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

/** Build a fake Express `req` */
const mockReq = (body = {}, params = {}) => ({ body, params });

// ──────────────────────────────────────────────────────────
// createTask
// ──────────────────────────────────────────────────────────
describe('createTask', () => {
  afterEach(() => jest.restoreAllMocks());

  test('should create a task with valid data', async () => {
    const taskData = {
      title: 'Learn Docker',
      description: 'Practice Docker volumes',
      status: 'todo',
      priority: 'high',
    };
    const createdTask = { ...taskData, _id: 'abc123' };

    Task.create.mockResolvedValue(createdTask);

    const req = mockReq(taskData);
    const res = mockRes();

    await createTask(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, statusCode: 201 })
    );
  });

  test('should accept UPPERCASE status and priority (case-insensitive)', async () => {
    const taskData = {
      title: 'Learn Docker',
      status: 'TODO',
      priority: 'HIGH',
    };
    const createdTask = { title: 'Learn Docker', status: 'todo', priority: 'high', _id: 'abc123' };

    Task.create.mockResolvedValue(createdTask);

    const req = mockReq(taskData);
    const res = mockRes();

    await createTask(req, res);

    // Should succeed, NOT return 400
    expect(res.status).toHaveBeenCalledWith(201);
    // Verify that Task.create was called with lowercased values
    expect(Task.create).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'todo', priority: 'high' })
    );
  });

  test('should accept mixed-case status (e.g. "In-Progress")', async () => {
    const taskData = { title: 'Test', status: 'In-Progress' };

    Task.create.mockResolvedValue({ ...taskData, status: 'in-progress', _id: '1' });

    const req = mockReq(taskData);
    const res = mockRes();

    await createTask(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(Task.create).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'in-progress' })
    );
  });

  test('should return 400 when title is missing', async () => {
    const req = mockReq({ description: 'No title here' });
    const res = mockRes();

    await createTask(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, message: 'Task title is required' })
    );
  });

  test('should return 400 when title is empty string', async () => {
    const req = mockReq({ title: '   ' });
    const res = mockRes();

    await createTask(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('should return 400 for truly invalid status', async () => {
    const req = mockReq({ title: 'Test', status: 'invalid-status' });
    const res = mockRes();

    await createTask(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining('Invalid status'),
      })
    );
  });

  test('should return 400 for truly invalid priority', async () => {
    const req = mockReq({ title: 'Test', priority: 'urgent' });
    const res = mockRes();

    await createTask(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining('Invalid priority'),
      })
    );
  });

  test('should return 400 for invalid due date', async () => {
    const req = mockReq({ title: 'Test', dueDate: 'not-a-date' });
    const res = mockRes();

    await createTask(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Invalid due date format',
      })
    );
  });

  test('should use defaults when status and priority are omitted', async () => {
    const taskData = { title: 'Simple Task' };

    Task.create.mockResolvedValue({ ...taskData, _id: 'x' });

    const req = mockReq(taskData);
    const res = mockRes();

    await createTask(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    // status and priority should be undefined (let Mongoose defaults apply)
    expect(Task.create).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Simple Task' })
    );
  });

  test('should handle database errors gracefully', async () => {
    Task.create.mockRejectedValue(new Error('DB connection failed'));

    const req = mockReq({ title: 'Test' });
    const res = mockRes();

    await createTask(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
  });
});

// ──────────────────────────────────────────────────────────
// getAllTasks
// ──────────────────────────────────────────────────────────
describe('getAllTasks', () => {
  afterEach(() => jest.restoreAllMocks());

  test('should return all tasks', async () => {
    const tasks = [
      { _id: '1', title: 'Task 1' },
      { _id: '2', title: 'Task 2' },
    ];

    Task.find.mockReturnValue({ sort: jest.fn().mockResolvedValue(tasks) });

    const req = mockReq();
    const res = mockRes();

    await getAllTasks(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, data: tasks })
    );
  });

  test('should return 500 on database error', async () => {
    Task.find.mockReturnValue({
      sort: jest.fn().mockRejectedValue(new Error('DB error')),
    });

    const req = mockReq();
    const res = mockRes();

    await getAllTasks(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ──────────────────────────────────────────────────────────
// getTaskById
// ──────────────────────────────────────────────────────────
describe('getTaskById', () => {
  afterEach(() => jest.restoreAllMocks());

  test('should return a task by ID', async () => {
    const task = { _id: 'abc', title: 'Found Task' };
    Task.findById.mockResolvedValue(task);

    const req = mockReq({}, { id: 'abc' });
    const res = mockRes();

    await getTaskById(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ data: task })
    );
  });

  test('should return 404 when task not found', async () => {
    Task.findById.mockResolvedValue(null);

    const req = mockReq({}, { id: 'nonexistent' });
    const res = mockRes();

    await getTaskById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });
});

// ──────────────────────────────────────────────────────────
// updateTask
// ──────────────────────────────────────────────────────────
describe('updateTask', () => {
  afterEach(() => jest.restoreAllMocks());

  const makeMockTask = (overrides = {}) => ({
    _id: 'task1',
    title: 'Original',
    description: '',
    status: 'todo',
    priority: 'medium',
    dueDate: null,
    save: jest.fn(),
    ...overrides,
  });

  test('should update task with valid data', async () => {
    const task = makeMockTask();
    task.save.mockResolvedValue({ ...task, title: 'Updated' });
    Task.findById.mockResolvedValue(task);

    const req = mockReq({ title: 'Updated' }, { id: 'task1' });
    const res = mockRes();

    await updateTask(req, res);

    expect(task.title).toBe('Updated');
    expect(task.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('should accept UPPERCASE status in update (case-insensitive)', async () => {
    const task = makeMockTask();
    task.save.mockResolvedValue({ ...task, status: 'done' });
    Task.findById.mockResolvedValue(task);

    const req = mockReq({ status: 'DONE' }, { id: 'task1' });
    const res = mockRes();

    await updateTask(req, res);

    expect(task.status).toBe('done');
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('should accept UPPERCASE priority in update (case-insensitive)', async () => {
    const task = makeMockTask();
    task.save.mockResolvedValue({ ...task, priority: 'low' });
    Task.findById.mockResolvedValue(task);

    const req = mockReq({ priority: 'LOW' }, { id: 'task1' });
    const res = mockRes();

    await updateTask(req, res);

    expect(task.priority).toBe('low');
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('should return 404 if task does not exist', async () => {
    Task.findById.mockResolvedValue(null);

    const req = mockReq({ title: 'Nope' }, { id: 'bad-id' });
    const res = mockRes();

    await updateTask(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('should return 400 for invalid status in update', async () => {
    const task = makeMockTask();
    Task.findById.mockResolvedValue(task);

    const req = mockReq({ status: 'invalid' }, { id: 'task1' });
    const res = mockRes();

    await updateTask(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('should return 400 for empty title in update', async () => {
    const task = makeMockTask();
    Task.findById.mockResolvedValue(task);

    const req = mockReq({ title: '' }, { id: 'task1' });
    const res = mockRes();

    await updateTask(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('should clear dueDate when set to null', async () => {
    const task = makeMockTask({ dueDate: new Date() });
    task.save.mockResolvedValue({ ...task, dueDate: null });
    Task.findById.mockResolvedValue(task);

    const req = mockReq({ dueDate: null }, { id: 'task1' });
    const res = mockRes();

    await updateTask(req, res);

    expect(task.dueDate).toBeNull();
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

// ──────────────────────────────────────────────────────────
// deleteTask
// ──────────────────────────────────────────────────────────
describe('deleteTask', () => {
  afterEach(() => jest.restoreAllMocks());

  test('should delete an existing task', async () => {
    Task.findByIdAndDelete.mockResolvedValue({ _id: 'task1' });

    const req = mockReq({}, { id: 'task1' });
    const res = mockRes();

    await deleteTask(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true })
    );
  });

  test('should return 404 when deleting non-existent task', async () => {
    Task.findByIdAndDelete.mockResolvedValue(null);

    const req = mockReq({}, { id: 'nonexistent' });
    const res = mockRes();

    await deleteTask(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });
});
