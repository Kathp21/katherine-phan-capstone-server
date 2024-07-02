const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer')
const knex = (require("../knexConfig"))
const jwt = require('jsonwebtoken')

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
    }
})

const forgotPassword = async (req, res) => {
    const { email } = req.body

    try {
        const user = await knex('users').where({email}).first()
        if(!user){
            return res.status(404).json({message: 'User not found'})
        }

        //Generate a JWT token
        const token = jwt.sign (
            {email: user.email},
            process.env.JWT_KEY,
            { expiresIn: '1h'}
        )

        // Ensure the URL has the token as a query parameter
        const resetURL = `${process.env.CLIENT_URL}/reset-password?token=${token}`   

        // Define the HTML content of the email
        const htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #dcdcdc; border-radius: 10px;">
                <h2 style="text-align: center; color: #333;">Password Reset Request</h2>
                <p style="font-size: 16px; color: #555;">Hello ${user.first_name},</p>
                <p style="font-size: 16px; color: #555;">
                    We received a request to reset your password. Click the button below to reset your password.
                </p>
                <div style="text-align: center; margin: 20px;">
                    <a href="${resetURL}" style="display: inline-block; background-color: #1e90ff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
                </div>
                <p style="font-size: 14px; color: #999;">
                    If you did not request a password reset, please ignore this email.
                </p>
                <p style="font-size: 14px; color: #999;">
                    This link will expire in 1 hour.
                </p>
                <p style="font-size: 14px; color: #999;">
                    Best regards,<br>Trip Crafters
                </p>
            </div>
        `;
        await transporter.sendMail({
            to: user.email,
            from: process.env.EMAIL,
            subject: 'Password Reset',
            html: htmlContent,
        })

        console.log('Password reset email sent')
        res.status(200).json({message: 'Password reset email sent'})
    
    } catch (error) {
        console.error('Error processing forgot-password request:', error);
        res.status(500).json({message: 'Server error'})
    }
}

// Post handling password reset requests
const resetPassword = async (req, res) => {
    const { token, password } = req.body

    try {
        //Verify the JWT token
        const decoded = jwt.verify(token, process.env.JWT_KEY)
        
        const user = await knex('users').where({ email: decoded.email }).first();
            if (!user) {
            console.log('Invalid or expired token');
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        const hashedPassword = await bcrypt.hash(password, 12)

        //Update the user's password and clear the reset token and expiration time
        await knex('users')
            .where({email: decoded.email})
            .update({
                password: hashedPassword
            })
        
        res.status(200).json({message: 'Password reset successfully'})
    } catch (error) {
        console.error('Error processing reset-password request:', error);
        if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
          return res.status(400).json({ message: 'Invalid or expired token' });
        }
        res.status(500).json({ message: 'Server error' });
    }
}

module.exports = {
    forgotPassword,
    resetPassword,
}