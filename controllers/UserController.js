import { Router, query } from 'express';
import UserService from '../services/UserService.js';
import NumberMiddleware from '../middlewares/number.middleware.js';
import UserMiddleware from '../middlewares/user.middleware.js';
import AuthMiddleware from '../middlewares/auth.middleware.js';
import userMiddleware from '../middlewares/user.middleware.js';

const router = Router();

router.post('/create', async (req, res) => {
    const response = await UserService.createUser(req);
    res.status(response.code).json(response.message);
});

router.get(
    '/:id',
    [
        NumberMiddleware.isNumber,
        UserMiddleware.isValidUserById,
        AuthMiddleware.validateToken,
        UserMiddleware.hasPermissions
    ],
    async (req, res) => {
        const response = await UserService.getUserById(req.params.id);
        res.status(response.code).json(response.message);
    });

router.put('/:id', [
        NumberMiddleware.isNumber,
        UserMiddleware.isValidUserById,
        AuthMiddleware.validateToken,
        UserMiddleware.hasPermissions,
    ],
    async(req, res) => {
        const response = await UserService.updateUser(req);
        res.status(response.code).json(response.message);
    });

router.delete('/:id',
    [
        NumberMiddleware.isNumber,
        UserMiddleware.isValidUserById,
        AuthMiddleware.validateToken,
        UserMiddleware.hasPermissions,
    ],
    async (req, res) => {
       const response = await UserService.deleteUser(req.params.id);
       res.status(response.code).json(response.message);
    });

//Endpoints 1
router.get('/getAllUsers/:id',[
        NumberMiddleware.isNumber,
        UserMiddleware.isValidUserById,
        AuthMiddleware.validateToken,
        UserMiddleware.hasPermissions,
    ],
    async(req,res) =>{
        const response = await UserService.getAllUsers(req.params.id);
        res.status(response.code).json(response.message);
    }
)

//endpoints 2
router.get('/findUsers/:id',[
        NumberMiddleware.isNumber,
        UserMiddleware.isValidUserById,
        AuthMiddleware.validateToken,
        UserMiddleware.hasPermissions,
        userMiddleware.validateSearchFilters
    ],
    async(req,res) =>{
        const response = await UserService.findUsers(req);
        res.status(response.code).json(response.message);
    }
)

//endpoints 3
router.post('/bulkCreate/:id',[
    NumberMiddleware.isNumber,
    UserMiddleware.isValidUserById,
    AuthMiddleware.validateToken,
    UserMiddleware.hasPermissions
    //UserMiddleware.checkExistsEmails
    ],
    async(req,res) =>{
        const response = await UserService.bulkCreate(req);
        res.status(response.code).json(response.message);
    } 
)

export default router;