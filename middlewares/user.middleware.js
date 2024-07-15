import { where } from 'sequelize';
import db from '../dist/db/models/index.js';

const isValidUserById = async (req, res, next) => {
    const id = req.params.id;
    const response = db.User.findOne({
        where: {
            id: id,
            status: true,
        }
    });
    if (!response) {
        return res.status(404).json({
            message: 'User not found'
        });
    }
    next();
};

const hasPermissions = async (req, res, next) => {
    const token = req.headers.token;
    const payload = JSON.parse(Buffer.from(token, 'base64').toString('ascii'));
    if(!payload.roles.includes('admin')){
        if(payload.id !== +req.params.id){
            return res.status(401).json({
                message: 'Unauthorized'
            });
        }
    }
    next();
}

const validateSearchFilters = (req, res, next) => {
    const { 
        deleted,
        name,
        loginBefore,
        loginAfter
    } = req.query;

    if (deleted !== undefined) {
        if (deleted !== 'true' && deleted !== 'false') {
            return res.status(400).json({
                message: 'Invalid status filter'
            });
        }
    }

    if (name && typeof name !== 'string') {
        return res.status(400).json({
            message: 'Invalid name filter'
        });
    }

    if (loginBefore && !isValidDate(loginBefore)) {
        return res.status(400).json({
            message: 'Invalid loginBefore date format'
        });
    }

    if (loginAfter && !isValidDate(loginAfter)) {
        return res.status(400).json({
            message: 'Invalid loginAfter date format'
        });
    }

    if (loginBefore && loginAfter) {
        const currentDate = new Date();
        const dateBefore = new Date(loginBefore);
        const dateAfter = new Date(loginAfter);

        if (dateBefore >= dateAfter) {
            return res.status(400).json({
                message: 'Invalid date range: loginBefore must be before loginAfter'
            });
        }

        if (dateBefore >= currentDate || dateAfter >= currentDate) {
            return res.status(400).json({
                message: 'Invalid date: loginBefore and loginAfter must be before current date'
            });
        }
    }

    next();
};

const isValidDate = (dateString) => {
    return !isNaN(Date.parse(dateString));
};

const checkExistsEmails = async (req, res, next) => {
    const users = req.body.users;
    const existingEmails = [];

    for (const user of users) {
        const { email } = user;
        const existingUser = await db.User.findOne({ where: { email } });
        if (existingUser) {
            existingEmails.push(email);
        }
    }

    if (existingEmails.length > 0) {
        return res.status(400).json({
            error: `Emails already registered: ${existingEmails.join(', ')}`
        });
    }

    next();
};


export default {
    isValidUserById,
    hasPermissions,
    validateSearchFilters,
    checkExistsEmails
};