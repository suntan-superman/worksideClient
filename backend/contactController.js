const mongoose = require("mongoose");
const Contact = require("../models/contactModel");
const asyncHandler = require("express-async-handler");

/**
 * Get all contacts
 * @route GET /api/contacts
 * @returns {Promise<Array>} Array of contacts
 * @throws {Error} Database error
 */
const getContacts = async (req, res) => {
	try {
		const contacts = await Contact.find({})
			.sort({ firm: 1, class: 1, lastname: 1 })
			.lean();

		if (!contacts?.length) {
			return res.status(404).json({ message: "No contacts found" });
		}

		res.status(200).json(contacts);
	} catch (error) {
		res.status(500).json({
			message: "Error fetching contacts",
			error: error.message,
		});
	}
};

/**
 * Get contact by ID
 * @route GET /api/contacts/:id
 * @param {string} id - Contact ID
 * @returns {Promise<Object>} Contact details
 * @throws {Error} Invalid ID or database error
 */
const getContact = async (req, res) => {
	try {
		const { id } = req.params;

		if (!mongoose.Types.ObjectId.isValid(id)) {
			return res.status(400).json({ message: "Invalid contact ID" });
		}

		const contact = await Contact.findById(id).lean();

		if (!contact) {
			return res.status(404).json({ message: "Contact not found" });
		}

		res.status(200).json(contact);
	} catch (error) {
		res.status(500).json({
			message: "Error fetching contact",
			error: error.message,
		});
	}
};

/**
 * Get contact by email
 * @route GET /api/contacts/email/:email
 * @param {string} email - Contact email
 * @returns {Promise<Object>} Contact details
 * @throws {Error} Database error
 */
const getContactByEmail = async (req, res) => {
	try {
		const { email } = req.params;

		if (!email) {
			return res.status(400).json({ message: "Email is required" });
		}

		const contact = await Contact.findOne({ username: email }).lean();

		if (!contact) {
			return res.status(404).json({ message: "Contact not found" });
		}

		res.status(200).json(contact);
	} catch (error) {
		res.status(500).json({
			message: "Error fetching contact",
			error: error.message,
		});
	}
};

/**
 * Create new contact
 * @route POST /api/contacts
 * @param {Object} body - Contact details
 * @returns {Promise<Object>} Created contact
 * @throws {Error} Validation or database error
 */
const createContact = asyncHandler(async (req, res) => {
	try {
		const {
			contact_id,
			contactclass,
			firm,
			accesslevel,
			username,
			userpassword,
			firstname,
			lastname,
			nickname,
			primaryphone,
			secondaryphone,
			primaryemail,
			secondaryemail,
			status,
			statusdate,
			comment,
			verified,
		} = req.body;

		// Validate required fields
		const requiredFields = [
			"contactclass",
			"firm",
			"username",
			"userpassword",
			"firstname",
			"lastname",
			"primaryemail",
		];

		const missingFields = requiredFields.filter((field) => !req.body[field]);

		if (missingFields.length) {
			return res.status(400).json({
				message: "Missing required fields",
				fields: missingFields,
			});
		}

		const contact = await Contact.create({
			contact_id,
			contactclass,
			firm,
			accesslevel,
			username,
			userpassword,
			firstname,
			lastname,
			nickname,
			primaryphone,
			secondaryphone,
			primaryemail,
			secondaryemail,
			status,
			statusdate,
			comment,
			verified,
		});

		res.status(201).json({
			message: "Contact created successfully",
			data: contact,
		});
	} catch (error) {
		if (error.name === "ValidationError") {
			return res.status(400).json({
				message: "Invalid input data",
				errors: Object.values(error.errors).map((err) => err.message),
			});
		}
		res.status(500).json({
			message: "Error creating contact",
			error: error.message,
		});
	}
});

/**
 * Delete contact
 * @route DELETE /api/contacts/:id
 * @param {string} id - Contact ID
 * @returns {Promise<Object>} Deleted contact
 * @throws {Error} Invalid ID or database error
 */
const deleteContact = async (req, res) => {
	try {
		const { id } = req.params;

		if (!mongoose.Types.ObjectId.isValid(id)) {
			return res.status(400).json({ message: "Invalid contact ID" });
		}

		const contact = await Contact.findByIdAndDelete(id);

		if (!contact) {
			return res.status(404).json({ message: "Contact not found" });
		}

		res.status(200).json({
			message: "Contact deleted successfully",
			data: contact,
		});
	} catch (error) {
		res.status(500).json({
			message: "Error deleting contact",
			error: error.message,
		});
	}
};

/**
 * Update contact
 * @route PUT /api/contacts/:id
 * @param {string} id - Contact ID
 * @param {Object} body - Updated contact details
 * @returns {Promise<Object>} Updated contact
 * @throws {Error} Invalid ID or database error
 */
const updateContact = asyncHandler(async (req, res) => {
	try {
		const contact = await Contact.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true,
		});

		if (!contact) {
			res.status(404).json({
				success: false,
				error: "Contact not found",
			});
			return;
		}

		res.status(200).json({
			success: true,
			data: contact,
		});
	} catch (error) {
		if (error.code === 11000) {
			res.status(400).json({
				success: false,
				error: "Contact with this email already exists",
			});
			return;
		}
		res.status(500).json({
			success: false,
			error: error.message,
		});
	}
});

/**
 * Update push token for a contact
 * @async
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<Object>} Updated contact with push token
 */
const updatePushToken = async (req, res) => {
	try {
		const { id } = req.params;
		const { pushToken } = req.body;
		// Validate contact ID
		if (!mongoose.Types.ObjectId.isValid(id)) {
			return res.status(400).json({
				success: false,
				error: "Invalid contact ID format",
			});
		}

		// Find and update the contact
		const updatedContact = await Contact.findByIdAndUpdate(
			id,
			{
				pushToken,
				// Update statusdate if we're setting or removing a token
				...(pushToken !== undefined && { statusdate: new Date() }),
			},
			{
				new: true, // Return updated document
				runValidators: true, // Run model validations
			},
		);

		// Check if contact exists
		if (!updatedContact) {
			return res.status(404).json({
				success: false,
				error: "Contact not found",
			});
		}

		// Log token update for audit purposes
		console.log(
			`Push token ${pushToken ? "updated" : "removed"} for contact: ${id}`,
		);

		return res.status(200).json({
			success: true,
			data: updatedContact,
		});
	} catch (error) {
		console.error("Push token update error:", error);
		return res.status(500).json({
			success: false,
			error: "Failed to update push token",
			details: error.message,
		});
	}
};

module.exports = {
	getContacts,
	getContact,
	getContactByEmail,
	createContact,
	deleteContact,
	updateContact,
	updatePushToken,
};
