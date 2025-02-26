import React, { useEffect } from "react";
import { LogBox } from "react-native";
import AppNavigator from "./GroceryApp/navigation/AppNavigator";
import { database } from "./GroceryApp/data/firebaseConfig";  // ✅ Import database
import { ref, onValue } from "firebase/database"; // ✅ Import Firebase Database functions

LogBox.ignoreLogs(["Remote debugger"]);

const App = () => {
  useEffect(() => {
    const testRef = ref(database, "/test");  // ✅ Use 'database' correctly

    onValue(
      testRef,
      (snapshot) => {
        console.log("🔥 Firebase Connected ✅ Data:", snapshot.val());
      },
      (error) => {
        console.error("❌ Firebase Connection Failed", error);
      }
    );
  }, []);

  return <AppNavigator />;
};

export default App;
