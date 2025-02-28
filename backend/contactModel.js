const mongoose = require("mongoose");

/**
 * Contact Schema - Represents a contact in the system
 * @typedef {Object} Contact
 * @property {number} contact_id - Unique identifier for the contact
 * @property {string} contactclass - Classification/type of contact
 * @property {string} firm - Company/organization name
 * @property {string} accesslevel - Access level for permissions
 * @property {string} username - Unique username for authentication
 * @property {string} userpassword - Encrypted password
 * @property {string} firstname - Contact's first name
 * @property {string} lastname - Contact's last name
 * @property {string} [nickname] - Optional nickname
 * @property {string} [primaryphone] - Primary contact number
 * @property {string} [secondaryphone] - Secondary contact number
 * @property {string} primaryemail - Primary email address
 * @property {string} [secondaryemail] - Secondary email address
 * @property {('ACTIVE'|'INACTIVE')} status - Current status
 * @property {Date} statusdate - Date of last status change
 * @property {string} [comment] - Additional notes
 * @property {string} [verified] - Verification status
 * @property {string} [pushToken] - Push notification token
 */

const ContactSchema = new mongoose.Schema(
	{
		contact_id: {
			type: Number,
			required: true,
			unique: true,
			index: true,
		},
		contactclass: {
			type: String,
			required: true,
			trim: true,
		},
		firm: {
			type: String,
			required: true,
			trim: true,
		},
		accesslevel: {
			type: String,
			trim: true,
			default: "user",
		},
		username: {
			type: String,
			required: true,
			unique: true,
			trim: true,
		},
		userpassword: {
			type: String,
			required: true,
			select: false, // Hide password field by default in queries
		},
		firstname: {
			type: String,
			required: true,
			trim: true,
		},
		lastname: {
			type: String,
			required: true,
			trim: true,
		},
		nickname: {
			type: String,
			trim: true,
		},
		primaryphone: {
			type: String,
			trim: true,
			validate: {
				validator: (v) => /^\+?[\d\s-]+$/.test(v),
				message: (props) => `${props.value} is not a valid phone number!`,
			},
		},
		secondaryphone: {
			type: String,
			trim: true,
			validate: {
				validator: (v) => !v || /^\+?[\d\s-]+$/.test(v),
				message: (props) => `${props.value} is not a valid phone number!`,
			},
		},
		primaryemail: {
			type: String,
			required: true,
			trim: true,
			lowercase: true,
			validate: {
				validator: (v) => /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v),
				message: (props) => `${props.value} is not a valid email address!`,
			},
		},
		secondaryemail: {
			type: String,
			trim: true,
			lowercase: true,
			validate: {
				validator: (v) =>
					!v || /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v),
				message: (props) => `${props.value} is not a valid email address!`,
			},
		},
		status: {
			type: String,
			enum: ["ACTIVE", "INACTIVE"],
			default: "ACTIVE",
		},
		statusdate: {
			type: Date,
			default: Date.now,
		},
		comment: {
			type: String,
			trim: true,
		},
		verified: {
			type: String,
			enum: ["YES", "NO", "PENDING"],
			default: "PENDING",
		},
		pushToken: {
			type: String,
			trim: true,
			default: null,
		},
	},
	{
		timestamps: true,
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	},
);

// Indexes for better query performance
ContactSchema.index({ username: 1 });
ContactSchema.index({ primaryemail: 1 });
ContactSchema.index({ firm: 1 });

// Virtual for full name
ContactSchema.virtual("fullName").get(function () {
	return `${this.firstname} ${this.lastname}`;
});

// Pre-save middleware to ensure statusdate is updated when status changes
ContactSchema.pre("save", function (next) {
	if (this.isModified("status")) {
		this.statusdate = new Date();
	}
	next();
});

module.exports = mongoose.model("Contact", ContactSchema);
