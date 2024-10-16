import React, {
  createContext,
  useContext,
  useState,
  useReducer,
  useRef,
} from "react";

const StateContext = createContext();

export const ContextProvider = ({ children }) => {
  const [screenSize, setScreenSize] = useState(undefined);
  const [currentColor, setCurrentColor] = useState("#7E7574");
  const [currentMode, setCurrentMode] = useState("Light");
  const [themeSettings, setThemeSettings] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [globalUserName, setGlobalUserName] = useState("");
  const [deleteFlag, setDeleteFlag] = useState(false);
  const [projectSelectedFlag, setProjectSelectedFlag] = useState(false);
  const [currentUserID, setCurrentUserID] = useState("");
  const [currentProjectID, setCurrentProjectID] = useState(null);
  const [currentCustomerName, setCurrentCustomerName] = useState("");
  const [currentProjectName, setCurrentProjectName] = useState("");
  const [currentProjectDescription, setCurrentProjectDescription] =
    useState("");
  const [currentProjectRig, setCurrentProjectRig] = useState("");
  const worksideSocket = useRef(null);

  const [apiURL, setApiURL] = useState(
		"https://workside-software.wl.r.appspot.com",
    // "https://keen-squid-lately.ngrok-free.app"
  );
  // const [apiURL, setApiURL] = useState(
  //   "https://rnazr-2603-9008-1600-a20d-af-4272-b43f-7f37.a.free.pinggy.link"
  // );

  const setMode = (e) => {
    setCurrentMode(e.target.value);
    localStorage.setItem("themeMode", e.target.value);
  };

  const setColor = (color) => {
    setCurrentColor(color);
    localStorage.setItem("colorMode", color);
  };

  return (
    // eslint-disable-next-line react/jsx-no-constructed-context-values
    <StateContext.Provider
      value={{
        currentColor,
        setCurrentColor,
        currentMode,
        setCurrentMode,
        screenSize,
        setScreenSize,
        setMode,
        setColor,
        themeSettings,
        setThemeSettings,
        deleteFlag,
        setDeleteFlag,
        isLoggedIn,
        setIsLoggedIn,
        globalUserName,
        setGlobalUserName,
        projectSelectedFlag,
        setProjectSelectedFlag,
        currentProjectID,
        setCurrentProjectID,
        currentUserID,
        setCurrentUserID,
        currentCustomerName,
        setCurrentCustomerName,
        currentProjectName,
        setCurrentProjectName,
        currentProjectDescription,
        setCurrentProjectDescription,
        currentProjectRig,
        setCurrentProjectRig,
        apiURL,
        setApiURL,
        worksideSocket,
      }}
    >
      {children}
    </StateContext.Provider>
  );
};

export const useStateContext = () => useContext(StateContext);
