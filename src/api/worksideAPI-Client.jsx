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
	try {
		const response = await fetch(`${apiURL}/api/firm`);
		const json = await response.json();
		return [{ data: json }];
	} catch (error) {
		console.error('Error:', err.message);
		return [{ data: [] }];
	}	
};

const GetAllFirmsForSelection = async () => {
	try {
		const response = await fetch(`${apiURL}/api/firm/allFirmNames`);
		const json = await response.json();
		return [json];
	} catch (error) {
		console.error('Error:', err.message);
		return [{ data: [] }];
	}
};

const GetAllSuppliers = async () => {
	try {
		const response = await fetch(`${apiURL}/api/firm`);
		const json = await response.json();
		// Get Suppliers
		const supplierResult = json.filter((json) => json.type === "SUPPLIER");
		return [response.status, supplierResult];
	}
	catch (error) {
		console.error('Error:', err.message);
		return [{ data: [] }];
	}
};

const GetAllCustomers = async () => {
	try {
		const response = await fetch(`${apiURL}/api/firm`);
		const json = await response.json();
		// Get Customers
		const customerResult = json.filter((json) => json.type === "CUSTOMER");
		return [response.status, customerResult];
	} catch (error) {
		console.error('Error:', err.message);
		return [{ data: [] }];
	}
};

const GetAllContacts = async () => {
	try {
		const response = await fetch(
			`${apiURL}/api/contact`,
		);
		const json = await response.json();
		return [json];
	} catch (error) {
		console.error('Error:', err.message);
		return null;
	}
};

const GetContactsByFirm = async (firm) => {
	try {
		const response = await fetch(
			`${apiURL}/api/contact`,
		);
		const json = await response.json();
		// Get Customer Contacts
		const contacts = json.filter((json) => json.firm === firm);
		return [response.status, contacts];
	} catch (error) {
		console.error('Error:', err.message);
		return null;
	}
};

const GetFirmOptions = async () => {
	try {
		const firms = await GetAllFirms();
		const firmOptions = firms.map((r) => r.name);
		return [200, firmOptions];
	} catch (error) {
		console.error('Error:', err.message);
		return null;
	}
};

const GetCustomerOptions = async () => {
	try {
		const customers = await GetAllCustomers();
		const customerOptions = customers.map((r) => r.name);
		return [200, customerOptions];
	} catch (error) {
		console.error('Error:', err.message);
		return null;
	}
};

const GetSupplierOptions = async () => {
	try {
	const suppliers = await GetAllSuppliers();
	const supplierOptions = suppliers.map((r) => r.name);
	return [200, supplierOptions];
	} catch (error) {
		console.error('Error:', err.message);
		return null;
	}
};

const GetContactOptions = async () => {
	try {
		const contacts = await GetAllContacts();
		const contactOptions = contacts.map((r) => r.username);
		return [200, contactOptions];
	} catch (error) {
		console.error('Error:', err.message);
		return null;
	}
};

const GetFirmID = async (firm) => {
	try {
		const firms = await GetAllFirms();
		const firmID = firms.filter((r) => r.name === firm)[0]._id;
		return [200, firmID];
	} catch (error) {
		console.error('Error:', err.message);
		return null;
	}
};

const GetContactID = async (contact) => {
	try {
		const contacts = await GetAllContacts();
		const contactID = contacts.filter((r) => r.username === contact)[0]._id;
		return [200, contactID];
	} catch (error) {
		console.error('Error:', err.message);
		return null;
	}
};

const GetCustomerSupplierMSAData = async (id) => {
	try {
		const response = await fetch(
			`${apiURL}/api/customersuppliermsa/${id}`,
		);
		const json = await response.json();
		return [response.status, json];
	} catch (error) {
	console.error('Error:', err.message);
	return null;
	}
};

const GetSupplierGroupData = async (id) => {
	try {
		const response = await fetch(
			`${apiURL}/api/suppliergroup/${id}`,
		);
		const json = await response.json();
		return [response.status, json];
	} catch (error) {
		console.error('Error:', err.message);
		return null;
	}
};

const GetAllRequests = async () => {
	try {
		const response = await fetch(
			`${apiURL}/api/request`,
		);
		const json = await response.json();
		return [{data: json}];
	} catch (error) {
		console.error('Error:', err.message);
		return [{data: []}];
	}
};

