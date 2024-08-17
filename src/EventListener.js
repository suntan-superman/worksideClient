// https://keen-squid-lately.ngrok-free.app/api/monitorNewRequests

import React, { useEffect, useState, useRef } from "react";
import { useStateContext } from "../src/contexts/ContextProvider";
import { io } from "socket.io-client";

const EventListener = () => {
	const { apiURL, currentUserID, setCurrentUserID, worksideSocket } =
		useStateContext();

	// useEffect(() => {
	//   async function updateUserID() {
	//     if (currentUserID === null) {
	//       const currentUser = await AsyncStorage.getItem("userId");
	//       setCurrentUserID(currentUser);
	//     }
	//   }
	//   updateUserID();
	// }, []);

	useEffect(() => {
		if (currentUserID) {
			worksideSocket.current = io(apiURL);
			worksideSocket.current.emit("add-user", currentUserID);
		}
	}, [currentUserID]);

	useEffect(() => {
		if (worksideSocket.current) {
			worksideSocket.current.on("msg-receive", (msg) => {
				console.log("Message Received: ", msg);
			});
		}
	}, []);

	return;
};

export default EventListener;

////////////////////////////////////////////////////////////////////////
// import * as React from "react";
// import { useState, useEffect } from "react";
// import { useStateContext } from "../src/contexts/ContextProvider";

// import EventSource from "react-native-sse";
// // import { fetchEventSource } from "@microsoft/fetch-event-source";

// // import RNEventSource from "react-native-event-source";

// const EventListener = () => {
//   const { apiURL } = useStateContext();
//   const [message, setMessage] = useState();

//   const reqURL = `${apiURL}/api/monitorNewRequests`;

//   async function parseMessage(data) {
//     if (!data) return;
//     try {
//       const m = JSON.parse(data);
//       console.log("Message: " + m.value);
//     } catch (e) {
//       console.log("Error parsing data: " + e);
//     }
//   }

//   //   useEffect(() => {
//   //     const eventSource = new RNEventSource(reqURL, {
//   //       headers: {
//   //         Connection: "keep-alive",
//   //         "Content-Type": "application/json",
//   //         "Cache-Control": "no-cache",
//   //         "Access-Control-Allow-Origin": "*",
//   //       },
//   //     });

//   //     eventSource.addEventListener("message", (event) => {
//   //       const data = event.data;
//   //       console.log(data);
//   //     });

//   //     return () => {
//   //       console.log("Close EventSource");
//   //       eventSource.close();
//   //     };
//   //   }, []);

//   // useEffect(() => {
//   //   const reqURL = `${apiURL}/api/monitorNewRequests`;
//   //   const fetchData = async () => {
//   //     console.log("Before fetchEventSource");
//   //     await fetchEventSource(reqURL, {
//   //       method: "POST",
//   //       headers: {
//   //         Accept: "text/event-stream",
//   //       },
//   //       onopen(res) {
//   //         console.log("Connection res ", res);
//   //         if (res.ok && res.status === 200) {
//   //           console.log("Connection made ", res);
//   //         } else if (
//   //           res.status >= 400 &&
//   //           res.status < 500 &&
//   //           res.status !== 429
//   //         ) {
//   //           console.log("Client side error ", res);
//   //         }
//   //       },
//   //       onmessage(event) {
//   //         console.log(event.data);
//   //         const parsedData = JSON.parse(event.data);
//   //         setMessage((data) => [...data, parsedData]);
//   //       },
//   //       onclose() {
//   //         console.log("Connection closed by the server");
//   //       },
//   //       onerror(err) {
//   //         console.log("There was an error from server", err);
//   //       },
//   //     });
//   //   };
//   //   fetchData();
//   // }, []);

//   useEffect(() => {
//     const reqURL = `${apiURL}/api/monitorNewRequests`;
//     // const eventSource = new EventSource(reqURL);
//     const options = {
//       method: "PUT",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({}),
//     };

//     async function EventSource(url, options) {
//       // console.log("Start EventSource. URL: \n" + url + "\nOptions: " + options);
//       const eventSource = new EventSource(url, options);
//       eventSource.addEventListener("message", (ev) => {
//         console.log("EventSource String: ", ev.data);

//         parseMessage(ev.data);
//       });
//       //   eventSource.onmessage = (event) => {
//       //   console.log("Server Data: " + event.data);
//       //   const eventData = JSON.parse(event.data);
//       //   setMessage(eventData.message);
//       // };
//       return eventSource;
//     }
//     EventSource(reqURL, options);
//     // // onerror version
//     // eventSource.onerror = (e) => {
//     //   console.log(
//     //     "An error occurred while attempting to connect.\n Error: " + e
//     //   );
//     // };
//     // // Check for error connecting
//     // eventSource.addEventListener("error", (e) => {
//     //   console.log("Error Connecting to EventSource");
//     // });

//     // console.log(
//     //   "Event Listener: " + JSON.stringify(eventSource) + "\nURL: " + reqURL
//     // );

//     // eventSource.addEventListener("open", (event) => {
//     //   console.log("Open SSE connection.");
//     // });

//     // // Check for close request
//     // eventSource.addEventListener("close", (ev) => {
//     //   console.log("EventSource Closed");
//     //   eventSource.close();
//     // });
//     // // Check for messages
//     // console.log("Ready to listen for messages");
//     // eventSource.addEventListener("message", (ev) => {
//     //   console.log("EventSource String: ", ev.data);

//     //   parseMessage(ev.data);
//     // });
//     // eventSource.onmessage = (event) => {
//     //   console.log("Server Data: " + event.data);

//     //   const eventData = JSON.parse(event.data);
//     //   setMessage(eventData.message);
//     //   //   console.log("Server Message: " + message);
//     // };

//     // if (typeof EventSource !== "undefined") {
//     //   console.log("yay");
//     // } else {
//     //   console.log("boooo");
//     // }
//     // eventSource.onmessage = (event) => {
//     //   const eventData = JSON.parse(event.data);
//     //   setMessage(eventData.message);
//     //   console.log("Server Message: " + message);
//     // };
//     // return () => eventSource.close();
//   }, []);

//   return;
// };

// export default EventListener;

///////////////////////////////////////////////////////////////////////
