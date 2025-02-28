/* eslint-disable */
import axios from "axios";
import { format } from "date-fns";

const apiURL = "https://workside-software.wl.r.appspot.com";

/**
 * Extracts selected fields from firm data.
 * @param {Array} dataArray - The array of firm objects.
 * @returns {Array} - Filtered array with selected fields.
 */
const extractFirmFields = (dataArray) => {
	if (!Array.isArray(dataArray)) return [];
	return dataArray.map(({ _id, type, area, name, status }) => ({
		_id,
		type,
		area,
		name,
		status,
	}));
};

/**
 * Handles API requests with error handling.
 * @param {string} endpoint - The API endpoint.
 * @param {object} [options] - Fetch options.
 * @returns {Promise<object>} - API response or error object.
 */
const fetchWithHandling = async (endpoint, options = {}) => {
	try {
		const response = await fetch(`${apiURL}${endpoint}`, options);
		if (!response.ok) {
			throw new Error(`HTTP Error! Status: ${response.status}`);
		}
		const data = await response.json();
		return { status: response.status, data };
	} catch (error) {
		console.error(`API Error: ${error.message}`);
		return { status: error?.response?.status || 500, data: [] };
	}
};

/**
 * Fetch all firms from the API.
 * @returns {Promise<object>} - Firms data or empty array.
 */
const GetAllFirms = async () => fetchWithHandling("/api/firm");

/**
 * Fetch all firm names for selection.
 * @returns {Promise<object>} - Firm names data or empty array.
 */
const GetAllFirmsForSelection = async () =>
	fetchWithHandling("/api/firm/allFirmNames");

/**
 * Fetch all firms of type SUPPLIER.
 * @returns {Promise<object>} - Supplier firms data or empty array.
 */
const GetAllSuppliers = async () => {
	const { status, data } = await fetchWithHandling("/api/firm");
	return { status, data: data.filter((firm) => firm.type === "SUPPLIER") };
};

/**
 * Fetch all firms of type RIGCOMPANY.
 * @returns {Promise<object>} - Rig company firms data or empty array.
 */
const GetAllRigCompanies = async () => {
	const { status, data } = await fetchWithHandling("/api/firm");
	return { status, data: data.filter((firm) => firm.type === "RIGCOMPANY") };
};

/**
 * Fetch all firms of type CUSTOMER.
 * @returns {Promise<object>} - Customer firms data or empty array.
 */
const GetAllCustomers = async () => {
	const { status, data } = await fetchWithHandling("/api/firm");
	return { status, data: data.filter((firm) => firm.type === "CUSTOMER") };
};

/**
 * Fetch all contacts from the API.
 * @returns {Promise<object>} - Contact data or empty array.
 */
const GetAllContacts = async () => fetchWithHandling("/api/contact");

/**
 * Fetch all contact by email from the API.
 * @returns {Promise<object>} - Contact data or empty array.
 */
const GetContactIDByEmail = async (email) => { 
try {
		const response = await axios.get(`${apiURL}/api/contact/email/${email}`);
		return { status: response.status, data: response.data._id };
	} catch (error) {
		console.error("Error updating request status:", error.message);
		return { status: error.response?.status || 500 };
	}};

/**
 * Fetch contacts based on firm name.
 * @param {string} firm - Firm name to filter contacts.
 * @returns {Promise<object>} - Filtered contacts or empty array.
 */
const GetContactsByFirm = async (firm) => {
	const { status, data } = await fetchWithHandling("/api/contact");
	return { status, data: data.filter((contact) => contact.firm === firm) };
};

/**
 * Fetches and extracts firm names for selection options.
 *
 * @returns {Promise<{ status: number, data: string[] }>} - A promise resolving to status and firm options.
 */

const GetFirmOptions = async () => {
	try {
		const firmsResponse = await GetAllFirms();

		// Validate response structure
		if (
			!firmsResponse ||
			!Array.isArray(firmsResponse) ||
			!firmsResponse[0]?.data
		) {
			throw new Error("Invalid data format received from GetAllFirms");
		}

		// Extract firm names safely
		const firmOptions = firmsResponse[0].data
			.filter((firm) => typeof firm.name === "string")
			.map((firm) => firm.name);

		return { status: 200, data: firmOptions };
	} catch (error) {
		console.error("Error fetching firm options:", error.message);
		return { status: 500, data: [] };
	}
};

/**
 * Fetches and extracts customer names for selection options.
 *
 * @returns {Promise<{ status: number, data: string[] }>} - A promise resolving to status and customer options.
 */
const GetCustomerOptions = async () => {
	try {
		const customersResponse = await GetAllCustomers();

		if (
			!customersResponse ||
			!Array.isArray(customersResponse) ||
			!customersResponse[1]
		) {
			throw new Error("Invalid data format received from GetAllCustomers");
		}

		// Extract valid customer names safely
		const customerOptions = customersResponse[1]
			.filter((customer) => typeof customer.name === "string")
			.map((customer) => customer.name);

		return { status: 200, data: customerOptions };
	} catch (error) {
		console.error("Error fetching customer options:", error.message);
		return { status: 500, data: [] };
	}
};

/**
 * Fetches and extracts supplier names for selection options.
 *
 * @returns {Promise<{ status: number, data: string[] }>} - A promise resolving to status and supplier options.
 */
