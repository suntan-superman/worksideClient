import { create } from "zustand";

const requestStore = (set, get) => ({
  request: "",
  setRequest: (value) => set({ request: value }),
  requestId: "",
  setRequestId: (value) => set({ requestId: value }),
  reqArrivalTime: null,
  setReqArrivalTime: (value) => set({ reqArrivalTime: value }),
  reqStatus: "",
  setReqStatus: (value) => set({ reqStatus: value }),
});

const useRequestStore = create(requestStore);

export default useRequestStore;
