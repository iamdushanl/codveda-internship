const { protect, admin } = require('../middleware/authMiddleware');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

jest.mock('jsonwebtoken');
jest.mock('../models/user');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockReq = (headers = {}, user = null) => ({ headers, user });

describe('Auth Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('protect', () => {
    it('should call next if valid token is provided', async () => {
      const req = mockReq({ authorization: 'Bearer valid_token' });
      const res = mockRes();
      const next = jest.fn();

      jwt.verify.mockReturnValue({ id: 'user123' });
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue({ _id: 'user123', role: 'USER' })
      });

      process.env.JWT_SECRET = 'secret';

      await protect(req, res, next);

      expect(jwt.verify).toHaveBeenCalledWith('valid_token', 'secret');
      expect(User.findById).toHaveBeenCalledWith('user123');
      expect(req.user).toEqual({ _id: 'user123', role: 'USER' });
      expect(next).toHaveBeenCalled();
    });

    it('should return 401 if token is invalid', async () => {
      const req = mockReq({ authorization: 'Bearer invalid_token' });
      const res = mockRes();
      const next = jest.fn();

      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await protect(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Not authorized, token failed' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 if no token is provided', async () => {
      const req = mockReq();
      const res = mockRes();
      const next = jest.fn();

      await protect(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Not authorized, no token' });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('admin', () => {
    it('should call next if user is admin', () => {
      const req = mockReq({}, { _id: 'user123', role: 'ADMIN' });
      const res = mockRes();
      const next = jest.fn();

      admin(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should return 403 if user is not admin', () => {
      const req = mockReq({}, { _id: 'user123', role: 'USER' });
      const res = mockRes();
      const next = jest.fn();

      admin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: 'Not authorized as an admin' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 403 if no user is found', () => {
      const req = mockReq();
      const res = mockRes();
      const next = jest.fn();

      admin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: 'Not authorized as an admin' });
      expect(next).not.toHaveBeenCalled();
    });
  });
});