const GetSupplierOptions = async () => {
	try {
		const suppliersResponse = await GetAllSuppliers();

		if (!suppliersResponse || !Array.isArray(suppliersResponse.data)) {
			throw new Error("Invalid data format received from GetAllSuppliers");
		}

		// Extract valid supplier names safely
		const supplierOptions = suppliersResponse.data
			.filter((supplier) => typeof supplier.name === "string")
			.map((supplier) => supplier.name);

		return { status: 200, data: supplierOptions };
	} catch (error) {
		console.error("Error fetching supplier options:", error.message);
		return { status: 500, data: [] };
	}
};

/**
 * Fetches and extracts contact usernames for selection options.
 *
 * @returns {Promise<{ status: number, data: string[] }>} - A promise resolving to status and contact options.
 */
const GetContactOptions = async () => {
	try {
		const contactsResponse = await GetAllContacts();

		if (
			!contactsResponse ||
			!Array.isArray(contactsResponse) ||
			!contactsResponse[0]
		) {
			throw new Error("Invalid data format received from GetAllContacts");
		}

		// Extract valid contact usernames safely
		const contactOptions = contactsResponse[0]
			.filter((contact) => typeof contact.username === "string")
			.map((contact) => contact.username);

		return { status: 200, data: contactOptions };
	} catch (error) {
		console.error("Error fetching contact options:", error.message);
		return { status: 500, data: [] };
	}
};

/**
 * Fetch firm ID based on firm name.
 * @param {string} firm - Firm name to search.
 * @returns {Promise<object>} - Firm ID or empty object.
 */
const GetFirmID = async (firm) => {
	const { status, data } = await GetAllFirms();
	const firmData = data.find((r) => r.name === firm);
	return { status, firmID: firmData?._id || null };
};

/**
 * Fetches the contact ID based on the given username.
 *
 * @param {string} contact - The username of the contact to find.
 * @returns {Promise<{ status: number, data: string | null }>} - A promise resolving to status and contact ID.
 */
const GetContactID = async (contact) => {
	if (!contact || typeof contact !== "string") {
		console.error("Invalid contact parameter provided.");
		return { status: 400, data: null };
	}
	try {
		const contacts = await GetAllContacts();
		if (!contacts || !Array.isArray(contacts) || contacts.length === 0) {
			throw new Error("Invalid data format received from GetAllContacts");
		}

		const foundContact = contacts.find((r) => r.username === contact);
		if (!foundContact) {
			throw new Error("Contact not found");
		}

		return { status: 200, data: foundContact._id };
	} catch (error) {
		console.error("Error fetching contact ID:", error.message);
		return { status: 500, data: null };
	}
};

/**
 * Retrieves Customer-Supplier MSA data by ID.
 *
 * @param {string} id - The ID of the customer-supplier MSA.
 * @returns {Promise<{ status: number, data: object | null }>} - A promise resolving to status and MSA data.
 */
const GetCustomerSupplierMSAData = async (id) => {
	if (!id || typeof id !== "string") {
		console.error("Invalid ID provided.");
		return { status: 400, data: null };
	}
	try {
		const response = await fetch(`${apiURL}/api/customersuppliermsa/${id}`);
		if (!response.ok) {
			throw new Error(
				`Failed to fetch MSA data with status: ${response.status}`,
			);
		}

		const json = await response.json();
		return { status: response.status, data: json };
	} catch (error) {
		console.error("Error fetching MSA data:", error.message);
		return { status: 500, data: null };
	}
};

/**
 * Retrieves supplier group data by ID.
 *
 * @param {string} id - The supplier group ID.
 * @returns {Promise<{ status: number, data: object | null }>} - A promise resolving to status and supplier group data.
 */
const GetSupplierGroupData = async (id) => {
	if (!id || typeof id !== "string") {
		console.error("Invalid ID provided.");
		return { status: 400, data: null };
	}
	try {
		const response = await fetch(`${apiURL}/api/suppliergroup/${id}`);
		if (!response.ok) {
			throw new Error(
				`Failed to fetch supplier group data with status: ${response.status}`,
			);
		}

		const json = await response.json();
		return { status: response.status, data: json };
	} catch (error) {
		console.error("Error fetching supplier group data:", error.message);
		return { status: 500, data: null };
	}
};

/**
 * Retrieves all supplier group data.
 *
 * @returns {Promise<{ status: number, data: object | null }>} - A promise resolving to status and supplier group data.
 */
const GetAllSupplierGroupData = async () => {
	try {
		const response = await fetch(`${apiURL}/api/suppliergroup`);
		if (!response.ok) {
			throw new Error(
				`Failed to fetch supplier group data with status: ${response.status}`,
			);
		}

		const json = await response.json();
		return { status: response.status, data: json };
	} catch (error) {
		console.error("Error fetching supplier group data:", error.message);
		return { status: 500, data: null };
	}
};

/**
 * Fetches all requests from the API.
 *
 * @returns {Promise<{ status: number, data: object[] }>} - A promise resolving to status and all request data.
 */
const GetAllRequests = async () => {
	try {
		const response = await fetch(`${apiURL}/api/request`);
		if (!response.ok) {
			throw new Error(
				`Failed to fetch requests with status: ${response.status}`,
			);
		}

		const json = await response.json();
		return { status: response.status, data: json };
	} catch (error) {
		console.error("Error fetching all requests:", error.message);
		return { status: 500, data: [] };
	}
};

