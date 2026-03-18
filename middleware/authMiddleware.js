import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {

    // This reads the Authorization header from the request.When a user sends a request, it usually contains a header like this =>  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
    const authHeader = req.headers.authorization;

    // Authorization header is missing
    if (!authHeader) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    // Authorization header usually looks like this:  Bearer TOKEN_STRING          .split(" ") breaks it into:["Bearer", "TOKEN_STRING"]     index 0 → Bearer    index 1 → TOKEN_STRING
    // This line stores the actual token in token.
    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            return res.status(401).json({ message: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};


export const verifyRole = (role) => {
    return (req, res, next) => {
        const userRole =  req.user?.role;
        if (userRole !== role) {   
            return res.status(403).json({ message: 'Forbidden' });
        }
        next();
    };
};
