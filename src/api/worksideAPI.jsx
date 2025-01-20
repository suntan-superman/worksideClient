/* eslint-disable */

import axios from "axios";

const apiURL = "https://workside-software.wl.r.appspot.com";
// export function async getMemberInfo (loginInfo) 
// {
//     return await fetch('http:url/'+loginInfo[0].ID)
//     .then(res => res.json())
//     .then(json => {return json});
// }

const extractFirmFields = (dataArray) => {
		// Map through the array and extract the required fields
		return dataArray?.map((item) => {
			const { _id, type, area, name, status } = item;
			return { _id, type, area, name, status };
		});
	};

const GetAllFirms = async () => {
	const response = await fetch(`${apiURL}/api/firm`);
	const json = await response.json();
	return [{ data: json }];
};

const GetAllFirmsForSelection = async () => {
	const response = await fetch(`${apiURL}/api/firm/allFirmNames`);
	const json = await response.json();
	return [json];
};

const GetAllSuppliers = async () => {
	const response = await fetch(`${apiURL}/api/firm`);
	const json = await response.json();
	// Get Suppliers
	const supplierResult = json.filter((json) => json.type === "SUPPLIER");
	return [response.status, supplierResult];
};

const GetAllCustomers = async () => {
	const response = await fetch(`${apiURL}/api/firm`);
	const json = await response.json();
	// Get Customers
	const customerResult = json.filter((json) => json.type === "CUSTOMER");
	return [response.status, customerResult];
};

const GetAllContacts = async () => {
	const response = await fetch(
		`${apiURL}/api/contact`,
	);
	const json = await response.json();
	return [json];
};

const GetContactsByFirm = async (firm) => {
	const response = await fetch(
		`${apiURL}/api/contact`,
	);
	const json = await response.json();
	// Get Customer Contacts
	const contacts = json.filter((json) => json.firm === firm);
	return [response.status, contacts];
};

const GetFirmOptions = async () => {
	const firms = await GetAllFirms();
	const firmOptions = firms.map((r) => r.name);
	return [200, firmOptions];
};

const GetCustomerOptions = async () => {
	const customers = await GetAllCustomers();
	const customerOptions = customers.map((r) => r.name);
	return [200, customerOptions];
};

const GetSupplierOptions = async () => {
	const suppliers = await GetAllSuppliers();
	const supplierOptions = suppliers.map((r) => r.name);
	return [200, supplierOptions];
};

const GetContactOptions = async () => {
	const contacts = await GetAllContacts();
	const contactOptions = contacts.map((r) => r.username);
	return [200, contactOptions];
};

const GetFirmID = async (firm) => {
	const firms = await GetAllFirms();
	const firmID = firms.filter((r) => r.name === firm)[0]._id;
	return [200, firmID];
};

const GetContactID = async (contact) => {
	const contacts = await GetAllContacts();
	const contactID = contacts.filter((r) => r.username === contact)[0]._id;
	return [200, contactID];
};

const GetCustomerSupplierMSAData = async (id) => {
	const response = await fetch(
		`${apiURL}/api/customersuppliermsa/${id}`,
	);
	const json = await response.json();
	return [response.status, json];
};

const GetSupplierGroupData = async (id) => {
	const response = await fetch(
		`${apiURL}/api/suppliergroup/${id}`,
	);
	const json = await response.json();
	return [response.status, json];
};

const GetAllRequests = async () => {
	const response = await fetch(
		`${apiURL}/api/request`,
	);
	const json = await response.json();
	return [{data: json}];
};

const GetRequestBids = async () => {
	const response = await fetch(
		`${apiURL}/api/requestbidsview`,
	);
	const json = await response.json();
	// console.log(`API Data: ${JSON.stringify(json, null, 2)}`);
	return {status: response.status, data: json};
};