/**
 * Fetches all requests associated with a specific project ID.
 *
 * @param {string} projectId - The project ID for filtering requests.
 * @returns {Promise<{ status: number, data: object[] }>} - A promise resolving to status and project-specific request data.
 */
const GetAllRequestsByProject = async (projectId) => {
	if (!projectId || typeof projectId !== "string") {
		console.error("Invalid project ID provided.");
		return { status: 400, data: [] };
	}
	try {
		const response = await fetch(
			`${apiURL}/api/request/byprojectid/${projectId}`,
		);
		if (!response.ok) {
			throw new Error(
				`Failed to fetch project requests with status: ${response.status}`,
			);
		}
		const json = await response.json();
		return { status: response.status, data: json };
	} catch (error) {
		console.error("Error fetching requests by project:", error.message);
		return { status: 500, data: [] };
	}
};

/**
 * Handles API requests with Axios for POST/PUT/PATCH/DELETE.
 * @param {string} endpoint - API endpoint.
 * @param {string} method - HTTP method.
 * @param {object} payload - Request payload.
 * @returns {Promise<object>} - API response or error object.
 */
const apiRequest = async (endpoint, method, payload) => {
	try {
		const response = await axios({
			method,
			url: `${apiURL}${endpoint}`,
			data: payload,
			headers: { "Content-Type": "application/json" },
		});
		return { status: response.status, data: response.data };
	} catch (error) {
		console.error(`API Error: ${error.message}`);
		return { status: error?.response?.status || 500, data: [] };
	}
};

/**
 * Save a new request to the API.
 * @param {object} reqData - Request data to save.
 * @returns {Promise<object>} - API response or error object.
 */
const SaveNewRequest = async (reqData) =>
	apiRequest("/api/request", "POST", reqData);

/**
 * Update an existing request.
 * @param {string} reqID - Request ID to update.
 * @param {object} reqData - Updated request data.
 * @returns {Promise<object>} - API response or error object.
 */
const UpdateRequest = async (reqID, reqData) =>
	apiRequest(`/api/request/${reqID}`, "PATCH", reqData);

/**
 * Fetches request bids from the API.
 *
 * @returns {Promise<{ status: number, data: object[] }>} - A promise resolving to the status and bids data.
 */
const GetRequestBids = async () => {
	try {
		const response = await fetch(`${apiURL}/api/requestbidsview`);
		if (!response.ok) {
			throw new Error(
				`Failed to fetch request bids. Status: ${response.status}`,
			);
		}

		const json = await response.json();
		return { status: response.status, data: json };
	} catch (error) {
		console.error("Error fetching request bids:", error.message);
		return { status: 500, data: [] };
	}
};

/**
 * Updates the status of a request.
 *
 * @param {object} params - Parameters object.
 * @param {string} params.reqID - The ID of the request to update.
 * @param {string} params.status - The new status to set.
 * @returns {Promise<{ status: number }>} - A promise resolving to the request status.
 */
const UpdateRequestStatus = async ({ reqID, status }) => {
	if (!reqID || !status) {
		console.error("Invalid parameters provided to UpdateRequestStatus.");
		return { status: 400 };
	}
	try {
		const response = await axios.patch(`${apiURL}/api/request`, {
			id: reqID,
			status: status,
		});
		return { status: response.status };
	} catch (error) {
		console.error("Error updating request status:", error.message);
		return { status: error.response?.status || 500 };
	}
};

/**
 * Updates the status of all request bids.
 *
 * @param {string} reqID - The ID of the request.
 * @param {string} status - The new status to set.
 * @returns {Promise<{ status: number }>} - A promise resolving to the request status.
 */
const SetRequestBidsStatus = async (reqID, status) => {
	if (!reqID || !status) {
		console.error("Invalid parameters provided to SetRequestBidsStatus.");
		return { status: 400 };
	}
	try {
		const response = await axios.post(`${apiURL}/api/requestbid/updateall`, {
			id: reqID,
			status: status,
		});
		return { status: response.status };
	} catch (error) {
		console.error("Error updating request bids status:", error.message);
		return { status: error.response?.status || 500 };
	}
};

/**
 * Updates the status of an awarded request bid.
 *
 * @param {string} reqID - The ID of the awarded request bid.
 * @param {string} status - The new status to set.
 * @returns {Promise<{ status: number }[]>} - A promise resolving to the request status.
 */
const SetAwardedRequestBidStatus = async (reqID, status) => {
	if (!reqID || !status) {
		console.error("Invalid parameters provided to SetAwardedRequestBidStatus.");
		return [{ status: 400 }];
	}
	try {
		const response = await axios.patch(`${apiURL}/api/requestbid`, {
			id: reqID,
			status: status,
		});
		return [{ status: response.status }];
	} catch (error) {
		console.error("Error updating awarded request bid status:", error.message);
		return [{ status: 500 }];
	}
};

/**
 * Retrieves supplier information based on the supplier ID.
 *
 * @param {string} id - The supplier ID.
 * @returns {Promise<{ status: number, data: object | [] }[]>} - A promise resolving to the supplier data.
 */
