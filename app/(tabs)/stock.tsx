import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, StatusBar, FlatList, TextInput } from 'react-native';
import { Card, Badge, Divider, Button, DataTable, Searchbar, FAB, Portal, Modal, List } from 'react-native-paper';
import { Stack } from 'expo-router';
import { Ionicons, MaterialCommunityIcons, FontAwesome5, MaterialIcons } from '@expo/vector-icons';

// Firebase imports (following the same pattern as your dashboard)
import { getDatabase, ref, onValue, set, push } from "firebase/database";

// Use the same color scheme from your dashboard for consistency
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

// Mock inventory data - would be replaced with Firebase data in production
const mockInventoryData = [
  { id: '1', name: 'Police Laptop', category: 'IT Equipment', condition: 'Good', quantity: 45, location: 'Central Store', lowStockThreshold: 10 },
  { id: '2', name: 'Body Camera', category: 'Field Equipment', condition: 'Good', quantity: 32, location: 'South Division', lowStockThreshold: 5 },
  { id: '3', name: 'Radio Unit', category: 'Communication', condition: 'Fair', quantity: 28, location: 'Central Store', lowStockThreshold: 8 },
  { id: '4', name: 'Bulletproof Vest', category: 'Safety Equipment', condition: 'Good', quantity: 18, location: 'Central Store', lowStockThreshold: 5 },
  { id: '5', name: 'Taser', category: 'Tactical Equipment', condition: 'Good', quantity: 12, location: 'North Division', lowStockThreshold: 3 },
  { id: '6', name: 'Mobile Data Terminal', category: 'IT Equipment', condition: 'Fair', quantity: 7, location: 'Central Store', lowStockThreshold: 5 },
  { id: '7', name: 'Digital Camera', category: 'Field Equipment', condition: 'Poor', quantity: 4, location: 'Evidence Room', lowStockThreshold: 2 },
  { id: '8', name: 'Riot Shield', category: 'Tactical Equipment', condition: 'Good', quantity: 25, location: 'Special Operations', lowStockThreshold: 5 },
  { id: '9', name: 'Fingerprint Scanner', category: 'Forensic Equipment', condition: 'Good', quantity: 8, location: 'Crime Lab', lowStockThreshold: 2 },
  { id: '10', name: 'GPS Tracker', category: 'Field Equipment', condition: 'Good', quantity: 15, location: 'Central Store', lowStockThreshold: 3 },
];

// Category options for filtering
const categoryOptions = [
  'All Categories',
  'IT Equipment',
  'Field Equipment',
  'Communication',
  'Safety Equipment',
  'Tactical Equipment',
  'Forensic Equipment',
];

// Location options for filtering
const locationOptions = [
  'All Locations',
  'Central Store',
  'North Division',
  'South Division',
  'East Division',
  'West Division',
  'Special Operations',
  'Crime Lab',
  'Evidence Room',
];

// Condition options
const conditionOptions = ['New', 'Good', 'Fair', 'Poor', 'Maintenance Required'];

