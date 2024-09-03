import { create } from "zustand";

const dataStore = (set, get) => ({
  worksideModifyFlag: false,
  setWorksideModifyFlag: (value) => set({ worksideModifyFlag: value }),
  modifyRequestFlag: false,
  setModifyRequestFlag: (value) => set({ modifyRequestFlag: value }),
  modifyRequestBidFlag: false,
  setModifyRequestBidFlag: (value) => set({ modifyRequestBidFlag: value }),
  currentUserId: null,
  setCurrentUserId: (value) => set({ currentUserId: value }),
  currentCustomer: null,
  setCurrentCustomer: (value) => set({ currentCustomer: value }),
  currentProjectId: null,
  setCurrentProjectId: (value) => set({ currentProjectId: value }),
  currentProjectDesc: null,
  setCurrentProjectDesc: (value) => set({ currentProjectDesc: value }),
  currentProject: null,
  setCurrentProject: (value) => set({ currentProject: value }),
  currentRigCompany: null,
  setCurrentRigCompany: (value) => set({ currentRigCompany: value }),
  currentSupplier: null,
  setCurrentSupplier: (value) => set({ currentSupplier: value }),
  currentRequestId: null,
  setCurrentRequestId: (value) => set({ currentRequestId: value }),
  currentRequestName: null,
  setCurrentRequestName: (value) => set({ currentRequestName: value }),
  currentRequestDateTime: null,
  setCurrentRequestDateTime: (value) => set({ currentRequestDateTime: value }),
  locationFlag: false,
  setLocationFlag: (value) => set({ trackingFlag: value }),
  trackingFlag: false,
  setTrackingFlag: (value) => set({ trackingFlag: value }),
  trackingFrequency: 60000, // in milliseconds
  setTrackingFrequency: (value) => set({ trackingFrequency: value }),
  currentLocation: null,
  setCurrentLocation: (value) => set({ currentLocation: value }),

  departureAlertFlag: false,
  setDepartureAlertFlag: (value) => set({ departureAlertFlag: value }),
  fifteenMinAlertFlag: false,
  setFifteenMinAlertFlag: (value) => set({ fifteenMinAlertFlag: value }),
  arrivalAlertFlag: false,
  setArrivalAlertFlag: (value) => set({ arrivalAlertFlag: value }),
  departLocationAlertFlag: false,
  setDepartLocationAlertFlag: (value) =>
    set({ departLocationAlertFlag: value }),
  alertReqTeamFlag: false,
  setAlertReqTeamFlag: (value) => set({ alertReqTeamFlag: value }),
});

const useDataStore = create(dataStore);

export default useDataStore;