const GetSupplierInfoFromID = async (id) => {
	if (!id || typeof id !== "string") {
		console.error("Invalid ID provided to GetSupplierInfoFromID.");
		return [{ status: 400, data: [] }];
	}
	try {
		const response = await fetch(`${apiURL}/api/firm/${id}`);
		if (!response.ok) {
			throw new Error(
				`Failed to fetch supplier info. Status: ${response.status}`,
			);
		}

		const json = await response.json();
		return [{ status: response.status, data: json }];
	} catch (error) {
		console.error("Error fetching supplier info:", error.message);
		return [{ status: 500, data: [] }];
	}
};

const GetSupplierIDFromName = async (name) => {
	if (!name || typeof name !== "string") {
		console.error("Invalid Name provided to GetSupplierIDFromName.");
		return [{ status: 400, data: [] }];
	}
	try {
		const response = await fetch(`${apiURL}/api/firm/getSupplierIdByName/${name}`);
		if (!response.ok) {
			throw new Error(
				`Failed to fetch Supplier ID. Status: ${response.status}`,
			);
		}

		const json = await response.json();
		return [{ status: response.status, data: json }];
	} catch (error) {
		console.error("Error fetching supplier info:", error.message);
		return [{ status: 500, data: [] }];
	}
};

const cleanUpStr = (url) => {
	// Remove double quotes from the URL string
	let formattedStr = url.replace(/"([^"]*)"/g, "$1");
	formattedStr = formattedStr.trimStart();
	formattedStr = formattedStr.trimEnd();
	return formattedStr;
};

/**
 * Fetches requests by customer name.
 *
 * @param {string} companyName - The name of the customer.
 * @returns {Promise<{ status: number, data: object[] }>} - A promise resolving to the requests data.
 */

const GetRequestsByCustomer = async ({ clientName: companyName }) => {
	try {
		// Input validation
		if (!companyName) {
			return { status: 500, data: ["No Customer Name"] };
		}

		const cleanCompanyName = cleanUpStr(companyName);
		const fetchString = `${apiURL}/api/request/bycustomername/${cleanCompanyName}`;
		let data = [];
		// Make the API request
		await axios.get(fetchString).then((res) => {
			data = res.data;
			return { status: 200, data: data };
		});
		// Handle successful response

		return { status: 200, data: data };
	} catch (error) {
		// Log detailed error information
		if (error.response) {
			console.error("Server error:", error.response.data);
		} else if (error.request) {
			console.error("No response received:", error.request);
		} else {
			console.error("Request setup error:", error.message);
		}

		// Return appropriate error response
		return {
			status: error.response?.status || 500,
			data: [],
			error: error.message,
		};
	}
};

/**
 * Fetch a specific request by ID.
 * @param {string} id - Request ID.
 * @returns {Promise<object>} - Request data or error object.
 */
const GetRequestData = async (id) => fetchWithHandling(`/api/request/${id}`);

/**
 * Fetches all request options from the API.
 *
 * @returns {Promise<{ status: number, data: string[] }>} - A promise resolving to the request options.
 */
const GetRequestOptions = async () => {
	try {
		const response = await fetch(`${apiURL}/api/request`);
		if (!response.ok) {
			throw new Error(
				`Failed to fetch request options. Status: ${response.status}`,
			);
		}
		const json = await response.json();
		const requestOptions = json.map((r) => r.requestname);
		return { status: response.status, data: requestOptions };
	} catch (error) {
		console.error("Error fetching request options:", error.message);
		return { status: 500, data: [] };
	}
};

/**
 * Fetches the request ID based on the given request name.
 *
 * @param {string} request - The name of the request.
 * @returns {Promise<{ status: number, data: string | null }>} - A promise resolving to the request ID.
 */
const GetRequestID = async (request) => {
	if (!request || typeof request !== "string") {
		console.error("Invalid request name provided to GetRequestID.");
		return { status: 400, data: null };
	}

	try {
		const response = await fetch(`${apiURL}/api/request`);
		if (!response.ok) {
			throw new Error(`Failed to fetch request ID. Status: ${response.status}`);
		}
		const json = await response.json();
		const requestItem = json.find((r) => r.requestname === request);

		if (!requestItem) {
			throw new Error("Request not found.");
		}

		return { status: response.status, data: requestItem._id };
	} catch (error) {
		console.error("Error fetching request ID:", error.message);
		return { status: 500, data: null };
	}
};

/**
 * Fetches all request category options from the API.
 *
 * @returns {Promise<{ status: number, data: string[] }>} - A promise resolving to the request categories.
 */
const GetRequestCategoryOptions = async () => {
	try {
		const response = await fetch(`${apiURL}/api/request`);
		if (!response.ok) {
			throw new Error(
				`Failed to fetch request category options. Status: ${response.status}`,
			);
		}
		const json = await response.json();
		const requestCategoryOptions = json.map((r) => r.requestcategory);
		return { status: response.status, data: requestCategoryOptions };
	} catch (error) {
		console.error("Error fetching request category options:", error.message);
		return { status: 500, data: [] };
	}
};

/**
 * Fetches the request category ID based on the given request category.
 *
 * @param {string} requestCategory - The name of the request category.
 * @returns {Promise<{ status: number, data: string | null }>} - A promise resolving to the request category ID.
 */
