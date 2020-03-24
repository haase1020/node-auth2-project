const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Users = require('../users/users-model.js'); ///research this
const { jwtSecret } = require('../config/secrets.js');

router.post('/register', (req, res) => {
    let user = req.body;
    const hash = bcrypt.hashSync(user.password, 10);
    user.password = hash;

    Users.add(user)
    .then(saved => {
        res.status(201).json(saved);
    })
    .catch(error => {
        res.status(500).json(error);
    });
});

router.post('/login', (req, res)=> {
    let { username, password, department } = req.body;

    Users.findBy({ username })
    .first()
    .then(user => {
        if (user && bcrypt.compareSync(password, user.password)) {
            const token = generateToken(user);
            res.status(200).json({ message: `Welcome ${user.username}`,
        token
    });

    } else {
        res.status(401).json({ message: 'invalid credentials' });
     }
    })
    .catch(({name,code,message,stack}) => {
        res.status(500).json({name,code,message,stack});
    });
});

function generateToken(user) {
    const payload = {
        subject: user.id,
        username: user.username,
        department: user.department || 'user'
    };

    const options = {
        expiresIn: '1h',
    };
    return jwt.sign(payload, jwtSecret, options);
}

module.exports = router;