import { create } from "zustand";

const passcodeStore = (set, get) => ({
  validated: false,
  setValidated: (value) => set({ validated: value }),
  passcodeRequested: false,
  setPasscodeRequested: (value) => set({ passcodeRequested: value }),
});

const usePasscodeStore = create(passcodeStore);

export default usePasscodeStore;
