const db = require('../config/database');

class TradesmanProfile {
    constructor(data) {
        this.userId = data.userId;
        this.firstName = data.firstName;
        this.lastName = data.lastName;
        this.email = data.email;
        this.phone = data.phone || null;
        this.trade = data.trade || null;
        this.experience = data.experience || null;
        this.qualifications = data.qualifications || null;
        this.availability = data.availability || 'available';
        this.rating = data.rating || 0;
        this.created_at = new Date();
    }

    static async findOne(query) {
        try {
            const [rows] = await db.query(
                'SELECT * FROM tradesman_profiles WHERE ?',
                query
            );
            return rows[0] || null;
        } catch (error) {
            console.error('Error finding tradesman profile:', error);
            throw error;
        }
    }

    async save() {
        try {
            const result = await db.query(
                `INSERT INTO tradesman_profiles 
                (user_id, first_name, last_name, email, phone, trade, 
                experience, qualifications, availability, rating, created_at) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    this.userId,
                    this.firstName,
                    this.lastName,
                    this.email,
                    this.phone,
                    this.trade,
                    this.experience,
                    this.qualifications,
                    this.availability,
                    this.rating,
                    this.created_at
                ]
            );
            return result;
        } catch (error) {
            console.error('Error saving tradesman profile:', error);
            throw error;
        }
    }

    static async update(userId, updateData) {
        try {
            const result = await db.query(
                'UPDATE tradesman_profiles SET ? WHERE user_id = ?',
                [updateData, userId]
            );
            return result;
        } catch (error) {
            console.error('Error updating tradesman profile:', error);
            throw error;
        }
    }
}

module.exports = TradesmanProfile; 