const GetRequestCategoryID = async (requestCategory) => {
	if (!requestCategory || typeof requestCategory !== "string") {
		console.error("Invalid request category provided to GetRequestCategoryID.");
		return { status: 400, data: null };
	}

	try {
		const response = await fetch(`${apiURL}/api/request`);
		if (!response.ok) {
			throw new Error(
				`Failed to fetch request category ID. Status: ${response.status}`,
			);
		}
		const json = await response.json();
		const categoryItem = json.find(
			(r) => r.requestcategory === requestCategory,
		);

		if (!categoryItem) {
			throw new Error("Request category not found.");
		}

		return { status: response.status, data: categoryItem._id };
	} catch (error) {
		console.error("Error fetching request category ID:", error.message);
		return { status: 500, data: null };
	}
};

/**
 * Fetches all request status options from the API.
 *
 * @returns {Promise<{ status: number, data: string[] }>} - A promise resolving to the request statuses.
 */
const GetRequestStatusOptions = async () => {
	try {
		const response = await fetch(`${apiURL}/api/request`);
		if (!response.ok) {
			throw new Error(
				`Failed to fetch request status options. Status: ${response.status}`,
			);
		}
		const json = await response.json();
		const requestStatusOptions = json.map((r) => r.requeststatus);
		return { status: response.status, data: requestStatusOptions };
	} catch (error) {
		console.error("Error fetching request status options:", error.message);
		return { status: 500, data: [] };
	}
};

/**
 * Sends a password reset request for the given email.
 * @param {string} email - User's email.
 * @returns {Promise<{status: number, data: object}>} Response status and data.
 */
const UserForgotPassword = async (email) => {
	if (!email || typeof email !== "string") {
		console.error("Invalid email provided to UserForgotPassword.");
		return { status: 400, data: null };
	}

	try {
		const response = await axios.post(`${apiURL}/api/user/forgotPassword`, {
			email: email.trim(),
		});
		return { status: response.status, data: response.data };
	} catch (error) {
		console.error("Error in UserForgotPassword:", error.message);
		return { status: error.response?.status || 500, data: null };
	}
};

/**
 * Checks if a user exists based on email.
 * @param {string} email - User's email.
 * @returns {Promise<{status: number, data: object}>} Response status and data.
 */
const UserDoesExist = async (email) => {
	if (!email || typeof email !== "string") {
		console.error("Invalid email provided to UserDoesExist.");
		return { status: 400, data: null };
	}

	try {
		const response = await axios.post(
			`${apiURL}/api/user/does-user-exist/${encodeURIComponent(email.trim())}`,
		);
		return { status: response.status, data: response.data };
	} catch (error) {
		console.error("Error in UserDoesExist:", error.message);
		return { status: error.response?.status || 500, data: null };
	}
};

/**
 * Resets the user's password.
 * @param {string} email - User's email.
 * @param {string} password - New password.
 * @returns {Promise<{status: number, data: object}>} Response status and data.
 */
const UserResetPassword = async (email, password) => {
	if (
		!email ||
		!password ||
		typeof email !== "string" ||
		typeof password !== "string"
	) {
		console.error("Invalid email or password provided to UserResetPassword.");
		return { status: 400, data: null };
	}

	try {
		const response = await axios.post(`${apiURL}/api/user/resetPassword`, {
			email: email.trim(),
			password: password.trim(),
		});
		return { status: response.status, data: response.data };
	} catch (error) {
		console.error("Error in UserResetPassword:", error.message);
		return { status: error.response?.status || 500, data: null };
	}
};

/**
 * Changes the user's password.
 * @param {string} email - User's email.
 * @param {string} password - New password.
 * @returns {Promise<{status: number, data: object}>} Response status and data.
 */
const UserChangePassword = async (email, password) => {
	if (
		!email ||
		!password ||
		typeof email !== "string" ||
		typeof password !== "string"
	) {
		console.error("Invalid email or password provided to UserChangePassword.");
		return { status: 400, data: null };
	}

	try {
		const response = await axios.post(`${apiURL}/api/user/changePassword`, {
			email: email.trim(),
			password: password.trim(),
		});
		return { status: response.status, data: response.data };
	} catch (error) {
		console.error("Error in UserChangePassword:", error.message);
		return { status: error.response?.status || 500, data: null };
	}
};

/**
 * Authenticates a user with email and password.
 * @param {string} email - User's email.
 * @param {string} password - User's password.
 * @returns {Promise<{status: number, data: object}>} Response status and data.
 */
const UserLogin = async (email, password) => {
	if (
		!email ||
		!password ||
		typeof email !== "string" ||
		typeof password !== "string"
	) {
		console.error("Invalid email or password provided to UserLogin.");
		return { status: 400, data: null };
	}

	try {
		const response = await axios.post(`${apiURL}/api/user/login`, {
			email: email.trim(),
			password: password.trim(),
		});
		return { status: response.status, data: response.data };
	} catch (error) {
		console.error("Error in UserLogin:", error.message);
		return { status: error.response?.status || 500, data: null };
	}
};

/**
 * Registers a new user.
 * @param {string} email - User's email.
 * @param {string} password - User's password.
 * @returns {Promise<{status: number, data: object}>} Response status and data.
 */
const UserRegister = async (email, password) => {
	if (
		!email ||
		!password ||
		typeof email !== "string" ||
		typeof password !== "string"
	) {
		console.error("Invalid email or password provided to UserRegister.");
		return { status: 400, data: null };
	}

	try {
		const response = await axios.post(`${apiURL}/api/user/register`, {
			email: email.trim(),
			password: password.trim(),
		});
		return { status: response.status, data: response.data };
	} catch (error) {
		console.error("Error in UserRegister:", error.message);
		return { status: error.response?.status || 500, data: null };
	}
};