export default function StockInventoryScreen() {
  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [inventory, setInventory] = useState(mockInventoryData);
  const [filteredInventory, setFilteredInventory] = useState(mockInventoryData);
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedLocation, setSelectedLocation] = useState('All Locations');
  const [categoryFilterVisible, setCategoryFilterVisible] = useState(false);
  const [locationFilterVisible, setLocationFilterVisible] = useState(false);
  const [addItemModalVisible, setAddItemModalVisible] = useState(false);
  const [itemDetailsModalVisible, setItemDetailsModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // New item state
  const [newItem, setNewItem] = useState({
    name: '',
    category: 'IT Equipment',
    condition: 'Good',
    quantity: '',
    location: 'Central Store',
    lowStockThreshold: '',
  });

  // Filter inventory items based on search and category/location filters
  useEffect(() => {
    let filtered = inventory;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedCategory !== 'All Categories') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    // Apply location filter
    if (selectedLocation !== 'All Locations') {
      filtered = filtered.filter(item => item.location === selectedLocation);
    }

    setFilteredInventory(filtered);
  }, [searchQuery, selectedCategory, selectedLocation, inventory]);

  // In a real app, this would fetch data from Firebase
  // useEffect(() => {
  //   const database = getDatabase();
  //   const inventoryRef = ref(database, 'inventory');
  //   
  //   onValue(inventoryRef, (snapshot) => {
  //     const data = snapshot.val();
  //     if (data) {
  //       const inventoryList = Object.keys(data).map(key => ({
  //         id: key,
  //         ...data[key]
  //       }));
  //       setInventory(inventoryList);
  //       setFilteredInventory(inventoryList);
  //     }
  //   });
  // }, []);

  // Function to handle adding a new item
  const handleAddItem = () => {
    // Validate inputs
    if (!newItem.name || !newItem.quantity || !newItem.lowStockThreshold) {
      // Show error message (in a real app)
      return;
    }

    // Create new item with ID
    const itemToAdd = {
      id: (inventory.length + 1).toString(),
      name: newItem.name,
      category: newItem.category,
      condition: newItem.condition,
      quantity: parseInt(newItem.quantity),
      location: newItem.location,
      lowStockThreshold: parseInt(newItem.lowStockThreshold),
    };

    // Add to inventory
    const updatedInventory = [...inventory, itemToAdd];
    setInventory(updatedInventory);

    // In a real app, you would save to Firebase
    // const database = getDatabase();
    // const newItemRef = push(ref(database, 'inventory'));
    // set(newItemRef, itemToAdd);

    // Reset form and close modal
    setNewItem({
      name: '',
      category: 'IT Equipment',
      condition: 'Good',
      quantity: '',
      location: 'Central Store',
      lowStockThreshold: '',
    });
    setAddItemModalVisible(false);
  };

  // Function to open item details
  const openItemDetails = (item) => {
    setSelectedItem(item);
    setItemDetailsModalVisible(true);
  };

  // Helper function to determine stock status
  const getStockStatus = (item) => {
    if (item.quantity <= 0) {
      return { label: 'Out of Stock', color: PoliceColors.danger };
    } else if (item.quantity <= item.lowStockThreshold) {
      return { label: 'Low Stock', color: PoliceColors.warning };
    } else {
      return { label: 'In Stock', color: PoliceColors.success };
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Stock Inventory',
          headerStyle: { backgroundColor: PoliceColors.darkBlue },
          headerTintColor: PoliceColors.white,
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      />
      <StatusBar barStyle="light-content" backgroundColor={PoliceColors.darkBlue} />

      {/* Search and filter section */}
      <View style={styles.searchFilterContainer}>
        <Searchbar
          placeholder="Search inventory..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          iconColor={PoliceColors.primary}
        />
        
        <View style={styles.filterButtonsContainer}>
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => setCategoryFilterVisible(true)}
          >
            <Text style={styles.filterButtonText}>
              <MaterialIcons name="category" size={16} color={PoliceColors.primary} /> {selectedCategory}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => setLocationFilterVisible(true)}
          >
            <Text style={styles.filterButtonText}>
              <Ionicons name="location" size={16} color={PoliceColors.primary} /> {selectedLocation}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Inventory Stats Cards */}
      <View style={styles.statsCardsContainer}>
        <Card style={styles.statsCard}>
          <Card.Content style={styles.statsCardContent}>
            <MaterialIcons name="inventory" size={24} color={PoliceColors.primary} />
            <Text style={styles.statsCardValue}>{inventory.length}</Text>
            <Text style={styles.statsCardLabel}>Total Items</Text>
          </Card.Content>
        </Card>
        
        <Card style={styles.statsCard}>
          <Card.Content style={styles.statsCardContent}>
            <MaterialIcons name="warning" size={24} color={PoliceColors.warning} />
            <Text style={styles.statsCardValue}>
              {inventory.filter(item => item.quantity <= item.lowStockThreshold && item.quantity > 0).length}
            </Text>
            <Text style={styles.statsCardLabel}>Low Stock</Text>
          </Card.Content>
        </Card>
        
        <Card style={styles.statsCard}>
          <Card.Content style={styles.statsCardContent}>
            <MaterialIcons name="error" size={24} color={PoliceColors.danger} />
            <Text style={styles.statsCardValue}>
              {inventory.filter(item => item.quantity <= 0).length}
            </Text>
            <Text style={styles.statsCardLabel}>Out of Stock</Text>
          </Card.Content>
        </Card>
      </View>

      {/* Inventory Table */}
      <Card style={styles.tableCard}>
        <DataTable>
          <DataTable.Header style={styles.tableHeader}>
            <DataTable.Title style={{flex: 3}}>Item</DataTable.Title>
            <DataTable.Title style={{flex: 2}}>Category</DataTable.Title>
            <DataTable.Title numeric>Qty</DataTable.Title>
            <DataTable.Title>Status</DataTable.Title>
          </DataTable.Header>

          <ScrollView style={styles.tableScrollView}>
            {filteredInventory.map((item) => {
              const stockStatus = getStockStatus(item);
              return (
                <TouchableOpacity 
                  key={item.id}
                  onPress={() => openItemDetails(item)}
                >
                  <DataTable.Row style={styles.tableRow}>
                    <DataTable.Cell style={{flex: 3}}>{item.name}</DataTable.Cell>
                    <DataTable.Cell style={{flex: 2}}>{item.category}</DataTable.Cell>
                    <DataTable.Cell numeric>{item.quantity}</DataTable.Cell>
                    <DataTable.Cell>
                      <Badge 
                        style={[styles.statusBadge, {backgroundColor: stockStatus.color}]}
                      >
                        {stockStatus.label}
                      </Badge>
                    </DataTable.Cell>
                  </DataTable.Row>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </DataTable>
      </Card>

      {/* Category Filter Modal */}
      <Portal>
        <Modal
          visible={categoryFilterVisible}
          onDismiss={() => setCategoryFilterVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Text style={styles.modalTitle}>Filter by Category</Text>
          <ScrollView style={styles.modalScrollView}>
            {categoryOptions.map((category) => (
              <TouchableOpacity
                key={category}
                style={styles.modalItem}
                onPress={() => {
                  setSelectedCategory(category);
                  setCategoryFilterVisible(false);
                }}
              >
                <Text style={[
                  styles.modalItemText,
                  selectedCategory === category ? styles.selectedFilterText : null
                ]}>
                  {category}
                </Text>
                {selectedCategory === category && (
                  <Ionicons name="checkmark" size={20} color={PoliceColors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
          <Button 
            mode="outlined" 
            onPress={() => setCategoryFilterVisible(false)}
            style={styles.modalButton}
          >
            Close
          </Button>
        </Modal>
      </Portal>

      {/* Location Filter Modal */}
      <Portal>
        <Modal
          visible={locationFilterVisible}
          onDismiss={() => setLocationFilterVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Text style={styles.modalTitle}>Filter by Location</Text>
          <ScrollView style={styles.modalScrollView}>
            {locationOptions.map((location) => (
              <TouchableOpacity
                key={location}
                style={styles.modalItem}
                onPress={() => {
                  setSelectedLocation(location);
                  setLocationFilterVisible(false);
                }}
              >
                <Text style={[
                  styles.modalItemText,
                  selectedLocation === location ? styles.selectedFilterText : null
                ]}>
                  {location}
                </Text>
                {selectedLocation === location && (
                  <Ionicons name="checkmark" size={20} color={PoliceColors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
          <Button 
            mode="outlined" 
            onPress={() => setLocationFilterVisible(false)}
            style={styles.modalButton}
          >
            Close
          </Button>
        </Modal>
      </Portal>

      {/* Add New Item Modal */}
      <Portal>
        <Modal
          visible={addItemModalVisible}
          onDismiss={() => setAddItemModalVisible(false)}
          contentContainerStyle={styles.addItemModalContainer}
        >
          <Text style={styles.modalTitle}>Add New Inventory Item</Text>
          
          <ScrollView style={styles.addItemForm}>
            <Text style={styles.inputLabel}>Item Name</Text>
            <TextInput
              style={styles.textInput}
              value={newItem.name}
              onChangeText={(text) => setNewItem({...newItem, name: text})}
              placeholder="Enter item name"
            />
            
            <Text style={styles.inputLabel}>Category</Text>
            <View style={styles.pickerContainer}>
              <FlatList
                data={categoryOptions.filter(cat => cat !== 'All Categories')}
                horizontal
                showsHorizontalScrollIndicator={false}
                renderItem={({item}) => (
                  <TouchableOpacity
                    style={[
                      styles.pickerItem,
                      newItem.category === item ? styles.pickerItemSelected : {}
                    ]}
                    onPress={() => setNewItem({...newItem, category: item})}
                  >
                    <Text style={[
                      styles.pickerItemText,
                      newItem.category === item ? styles.pickerItemTextSelected : {}
                    ]}>
                      {item}
                    </Text>
                  </TouchableOpacity>
                )}
                keyExtractor={item => item}
              />
            </View>
            
            <Text style={styles.inputLabel}>Condition</Text>
            <View style={styles.pickerContainer}>
              <FlatList
                data={conditionOptions}
                horizontal
                showsHorizontalScrollIndicator={false}
                renderItem={({item}) => (
                  <TouchableOpacity
                    style={[
                      styles.pickerItem,
                      newItem.condition === item ? styles.pickerItemSelected : {}
                    ]}
                    onPress={() => setNewItem({...newItem, condition: item})}
                  >
                    <Text style={[
                      styles.pickerItemText,
                      newItem.condition === item ? styles.pickerItemTextSelected : {}
                    ]}>
                      {item}
                    </Text>
                  </TouchableOpacity>
                )}
                keyExtractor={item => item}
              />
            </View>
            
            <View style={styles.rowInputs}>
              <View style={styles.halfInput}>
                <Text style={styles.inputLabel}>Quantity</Text>
                <TextInput
                  style={styles.textInput}
                  value={newItem.quantity}
                  onChangeText={(text) => setNewItem({...newItem, quantity: text})}
                  placeholder="0"
                  keyboardType="numeric"
                />
              </View>
              
              <View style={styles.halfInput}>
                <Text style={styles.inputLabel}>Low Stock Threshold</Text>
                <TextInput
                  style={styles.textInput}
                  value={newItem.lowStockThreshold}
                  onChangeText={(text) => setNewItem({...newItem, lowStockThreshold: text})}
                  placeholder="0"
                  keyboardType="numeric"
                />
              </View>
            </View>
            
            <Text style={styles.inputLabel}>Storage Location</Text>
            <View style={styles.pickerContainer}>
              <FlatList
                data={locationOptions.filter(loc => loc !== 'All Locations')}
                horizontal
                showsHorizontalScrollIndicator={false}
                renderItem={({item}) => (
                  <TouchableOpacity
                    style={[
                      styles.pickerItem,
                      newItem.location === item ? styles.pickerItemSelected : {}
                    ]}
                    onPress={() => setNewItem({...newItem, location: item})}
                  >
                    <Text style={[
                      styles.pickerItemText,
                      newItem.location === item ? styles.pickerItemTextSelected : {}
                    ]}>
                      {item}
                    </Text>
                  </TouchableOpacity>
                )}
                keyExtractor={item => item}
              />
            </View>
          </ScrollView>
          
          <View style={styles.modalButtonRow}>
            <Button 
              mode="outlined" 
              onPress={() => setAddItemModalVisible(false)}
              style={[styles.modalButton, styles.cancelButton]}
            >
              Cancel
            </Button>
            <Button 
              mode="contained" 
              onPress={handleAddItem}
              style={[styles.modalButton, styles.saveButton]}
              labelStyle={{color: 'white'}}
            >
              Add Item
            </Button>
          </View>
        </Modal>
      </Portal>

      {/* Item Details Modal */}
      <Portal>
        <Modal
          visible={itemDetailsModalVisible}
          onDismiss={() => setItemDetailsModalVisible(false)}
          contentContainerStyle={styles.itemDetailsModalContainer}
        >
          {selectedItem && (
            <>
              <View style={styles.itemDetailsHeader}>
                <Text style={styles.itemDetailsTitle}>{selectedItem.name}</Text>
                {getStockStatus(selectedItem).label === 'In Stock' ? (
                  <Badge style={[styles.statusBadge, {backgroundColor: PoliceColors.success}]}>
                    In Stock
                  </Badge>
                ) : getStockStatus(selectedItem).label === 'Low Stock' ? (
                  <Badge style={[styles.statusBadge, {backgroundColor: PoliceColors.warning}]}>
                    Low Stock
                  </Badge>
                ) : (
                  <Badge style={[styles.statusBadge, {backgroundColor: PoliceColors.danger}]}>
                    Out of Stock
                  </Badge>
                )}
              </View>
              
              <Divider style={styles.divider} />
              
              <ScrollView style={styles.itemDetailsScrollView}>
                <List.Item
                  title="Category"
                  description={selectedItem.category}
                  left={props => <List.Icon {...props} icon="tag" color={PoliceColors.primary} />}
                />
                <Divider />
                
                <List.Item
                  title="Quantity Available"
                  description={selectedItem.quantity.toString()}
                  left={props => <List.Icon {...props} icon="numeric" color={PoliceColors.primary} />}
                />
                <Divider />
                
                <List.Item
                  title="Condition"
                  description={selectedItem.condition}
                  left={props => <List.Icon {...props} icon="star" color={PoliceColors.primary} />}
                />
                <Divider />
                
                <List.Item
                  title="Storage Location"
                  description={selectedItem.location}
                  left={props => <List.Icon {...props} icon="map-marker" color={PoliceColors.primary} />}
                />
                <Divider />
                
                <List.Item
                  title="Low Stock Alert Threshold"
                  description={selectedItem.lowStockThreshold.toString()}
                  left={props => <List.Icon {...props} icon="alert" color={PoliceColors.primary} />}
                />
              </ScrollView>
              
              <View style={styles.itemDetailsButtons}>
                <Button 
                  mode="outlined" 
                  onPress={() => setItemDetailsModalVisible(false)}
                  style={styles.detailsButton}
                >
                  Close
                </Button>
                <Button 
                  mode="contained" 
                  icon="pencil"
                  onPress={() => {
                    // Would navigate to edit screen in a real app
                    setItemDetailsModalVisible(false);
                  }}
                  style={[styles.detailsButton, styles.editButton]}
                  labelStyle={{color: 'white'}}
                >
                  Edit Item
                </Button>
              </View>
            </>
          )}
        </Modal>
      </Portal>

      {/* Floating Action Button for adding new items */}
      <FAB
        style={styles.fab}
        icon="plus"
        color={PoliceColors.white}
        onPress={() => setAddItemModalVisible(true)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PoliceColors.background,
  },
  searchFilterContainer: {
    padding: 16,
    backgroundColor: PoliceColors.white,
    borderBottomWidth: 1,
    borderBottomColor: PoliceColors.border,
  },
  searchBar: {
    elevation: 2,
    marginBottom: 10,
    borderRadius: 8,
  },
  filterButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  filterButton: {
    backgroundColor: PoliceColors.lightBlue,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    flex: 0.48,
    justifyContent: 'center',
  },
  filterButtonText: {
    color: PoliceColors.primary,
    fontWeight: '500',
    fontSize: 14,
  },
  statsCardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  statsCard: {
    width: '31%',
    borderRadius: 8,
    elevation: 2,
  },
  statsCardContent: {
    alignItems: 'center',
    padding: 10,
  },
  statsCardValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: PoliceColors.text,
    marginVertical: 5,
  },
  statsCardLabel: {
    fontSize: 12,
    color: PoliceColors.textLight,
  },
  tableCard: {
    margin: 16,
    borderRadius: 8,
    flex: 1,
    elevation: 2,
  },
  tableHeader: {
    backgroundColor: PoliceColors.lightGray,
  },
  tableScrollView: {
    height: '100%',
  },
  tableRow: {
    borderBottomWidth: 1,
    borderBottomColor: PoliceColors.border,
  },
  statusBadge: {
    borderRadius: 4,
  },
  modalContainer: {
    backgroundColor: PoliceColors.white,
    padding: 20,
    margin: 20,
    borderRadius: 8,
    maxHeight: '80%',
  },
  addItemModalContainer: {
    backgroundColor: PoliceColors.white,
    padding: 20,
    margin: 20,
    borderRadius: 8,
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: PoliceColors.text,
    textAlign: 'center',
  },
  modalScrollView: {
    marginBottom: 15,
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: PoliceColors.border,
  },
  modalItemText: {
    fontSize: 16,
    color: PoliceColors.text,
  },
  selectedFilterText: {
    color: PoliceColors.primary,
    fontWeight: 'bold',
  },
  modalButton: {
    marginTop: 10,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: PoliceColors.accent,
  },
  addItemForm: {
    marginVertical: 10,
  },
  inputLabel: {
    fontSize: 14,
    color: PoliceColors.textLight,
    marginBottom: 5,
    marginTop: 10,
  },
  textInput: {
    backgroundColor: PoliceColors.lightGray,
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
  },
  pickerContainer: {
    marginVertical: 10,
  },
  pickerItem: {
    backgroundColor: PoliceColors.lightGray,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
  },
  pickerItemSelected: {
    backgroundColor: PoliceColors.lightBlue,
    borderWidth: 1,
    borderColor: PoliceColors.primary,
  },
  pickerItemText: {
    color: PoliceColors.text,
  },
  pickerItemTextSelected: {
    color: PoliceColors.primary,
    fontWeight: 'bold',
  },
  rowInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  saveButton: {
    backgroundColor: PoliceColors.primary,
    flex: 1,
    marginLeft: 5,
  },
  cancelButton: {
    flex: 1,
    marginRight: 5,
  },
  itemDetailsModalContainer: {
    backgroundColor: PoliceColors.white,
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  itemDetailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemDetailsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: PoliceColors.text,
    flex: 1,
  },
  divider: {
    marginVertical: 10,
    height: 1,
    backgroundColor: PoliceColors.border,
  },
  itemDetailsScrollView: {
    marginTop: 10,
  },
  itemDetailsButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  detailsButton: {
    flex: 1,
    marginHorizontal: 5,
  },
  editButton: {
    backgroundColor: PoliceColors.primary,
  },
});