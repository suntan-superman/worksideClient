/* eslint-disable */
import axios from "axios";
import { format } from "date-fns";

const apiURL = "https://workside-software.wl.r.appspot.com";

/******************************************************************************
 * Core Utility Functions
 ******************************************************************************/

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
 * Cleans up a string by removing double quotes and trimming whitespace
 * @param {string} url - The string to clean
 * @returns {string} - The cleaned string
 */
const cleanUpStr = (url) => {
    let formattedStr = url.replace(/"([^"]*)"/g, "$1");
    formattedStr = formattedStr.trimStart();
    formattedStr = formattedStr.trimEnd();
    return formattedStr;
};

/******************************************************************************
 * Firm-related Functions
 ******************************************************************************/

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
 * Fetches and extracts firm names for selection options.
 * @returns {Promise<{ status: number, data: string[] }>} - A promise resolving to status and firm options.
 */
const GetFirmOptions = async () => {
    try {
        const firmsResponse = await GetAllFirms();

        if (!firmsResponse || !Array.isArray(firmsResponse) || !firmsResponse[0]?.data) {
            throw new Error("Invalid data format received from GetAllFirms");
        }

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
 * Fetch firm TYPE based on firm name.
 * @param {string} firm - Firm name to search.
 * @returns {Promise<object>} - Firm type or empty object.
 */
const GetFirmType = async (firm) => {
    const { status, data } = await GetAllFirms();
    const firmData = data.find((r) => r.name === firm);
    return { status, firmType: firmData?.type || null };
};

/**
 * Fetches and extracts customer names for selection options.
 * @returns {Promise<{ status: number, data: string[] }>} - A promise resolving to status and customer options.
 */
const GetCustomerOptions = async () => {
    try {
        const customersResponse = await GetAllCustomers();

        if (!customersResponse || !Array.isArray(customersResponse) || !customersResponse[1]) {
            throw new Error("Invalid data format received from GetAllCustomers");
        }

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
 * @returns {Promise<{ status: number, data: string[] }>} - A promise resolving to status and supplier options.
 */
const GetSupplierOptions = async () => {
    try {
        const suppliersResponse = await GetAllSuppliers();

        if (!suppliersResponse || !Array.isArray(suppliersResponse.data)) {
            throw new Error("Invalid data format received from GetAllSuppliers");
        }

        const supplierOptions = suppliersResponse.data
            .filter((supplier) => typeof supplier.name === "string")
            .map((supplier) => supplier.name);

        return { status: 200, data: supplierOptions };
    } catch (error) {
        console.error("Error fetching supplier options:", error.message);
        return { status: 500, data: [] };
    }
};

/******************************************************************************
 * Contact-related Functions
 ******************************************************************************/

/**
 * Fetch all contacts from the API.
 * @returns {Promise<object>} - Contact data or empty array.
 */
const GetAllContacts = async () => fetchWithHandling("/api/contact");

/**
 * Fetch contact ID by email from the API.
 * @param {string} email - Email address to look up
 * @returns {Promise<object>} - Contact ID or error object
 */
const GetContactIDByEmail = async (email) => { 
    try {
        const response = await axios.get(`${apiURL}/api/contact/email/${email}`);
        return { status: response.status, data: response.data._id };
    } catch (error) {
        console.error("Error fetching contact ID by email:", error.message);
        return { status: error.response?.status || 500 };
    }
};

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
 * Fetches and extracts contact usernames for selection options.
 * @returns {Promise<{ status: number, data: string[] }>} - A promise resolving to status and contact options.
 */
const GetContactOptions = async () => {
    try {
        const contactsResponse = await GetAllContacts();

        if (!contactsResponse || !Array.isArray(contactsResponse) || !contactsResponse[0]) {
            throw new Error("Invalid data format received from GetAllContacts");
        }

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
 * Fetches the contact ID based on the given username.
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

/******************************************************************************
 * Request-related Functions
 ******************************************************************************/

/**
 * Retrieves Customer-Supplier MSA data by ID.
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
            throw new Error(`Failed to fetch MSA data with status: ${response.status}`);
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
            throw new Error(`Failed to fetch supplier group data with status: ${response.status}`);
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
 * @returns {Promise<{ status: number, data: object[] }>} - A promise resolving to status and all request data.
 */
const GetAllRequests = async () => {
    try {
        const response = await fetch(`${apiURL}/api/request`);
        if (!response.ok) {
            throw new Error(`Failed to fetch requests with status: ${response.status}`);
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
 * @param {string} projectId - The project ID for filtering requests.
 * @returns {Promise<{ status: number, data: object[] }>} - A promise resolving to status and project-specific request data.
 */
const GetAllRequestsByProject = async (projectId) => {
    if (!projectId || typeof projectId !== "string") {
        console.error("Invalid project ID provided.");
        return { status: 400, data: [] };
    }
    try {
        const response = await fetch(`${apiURL}/api/request/byprojectid/${projectId}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch project requests with status: ${response.status}`);
        }
        const json = await response.json();
        return { status: response.status, data: json };
    } catch (error) {
        console.error("Error fetching requests by project:", error.message);
        return { status: 500, data: [] };
    }
};

/**
 * Save a new request to the API.
 * @param {object} reqData - Request data to save.
 * @returns {Promise<object>} - API response or error object.
 */
const SaveNewRequest = async (reqData) => apiRequest("/api/request", "POST", reqData);

/**
 * Update an existing request.
 * @param {string} reqID - Request ID to update.
 * @param {object} reqData - Updated request data.
 * @returns {Promise<object>} - API response or error object.
 */
const UpdateRequest = async (reqID, reqData) =>
    apiRequest(`/api/request/${reqID}`, "PATCH", reqData);

/**
 * Save a new request bid.
 * @param {object} reqBidData - Request bid data to save.
 * @returns {Promise<object>} - API response or error object.
 */
const SaveRequestBid = async (reqBidData) => 
    apiRequest("/api/requestbid", "POST", reqBidData);

/**
 * Update an existing request bid.
 * @param {object} reqBidData - Updated request bid data.
 * @returns {Promise<object>} - API response or error object.
 */
const UpdateRequestBid = async (reqBidData) => 
    apiRequest("/api/requestbid", "PATCH", reqBidData);

/**
 * Check if a request bid exists for a supplier.
 * @param {string} reqID - Request ID
 * @param {string} supplierID - Supplier ID
 * @returns {Promise<{status: number, data?: object}>} - Status and existing bid data if found
 */
const DoesRequestBidExist = async (reqID, supplierID) => {
    const strAPI = `${apiURL}/api/requestbid/doesBidExist`;
    const body = {
        requestid: reqID,
        supplierid: supplierID,
    };

    try {
        const response = await axios.post(strAPI, body);
        if (response.status === 200) {
            return { status: 200, data: response.data };
        }
        return { status: 400 };
    } catch (error) {
        return { status: 500 };
    }
};

/**
 * Fetches request bids from the API.
 * @returns {Promise<{ status: number, data: object[] }>} - A promise resolving to the status and bids data.
 */
const GetRequestBids = async () => {
    try {
        const response = await fetch(`${apiURL}/api/requestbidsview`);
        if (!response.ok) {
            throw new Error(`Failed to fetch request bids. Status: ${response.status}`);
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
 * @param {object} params - Parameters object.
 * @param {string} params.reqID - The ID of the request.
 * @param {string} params.status - The new status to set.
 * @returns {Promise<{ status: number }>} - A promise resolving to the request status.
 */
const SetRequestBidsStatus = async ({ reqID, status }) => {
    if (!reqID || !status) {
        console.error("Invalid parameters provided to SetRequestBidsStatus.");
        return { status: 400 };
    }
    try {
        const response = await axios.patch(`${apiURL}/api/requestbid/setstatus`, {
            requestid: reqID,
            status: status,
        });
        return { status: response.status };
    } catch (error) {
        console.error("Error updating request bids status:", error.message);
        return { status: error.response?.status || 500 };
    }
};

/**
 * Updates the status of the awarded request bid.
 * @param {object} params - Parameters object.
 * @param {string} params.reqID - The ID of the request.
 * @param {string} params.supplierID - The ID of the supplier.
 * @returns {Promise<{ status: number }>} - A promise resolving to the request status.
 */
const SetAwardedRequestBidStatus = async ({ reqID, supplierID }) => {
    if (!reqID || !supplierID) {
        console.error("Invalid parameters provided to SetAwardedRequestBidStatus.");
        return { status: 400 };
    }
    try {
        const response = await axios.patch(`${apiURL}/api/requestbid/setawarded`, {
            requestid: reqID,
            supplierid: supplierID,
        });
        return { status: response.status };
    } catch (error) {
        console.error("Error updating awarded request bid status:", error.message);
        return { status: error.response?.status || 500 };
    }
};

/**
 * Fetches delivery associates from the API.
 * @returns {Promise<{ status: number, data: object[] }>} - A promise resolving to status and delivery associates data.
 */
const GetDeliveryAssociates = async () => {
    try {
        const response = await fetch(`${apiURL}/api/deliveryassociate`);
        if (!response.ok) {
            throw new Error(`Failed to fetch delivery associates. Status: ${response.status}`);
        }
        const json = await response.json();
        return { status: response.status, data: json };
    } catch (error) {
        console.error("Error fetching delivery associates:", error.message);
        return { status: 500, data: [] };
    }
};

/**
 * Fetches supplier information by ID.
 * @param {string} id - The supplier ID.
 * @returns {Promise<{ status: number, data: object | null }>} - A promise resolving to status and supplier data.
 */
const GetSupplierInfoFromID = async (id) => {
    if (!id || typeof id !== "string") {
        console.error("Invalid supplier ID provided.");
        return { status: 400, data: null };
    }
    try {
        const response = await fetch(`${apiURL}/api/firm/${id}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch supplier info. Status: ${response.status}`);
        }
        const json = await response.json();
        return { status: response.status, data: json };
    } catch (error) {
        console.error("Error fetching supplier info:", error.message);
        return { status: 500, data: null };
    }
};

/**
 * Fetches requests by customer.
 * @param {string} customer - The customer name.
 * @returns {Promise<{ status: number, data: object[] }>} - A promise resolving to status and request data.
 */
const GetRequestsByCustomer = async (customer) => {
    if (!customer || typeof customer !== "string") {
        console.error("Invalid customer name provided.");
        return { status: 400, data: [] };
    }
    try {
        const response = await fetch(`${apiURL}/api/request/bycustomer/${customer}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch customer requests. Status: ${response.status}`);
        }
        const json = await response.json();
        return { status: response.status, data: json };
    } catch (error) {
        console.error("Error fetching customer requests:", error.message);
        return { status: 500, data: [] };
    }
};

/**
 * Fetches request data by ID.
 * @param {string} id - The request ID.
 * @returns {Promise<{ status: number, data: object | null }>} - A promise resolving to status and request data.
 */
const GetRequestData = async (id) => {
    if (!id || typeof id !== "string") {
        console.error("Invalid request ID provided.");
        return { status: 400, data: null };
    }
    try {
        const response = await fetch(`${apiURL}/api/request/${id}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch request data. Status: ${response.status}`);
        }
        const json = await response.json();
        return { status: response.status, data: json };
    } catch (error) {
        console.error("Error fetching request data:", error.message);
        return { status: 500, data: null };
    }
};

/**
 * Fetches request options from the API.
 * @returns {Promise<{ status: number, data: string[] }>} - A promise resolving to status and request options.
 */
const GetRequestOptions = async () => {
    try {
        const response = await fetch(`${apiURL}/api/request`);
        if (!response.ok) {
            throw new Error(`Failed to fetch request options. Status: ${response.status}`);
        }

        const json = await response.json();
        if (!Array.isArray(json)) {
            throw new Error("Unexpected response format. Expected an array.");
        }

        const requestOptions = json
            .filter((request) => typeof request.name === "string")
            .map((request) => request.name);

        return { status: response.status, data: requestOptions };
    } catch (error) {
        console.error("Error fetching request options:", error.message);
        return { status: 500, data: [] };
    }
};

/**
 * Fetches request ID based on request name.
 * @param {string} request - The request name to look up.
 * @returns {Promise<{ status: number, data: string | null }>} - A promise resolving to status and request ID.
 */
const GetRequestID = async (request) => {
    if (!request || typeof request !== "string") {
        console.error("Invalid request name provided.");
        return { status: 400, data: null };
    }
    try {
        const { status, data } = await GetAllRequests();
        const requestData = data.find((r) => r.name === request);
        return { status, data: requestData?._id || null };
    } catch (error) {
        console.error("Error fetching request ID:", error.message);
        return { status: 500, data: null };
    }
};

/**
 * Fetches request category options from the API.
 * @returns {Promise<{ status: number, data: string[] }>} - A promise resolving to status and category options.
 */
const GetRequestCategoryOptions = async () => {
    try {
        const response = await fetch(`${apiURL}/api/requestcategory`);
        if (!response.ok) {
            throw new Error(`Failed to fetch category options. Status: ${response.status}`);
        }

        const json = await response.json();
        if (!Array.isArray(json)) {
            throw new Error("Unexpected response format. Expected an array.");
        }

        const categoryOptions = json
            .filter((category) => typeof category.name === "string")
            .map((category) => category.name);

        return { status: response.status, data: categoryOptions };
    } catch (error) {
        console.error("Error fetching category options:", error.message);
        return { status: 500, data: [] };
    }
};

/**
 * Fetches request category ID based on category name.
 * @param {string} category - The category name to look up.
 * @returns {Promise<{ status: number, data: string | null }>} - A promise resolving to status and category ID.
 */
const GetRequestCategoryID = async (category) => {
    if (!category || typeof category !== "string") {
        console.error("Invalid category name provided.");
        return { status: 400, data: null };
    }
    try {
        const response = await fetch(`${apiURL}/api/requestcategory`);
        if (!response.ok) {
            throw new Error(`Failed to fetch category data. Status: ${response.status}`);
        }

        const json = await response.json();
        const categoryData = json.find((c) => c.name === category);
        return { status: response.status, data: categoryData?._id || null };
    } catch (error) {
        console.error("Error fetching category ID:", error.message);
        return { status: 500, data: null };
    }
};

/**
 * Fetches request status options from the API.
 * @returns {Promise<{ status: number, data: string[] }>} - A promise resolving to status and status options.
 */
const GetRequestStatusOptions = async () => {
    try {
        const response = await fetch(`${apiURL}/api/requeststatus`);
        if (!response.ok) {
            throw new Error(`Failed to fetch status options. Status: ${response.status}`);
        }

        const json = await response.json();
        if (!Array.isArray(json)) {
            throw new Error("Unexpected response format. Expected an array.");
        }

        const statusOptions = json
            .filter((status) => typeof status.name === "string")
            .map((status) => status.name);

        return { status: response.status, data: statusOptions };
    } catch (error) {
        console.error("Error fetching status options:", error.message);
        return { status: 500, data: [] };
    }
};

/******************************************************************************
 * User Authentication Functions
 ******************************************************************************/

/**
 * Fetches all users from the API.
 * @returns {Promise<{ status: number, data: object[] }>} - A promise resolving to status and user data.
 */
const GetAllUsers = async () => {
    try {
        const response = await fetch(`${apiURL}/api/user`);
        if (!response.ok) {
            throw new Error(`Failed to fetch users. Status: ${response.status}`);
        }
        const json = await response.json();
        return { status: response.status, data: json };
    } catch (error) {
        console.error("Error fetching users:", error.message);
        return { status: 500, data: [] };
    }
};

/**
 * Initiates password reset process for a user.
 * @param {string} email - User's email address.
 * @returns {Promise<{status: number, data: object}>} Response status and data.
 */
const UserForgotPassword = async (email) => {
    try {
        const response = await axios.post(`${apiURL}/api/user/forgotpassword`, { email });
        return { status: response.status, data: response.data };
    } catch (error) {
        console.error("Error in UserForgotPassword:", error.message);
        return { status: error.response?.status || 500, data: null };
    }
};

/**
 * Checks if a user exists in the system.
 * @param {string} email - User's email address.
 * @returns {Promise<{status: number, data: object}>} Response status and data.
 */
const UserDoesExist = async (email) => {
    try {
        const response = await axios.post(`${apiURL}/api/user/doesexist`, { email });
        return { status: response.status, data: response.data };
    } catch (error) {
        console.error("Error in UserDoesExist:", error.message);
        return { status: error.response?.status || 500, data: null };
    }
};

/**
 * Resets a user's password using a reset token.
 * @param {string} token - Password reset token.
 * @param {string} password - New password.
 * @returns {Promise<{status: number, data: object}>} Response status and data.
 */
const UserResetPassword = async (token, password) => {
    try {
        const response = await axios.post(`${apiURL}/api/user/resetpassword`, {
            token: token.trim(),
            password: password.trim(),
        });
        return { status: response.status, data: response.data };
    } catch (error) {
        console.error("Error in UserResetPassword:", error.message);
        return { status: error.response?.status || 500, data: null };
    }
};

/**
 * Changes a user's password.
 * @param {string} oldPassword - Current password.
 * @param {string} newPassword - New password.
 * @returns {Promise<{status: number, data: object}>} Response status and data.
 */
const UserChangePassword = async (oldPassword, newPassword) => {
    try {
        const response = await axios.post(`${apiURL}/api/user/changepassword`, {
            oldpassword: oldPassword.trim(),
            newpassword: newPassword.trim(),
        });
        return { status: response.status, data: response.data };
    } catch (error) {
        console.error("Error in UserChangePassword:", error.message);
        return { status: error.response?.status || 500, data: null };
    }
};

/**
 * Authenticates a user login.
 * @param {string} email - User's email.
 * @param {string} password - User's password.
 * @returns {Promise<{status: number, data: object}>} Response status and data.
 */
const UserLogin = async (email, password) => {
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
 * Logs out the current user.
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
 * Checks if the current user is authenticated.
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

/******************************************************************************
 * Product-related Functions
 ******************************************************************************/

/**
 * Fetches all products from the API.
 * @returns {Promise<{ status: number, data: object[] }>} - A promise resolving to status and product data.
 */
const GetProducts = async () => {
    try {
        const response = await fetch(`${apiURL}/api/product`);
        if (!response.ok) {
            throw new Error(`Failed to fetch products. Status: ${response.status}`);
        }
        const json = await response.json();
        return { status: response.status, data: json };
    } catch (error) {
        console.error("Error fetching products:", error.message);
        return { status: 500, data: [] };
    }
};

/**
 * Deletes a product by ID.
 * @param {string} id - The ID of the product to delete.
 * @returns {Promise<{ status: number, data: object | null }>} - A promise resolving to status and result data.
 */
const DeleteProduct = async (id) => {
    if (!id || typeof id !== "string") {
        console.error("Invalid product ID provided.");
        return { status: 400, data: null };
    }
    try {
        const response = await fetch(`${apiURL}/api/product/${id}`, {
            method: "DELETE",
        });
        if (!response.ok) {
            throw new Error(`Failed to delete product. Status: ${response.status}`);
        }
        const json = await response.json();
        return { status: response.status, data: json };
    } catch (error) {
        console.error("Error deleting product:", error.message);
        return { status: 500, data: null };
    }
};

/**
 * Fetches product data by ID.
 * @param {string} id - The product ID.
 * @returns {Promise<{ status: number, data: object | null }>} - A promise resolving to status and product data.
 */
const GetProductByID = async (id) => {
    if (!id || typeof id !== "string") {
        console.error("Invalid product ID provided.");
        return { status: 400, data: null };
    }
    try {
        const response = await fetch(`${apiURL}/api/product/${id}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch product. Status: ${response.status}`);
        }
        const json = await response.json();
        return { status: response.status, data: json };
    } catch (error) {
        console.error("Error fetching product:", error.message);
        return { status: 500, data: null };
    }
};

/**
 * Fetches product options from the API.
 * @returns {Promise<{status: number, data: string[] | null}>} Response status and product options.
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
        console.error("Error fetching product options:", error.message);
        return { status: null, data: null };
    }
};

/******************************************************************************
 * Project-related Functions
 ******************************************************************************/

/**
 * Fetches all projects from the API.
 * @returns {Promise<{ status: number, data: object[] }>} - A promise resolving to status and project data.
 */
const GetAllProjects = async () => {
    try {
        const response = await fetch(`${apiURL}/api/project`);
        if (!response.ok) {
            throw new Error(`Failed to fetch projects. Status: ${response.status}`);
        }
        const json = await response.json();
        return { status: response.status, data: json };
    } catch (error) {
        console.error("Error fetching projects:", error.message);
        return { status: 500, data: [] };
    }
};

/**
 * Fetches projects filtered by status and customer.
 * @param {string} status - Project status to filter by.
 * @param {string} customer - Customer name to filter by.
 * @returns {Promise<{ status: number, data: object[] | null }>} - A promise resolving to status and filtered project data.
 */
const GetProjectsByStatus = async (status, customer) => {
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

/******************************************************************************
 * Rig-related Functions
 ******************************************************************************/

/**
 * Fetches all rigs from the API.
 * @returns {Promise<{ status: number, data: object[] }>} - A promise resolving to status and rig data.
 */
const GetRigs = async () => {
    try {
        const response = await fetch(`${apiURL}/api/rig`);
        if (!response.ok) {
            throw new Error(`Failed to fetch rigs. Status: ${response.status}`);
        }
        const json = await response.json();
        return { status: response.status, data: json };
    } catch (error) {
        console.error("Error fetching rigs:", error.message);
        return { status: 500, data: [] };
    }
};

/**
 * Fetches rigs filtered by rig company name.
 * @param {string} rigCompany - The name of the rig company to filter rigs.
 * @returns {Promise<{ status: number | null, data: object[] }>} - A promise resolving to status and filtered rig data.
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
        console.error("Error fetching rigs by company:", error.message);
        return { status: 500, data: [] };
    }
};

/**
 * Deletes a rig by ID.
 * @param {string} id - The ID of the rig to delete.
 * @returns {Promise<{ status: number, data: object | null }>} - A promise resolving to status and result data.
 */
const DeleteRig = async (id) => {
    try {
        if (!id) throw new Error("Rig ID is required.");

        const response = await fetch(`${apiURL}/api/rig/${id}`, {
            method: "DELETE",
        });

        if (!response.ok) {
            throw new Error(`Failed to delete rig. Status: ${response.status}`);
        }

        return { status: response.status, data: await response.json() };
    } catch (error) {
        console.error("Error deleting rig:", error.message);
        return { status: 500, data: null };
    }
};

/**
 * Fetches supplier products filtered by category and product.
 * @param {string} category - The product category.
 * @param {string} product - The product name.
 * @returns {Promise<{ status: number, data: object[] | null }>} - A promise resolving to status and supplier product data.
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
            throw new Error(`Failed to fetch supplier products. Status: ${response.status}`);
        }

        if (!Array.isArray(response.data)) {
            throw new Error("Unexpected response format. Expected an array.");
        }

        return { status: 200, data: response.data };
    } catch (error) {
        console.error("Error fetching supplier products:", error.message);
        return { status: 500, data: null };
    }
};

// Export all functions
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
    GetFirmType,
    GetContactID,
    GetCustomerSupplierMSAData,
    GetSupplierGroupData,
    GetAllRequests,
    GetAllRequestsByProject,
    SaveNewRequest,
    UpdateRequest,
    SaveRequestBid,
    UpdateRequestBid,
    DoesRequestBidExist,
    GetRequestBids,
    UpdateRequestStatus,
    SetRequestBidsStatus,
    SetAwardedRequestBidStatus,
    GetDeliveryAssociates,
    GetSupplierInfoFromID,
    GetRequestsByCustomer,
    GetRequestData,
    GetRequestOptions,
    GetRequestID,
    GetRequestCategoryOptions,
    GetRequestCategoryID,
    GetRequestStatusOptions,
    GetAllUsers,
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
}; 