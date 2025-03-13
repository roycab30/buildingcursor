const db = require('../config/database');

class PropertyOwnerProfile {
    constructor(data) {
        this.userId = data.userId;
        this.firstName = data.firstName;
        this.lastName = data.lastName;
        this.email = data.email;
        this.phone = data.phone || null;
        this.address = data.address || null;
        this.city = data.city || null;
        this.postcode = data.postcode || null;
        this.created_at = new Date();
    }

    static async findOne(query) {
        try {
            const [rows] = await db.query(
                'SELECT * FROM property_owner_profiles WHERE ?',
                query
            );
            return rows[0] || null;
        } catch (error) {
            console.error('Error finding property owner profile:', error);
            throw error;
        }
    }

    async save() {
        try {
            const result = await db.query(
                `INSERT INTO property_owner_profiles 
                (user_id, first_name, last_name, email, phone, 
                address, city, postcode, created_at) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    this.userId,
                    this.firstName,
                    this.lastName,
                    this.email,
                    this.phone,
                    this.address,
                    this.city,
                    this.postcode,
                    this.created_at
                ]
            );
            return result;
        } catch (error) {
            console.error('Error saving property owner profile:', error);
            throw error;
        }
    }

    static async update(userId, updateData) {
        try {
            const result = await db.query(
                'UPDATE property_owner_profiles SET ? WHERE user_id = ?',
                [updateData, userId]
            );
            return result;
        } catch (error) {
            console.error('Error updating property owner profile:', error);
            throw error;
        }
    }
}

module.exports = PropertyOwnerProfile; 