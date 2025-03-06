// App.js
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, SafeAreaView, FlatList } from 'react-native';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue } from 'firebase/database';

// Your Firebase configuration
// Replace these values with your actual Firebase project configuration
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project-id.firebaseapp.com",
  databaseURL: "https://your-project-id.firebaseio.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export default function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get database reference after initialization
        const database = getDatabase(app);
        
        // Reference to your data
        // Replace 'items' with your actual data path
        const dataRef = ref(database, 'items');
        
        // Set up a listener for changes
        onValue(dataRef, (snapshot) => {
          if (snapshot.exists()) {
            const fetchedData = snapshot.val();
            
            // Convert object to array if needed
            const dataArray = Object.keys(fetchedData).map(key => ({
              id: key,
              ...fetchedData[key]
            }));
            
            setData(dataArray);
          } else {
            setData([]);
          }
          setLoading(false);
        }, (error) => {
          console.error("Database error:", error);
          setError("Failed to fetch data. Please try again later.");
          setLoading(false);
        });
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to fetch data. Please try again later.");
        setLoading(false);
      }
    };

    fetchData();

    // Clean up listener on component unmount
    return () => {
      // If you need to detach listeners, do it here
    };
  }, []);

  // Render item for the FlatList
  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Text style={styles.itemTitle}>{item.title || 'No title'}</Text>
      <Text>{item.description || 'No description'}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Loading data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>My App</Text>
      {data.length > 0 ? (
        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
        />
      ) : (
        <View style={styles.centered}>
          <Text>No data available</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 20,
    backgroundColor: '#fff',
  },
  list: {
    padding: 16,
  },
  item: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
});