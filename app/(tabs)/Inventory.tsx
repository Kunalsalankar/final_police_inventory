import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { Card, Searchbar, DataTable, Chip, FAB, Dialog, Portal, Button, TextInput } from 'react-native-paper';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { Stack } from 'expo-router';

// Firebase imports
import { getDatabase, ref, onValue, push, set, update } from "firebase/database";

// Color scheme from the dashboard
const PoliceColors = {
  primary: '#003366', // Dark blue
  secondary: '#1a3c61', // Slightly lighter blue
  accent: '#bf2c37', // Police red
  background: '#f5f7fa', // Light background
  cardBackground: '#ffffff', // White for cards
  text: '#333333', // Near black for text
  textLight: '#6c757d', // Gray for secondary text
  border: '#d1d9e6', // Light border color
  success: '#28a745', // Green for success indicators
  warning: '#ffc107', // Yellow for warnings
  danger: '#dc3545', // Red for alerts
  lightBlue: '#e6f0ff', // Light blue for backgrounds
  gold: '#ffd700', // Gold for badge elements
  white: '#ffffff', // White color
  darkBlue: '#00264d', // Darker blue for gradients
  lightGray: '#f0f2f5', // Light gray for backgrounds
  darkGray: '#495057', // Dark gray for text
  shadowColor: 'rgba(0, 0, 0, 0.1)', // Shadow color
};

// Define the type for inventory items
interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  threshold: number;
  status: string;
  lastUpdated: string;
  dateAdded: string;
}

// Define the type for new items (before they get an ID)
interface NewInventoryItem {
  name: string;
  category: string;
  quantity: string; // Using string for form input
  threshold: string; // Using string for form input
  status: string;
}

// Define the type for stock statistics
interface StockStats {
  totalItems: number;
  lowStock: number;
  recentlyAdded: number;
}

