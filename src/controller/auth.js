import User from "../models/user";
const bcyrpt = require('bcrypt');
const { generateOTP, sendOTP } = require("../util/otp");
class Auth {
    async functionAuth(req, res) {
        try {
            const { operation, user } = req.body;
            if (operation === "register") {
                const { name, email, password } = user;
                const checkEmail = await User.findOne({ email: email });
                if (checkEmail) {
                    return res.status(200).json({
                        "result": "failure",
                        "message": "User Already Registered !"
                    });
                }

                const passHash = bcyrpt.hashSync(password, 10);
                const dataUser = {
                    name: name,
                    email: email,
                    password: passHash
                };
                const result = await new User(dataUser).save();

                if (result) {
                    return res.status(200).json({
                        "result": "success",
                        "message": "User Registered Successfully !"
                    });
                }
            } else if (operation === "login") {
                const { email, password } = user;
                const checkEmail = await User.findOne({ email: email });
                if (!checkEmail) {
                    return res.status(200).json({
                        "result": "failure",
                        "message": "The account is not registered"
                    });
                }
                const checkPass = bcyrpt.compareSync(password, checkEmail.password);
                if (!checkPass) {
                    return res
                        .status(200)
                        .json({
                            "result": "failure",
                            "message": "Invaild Login Credentials"
                        });
                }
                const data = {
                    result: "success",
                    message: "Login Successful",
                    user: {
                        name: checkEmail.name,
                        email: checkEmail.email,
                        unique_id: checkEmail.id
                    }
                };
                res.status(200).json(data);
            } else if (operation === "chgPass") {
                const { email, old_password, new_password } = user;
                const user1 = await User.findOne({ email: email });

                if (!user1) {
                    return res.status(200).json({
                        "result": "failure",
                        "message": "The account is not registered"
                    });
                }

                const checkPass = bcyrpt.compareSync(old_password, user1.password);
                if (!checkPass) {
                    return res
                        .status(200)
                        .json({
                            "result": "failure",
                            "message": "Invalid Old Password"
                        });
                }
                const newPasswordHash = bcyrpt.hashSync(new_password, 10);
                user1.password = newPasswordHash;
                await user1.save();

                return res.status(200).json({
                    "result": "success",
                    "message": "Password Changed Successfully"
                });
            } else if (operation === "resPassReq") {
                const { email } = user;
                let user1 = await User.findOne({ email: email });
                if (!user1) {
                    return res
                        .status(200)
                        .json({
                            "result": "failure",
                            "message": "Email is not registered"
                        });
                }

                if (user1.isBlocked) {
                    const currentTime = new Date();
                    if (currentTime < user1.blockUntil) {
                        return res
                            .status(200)
                            .json({
                                "result": "failure",
                                "message": "Account is locked. Try it after a while."
                            });
                    } else {
                        user1.isBlocked = false;
                        user1.OTPAttempts = 0;
                    }
                }

                const lastOTPTime = user1.OTPCreatedTime;
                const currentTime = new Date();

                if (lastOTPTime && currentTime - lastOTPTime < 60000) {
                    return res
                        .status(200)
                        .json({
                            "result": "failure",
                            "message": "Requires a minimum 1-minute gap between OTP requests"
                        });
                }

                const OTP = generateOTP();
                user1.OTP = OTP;
                user1.OTPCreatedTime = currentTime;

                await user1.save();

                sendOTP(email, OTP);
                console.log(OTP)
                return res.status(200).json({
                    "result": "success",
                    "message": "OTP sent successfully"
                });
            }
        } catch (error) {
            console.log(error);
            return res.status(200).json({
                "result": "failure",
                "message": "Server error"
            });
        }
    }

    async verifyOTP(req, res) {
        const email = req.body.email;
        const OTP = req.body.OTP;

        try {
            const user = await User.findOne({ email: email });

            if (!user) {
                return res.status(200).json({
                    "result": "failure",
                    "message": "User Already Registered !"
                });
            }

            if (user.isBlocked) {
                const currentTime = new Date();
                if (currentTime < user.blockUntil) {
                    return res.status(200).json({
                        "result": "failure",
                        "message": "Account is locked. Try it after a while."
                    });
                  
                } else {
                    user.isBlocked = false;
                    user.OTPAttempts = 0;
                }
            }

            if (user.OTP !== OTP) {
                user.OTPAttempts++;

                if (user.OTPAttempts >= 5) {
                    user.isBlocked = true;
                    let blockUntil = new Date();
                    blockUntil.setHours(blockUntil.getHours() + 1);
                    user.blockUntil = blockUntil;
                }

                await user.save();

                return res.status(200).json({
                    "result": "failure",
                    "message": "Invalid OTP"
                });
            }

            const OTPCreatedTime = user.OTPCreatedTime;
            const currentTime = new Date();

            if (currentTime - OTPCreatedTime > 5 * 60 * 1000) {
                return res.status(200).json({
                    "result": "failure",
                    "message": "Expired OTP"
                });
            }
            user.OTP = undefined;
            user.OTPCreatedTime = undefined;
            user.OTPAttempts = 0;

            user.verified = true

            await user.save();
            return res.status(200).json({
                "result": "success",
                "message": "Successful confirmation"
            });
        } catch (err) {
            console.log(err);
            res.status(500).send("Server error");
        }
    }
}

export default new Auth();