/**
 * Logs out the user.
 * @returns {Promise<{status: number, data: object}>} Response status and data.
 */
const UserLogout = async () => {
	try {
		const response = await axios.post(`${apiURL}/api/user/logout`);
		return { status: response.status, data: response.data };
	} catch (error) {
		console.error("Error in UserLogout:", error.message);
		return { status: error.response?.status || 500, data: null };
	}
};

/**
 * Checks if the user is authenticated.
 * @returns {Promise<{status: number, data: object}>} Response status and data.
 */
const UserIsAuthenticated = async () => {
	try {
		const response = await axios.post(`${apiURL}/api/user/isAuthenticated`);
		return { status: response.status, data: response.data };
	} catch (error) {
		console.error("Error in UserIsAuthenticated:", error.message);
		return { status: error.response?.status || 500, data: null };
	}
};

/**
 * Fetches all products from the API.
 * @returns {Promise<{data: object[] | null}>} Product data.
 */
const GetProducts = async () => {
	try {
		const response = await fetch(`${apiURL}/api/product`);
		if (!response.ok) {
			throw new Error(`Failed to fetch products. Status: ${response.status}`);
		}
		const json = await response.json();
		return { data: json };
	} catch (error) {
		console.error("Error in GetProducts:", error.message);
		return { data: null };
	}
};

/**
 * Deletes a product by ID.
 * @param {string} id - Product ID.
 * @returns {Promise<{status: number, data: object}>} Response status and data.
 */
const DeleteProduct = async (id) => {
	if (!id || typeof id !== "string") {
		console.error("Invalid product ID provided to DeleteProduct.");
		return { status: 400, data: null };
	}

	try {
		const response = await fetch(`${apiURL}/api/product/${id}`, {
			method: "DELETE",
		});
		return { status: response.status, data: response };
	} catch (error) {
		console.error("Error in DeleteProduct:", error.message);
		return { status: 500, data: null };
	}
};

/**
 * Fetches a product by ID.
 * @param {string} id - Product ID.
 * @returns {Promise<{status: number, data: object | null}>} Product data.
 */
const GetProductByID = async (id) => {
	if (!id || typeof id !== "string") {
		console.error("Invalid product ID provided to GetProductByID.");
		return { status: 400, data: null };
	}

	try {
		const response = await fetch(`${apiURL}/api/product/${id}`);
		const json = await response.json();
		return { status: response.status, data: json };
	} catch (error) {
		console.error("Error in GetProductByID:", error.message);
		return { status: 500, data: null };
	}
};

/**
 * Fetches product options from the API.
 * @returns {Promise<{status: number | null, data: string[] | null}>} Response status and product options.
 */
const GetProductOptions = async () => {
	try {
		const response = await fetch(`${apiURL}/api/product`);

		if (!response.ok) {
			throw new Error(`Failed to fetch products. Status: ${response.status}`);
		}

		const json = await response.json();

		if (!Array.isArray(json)) {
			throw new Error("Unexpected response format. Expected an array.");
		}

		const productOptions = json
			.filter((product) => typeof product.productname === "string")
			.map((product) => product.productname);

		return { status: response.status, data: productOptions };
	} catch (error) {
		console.error("Error in GetProductOptions:", error.message);
		return { status: null, data: null };
	}
};

/**
 * Fetch all projects from the API.
 * @returns {Promise<object>} - Projects data or empty array.
 */
const GetAllProjects = async () => fetchWithHandling("/api/project");

/**
 * Fetches projects filtered by status for a specific customer.
 * @param {Object} params - Object containing customer and status.
 * @param {string} params.customer - Customer name to filter projects.
 * @param {string} params.status - Status to filter projects.
 * @returns {Promise<{status: number, data: object[] | null}>} Response status and filtered project data.
 */
const GetProjectsByStatus = async ({ customer, status }) => {
	try {
		const response = await axios.get(`${apiURL}/api/project`);

		if (response.status !== 200) {
			throw new Error(`Failed to fetch projects. Status: ${response.status}`);
		}

		if (!Array.isArray(response.data)) {
			throw new Error("Unexpected response format. Expected an array.");
		}

		const projects = response.data.filter(
			(project) => project.customer === customer && project.status === status,
		);

		return { status: 200, data: projects };
	} catch (error) {
		console.error("Error in GetProjectsByStatus:", error.message);
		return { status: 500, data: null };
	}
};

/**
 * Fetches all projects for a specific customer.
 * @param {string} customer - Customer name to filter projects.
 * @returns {Promise<{status: number | null, data: object[] | null}>} Response status and filtered project data.
 */
const GetAllProjectsByCustomer = async (customer) => {
	try {
		const response = await fetch(`${apiURL}/api/project`);

		if (!response.ok) {
			throw new Error(`Failed to fetch projects. Status: ${response.status}`);
		}

		const json = await response.json();

		if (!Array.isArray(json)) {
			throw new Error("Unexpected response format. Expected an array.");
		}

		const projects = json.filter((project) => project.customer === customer);

		return { status: response.status, data: projects };
	} catch (error) {
		console.error("Error in GetAllProjectsByCustomer:", error.message);
		return { status: null, data: null };
	}
};

