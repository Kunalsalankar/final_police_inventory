import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, StatusBar, Platform, Alert } from 'react-native';
import { Card, Searchbar, FAB, DataTable, Menu, Button, IconButton, Chip } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Firebase imports
import { getDatabase, ref, onValue } from "firebase/database";

// Define interfaces for our data types
interface InventoryItem {
  id: string;
  name: string;
  category: string;
  status: 'Available' | 'Assigned' | 'Maintenance' | 'Expired';
  quantity: number;
  lastUpdated: string;
  serialNumber?: string;
  location?: string;
  condition?: string;
  purchaseDate?: string;
  warrantyExpiry?: string;
}

interface FilterOptions {
  category: string[];
  status: string[];
  location: string[];
}

// Color scheme for police-themed app
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

export default function InventoryScreen(): React.ReactElement {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(0);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [menuVisible, setMenuVisible] = useState<boolean>(false);
  const [filterVisible, setFilterVisible] = useState<boolean>(false);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    category: [],
    status: [],
    location: []
  });
  const [activeFilters, setActiveFilters] = useState<{
    category: string | null,
    status: string | null,
    location: string | null
  }>({
    category: null,
    status: null,
    location: null
  });
  const [error, setError] = useState<string | null>(null);

  // Initialize and fetch data on component mount
  useEffect(() => {
    setLoading(true);
    
    try {
      const db = getDatabase();
      const inventoryRef = ref(db, 'inventory');
      
      // If Firebase is connected, fetch real data
      onValue(inventoryRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const itemsArray = Object.keys(data).map(key => ({
            id: key,
            ...data[key]
          }));
          setInventoryItems(itemsArray);
          setFilteredItems(itemsArray);
          
          // Extract filter options
          const categories = [...new Set(itemsArray.map(item => item.category))];
          const statuses = [...new Set(itemsArray.map(item => item.status))];
          const locations = [...new Set(itemsArray.map(item => item.location).filter(Boolean))];
          
          setFilterOptions({
            category: categories,
            status: statuses,
            location: locations
          });
          setError(null);
        } else {
          // If no data in Firebase, load dummy data
          setDummyData();
        }
        setLoading(false);
      }, (error) => {
        console.error("Error fetching inventory data:", error);
        setError("Error fetching inventory data: " + error.message);
        setDummyData();
        setLoading(false);
      });
    } catch (error: any) {
      console.error("Error connecting to Firebase:", error);
      setError("Error connecting to Firebase: " + error.message);
      setDummyData();
      setLoading(false);
    }
  }, []);

  // Set dummy data if Firebase fails
  const setDummyData = (): void => {
    const dummyItems: InventoryItem[] = [
      {
        id: '1',
        name: 'Police Radio - Motorola APX 8000',
        category: 'Communication',
        status: 'Available',
        quantity: 24,
        lastUpdated: '2025-02-15',
        serialNumber: 'MTR-APX-2022-001',
        location: 'Central Station',
        condition: 'New',
        purchaseDate: '2025-01-10',
        warrantyExpiry: '2028-01-10'
      },
      {
        id: '2',
        name: 'Body Camera - Axon Body 3',
        category: 'Surveillance',
        status: 'Assigned',
        quantity: 48,
        lastUpdated: '2025-02-20',
        serialNumber: 'AXN-BC3-2023-032',
        location: 'Central Station',
        condition: 'Good',
        purchaseDate: '2024-08-15',
        warrantyExpiry: '2026-08-15'
      },
      {
        id: '3',
        name: 'Patrol Laptop - Panasonic Toughbook',
        category: 'Computing',
        status: 'Maintenance',
        quantity: 12,
        lastUpdated: '2025-02-22',
        serialNumber: 'PAN-TBK-2023-018',
        location: 'IT Department',
        condition: 'Needs Repair',
        purchaseDate: '2023-11-05',
        warrantyExpiry: '2026-11-05'
      },
      {
        id: '4',
        name: 'Taser X2',
        category: 'Weapons',
        status: 'Available',
        quantity: 35,
        lastUpdated: '2025-02-18',
        serialNumber: 'TSR-X2-2024-022',
        location: 'Weapons Storage',
        condition: 'Good',
        purchaseDate: '2024-01-25',
        warrantyExpiry: '2029-01-25'
      },
      {
        id: '5',
        name: 'Patrol Vehicle Dashcam',
        category: 'Surveillance',
        status: 'Assigned',
        quantity: 28,
        lastUpdated: '2025-02-10',
        serialNumber: 'DC-PV-2023-045',
        location: 'Vehicle Bay',
        condition: 'Good',
        purchaseDate: '2023-06-12',
        warrantyExpiry: '2027-06-12'
      },
      {
        id: '6',
        name: 'Bulletproof Vest - Level IIIA',
        category: 'Protection',
        status: 'Expired',
        quantity: 8,
        lastUpdated: '2025-02-05',
        serialNumber: 'BPV-3A-2020-089',
        location: 'Equipment Storage',
        condition: 'Expired',
        purchaseDate: '2020-03-18',
        warrantyExpiry: '2025-03-18'
      },
      {
        id: '7',
        name: 'Handheld Breathalyzer',
        category: 'Testing Equipment',
        status: 'Available',
        quantity: 15,
        lastUpdated: '2025-02-12',
        serialNumber: 'BRZ-HH-2024-012',
        location: 'Traffic Division',
        condition: 'New',
        purchaseDate: '2024-12-20',
        warrantyExpiry: '2027-12-20'
      },
      {
        id: '8',
        name: 'Police Badge',
        category: 'Identification',
        status: 'Assigned',
        quantity: 75,
        lastUpdated: '2025-01-30',
        serialNumber: 'PB-STD-2024-Series',
        location: 'Admin Office',
        condition: 'Good',
        purchaseDate: '2024-01-15',
        warrantyExpiry: 'N/A'
      }
    ];
    
    setInventoryItems(dummyItems);
    setFilteredItems(dummyItems);
    
    // Extract filter options from dummy data
    const categories = [...new Set(dummyItems.map(item => item.category))];
    const statuses = [...new Set(dummyItems.map(item => item.status))];
    const locations = [...new Set(dummyItems.map(item => item.location).filter(Boolean))];
    
    setFilterOptions({
      category: categories,
      status: statuses,
      location: locations
    });
  };

  // Handle search and filtering
  useEffect(() => {
    const filtered = inventoryItems.filter(item => {
      const matchesSearch = searchQuery === '' || 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.serialNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());
        
      const matchesCategory = !activeFilters.category || item.category === activeFilters.category;
      const matchesStatus = !activeFilters.status || item.status === activeFilters.status;
      const matchesLocation = !activeFilters.location || item.location === activeFilters.location;
      
      return matchesSearch && matchesCategory && matchesStatus && matchesLocation;
    });
    
    setFilteredItems(filtered);
    setPage(0); // Reset to first page on search/filter change
  }, [searchQuery, activeFilters, inventoryItems]);

  // Apply filter
  const applyFilter = (filterType: 'category' | 'status' | 'location', value: string | null) => {
    setActiveFilters(prev => ({ ...prev, [filterType]: value }));
    setFilterVisible(false);
  };

  // Reset all filters
  const resetFilters = () => {
    setActiveFilters({
      category: null,
      status: null,
      location: null
    });
    setFilterVisible(false);
  };

  // Navigate to item detail page
  const navigateToItemDetail = (itemId: string) => {
    router.push(`/(tabs)/inventory/${itemId}` as any);
  };

  // Get status color
  const getStatusColor = (status: string): string => {
    switch(status) {
      case 'Available':
        return PoliceColors.success;
      case 'Assigned':
        return PoliceColors.primary;
      case 'Maintenance':
        return PoliceColors.warning;
      case 'Expired':
        return PoliceColors.danger;
      default:
        return PoliceColors.textLight;
    }
  };

  // Calculate pagination values
  const from = page * itemsPerPage;
  const to = Math.min((page + 1) * itemsPerPage, filteredItems.length);
  const paginatedItems = filteredItems.slice(from, to);

  // Handle error dismissal
  const dismissError = () => {
    setError(null);
  };

  // Handle items per page change
  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setPage(0); // Reset to first page when changing items per page
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={PoliceColors.darkBlue} />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: PoliceColors.primary }]}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={PoliceColors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Stock Inventory</Text>
          <TouchableOpacity onPress={() => setMenuVisible(true)} style={styles.menuButton}>
            <Ionicons name="ellipsis-vertical" size={24} color={PoliceColors.white} />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Menu */}
      <Menu
        visible={menuVisible}
        onDismiss={() => setMenuVisible(false)}
        anchor={{ x: window.innerWidth - 40, y: Platform.OS === 'ios' ? 90 : 70 }}
        style={styles.menu}
      >
        <Menu.Item 
          onPress={() => {
            setMenuVisible(false);
            router.push('/(tabs)/inventory/export' as any);
          }} 
          title="Export Inventory"
          leadingIcon="file-export"
        />
        <Menu.Item 
          onPress={() => {
            setMenuVisible(false);
            router.push('/(tabs)/inventory/settings' as any);
          }} 
          title="Inventory Settings" 
          leadingIcon="cog"
        />
        <Divider />
        <Menu.Item 
          onPress={() => {
            setMenuVisible(false);
            Alert.alert("Print", "Printing inventory list...");
          }} 
          title="Print Inventory List" 
          leadingIcon="printer"
        />
      </Menu>
      
      {/* Main Content */}
      <View style={styles.content}>
        {/* Search and Filter */}
        <View style={styles.searchFilterContainer}>
          <Searchbar
            placeholder="Search by name, serial number..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            iconColor={PoliceColors.primary}
          />
          <TouchableOpacity 
            style={[
              styles.filterButton, 
              Object.values(activeFilters).some(filter => filter !== null) && styles.filterButtonActive
            ]}
            onPress={() => setFilterVisible(!filterVisible)}
          >
            <Ionicons 
              name="filter" 
              size={22} 
              color={Object.values(activeFilters).some(filter => filter !== null) 
                ? PoliceColors.white 
                : PoliceColors.primary} 
            />
          </TouchableOpacity>
        </View>
        
        {/* Active Filters */}
        {Object.values(activeFilters).some(filter => filter !== null) && (
          <View style={styles.activeFiltersContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {activeFilters.category && (
                <Chip 
                  style={styles.filterChip} 
                  textStyle={{ color: PoliceColors.primary }}
                  onClose={() => applyFilter('category', null)}
                >
                  Category: {activeFilters.category}
                </Chip>
              )}
              {activeFilters.status && (
                <Chip 
                  style={styles.filterChip} 
                  textStyle={{ color: PoliceColors.primary }}
                  onClose={() => applyFilter('status', null)}
                >
                  Status: {activeFilters.status}
                </Chip>
              )}
              {activeFilters.location && (
                <Chip 
                  style={styles.filterChip} 
                  textStyle={{ color: PoliceColors.primary }}
                  onClose={() => applyFilter('location', null)}
                >
                  Location: {activeFilters.location}
                </Chip>
              )}
              <TouchableOpacity style={styles.clearFiltersButton} onPress={resetFilters}>
                <Text style={styles.clearFiltersText}>Clear All</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        )}
        
        {/* Filter Panel */}
        {filterVisible && (
          <Card style={styles.filterPanel}>
            <Card.Content>
              <Text style={styles.filterPanelTitle}>Filter Inventory</Text>
              
              {/* Category Filter */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Category</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterOptionsScroll}>
                  {filterOptions.category.map(category => (
                    <TouchableOpacity 
                      key={category}
                      style={[
                        styles.filterOption,
                        activeFilters.category === category && styles.filterOptionActive
                      ]}
                      onPress={() => applyFilter('category', category)}
                    >
                      <Text style={[
                        styles.filterOptionText,
                        activeFilters.category === category && styles.filterOptionTextActive
                      ]}>
                        {category}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              
              {/* Status Filter */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Status</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterOptionsScroll}>
                  {filterOptions.status.map(status => (
                    <TouchableOpacity 
                      key={status}
                      style={[
                        styles.filterOption,
                        activeFilters.status === status && styles.filterOptionActive
                      ]}
                      onPress={() => applyFilter('status', status)}
                    >
                      <Text style={[
                        styles.filterOptionText,
                        activeFilters.status === status && styles.filterOptionTextActive
                      ]}>
                        {status}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              
              {/* Location Filter */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Location</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterOptionsScroll}>
                  {filterOptions.location.map(location => (
                    <TouchableOpacity 
                      key={location}
                      style={[
                        styles.filterOption,
                        activeFilters.location === location && styles.filterOptionActive
                      ]}
                      onPress={() => applyFilter('location', location)}
                    >
                      <Text style={[
                        styles.filterOptionText,
                        activeFilters.location === location && styles.filterOptionTextActive
                      ]}>
                        {location}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              
              <View style={styles.filterActions}>
                <Button 
                  mode="outlined" 
                  onPress={resetFilters}
                  style={styles.filterResetButton}
                >
                  Reset
                </Button>
                <Button 
                  mode="contained" 
                  onPress={() => setFilterVisible(false)}
                  style={styles.filterApplyButton}
                  buttonColor={PoliceColors.primary}
                >
                  Apply
                </Button>
              </View>
            </Card.Content>
          </Card>
        )}
        
        {/* Error Banner */}
        {error && (
          <View style={styles.errorBanner}>
            <View style={styles.errorContent}>
              <Ionicons name="alert-circle" size={24} color={PoliceColors.white} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
            <TouchableOpacity onPress={dismissError} style={styles.errorDismiss}>
              <Ionicons name="close" size={20} color={PoliceColors.white} />
            </TouchableOpacity>
          </View>
        )}
        
        {/* Inventory Table */}
        <Card style={styles.dataTableCard}>
          <ScrollView>
            <DataTable>
              <DataTable.Header style={styles.tableHeader}>
                <DataTable.Title style={{ flex: 3 }}>Item</DataTable.Title>
                <DataTable.Title style={{ flex: 1 }} numeric>Qty</DataTable.Title>
                <DataTable.Title style={{ flex: 2 }}>Status</DataTable.Title>
                <DataTable.Title style={{ flex: 0.5 }}></DataTable.Title>
              </DataTable.Header>

              {loading ? (
                <View style={styles.loadingContainer}>
                  <Text style={styles.loadingText}>Loading inventory data...</Text>
                </View>
              ) : filteredItems.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Ionicons name="search" size={48} color={PoliceColors.textLight} />
                  <Text style={styles.emptyText}>No inventory items found</Text>
                  <Text style={styles.emptySubText}>Try adjusting your search or filters</Text>
                </View>
              ) : (
                paginatedItems.map((item) => (
                  <DataTable.Row 
                    key={item.id}
                    style={styles.tableRow}
                    onPress={() => navigateToItemDetail(item.id)}
                  >
                    <DataTable.Cell style={{ flex: 3 }}>
                      <View>
                        <Text style={styles.itemName} numberOfLines={1} ellipsizeMode="tail">
                          {item.name}
                        </Text>
                        <Text style={styles.itemCategory} numberOfLines={1}>
                          {item.category}
                        </Text>
                      </View>
                    </DataTable.Cell>
                    <DataTable.Cell style={{ flex: 1 }} numeric>
                      <Text style={styles.itemQuantity}>{item.quantity}</Text>
                    </DataTable.Cell>
                    <DataTable.Cell style={{ flex: 2 }}>
                      <View style={[
                        styles.statusBadge, 
                        { backgroundColor: `${getStatusColor(item.status)}20` }
                      ]}>
                        <Text style={[
                          styles.statusText, 
                          { color: getStatusColor(item.status) }
                        ]}>
                          {item.status}
                        </Text>
                      </View>
                    </DataTable.Cell>
                    <DataTable.Cell style={{ flex: 0.5, justifyContent: 'flex-end' }}>
                      <IconButton
                        icon="chevron-right"
                        size={20}
                        iconColor={PoliceColors.textLight}
                        onPress={() => navigateToItemDetail(item.id)}
                        style={styles.chevronButton}
                      />
                    </DataTable.Cell>
                  </DataTable.Row>
                ))
              )}
            </DataTable>
          </ScrollView>
          
          {/* Pagination */}
          <View style={styles.paginationContainer}>
            <View style={styles.itemsPerPageContainer}>
              <Text style={styles.paginationText}>Rows per page:</Text>
              <TouchableOpacity 
                style={styles.itemsPerPageSelector}
                onPress={() => {
                  const newValue = itemsPerPage === 5 ? 10 : itemsPerPage === 10 ? 20 : 5;
                  handleItemsPerPageChange(newValue);
                }}
              >
                <Text style={styles.itemsPerPageValue}>{itemsPerPage}</Text>
                <Ionicons name="chevron-down" size={16} color={PoliceColors.text} />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.paginationLabel}>
              {from + 1}-{to} of {filteredItems.length}
            </Text>
            
            <View style={styles.paginationControls}>
              <IconButton
                icon="chevron-left"
                size={20}
                iconColor={page === 0 ? PoliceColors.textLight : PoliceColors.primary}
                disabled={page === 0}
                onPress={() => setPage(Math.max(0, page - 1))}
                style={styles.paginationButton}
              />
              <IconButton
                icon="chevron-right"
                size={20}
                iconColor={page >= Math.ceil(filteredItems.length / itemsPerPage) - 1 
                  ? PoliceColors.textLight 
                  : PoliceColors.primary}
                disabled={page >= Math.ceil(filteredItems.length / itemsPerPage) - 1}
                onPress={() => setPage(Math.min(Math.ceil(filteredItems.length / itemsPerPage) - 1, page + 1))}
                style={styles.paginationButton}
              />
            </View>
          </View>
        </Card>
      </View>
      
      {/* Add Item FAB */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => router.push('/(tabs)/inventory/add' as any)}
        color={PoliceColors.white}
      />
    </View>
  );
}

// Improved styles with better mobile responsiveness
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PoliceColors.background,
  },
  header: {
    height: Platform.OS === 'ios' ? 100 : 80,
    paddingTop: Platform.OS === 'ios' ? 40 : 20,
    elevation: 4,
    shadowColor: PoliceColors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: PoliceColors.white,
  },
  menuButton: {
    padding: 8,
  },
  menu: {
    borderRadius: 8,
    elevation: 5,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 80, // Added space for FAB
  },
  searchFilterContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  searchBar: {
    flex: 1,
    height: 45,
    borderRadius: 8,
    marginRight: 8,
    elevation: 1,
  },
  filterButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 45,
    height: 45,
    borderRadius: 8,
    backgroundColor: PoliceColors.white,
    borderWidth: 1,
    borderColor: PoliceColors.primary,
    elevation: 1,
  },
  filterButtonActive: {
    backgroundColor: PoliceColors.primary,
  },
  activeFiltersContainer: {
    marginBottom: 12,
  },
  filterChip: {
    marginRight: 8,
    backgroundColor: PoliceColors.lightBlue,
    height: 32,
  },
  clearFiltersButton: {
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  clearFiltersText: {
    color: PoliceColors.accent,
    fontWeight: '500',
  },
  filterPanel: {
    marginBottom: 12,
    elevation: 4,
    borderRadius: 8,
    zIndex: 10,
  },
  filterPanelTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: PoliceColors.text,
  },
  filterSection: {
    marginBottom: 12,
  },
  filterSectionTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    color: PoliceColors.textLight,
  },
  filterOptionsScroll: {
    flexDirection: 'row',
  },
  filterOption: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: PoliceColors.lightGray,
    marginRight: 8,
  },
  filterOptionActive: {
    backgroundColor: PoliceColors.primary,
  },
  filterOptionText: {
    color: PoliceColors.text,
    fontSize: 14,
  },
  filterOptionTextActive: {
    color: PoliceColors.white,
  },
  filterActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  filterResetButton: {
    marginRight: 8,
    borderColor: PoliceColors.primary,
  },
  filterApplyButton: {
    backgroundColor: PoliceColors.primary,
  },
  dataTableCard: {
    flex: 1,
    borderRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  tableHeader: {
    backgroundColor: PoliceColors.lightGray,
    height: 50,
  },
  tableRow: {
    borderBottomWidth: 1,
    borderBottomColor: PoliceColors.border,
    height: 64,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '500',
    color: PoliceColors.text,
    width: '100%',
  },
  itemCategory: {
    fontSize: 12,
    color: PoliceColors.textLight,
    marginTop: 2,
  },
  itemQuantity: {
    fontWeight: 'bold',
    color: PoliceColors.text,
    fontSize: 16,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
    maxWidth: 100,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  chevronButton: {
    margin: 0,
    padding: 0,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    color: PoliceColors.textLight,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    color: PoliceColors.textLight,
    marginTop: 12,
  },
  emptySubText: {
    fontSize: 14,
    color: PoliceColors.textLight,
    marginTop: 4,
  },
  errorBanner: {
    backgroundColor: PoliceColors.danger,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  errorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  errorText: {
    color: PoliceColors.white,
    marginLeft: 8,
    flex: 1,
  },
  errorDismiss: {
    padding: 4,
  },
  paginationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: PoliceColors.border,
    padding: 8,
    backgroundColor: PoliceColors.white,
  },
  itemsPerPageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paginationText: {
    fontSize: 12,
    color: PoliceColors.textLight,
    marginRight: 8,
  },
  itemsPerPageSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
  },
  itemsPerPageValue: {
    fontSize: 12,
    fontWeight: '500',
    marginRight: 4,
    color: PoliceColors.text,
  },
  paginationLabel: {
    fontSize: 12,
    color: PoliceColors.textLight,
  },
  paginationControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paginationButton: {
    margin: 0,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: PoliceColors.primary,
    borderRadius: 28,
    elevation: 4,
    shadowColor: PoliceColors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
});

// We need to add this Divider component that was missing
const Divider = () => (
  <View 
    style={{
      height: 1,
      backgroundColor: PoliceColors.border,
      marginVertical: 4
    }}
  />
);