const mongoose = require('mongoose');
const { TASK_STATUS, TASK_PRIORITY, TASK_STATUS_VALUES, TASK_PRIORITY_VALUES } = require('../constants/taskConstants');

const taskSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    status: {
      type: String,
      enum: {
        values: TASK_STATUS_VALUES,
        message: '{VALUE} is not a valid status',
      },
      default: TASK_STATUS.TODO,
    },
    priority: {
      type: String,
      enum: {
        values: TASK_PRIORITY_VALUES,
        message: '{VALUE} is not a valid priority',
      },
      default: TASK_PRIORITY.MEDIUM,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    dueDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// ── Indexes ──────────────────────────────────────────────
taskSchema.index({ status: 1 });
taskSchema.index({ priority: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ assignedTo: 1 });
taskSchema.index({ createdAt: -1 });

// ── Pre-save hook: sync `completed` with status ─────────
taskSchema.pre('save', function () {
  if (this.isModified('status')) {
    this.completed = this.status === TASK_STATUS.DONE;
  }
});

// ── JSON transform: hide __v, rename _id ─────────────────
taskSchema.set('toJSON', {
  transform(_doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Task', taskSchema);
