    const mongoose = require("mongoose");
    const { v4: uuidv4 } = require("uuid");

    // Schema for siblings
    const siblingSchema = new mongoose.Schema({
        uniqueId: { type: String, default: uuidv4 },
        name: { type: String, required: [true, "Sibling's name is required"] },
        dob: { type: Date, required: [true, "Sibling's date of birth is required"] },
        gender: { 
            type: String, 
            enum: ["Male", "Female", "Other"], 
            required: [true, "Sibling's gender is required"] 
        },
        image: { type: String }
    });

    // Schema for children
    const childSchema = new mongoose.Schema({
        uniqueId: { type: String, default: uuidv4 },
        name: { type: String, required: [true, "Child's name is required"] },
        dob: { type: Date, required: [true, "Child's date of birth is required"] },
        image: { type: String }
    });

    // Schema for parents, spouse, and anniversaries
    const familyMemberSchema = new mongoose.Schema({
        uniqueId: { type: String, default: uuidv4 },
        name: { type: String },
        dob: { type: Date },
        image: { type: String }
    });

    // Schema for events like anniversaries
    const eventSchema = new mongoose.Schema({
        uniqueId: { type: String, default: uuidv4 },
        date: { type: Date },
        image: { type: String }
    });

    // Main profile schema
    const profileSchema = new mongoose.Schema({
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        fullName: { type: String, required: [true, "Full name is required"] },
        email: { type: String, required: [true, "Email is required"], unique: true },
        phoneNumber: { type: String, required: [true, "Phone number is required"] },
        gender: { 
            type: String, 
            enum: ["Male", "Female", "Other"], 
            required: [true, "Gender is required"] 
        },
        dob: { type: Date, required: [true, "Date of birth is required"] },
        location: { type: String },
        maritalStatus: { 
            type: String, 
            enum: ["Married", "Unmarried"], 
            required: [true, "Marital status is required"] 
        },
        profileImage: { type: String },

        father: familyMemberSchema,
        mother: familyMemberSchema,
        spouse: familyMemberSchema,
        marriageAnniversary: eventSchema,
        parentAnniversary: eventSchema,

        hasChildren: { type: Boolean, default: false },
        children: [childSchema],
        siblings: [siblingSchema]
    }, { timestamps: true });

    module.exports = mongoose.model("Profile", profileSchema);