/**
 * Delete a project by ID.
 * @param {string} id - Project ID.
 * @returns {Promise<object>} - API response or error object.
 */
const DeleteProject = async (id) => apiRequest(`/api/project/${id}`, "DELETE");

/**
 * Save a new project to the API.
 * @param {object} data - Project data to save.
 * @returns {Promise<object>} - API response or error object.
 */
const SaveProject = async (data) => apiRequest("/api/project/", "POST", data);

/**
 * Update project details.
 * @param {string} id - Project ID.
 * @param {object} body - Updated project data.
 * @returns {Promise<object>} - API response or error object.
 */
const UpdateProject = async (id, body) =>
	apiRequest(`/api/project/${id}`, "PATCH", body);

/**
 * Fetches all rigs from the API.
 * @returns {Promise<{status: number, data: object[]}>} Response status and rig data.
 */
const GetRigs = async () => {
	try {
		const response = await fetch(`${apiURL}/api/rig`);

		if (!response.ok) {
			throw new Error(`Failed to fetch rigs. Status: ${response.status}`);
		}

		const json = await response.json();

		if (!Array.isArray(json)) {
			throw new Error("Unexpected response format. Expected an array.");
		}

		return { status: response.status, data: json };
	} catch (error) {
		console.error("Error in GetRigs:", error.message);
		return { status: 500, data: [] };
	}
};

/**
 * Fetches rigs filtered by rig company name.
 * @param {string} rigCompany - The name of the rig company to filter rigs.
 * @returns {Promise<{status: number | null, data: object[]}>} Response status and filtered rig data.
 */
const GetRigsByRigCompany = async (rigCompany) => {
	try {
		if (!rigCompany) throw new Error("Rig company name is required.");

		const response = await fetch(`${apiURL}/api/rig`);

		if (!response.ok) {
			throw new Error(`Failed to fetch rigs. Status: ${response.status}`);
		}

		const json = await response.json();

		if (!Array.isArray(json)) {
			throw new Error("Unexpected response format. Expected an array.");
		}

		const rigs = json.filter((rig) => rig.rigcompanyname === rigCompany);

		return { status: response.status, data: rigs };
	} catch (error) {
		console.error("Error in GetRigsByRigCompany:", error.message);
		return { status: 500, data: [] };
	}
};

/**
 * Deletes a rig by ID.
 * @param {string} id - The ID of the rig to delete.
 * @returns {Promise<{status: number, data: object | null}>} Response status and result data.
 */
const DeleteRig = async (id) => {
	try {
		if (!id) throw new Error("Rig ID is required.");

		const fetchString = `${apiURL}/api/rig/${id}`;
		const response = await fetch(fetchString, {
			method: "DELETE",
		});

		if (!response.ok) {
			throw new Error(`Failed to delete rig. Status: ${response.status}`);
		}

		return { status: response.status, data: await response.json() };
	} catch (error) {
		console.error("Error in DeleteRig:", error.message);
		return { status: 500, data: null };
	}
};

/**
 * Fetches supplier products filtered by category and product.
 * @param {string} category - The product category.
 * @param {string} product - The product name.
 * @returns {Promise<{status: number, data: object[] | null}>} Response status and supplier product data.
 */
const GetSupplierProductsByProduct = async (category, product) => {
	try {
		if (!category || !product) {
			throw new Error("Category and product are required.");
		}
		const response = await axios.get(
			`${apiURL}/api/supplierproductsview/byproduct`,
			{
				params: { category, product },
			},
		);

		if (response.status !== 200) {
			throw new Error(
				`Failed to fetch supplier products. Status: ${response.status}`,
			);
		}
		if (!Array.isArray(response.data)) {
			throw new Error("Unexpected response format. Expected an array.");
		}

		return { status: 200, data: response.data };
	} catch (error) {
		console.error("Error in GetSupplierProductsByProduct:", error.message);
		return { status: 500, data: null };
	}
};

/**
 * Creates a new request template.
 * @param {Object} templateData - The template data to create
 * @param {string} templateData.name - Template name (required, unique)
 * @param {string} templateData.description - Template description
 * @param {string} templateData.category - Request category (required)
 * @param {string} templateData.product - Product name (required)
 * @param {string} templateData.comment - Additional comments
 * @param {number} templateData.quantity - Request quantity (min: 1)
 * @param {('MSA'|'OPEN'|'SSR')} templateData.preferredVendorType - Vendor type
 * @param {string} templateData.preferredVendor - Preferred vendor name
 * @param {string} templateData.createdBy - User ID who created the template
 * @returns {Promise<{status: number, data: Object|null, error: string|null}>}
 */