const GetAllRequestsByProject = async (projectId) => {
	try {
		const response = await fetch(
			`${apiURL}/api/request/byprojectid/${projectId}`,
		);
		const json = await response.json();
		return [{data: json}];
	} catch (error) {
		console.error('Error:', err.message);
		return [{data: []}];
	}
};

const SaveNewRequest = async (reqData) => {
	try {
		const response = await fetch(`${apiURL}/api/request`, {
			method: "POST",
			body: JSON.stringify(reqData),
			headers: {
				"Content-Type": "application/json",
			},
		});

	const newRequestData = await response.json();
	return { status: response.status, data: newRequestData };
	} catch (error) {
		console.error('Error:', err.message);
		return { status: 500, data: [] };
	}
};

const UpdateRequest = async ({
		reqID,
		reqData,
	}) => {
	try {
		const response = await fetch(`${apiURL}/api/request/${reqID}`, {
			method: "PATCH",
			body: JSON.stringify(reqData),
			headers: {
				"Content-Type": "application/json",
			},
		});

	const newRequestData = await response.json();
	return { status: response.status, data: newRequestData };
	} catch (error) {
		console.error('Error:', err.message);
		return { status: 500, data: [] };
	}
};

const GetRequestBids = async () => {
	try {
		const response = await fetch(
			`${apiURL}/api/requestbidsview`,
		);
		const json = await response.json();
		return {status: response.status, data: json};
	} catch (error) {
		console.error('Error:', err.message);
		return {status: 500, data: []};
	}
};

const UpdateRequestStatus = async ({
		reqID,
		status,
	}) => {
	try {
		const strAPI = `${apiURL}/api/request`;
		const response = await axios.patch(strAPI, 
			{
				id: reqID,
				status: status,
			})
		return { status: response.status };
	} catch (error) {
		console.error('Error:', err.message);
		return { status: error.status };
	}
};

const SetRequestBidsStatus = async (reqID, status) => {
	const strAPI = `${apiURL}/api/requestbid/updateall`;
	try {
		const response = await axios.post(strAPI, {
			id: reqID,
			status: status,
		});
		return { status: response.status };
	} catch (error) {
		console.error('Error:', error.message);
		return { status: error.status };
		}
};

const SetAwardedRequestBidStatus = async (reqID, status) => {
 try {
		const strAPI = `${apiURL}/api/requestbid`;
		const response = await axios.patch(strAPI, 
			{
				id: reqID,
				status: status,
			})
		return [{ status: response.status }];
	} catch (error) {
		console.error('Error:', err.message);
		return [{ status: 500 }];
	}
};

const GetSupplierInfoFromID = async (id) => {
	try {
		const response = await fetch(
			`${apiURL}/api/firm/${id}`
		);
		const json = await response.json();
		return [{ status: response.status, data: json }];
	} catch (error) {
		console.error('Error:', err.message);
		return [{ status: 500, data: [] }];
	}
};

const GetRequestsByCustomer = async (customer) => {
	try {
		const response = await fetch(
			`${apiURL}/api/request`,
		);
		const json = await response.json();
		const requests = json.filter((json) => json.customer === customer);
		return [response.status, requests];
	} catch (error) {
		console.error('Error:', err.message);
		return [{ data: [] }];
	}
};

const GetRequestData = async (id) => {
	try {
		const response = await fetch(
			`${apiURL}/api/request/${id}`,
		);
		const json = await response.json();
		return {status: response.status, data: json};
	} catch (error) {
		console.error('Error:', err.message);
		return {status: err.status, data: null};
	}
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
	try {
		const response = await fetch(
			`${apiURL}/api/request`,
		);
		const json = await response.json();
		const requestID = json.filter((r) => r.requestname === request)[0]._id;
		return [response.status, requestID];
	} catch (error) {
		console.error('Error:', err.message);
		return [{ data: [] }];
	} 
};

const GetRequestCategoryOptions = async () => {
	try {
		const response = await fetch(
			`${apiURL}/api/request`,
		);
		const json = await response.json();
		const requestCategoryOptions = json.map((r) => r.requestcategory);
		return [response.status, requestCategoryOptions];
	} catch (error) {
		console.error('Error:', err.message);
		return [{ data: [] }];
	}
};

