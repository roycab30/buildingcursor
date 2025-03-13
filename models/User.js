const conn = require('../config/database');
const bcrypt = require('bcrypt');

class User {
    constructor(data) {
        this.email = data.email;
        this.password = data.password;
        this.firstName = data.firstName;
        this.lastName = data.lastName;
        this.role = data.role;
        this.created_at = new Date();
    }

    static async findOne({ email }) {
        const [users] = await conn.execute('SELECT * FROM users WHERE email = ?', [email]);
        return users[0];
    }

    static async findById(userId) {
        try {
            const [rows] = await conn.execute(
                'SELECT * FROM users WHERE user_id = ?',
                [userId]
            );
            return rows[0] || null;
        } catch (error) {
            console.error('Error finding user by ID:', error);
            throw error;
        }
    }

    async save() {
        try {
            // Hash password before saving
            const hashedPassword = await bcrypt.hash(this.password, 10);
            
            const result = await conn.execute(
                `INSERT INTO users 
                (email, password, first_name, last_name, user_type, created_at, updated_at) 
                VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
                [
                    this.email,
                    hashedPassword,
                    this.firstName,
                    this.lastName,
                    this.role === 'tradesperson' ? 'tradesperson' : 
                    this.role === 'propertyOwner' ? 'property_owner' : 'user',
                    this.created_at
                ]
            );

            // Get the inserted user's ID
            const [newUser] = await conn.execute(
                'SELECT user_id FROM users WHERE email = ?',
                [this.email]
            );

            return newUser[0].user_id;
        } catch (error) {
            console.error('Error saving user:', error);
            throw error;
        }
    }

    static async update(userId, updateData) {
        try {
            // If password is being updated, hash it
            if (updateData.password) {
                updateData.password = await bcrypt.hash(updateData.password, 10);
            }

            const result = await conn.execute(
                'UPDATE users SET ? WHERE user_id = ?',
                [updateData, userId]
            );
            return result;
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    }

    static async verifyPassword(inputPassword, hashedPassword) {
        return await bcrypt.compare(inputPassword, hashedPassword);
    }

    static async delete(userId) {
        try {
            const result = await conn.execute(
                'DELETE FROM users WHERE user_id = ?',
                [userId]
            );
            return result;
        } catch (error) {
            console.error('Error deleting user:', error);
            throw error;
        }
    }

    static async create(userData) {
        const { email, password, firstName, lastName, userType } = userData;
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const [result] = await conn.execute(
            `INSERT INTO users (email, password, first_name, last_name, user_type, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
            [email, hashedPassword, firstName, lastName, userType]
        );
        
        return result.insertId;
    }
}

module.exports = User; 