const SetRequestBidsStatus = async (reqID, status) => {
	const strAPI = `${apiURL}/api/requestbid/updateall`;
		const response = await axios.post(strAPI, 
			{
				id: reqID,
				status: status,
			})

	return [{ status: response.status }];
};

const SetAwardedRequestBidStatus = async (reqID, status) => {
	const strAPI = `${apiURL}/api/requestbid`;
		const response = await axios.patch(strAPI, 
			{
				id: reqID,
				status: status,
			})

	return [{ status: response.status }];
};

const GetSupplierInfoFromID = async (id) => {
	// console.log(`API URL: ${apiURL}/api/firm/${id}`);
		const response = await fetch(
		`${apiURL}/api/firm/${id}`
	);
	const json = await response.json();
	// console.log(`API Data: ${JSON.stringify(json, null, 2)}`);
	return [{ status: response.status, data: json }];
	};

const GetRequestsByCustomer = async (customer) => {
	const response = await fetch(
		`${apiURL}/api/request`,
	);
	const json = await response.json();
	const requests = json.filter((json) => json.customer === customer);
	return [response.status, requests];
};

const GetRequestData = async (id) => {
	const response = await fetch(
		`${apiURL}/api/request/${id}`,
	);
	const json = await response.json();
	return [response.status, json];
};

const GetRequestOptions = async () => {
	const response = await fetch(
		`${apiURL}/api/request`,
	);
	const json = await response.json();
	const requestOptions = json.map((r) => r.requestname);
	return [response.status, requestOptions];
};

const GetRequestID = async (request) => {
	const response = await fetch(
		`${apiURL}/api/request`,
	);
	const json = await response.json();
	const requestID = json.filter((r) => r.requestname === request)[0]._id;
	return [response.status, requestID];
};

const GetRequestCategoryOptions = async () => {
	const response = await fetch(
		`${apiURL}/api/request`,
	);
	const json = await response.json();
	const requestCategoryOptions = json.map((r) => r.requestcategory);
	return [response.status, requestCategoryOptions];
};

const GetRequestCategoryID = async (requestCategory) => {
	const response = await fetch(
		`${apiURL}/api/request`,
	);
	const json = await response.json();
	const requestCategoryID = json.filter(
		(r) => r.requestcategory === requestCategory,
	)[0]._id;
	return [response.status, requestCategoryID];
};

const GetRequestStatusOptions = async () => {
	const response = await fetch(
		`${apiURL}/api/request`,
	);
	const json = await response.json();
	const requestStatusOptions = json.map((r) => r.requeststatus);
	return [response.status, requestStatusOptions];
};