const createRequestTemplate = async (templateData) => {
	try {
		// Validate required fields
		const requiredFields = [
			"name",
			"category",
			"product",
			"preferredVendorType",
			"createdBy",
		];
		const missingFields = requiredFields.filter(
			(field) => !templateData[field],
		);

		if (missingFields.length > 0) {
			throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
		}

		// Validate vendor type
		const validVendorTypes = ["MSA", "OPEN", "SSR"];
		if (!validVendorTypes.includes(templateData.preferredVendorType)) {
			throw new Error("Invalid preferredVendorType. Must be MSA, OPEN, or SSR");
		}

		// Validate quantity
		if (
			templateData.quantity &&
			(templateData.quantity < 1 || !Number.isInteger(templateData.quantity))
		) {
			throw new Error("Quantity must be a positive integer");
		}

		// Validate SSR vendor
		if (
			templateData.preferredVendorType === "SSR" &&
			!templateData.preferredVendor
		) {
			throw new Error("Preferred vendor is required for SSR type");
		}

		const response = await axios.post(`${apiURL}/api/requesttemplate`, templateData);
		return {
			status: response.status,
			data: response.data,
			error: null,
		};
	} catch (error) {
		console.error("Error creating template:", error.message);
		return {
			status: error.response?.status || 500,
			data: null,
			error: error.message,
		};
	}
};

/**
 * Fetches all templates for a specific user.
 * @param {string} userId - The ID of the user whose templates to fetch
 * @returns {Promise<{status: number, data: Array<Object>|null, error: string|null}>}
 */
const getRequestTemplates = async (userId) => {
	try {
		if (!userId || typeof userId !== "string") {
			throw new Error("Valid userId is required");
		}

		const response = await axios.get(`${apiURL}/api/requesttemplate`, {
			params: { createdBy: userId },
		});

		return {
			status: response.status,
			data: response.data.data,
			error: null,
		};
	} catch (error) {
		console.error("Error fetching templates:", error.message);
		return {
			status: error.response?.status || 500,
			data: null,
			error: error.message,
		};
	}
};

/**
 * Updates an existing request template.
 * @param {string} templateId - The ID of the template to update
 * @param {Object} updateData - The template data to update
 * @returns {Promise<{status: number, data: Object|null, error: string|null}>}
 */
const updateRequestTemplate = async (templateId, updateData) => {
	try {
		if (!templateId || typeof templateId !== "string") {
			throw new Error("Valid templateId is required");
		}

		// Validate vendor type if it's being updated
		if (updateData.preferredVendorType) {
			const validVendorTypes = ["MSA", "OPEN", "SSR"];
			if (!validVendorTypes.includes(updateData.preferredVendorType)) {
				throw new Error(
					"Invalid preferredVendorType. Must be MSA, OPEN, or SSR",
				);
			}

			// Validate SSR vendor
			if (
				updateData.preferredVendorType === "SSR" &&
				!updateData.preferredVendor
			) {
				throw new Error("Preferred vendor is required for SSR type");
			}
		}

		// Validate quantity if it's being updated
		if (updateData.quantity !== undefined) {
			if (updateData.quantity < 1 || !Number.isInteger(updateData.quantity)) {
				throw new Error("Quantity must be a positive integer");
			}
		}

		const response = await axios.put(
			`${apiURL}/api/requesttemplate/${templateId}`,
			updateData,
		);
		return {
			status: response.status,
			data: response.data.data,
			error: null,
		};
	} catch (error) {
		console.error("Error updating template:", error.message);
		return {
			status: error.response?.status || 500,
			data: null,
			error: error.message,
		};
	}
};

/**
 * Deletes a request template.
 * @param {string} templateId - The ID of the template to delete
 * @returns {Promise<{status: number, error: string|null}>}
 */
const deleteRequestTemplate = async (templateId) => {
	try {
		if (!templateId || typeof templateId !== "string") {
			throw new Error("Valid templateId is required");
		}

		const response = await axios.delete(
			`${apiURL}/api/requesttemplate/${templateId}`,
		);
		return {
			status: response.status,
			error: null,
		};
	} catch (error) {
		console.error("Error deleting template:", error.message);
		return {
			status: error.response?.status || 500,
			error: error.message,
		};
	}
};

export {
	GetAllFirms,
	GetAllFirmsForSelection,
	GetAllSuppliers,
	GetAllRigCompanies,
	GetAllCustomers,
	GetAllContacts,
	GetContactIDByEmail,
	GetContactsByFirm,
	GetFirmOptions,
	GetCustomerOptions,
	GetSupplierOptions,
	GetContactOptions,
	GetFirmID,
	GetContactID,
	GetCustomerSupplierMSAData,
	GetSupplierGroupData,
	GetAllSupplierGroupData,
	GetAllRequests,
	GetAllRequestsByProject,
	SaveNewRequest,
	UpdateRequest,
	GetRequestBids,
	UpdateRequestStatus,
	SetRequestBidsStatus,
	SetAwardedRequestBidStatus,
	GetSupplierInfoFromID,
	GetSupplierIDFromName,
	GetRequestsByCustomer,
	GetRequestData,
	GetRequestOptions,
	GetRequestID,
	GetRequestCategoryOptions,
	GetRequestCategoryID,
	GetRequestStatusOptions,
	UserForgotPassword,
	UserDoesExist,
	UserResetPassword,
	UserChangePassword,
	UserLogin,
	UserRegister,
	UserLogout,
	UserIsAuthenticated,
	GetProducts,
	DeleteProduct,
	GetProductByID,
	GetProductOptions,
	GetAllProjects,
	GetProjectsByStatus,
	GetAllProjectsByCustomer,
	DeleteProject,
	SaveProject,
	UpdateProject,
	GetRigs,
	GetRigsByRigCompany,
	DeleteRig,
	GetSupplierProductsByProduct,
	createRequestTemplate,
	getRequestTemplates,
	updateRequestTemplate,
	deleteRequestTemplate,
};
