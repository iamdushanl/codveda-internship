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

// ── Mock the taskService ──────────────────────────────────
jest.mock('../services/taskService');
const taskService = require('../services/taskService');

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

    taskService.createTask.mockResolvedValue(createdTask);

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

    taskService.createTask.mockResolvedValue(createdTask);

    const req = mockReq(taskData);
    const res = mockRes();

    await createTask(req, res);

    // Should succeed, NOT return 400
    expect(res.status).toHaveBeenCalledWith(201);
    // Verify that taskService.createTask was called with lowercased values
    expect(taskService.createTask).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'todo', priority: 'high' })
    );
  });

  test('should accept mixed-case status (e.g. "In-Progress")', async () => {
    const taskData = { title: 'Test', status: 'In-Progress' };

    taskService.createTask.mockResolvedValue({ ...taskData, status: 'in-progress', _id: '1' });

    const req = mockReq(taskData);
    const res = mockRes();

    await createTask(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(taskService.createTask).toHaveBeenCalledWith(
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

    taskService.createTask.mockResolvedValue({ ...taskData, _id: 'x' });

    const req = mockReq(taskData);
    const res = mockRes();

    await createTask(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    // status and priority should be undefined (let defaults apply in the model/service)
    expect(taskService.createTask).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Simple Task' })
    );
  });

  test('should handle database errors gracefully', async () => {
    taskService.createTask.mockRejectedValue(new Error('DB connection failed'));

    const req = mockReq({ title: 'Test' });
    const res = mockRes();
    const next = jest.fn();

    await createTask(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
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

    taskService.getAllTasks.mockResolvedValue(tasks);

    const req = mockReq();
    const res = mockRes();

    await getAllTasks(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, data: tasks })
    );
  });

  test('should return 500 on database error', async () => {
    taskService.getAllTasks.mockRejectedValue(new Error('DB error'));


    const req = mockReq();
    const res = mockRes();
    const next = jest.fn();

    await getAllTasks(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});

// ──────────────────────────────────────────────────────────
// getTaskById
// ──────────────────────────────────────────────────────────
describe('getTaskById', () => {
  afterEach(() => jest.restoreAllMocks());

  test('should return a task by ID', async () => {
    const task = { _id: 'abc', title: 'Found Task' };
    taskService.getTaskById.mockResolvedValue(task);

    const req = mockReq({}, { id: 'abc' });
    const res = mockRes();

    await getTaskById(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ data: task })
    );
  });

  test('should return 404 when task not found', async () => {
    taskService.getTaskById.mockResolvedValue(null);

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
    taskService.updateTask.mockResolvedValue({ ...task, title: 'Updated' });

    const req = mockReq({ title: 'Updated' }, { id: 'task1' });
    const res = mockRes();
    const next = jest.fn();

    await updateTask(req, res, next);

    expect(taskService.updateTask).toHaveBeenCalledWith('task1', { title: 'Updated' });
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('should accept UPPERCASE status in update (case-insensitive)', async () => {
    const task = makeMockTask();
    taskService.updateTask.mockResolvedValue({ ...task, status: 'done' });

    const req = mockReq({ status: 'DONE' }, { id: 'task1' });
    const res = mockRes();
    const next = jest.fn();

    await updateTask(req, res, next);

    expect(taskService.updateTask).toHaveBeenCalledWith('task1', { status: 'done' });
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('should accept UPPERCASE priority in update (case-insensitive)', async () => {
    const task = makeMockTask();
    taskService.updateTask.mockResolvedValue({ ...task, priority: 'low' });

    const req = mockReq({ priority: 'LOW' }, { id: 'task1' });
    const res = mockRes();
    const next = jest.fn();

    await updateTask(req, res, next);

    expect(taskService.updateTask).toHaveBeenCalledWith('task1', { priority: 'low' });
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('should return 404 if task does not exist', async () => {
    taskService.updateTask.mockResolvedValue(null);

    const req = mockReq({ title: 'Nope' }, { id: 'bad-id' });
    const res = mockRes();

    await updateTask(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('should return 400 for invalid status in update', async () => {
    const task = makeMockTask();
    taskService.updateTask.mockResolvedValue(task);

    const req = mockReq({ status: 'invalid' }, { id: 'task1' });
    const res = mockRes();

    await updateTask(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('should return 400 for empty title in update', async () => {
    const task = makeMockTask();
    taskService.updateTask.mockResolvedValue(task);

    const req = mockReq({ title: '' }, { id: 'task1' });
    const res = mockRes();

    await updateTask(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('should clear dueDate when set to null', async () => {
    const task = makeMockTask({ dueDate: new Date() });
    taskService.updateTask.mockResolvedValue({ ...task, dueDate: null });

    const req = mockReq({ dueDate: null }, { id: 'task1' });
    const res = mockRes();
    const next = jest.fn();

    await updateTask(req, res, next);

    expect(taskService.updateTask).toHaveBeenCalledWith('task1', { dueDate: null });
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

// ──────────────────────────────────────────────────────────
// deleteTask
// ──────────────────────────────────────────────────────────
describe('deleteTask', () => {
  afterEach(() => jest.restoreAllMocks());

  test('should delete an existing task', async () => {
    taskService.deleteTask.mockResolvedValue({ _id: 'task1' });

    const req = mockReq({}, { id: 'task1' });
    const res = mockRes();

    await deleteTask(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true })
    );
  });

  test('should return 404 when deleting non-existent task', async () => {
    taskService.deleteTask.mockResolvedValue(null);

    const req = mockReq({}, { id: 'nonexistent' });
    const res = mockRes();

    await deleteTask(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });
});
