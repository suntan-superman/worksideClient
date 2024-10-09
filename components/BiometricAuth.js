import { useState, useEffect } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';

export const isBiometricSupported = async () => {
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
    // Check if hardware supports biometrics
      const compatible = await LocalAuthentication.hasHardwareAsync().then(
        (result) => {
          setIsBiometricSupported(compatible);
          console.log("Compatible: ", compatible);
          return result;
        }
      );
      return false;
};

export const onAuthenticate = async () => {
      const auth = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate',
        fallbackLabel: 'Enter Password',
        }).then(result => {
          setIsAuthenticated(result.success);
          console.log("Result: ", result);
          return result.success;
         }
       );
      return false;
    };

