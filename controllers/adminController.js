const User = require('../models/userModel');
const bcrypt = require('bcrypt');

const loadLogin = (req, res) => {
    res.render('login');
};

const verifyLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const userData = await User.findOne({ email });

        if (userData && await bcrypt.compare(password, userData.password)) {
            if (userData.is_admin === 0) {
                res.render('login', { message: "Email or Password is incorrect" });
            } else {
                req.session.user_id = userData._id;
                res.redirect('/admin/home');
            }
        } else {
            res.render('login', { message: "Email or Password is incorrect" });
        }
    } catch (error) {
        console.error(error.message);
    }
};

const loadDashboard = async (req, res) => {
    try {
        const userData = await User.findById(req.session.user_id);
        res.render('home', { admin: userData });
    } catch (error) {
        console.error(error.message);
    }
};

const logout = (req, res) => {
    req.session.destroy(() => {
        res.redirect('/admin');
    });
};

const adminDashboard = async (req, res) => {
    try {
        const searchQuery = req.query.search || ''; // Get search term from query string
        const usersData = await User.find({
            is_admin: 0,
            $or: [
                { name: { $regex: searchQuery, $options: 'i' } },
                { email: { $regex: searchQuery, $options: 'i' } },
                { mobile: { $regex: searchQuery, $options: 'i' } }
            ]
        });
        res.render('dashboard', { users: usersData, searchQuery });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).send('Server error');
    }
};

const newUserLoad = (req, res) => {
    res.render('new-user');
};

const addUser = async (req, res) => {
    try {
        const { name, email, mno, password } = req.body;
        const image = req.file.filename;
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            name,
            email,
            mobile: mno,
            image,
            password: hashedPassword,
            is_admin: 0,
        });

        await user.save();
        res.redirect('/admin/dashboard');
    } catch (error) {
        console.error(error.message);
        res.render('new-user', { message: "Something went wrong...!" });
    }
};

const editUserLoad = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        res.render('edit-user', { user });
    } catch (error) {
        console.error(error.message);
        res.redirect('/admin/dashboard');
    }
};

const updateUser = async (req, res) => {
    try {
        const { name, email, mno, password } = req.body;
        const updateData = { name, email, mobile: mno };

        if (req.file) {
            updateData.image = req.file.filename;
        }

        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        await User.findByIdAndUpdate(req.params.id, updateData);
        res.redirect('/admin/dashboard');
    } catch (error) {
        console.error(error.message);
        res.redirect('/admin/dashboard');
    }
};

const deleteUser = async(req,res)=>{
    try {
        const id = req.query.id;
        await User.deleteOne({_id:id});
        res.redirect('/admin/dashboard');
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    loadLogin,
    verifyLogin,
    loadDashboard,
    logout,
    adminDashboard,
    newUserLoad,
    addUser,
    editUserLoad,
    updateUser,
    deleteUser
};




