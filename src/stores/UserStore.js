import { create } from "zustand";

const userStore = (set, get) => ({
  username: "",
  setUsername: (value) => set({ username: value }),
  password: "",
  setPassword: (value) => set({ password: value }),
  userID: null,
  setUserID: (value) => set({ userID: value }),
  email: "",
  setEmail: (value) => set({ email: value }),
  loggedIn: false,
  setLoggedIn: (value) => set({ loggedIn: value }),
  companyID: null,
  setCompanyID: (value) => set({ companyID: value }),
  passcodeFlag: false,
  setPasscodeFlag: (value) => set({ passcodeFlag: value }),
  passcode: "",
  setPasscode: (value) => set({ passcode: value }),
  biometricSupported: false,
  setBiometricSupported: (value) => set({ biometricSupported: value }),
  biometricEnrolled: false,
  setBiometricEnrolled: (value) => set({ biometricEnrolled: value }),
});

const useUserStore = create(userStore);

export default useUserStore;