export default function InventoryScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [stockStats, setStockStats] = useState<StockStats>({
    totalItems: 0,
    lowStock: 0,
    recentlyAdded: 0
  });
  const [visible, setVisible] = useState(false);
  const [newItem, setNewItem] = useState<NewInventoryItem>({
    name: '',
    category: '',
    quantity: '',
    threshold: '',
    status: 'Available',
  });
  const [filterCategory, setFilterCategory] = useState('All');

  // Fetch inventory data from Firebase
  useEffect(() => {
    const database = getDatabase();
    const inventoryRef = ref(database, 'inventory');
    
    // Listen for inventory changes
    const unsubscribe = onValue(inventoryRef, (snapshot) => {
      try {
        const data = snapshot.val();
        if (data) {
          // Convert the object to an array of items
          const itemsArray = Object.keys(data).map(key => ({
            id: key,
            ...data[key]
          }));
          
          setInventoryItems(itemsArray);
          
          // Calculate stats
          calculateStats(itemsArray);
        } else {
          // If no data found, initialize with sample data
          setInventoryItems(sampleInventoryItems);
          calculateStats(sampleInventoryItems);
        }
      } catch (error) {
        console.error("Error parsing inventory data:", error);
        // Fallback to sample data if there's an error
        setInventoryItems(sampleInventoryItems);
        calculateStats(sampleInventoryItems);
      } finally {
        setLoading(false);
      }
    }, (error) => {
      console.error("Firebase inventory fetch error:", error);
      setInventoryItems(sampleInventoryItems);
      calculateStats(sampleInventoryItems);
      setLoading(false);
    });
    
    // Cleanup the listener on unmount
    return () => unsubscribe();
  }, []);

  // Calculate inventory statistics
  const calculateStats = (items: InventoryItem[]) => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const lowStockCount = items.filter(item => 
      item.quantity <= item.threshold
    ).length;
    
    const recentlyAddedCount = items.filter(item => {
      const addedDate = new Date(item.dateAdded);
      return addedDate > oneWeekAgo;
    }).length;
    
    setStockStats({
      totalItems: items.length,
      lowStock: lowStockCount,
      recentlyAdded: recentlyAddedCount
    });
  };

  // Add new inventory item
  const addInventoryItem = () => {
    if (!newItem.name || !newItem.category || !newItem.quantity) {
      alert("Please fill in all required fields");
      return;
    }

    const database = getDatabase();
    const inventoryRef = ref(database, 'inventory');
    const newItemRef = push(inventoryRef);
    
    // Format the new item
    const itemToAdd = {
      ...newItem,
      quantity: parseInt(newItem.quantity),
      threshold: parseInt(newItem.threshold) || 5,
      dateAdded: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };
    
    // Add to Firebase
    set(newItemRef, itemToAdd)
      .then(() => {
        // Reset form and close dialog
        setNewItem({
          name: '',
          category: '',
          quantity: '',
          threshold: '',
          status: 'Available',
        });
        setVisible(false);
      })
      .catch(error => {
        console.error("Error adding inventory item:", error);
        alert("Failed to add item. Please try again.");
      });
  };

  // Filter items based on search query and category
  const filteredItems = inventoryItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = filterCategory === 'All' || item.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Get unique categories for the filter
  const categories = ['All', ...new Set(inventoryItems.map(item => item.category))];

  // Get status color
  const getStatusColor = (status: string, quantity: number, threshold: number) => {
    if (status === 'Maintenance') return PoliceColors.warning;
    if (status === 'Out of Service') return PoliceColors.danger;
    if (quantity <= threshold) return PoliceColors.warning;
    return PoliceColors.success;
  };

  // Sample inventory data (fallback data)
  const sampleInventoryItems: InventoryItem[] = [
    {
      id: '1',
      name: 'Police Laptop',
      category: 'Electronics',
      quantity: 25,
      threshold: 10,
      status: 'Available',
      lastUpdated: '2025-02-10T10:30:00Z',
      dateAdded: '2024-10-15T08:00:00Z'
    },
    {
      id: '2',
      name: 'Body Camera',
      category: 'Equipment',
      quantity: 8,
      threshold: 10,
      status: 'Available',
      lastUpdated: '2025-02-15T14:20:00Z',
      dateAdded: '2024-11-05T09:30:00Z'
    },
    {
      id: '3',
      name: 'Police Radio',
      category: 'Communication',
      quantity: 15,
      threshold: 5,
      status: 'Available',
      lastUpdated: '2025-02-12T11:45:00Z',
      dateAdded: '2024-09-22T13:15:00Z'
    },
    {
      id: '4',
      name: 'Taser',
      category: 'Weapons',
      quantity: 3,
      threshold: 5,
      status: 'Low Stock',
      lastUpdated: '2025-02-18T09:10:00Z',
      dateAdded: '2024-10-30T10:00:00Z'
    },
    {
      id: '5',
      name: 'Patrol Car Dashboard Camera',
      category: 'Equipment',
      quantity: 12,
      threshold: 8,
      status: 'Available',
      lastUpdated: '2025-02-16T16:30:00Z',
      dateAdded: '2024-12-05T11:20:00Z'
    },
    {
      id: '6',
      name: 'Fingerprint Scanner',
      category: 'Forensics',
      quantity: 5,
      threshold: 3,
      status: 'Available',
      lastUpdated: '2025-02-14T13:45:00Z',
      dateAdded: '2024-11-15T14:30:00Z'
    },
    {
      id: '7',
      name: 'Mobile Data Terminal',
      category: 'Electronics',
      quantity: 2,
      threshold: 3,
      status: 'Low Stock',
      lastUpdated: '2025-02-17T10:20:00Z',
      dateAdded: '2024-12-10T09:00:00Z'
    }
  ];

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Stock Inventory',
          headerStyle: {
            backgroundColor: PoliceColors.primary,
          },
          headerTintColor: PoliceColors.white,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={PoliceColors.primary} />
          <Text style={styles.loadingText}>Loading inventory data...</Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollContainer}>
          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            <Card style={styles.statCard}>
              <Card.Content style={styles.statCardContent}>
                <View style={[styles.statIconContainer, { backgroundColor: `${PoliceColors.primary}20` }]}>
                  <Ionicons name="cube" size={24} color={PoliceColors.primary} />
                </View>
                <Text style={styles.statValue}>{stockStats.totalItems}</Text>
                <Text style={styles.statLabel}>Total Items</Text>
              </Card.Content>
            </Card>
            
            <Card style={styles.statCard}>
              <Card.Content style={styles.statCardContent}>
                <View style={[styles.statIconContainer, { backgroundColor: `${PoliceColors.warning}20` }]}>
                  <MaterialIcons name="inventory" size={24} color={PoliceColors.warning} />
                </View>
                <Text style={styles.statValue}>{stockStats.lowStock}</Text>
                <Text style={styles.statLabel}>Low Stock</Text>
              </Card.Content>
            </Card>
            
            <Card style={styles.statCard}>
              <Card.Content style={styles.statCardContent}>
                <View style={[styles.statIconContainer, { backgroundColor: `${PoliceColors.success}20` }]}>
                  <Ionicons name="add-circle" size={24} color={PoliceColors.success} />
                </View>
                <Text style={styles.statValue}>{stockStats.recentlyAdded}</Text>
                <Text style={styles.statLabel}>New Items</Text>
              </Card.Content>
            </Card>
          </View>

          {/* Search and Filters */}
          <View style={styles.searchFilterContainer}>
            <Searchbar
              placeholder="Search inventory..."
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={styles.searchBar}
              iconColor={PoliceColors.primary}
            />
            
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              style={styles.categoryScroll}
              contentContainerStyle={styles.categoryScrollContent}
            >
              {categories.map((category) => (
                <Chip
                  key={category}
                  selected={filterCategory === category}
                  onPress={() => setFilterCategory(category)}
                  style={[
                    styles.categoryChip, 
                    filterCategory === category && {backgroundColor: PoliceColors.primary}
                  ]}
                  textStyle={[
                    styles.categoryChipText,
                    filterCategory === category && {color: PoliceColors.white}
                  ]}
                >
                  {category}
                </Chip>
              ))}
            </ScrollView>
          </View>

          {/* Inventory Table */}
          <Card style={styles.tableCard}>
            <Card.Content style={styles.tableCardContent}>
              <DataTable>
                <DataTable.Header style={styles.tableHeader}>
                  <DataTable.Title>Item</DataTable.Title>
                  <DataTable.Title numeric>Quantity</DataTable.Title>
                  <DataTable.Title>Category</DataTable.Title>
                  <DataTable.Title>Status</DataTable.Title>
                </DataTable.Header>

                {filteredItems.length > 0 ? (
                  filteredItems.map((item) => (
                    <DataTable.Row key={item.id} style={styles.tableRow}>
                      <DataTable.Cell>{item.name}</DataTable.Cell>
                      <DataTable.Cell numeric>{item.quantity}</DataTable.Cell>
                      <DataTable.Cell>{item.category}</DataTable.Cell>
                      <DataTable.Cell>
                        <View style={[
                          styles.statusIndicator, 
                          {backgroundColor: getStatusColor(item.status, item.quantity, item.threshold)}
                        ]}>
                          <Text style={styles.statusText}>
                            {item.quantity <= item.threshold ? 'Low Stock' : item.status}
                          </Text>
                        </View>
                      </DataTable.Cell>
                    </DataTable.Row>
                  ))
                ) : (
                  <View style={styles.noResultsContainer}>
                    <Text style={styles.noResultsText}>No items match your search</Text>
                  </View>
                )}
              </DataTable>
            </Card.Content>
          </Card>
        </ScrollView>
      )}

      {/* Add Item Dialog */}
      <Portal>
        <Dialog visible={visible} onDismiss={() => setVisible(false)} style={styles.dialog}>
          <Dialog.Title style={styles.dialogTitle}>Add New Inventory Item</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Item Name"
              value={newItem.name}
              onChangeText={(text) => setNewItem({...newItem, name: text})}
              style={styles.input}
              mode="outlined"
            />
            <TextInput
              label="Category"
              value={newItem.category}
              onChangeText={(text) => setNewItem({...newItem, category: text})}
              style={styles.input}
              mode="outlined"
            />
            <TextInput
              label="Quantity"
              value={newItem.quantity}
              onChangeText={(text) => setNewItem({...newItem, quantity: text})}
              keyboardType="numeric"
              style={styles.input}
              mode="outlined"
            />
            <TextInput
              label="Low Stock Threshold"
              value={newItem.threshold}
              onChangeText={(text) => setNewItem({...newItem, threshold: text})}
              keyboardType="numeric"
              style={styles.input}
              mode="outlined"
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setVisible(false)} color={PoliceColors.textLight}>Cancel</Button>
            <Button onPress={addInventoryItem} color={PoliceColors.primary}>Add Item</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* FAB for adding new items */}
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => setVisible(true)}
        color={PoliceColors.white}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PoliceColors.background,
  },
  scrollContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: PoliceColors.textLight,
    fontSize: 16,
  },
  
  // Stats container styles
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  statCard: {
    width: '31%',
    elevation: 3,
    borderRadius: 12,
    overflow: 'hidden',
  },
  statCardContent: {
    alignItems: 'center',
    padding: 12,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    color: PoliceColors.textLight,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: PoliceColors.text,
    marginBottom: 4,
  },
  
  // Search and filter styles
  searchFilterContainer: {
    padding: 16,
  },
  searchBar: {
    elevation: 2,
    borderRadius: 10,
    marginBottom: 16,
  },
  categoryScroll: {
    marginBottom: 8,
  },
  categoryScrollContent: {
    paddingRight: 8,
  },
  categoryChip: {
    marginRight: 8,
    backgroundColor: PoliceColors.lightGray,
  },
  categoryChipText: {
    color: PoliceColors.text,
  },
  
  // Table styles
  tableCard: {
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 80,
  },
  tableCardContent: {
    padding: 0,
  },
  tableHeader: {
    backgroundColor: PoliceColors.lightBlue,
  },
  tableRow: {
    borderBottomWidth: 1,
    borderBottomColor: PoliceColors.border,
  },
  statusIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    color: PoliceColors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  noResultsContainer: {
    padding: 20,
    alignItems: 'center',
  },
  noResultsText: {
    color: PoliceColors.textLight,
    fontStyle: 'italic',
  },
  
  // Dialog styles
  dialog: {
    borderRadius: 12,
  },
  dialogTitle: {
    color: PoliceColors.primary,
    fontWeight: 'bold',
  },
  input: {
    marginBottom: 16,
    backgroundColor: PoliceColors.white,
  },
  
  // FAB styles
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: PoliceColors.primary,
  },
});