const UserForgotPassword = async (email) => {
	const fetchString = `${apiURL}/api/user/forgotPassword`;
	const response = await axios.post(fetchString, {
		email: email.replace(/"/g, ""),
	});
	return [response.status, response];
};

const UserDoesExist = async (email) => {
	const userEmail = email.replace(/"/g, "");
	const getUserFetchString = `${apiURL}api/user/does-user-exist/${userEmail}`;
	const response = await axios.post(getUserFetchString);
	return [response.status, response];
};

const UserResetPassword = async (email, password) => {
	const fetchString = `${apiURL}/api/user/resetPassword`;
	const response = await axios.post(fetchString, {
		email: email.replace(/"/g, ""),
		password: password.replace(/"/g, ""),
	});
	return [response.status, response];
};

const UserChangePassword = async (email, password) => {
	const fetchString = `${apiURL}/api/user/changePassword`;
	const response = await axios.post(fetchString, {
		email: email.replace(/"/g, ""),
		password: password.replace(/"/g, ""),
	});
	return [response.status, response];
};

const UserLogin = async (email, password) => {
	const fetchString = `${apiURL}/api/user/login`;
	const response = await axios.post(fetchString, {
		email: email.replace(/"/g, ""),
		password: password.replace(/"/g, ""),
	});
	return [response.status, response];
};

const UserRegister = async (email, password) => {
	const fetchString = `${apiURL}/api/user/register`;
	const response = await axios.post(fetchString, {
		email: email.replace(/"/g, ""),
		password: password.replace(/"/g, ""),
	});
	return [response.status, response];
};

const UserLogout = async () => {
	const fetchString = `${apiURL}/api/user/logout`;
	const response = await axios.post(fetchString);
	return [response.status, response];
};

const UserIsAuthenticated = async () => {
	const fetchString = `${apiURL}/api/user/isAuthenticated`;
	const response = await axios.post(fetchString);
	return [response.status, response];
};

const GetProducts = async () => {
	const response = await fetch(
		`${apiURL}/api/product`,
	);
	const json = await response.json();
	return [json];
};

const DeleteProduct = async (id) => {
	const fetchString = `${apiURL}/api/product/${id}`;
	const response = await fetch(fetchString, {
		method: "DELETE",
	});
	return [response.status, response];
};

const GetProductByID = async (id) => {
	const response = await fetch(
		`${apiURL}/api/product/${id}`,
	);
	const json = await response.json();
	return [response.status, json];
};

const GetProductOptions = async () => {
	const response = await fetch(
		`${apiURL}/api/product`,
	);
	const json = await response.json();
	const productOptions = json.map((r) => r.productname);
	return [response.status, productOptions];
};

const GetAllProjects = async () => {
	const response = await fetch(
		`${apiURL}/api/project`,
	);
	const json = await response.json();
	return { status: response.status, data: json };
};

const GetAllProjectsByCustomer = async (customer) => {
	const response = await fetch(
		`${apiURL}/api/project`,
	);
	const json = await response.json();
	const projects = json.filter((json) => json.customer === customer);
	return [response.status, projects];
};

const DeleteProject = async (id) => {
	const fetchString = `${apiURL}/api/project/${id}`;
	const response = await fetch(fetchString, {
		method: "DELETE",
	});
	return [response.status, response];
};

const SaveProject = async (data) => {
	const response = await axios.post(
		`${apiURL}/api/project/`,
		data,
	);
	return { status: response.status, data: response.data };
};

const UpdateProject = async (id, body) => {
	const response = await fetch(
		`${apiURL}/api/project/${id}`,
		{ method: "PATCH", headers: { "Content-Type": "application/json" }, body },
	);
	return { status: response.status, data: response.data };
};

const GetRigs = async () => {
	const response = await fetch(`${apiURL}/api/rig`);
	const json = await response.json();
	return [response.status, json];
};

const GetRigsByRigCompany = async (rigCompany) => {
	const response = await fetch(`${apiURL}/api/rig`);
	const json = await response.json();
	const rigs = json.filter((json) => json.rigcompanyname === rigCompany);
	return [response.status, rigs];
};

const DeleteRig = async (id) => {
	const fetchString = `${apiURL}/api/rig/${id}`;
	const response = await fetch(fetchString, {
		method: "DELETE",
	});
	return [{ status: response.status, data: response }];
};

const GetSupplierProductsByProduct = async () => {
	const response = await axios.get(`${apiURL}/api/supplierproductsview/byproduct`);
	return [{ status: response.status, data: response.data }];
	};

export {
	GetAllFirms,
	GetAllFirmsForSelection,
	GetAllSuppliers,
	GetAllCustomers,
	GetAllContacts,
	GetContactsByFirm,
	GetFirmOptions,
	GetCustomerOptions,
	GetSupplierOptions,
	GetContactOptions,
	GetFirmID,
	GetContactID,
	GetCustomerSupplierMSAData,
	GetSupplierGroupData,
	GetAllRequests,
	GetRequestBids,
	SetRequestBidsStatus,
	SetAwardedRequestBidStatus,
	GetSupplierInfoFromID,
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
	GetAllProjectsByCustomer,
	DeleteProject,
	SaveProject,
	UpdateProject,
	GetRigs,
	GetRigsByRigCompany,
	DeleteRig,
	GetSupplierProductsByProduct,
};
