import { where } from 'sequelize';
import db from '../dist/db/models/index.js';
import bcrypt from 'bcrypt';

const createUser = async (req) => {
    const {
        name,
        email,
        password,
        password_second,
        cellphone
    } = req.body;
    if (password !== password_second) {
        return {
            code: 400,
            message: 'Passwords do not match'
        };
    }
    const user = await db.User.findOne({
        where: {
            email: email
        }
    });
    if (user) {
        return {
            code: 400,
            message: 'User already exists'
        };
    }

    const encryptedPassword = await bcrypt.hash(password, 10);

    const newUser = await db.User.create({
        name,
        email,
        password: encryptedPassword,
        cellphone,
        status: true
    });
    return {
        code: 200,
        message: 'User created successfully with ID: ' + newUser.id,
    }
};

const getUserById = async (id) => {
    return {
        code: 200,
        message: await db.User.findOne({
            where: {
                id: id,
                status: true,
            }
        })
    };
}

const updateUser = async (req) => {
    const user = db.User.findOne({
        where: {
            id: req.params.id,
            status: true,
        }
    });
    const payload = {};
    payload.name = req.body.name ?? user.name;
    payload.password = req.body.password ? await bcrypt.hash(req.body.password, 10) : user.password;
    payload.cellphone = req.body.cellphone ?? user.cellphone;
    await db.User.update(payload, {
        where: {
            id: req.params.id
        }

    });
    return {
        code: 200,
        message: 'User updated successfully'
    };
}

const deleteUser = async (id) => {
    /* await db.User.destroy({
        where: {
            id: id
        }
    }); */
    const user = db.User.findOne({
        where: {
            id: id,
            status: true,
        }
    });
    await  db.User.update({
        status: false
    }, {
        where: {
            id: id
        }
    });
    return {
        code: 200,
        message: 'User deleted successfully'
    };
}
//Endpoints 1
const getAllUsers = async (id) =>{
    
    const users = await db.User.findAll({
        where: {
            status: true
        }
    })

    return {
        code: 200,
        message : users
    }

}
// Endpoint 2: Find Users
const findUsers = async (req) => {
    const {
        deleted,
        name,
        loginBefore,
        loginAfter
    } = req.query;
    let userWhere = {};
    let sessionWhere = {};
    //se ajusta el estado status a false cuando el valor deleter es verdadero y viceversa
    if (deleted === 'true') {
        userWhere.status = false;
    } else if (deleted === 'false') {
        userWhere.status = true;
    }
    //console.log(userWhere.status)

    if (name) {
        userWhere.name = {
            [db.Sequelize.Op.like]: `%${name}%`
        };
    }
    if (loginBefore) {
        sessionWhere.updatedAt = {
            [db.Sequelize.Op.gte]: new Date(loginBefore) 
        };
    }
    if (loginAfter) {
        sessionWhere.updatedAt = {
             ...sessionWhere.updatedAt,
             [db.Sequelize.Op.lte]: new Date(loginAfter)
            };
    }

    const users = await db.User.findAll({
        where: userWhere,
        include: [{
            model: db.Session,
            where: sessionWhere
        }]
    });

    return {
        code: 200,
        message: users
    }
}


//Endpoints 3
const bulkCreate = async (req) => {
    const users = req.body.users;
    let successCount = 0;
    let failureCount = 0;

    for (const user of users) {
        const {
            name,
            email,
            password,
            password_second,
            cellphone 
        } = user;

        const existsUser = await db.User.findOne({
            where: {
                email : email } 
            });

        if (!existsUser && password === password_second) {
            const encryptedPassword = await bcrypt.hash(password, 10);

            await db.User.create({
                name,
                email,
                password: encryptedPassword,
                cellphone,
                status: true
            });

            successCount++;
        } else {
            failureCount++;
        }
    }

    return {
        code: 200,
        message: {
            successCount,
            failureCount
        }
    };
};
export default {
    createUser,
    getUserById,
    updateUser,
    deleteUser,
    getAllUsers,
    findUsers,
    bulkCreate

}