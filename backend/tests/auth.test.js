const basicAuth = require('../src/middleware/auth');

describe('Auth Middleware', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            headers: {}
        };
        res = {
            setHeader: jest.fn(),
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        next = jest.fn();
    });

    test('should return 401 if no authorization header', () => {
        basicAuth(req, res, next);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'Authentication required' });
    });

    test('should call next if valid credentials', () => {
        const user = process.env.ADMIN_USER || 'admin';
        const pass = process.env.ADMIN_PASS || 'password123';
        const auth = Buffer.from(`${user}:${pass}`).toString('base64');
        req.headers.authorization = `Basic ${auth}`;

        basicAuth(req, res, next);
        expect(next).toHaveBeenCalled();
    });

    test('should return 401 if invalid credentials', () => {
        req.headers.authorization = 'Basic ' + Buffer.from('wrong:wrong').toString('base64');

        basicAuth(req, res, next);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'Invalid credentials' });
    });
});