const GetRequestCategoryID = async (requestCategory) => {
	try {
		const response = await fetch(
			`${apiURL}/api/request`,
		);
		const json = await response.json();
		const requestCategoryID = json.filter(
			(r) => r.requestcategory === requestCategory,
		)[0]._id;
		return [response.status, requestCategoryID];
	} catch (error) {
		console.error('Error:', err.message);
		return [{ data: [] }];
	}
};

const GetRequestStatusOptions = async () => {
	try {
		const response = await fetch(
			`${apiURL}/api/request`,
		);
		const json = await response.json();
		const requestStatusOptions = json.map((r) => r.requeststatus);
		return [response.status, requestStatusOptions];
	} catch (error) {
		console.error('Error:', err.message);
		return [{ data: [] }];
	}
};

const UserForgotPassword = async (email) => {
	try {
		const fetchString = `${apiURL}/api/user/forgotPassword`;
		const response = await axios.post(fetchString, {
			email: email.replace(/"/g, ""),
		});
		return [response.status, response];
	} catch (error) {
		console.error('Error:', err.message);
		return [{ status: 500 }];
	}
};

const UserDoesExist = async (email) => {
	try {
		const userEmail = email.replace(/"/g, "");
		const getUserFetchString = `${apiURL}api/user/does-user-exist/${userEmail}`;
		const response = await axios.post(getUserFetchString);
		return [response.status, response];
	} catch (error) {
		console.error('Error:', err.message);
		return [{ status: 500 }];
	}
};

const UserResetPassword = async (email, password) => {
	try {
		const fetchString = `${apiURL}/api/user/resetPassword`;
		const response = await axios.post(fetchString, {
			email: email.replace(/"/g, ""),
			password: password.replace(/"/g, ""),
		});
		return [response.status, response];
	} catch (error) {
		console.error('Error:', err.message);
		return [{ status: 500 }];
	}
};

const UserChangePassword = async (email, password) => {
	try {
		const fetchString = `${apiURL}/api/user/changePassword`;
		const response = await axios.post(fetchString, {
			email: email.replace(/"/g, ""),
			password: password.replace(/"/g, ""),
		});
		return [response.status, response];
	} catch (error) {
		console.error('Error:', err.message);
		return [{ status: 500 }];
	}
};

const UserLogin = async (email, password) => {
	try {
		const fetchString = `${apiURL}/api/user/login`;
		const response = await axios.post(fetchString, {
			email: email.replace(/"/g, ""),
			password: password.replace(/"/g, ""),
		});
		return [response.status, response];
	} catch (error) {
		console.error('Error:', err.message);
		return [{ status: 500 }];
	}
};

const UserRegister = async (email, password) => {
	try {
		const fetchString = `${apiURL}/api/user/register`;
		const response = await axios.post(fetchString, {
			email: email.replace(/"/g, ""),
			password: password.replace(/"/g, ""),
		});
		return [response.status, response];
	} catch (error) {
		console.error('Error:', err.message);
		return [{ status: 500 }];
	}
};

const UserLogout = async () => {
	try {
		const fetchString = `${apiURL}/api/user/logout`;
		const response = await axios.post(fetchString);
		return [response.status, response];
	} catch (error) {
		console.error('Error:', err.message);
		return [{ status: 500 }];
	}
};

const UserIsAuthenticated = async () => {
	try {
	const fetchString = `${apiURL}/api/user/isAuthenticated`;
	const response = await axios.post(fetchString);
	return [response.status, response];
	} catch (error) {
		console.error('Error:', err.message);
		return [{ status: 500 }];
	}
};

const GetProducts = async () => {
	try {
	const response = await fetch(
		`${apiURL}/api/product`,
	);
	const json = await response.json();
	return { data: json };
} catch (error) {
	console.error('Error:', err.message);
	return { data: null };
	}
};

const DeleteProduct = async (id) => {
	try {
		const fetchString = `${apiURL}/api/product/${id}`;
		const response = await fetch(fetchString, {
			method: "DELETE",
		});
		return [response.status, response];
	} catch (error) {
		console.error('Error:', err.message);
		return [{status: 500}];
	}
};

const GetProductByID = async (id) => {
	try {
		const response = await fetch(
			`${apiURL}/api/product/${id}`,
		);
		const json = await response.json();
		return [response.status, json];
	} catch (error) {
		console.error('Error:', err.message);
		return [{status: 500}];
	}
};

const GetProductOptions = async () => {
	try {
		const response = await fetch(
			`${apiURL}/api/product`,
		);
		const json = await response.json();
		const productOptions = json.map((r) => r.productname);
		return [response.status, productOptions];
	} catch (error) {
		console.error('Error:', err.message);
		return [null];
	}
};

const GetAllProjects = async () => {
	try {
		const response = await fetch(
			`${apiURL}/api/project`,
		);
		const json = await response.json();
		return { status: response.status, data: json };
	} catch (error) {
		console.error('Error:', err.message);
		return { status: 500 };
	}
};

const GetProjectsByStatus = async ({customer, status}) => {
	try {
    await axios.get(`${apiURL}/api/project`).then((response) => {
			console.log(`API Projects: ${JSON.stringify(response.data, null, 2)}`);
      const projects = response.data.filter((p) => {
        if (p.status === status)
          return true;
        return false;
      });
			console.log(`API Filtered Projects: ${JSON.stringify(projects, null, 2)}`);
		return { status: 200, data: projects[0]};
		});
	} catch (error) {
		console.error('Error:', error.message);
		return { status: 500, data: null };
	}
};

const GetAllProjectsByCustomer = async (customer) => {
	try {
		const response = await fetch(
			`${apiURL}/api/project`,
		);
		const json = await response.json();
		const projects = json.filter((json) => json.customer === customer);
		return [response.status, projects];
	} catch (error) {
		console.error('Error:', err.message);
		return [null];
	}
};

const DeleteProject = async (id) => {
	try {
		const fetchString = `${apiURL}/api/project/${id}`;
		const response = await fetch(fetchString, {
			method: "DELETE",
		});
		return [response.status, response];
	} catch (error) {
		console.error('Error:', err.message);
		return [{ status: 500 }];
	}
};

const SaveProject = async (data) => {
	try {
		const response = await axios.post(
			`${apiURL}/api/project/`,
			data,
		);
		return { status: response.status, data: response.data };
	} catch (error) {
		console.error('Error:', err.message);
		return { status: 500 };
	}
};

const UpdateProject = async (id, body) => {
	try {
		const response = await fetch(
			`${apiURL}/api/project/${id}`,
			{ method: "PATCH", headers: { "Content-Type": "application/json" }, body },
		);
		return { status: response.status, data: response.data };
	} catch (error) {
		console.error('Error:', err.message);
		return { status: 500 };
	}
};

const GetRigs = async () => {
	try {
		const response = await fetch(`${apiURL}/api/rig`);
		const json = await response.json();
		return [response.status, json];
	} catch (error) {
		console.error('Error:', err.message);
		return [null];
	}
};

const GetRigsByRigCompany = async (rigCompany) => {
	try {
		const response = await fetch(`${apiURL}/api/rig`);
		const json = await response.json();
		const rigs = json.filter((json) => json.rigcompanyname === rigCompany);
		return [response.status, rigs];
	} catch (error) {
		console.error('Error:', err.message);
		return [null];
	}
};

const DeleteRig = async (id) => {
	try {
	const fetchString = `${apiURL}/api/rig/${id}`;
	const response = await fetch(fetchString, {
		method: "DELETE",
	});
	return [{ status: response.status, data: response }];
} catch (error) {
	console.error('Error:', err.message);
	return [{ status: 500 }];
	}
};

// TODO This api call is not working properly. Not returning the filtered data.
const GetSupplierProductsByProduct = async (
		category,
		product,
	) => {
	try {
		const suppliers = await axios.get(`${apiURL}/api/supplierproductsview/byproduct`, {
			category,
			product,
		});
		return {status: 200, data: suppliers.data};
	} catch (error) {
		console.error('Error:', err.message);
		return {status: err.status, data: null};
	}
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
	GetAllRequestsByProject,
	SaveNewRequest,
	UpdateRequest,
	GetRequestBids,
	UpdateRequestStatus,
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
