const express = require("express");
const router = express.Router();
const {
	getContacts,
	getContact,
	getContactByEmail,
	createContact,
	deleteContact,
	updateContact,
	updatePushToken,
} = require("../controllers/contactController");

/**
 * Contact routes
 * @module routes/contact
 */

/**
 * Get all contacts
 * @route GET /api/contacts
 * @returns {Promise<Array>} Array of contacts
 */
router.get("/", getContacts);

/**
 * Get contact by ID
 * @route GET /api/contacts/:id
 * @param {string} id.path.required - Contact ID
 * @returns {Promise<Object>} Contact details
 */
router.get("/:id", getContact);

/**
 * Get contact by email
 * @route GET /api/contacts/email/:email
 * @param {string} email.path.required - Contact email
 * @returns {Promise<Object>} Contact details
 */
router.get("/email/:email", getContactByEmail);

/**
 * Create new contact
 * @route POST /api/contacts
 * @param {Object} body.required - Contact details
 * @returns {Promise<Object>} Created contact
 */
router.post("/", createContact);

/**
 * Delete contact
 * @route DELETE /api/contacts/:id
 * @param {string} id.path.required - Contact ID
 * @returns {Promise<Object>} Deleted contact
 */
router.delete("/:id", deleteContact);

/**
 * Update contact
 * @route PATCH /api/contacts/:id
 * @param {string} id.path.required - Contact ID
 * @param {Object} body.required - Updated contact details
 * @returns {Promise<Object>} Updated contact
 */
router.patch("/:id", updateContact);

/**
 * Update push token for a contact
 * @route PATCH /api/contacts/:id/push-token
 * @param {string} id.path.required - Contact ID
 * @param {Object} body.required - Push token details
 * @param {string} body.pushToken - The push notification token or null to remove
 * @returns {Promise<Object>} Updated contact details
 */
router.patch("/pushtoken/:id", updatePushToken);

module.exports = router;
