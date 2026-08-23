/**
 * Task status and priority constants.
 *
 * Centralised here so that models, controllers, and validators
 * all reference the same source of truth.
 */

const TASK_STATUS = Object.freeze({
  TODO: 'todo',
  IN_PROGRESS: 'in-progress',
  DONE: 'done',
});

const TASK_PRIORITY = Object.freeze({
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
});

const TASK_STATUS_VALUES = Object.values(TASK_STATUS);
const TASK_PRIORITY_VALUES = Object.values(TASK_PRIORITY);

module.exports = {
  TASK_STATUS,
  TASK_PRIORITY,
  TASK_STATUS_VALUES,
  TASK_PRIORITY_VALUES,
};
