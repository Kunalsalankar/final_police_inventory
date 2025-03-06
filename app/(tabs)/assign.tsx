import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  Alert, 
  TouchableOpacity, 
  ActivityIndicator, 
  Modal, 
  StatusBar, 
  SafeAreaView,
  ViewStyle,
  TextStyle,
  ImageStyle,
  StyleProp
} from 'react-native';
import { Card, TextInput, Button, Divider, Chip, Searchbar, Menu, IconButton } from 'react-native-paper';
import { collection, addDoc, getDocs, query, orderBy, Timestamp, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { format } from 'date-fns';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Define a theme object for consistent styling
const Theme = {
  colors: {
    primary: '#3b82f6', // Bright blue
    primaryDark: '#1d4ed8', // Darker blue
    secondary: '#94a3b8', // Slate gray
    background: '#f8fafc', // Light gray background
    surface: '#ffffff', // White
    error: '#ef4444', // Red
    success: '#22c55e', // Green
    warning: '#f59e0b', // Amber
    info: '#0ea5e9', // Light blue
    text: '#1e293b', // Dark slate
    textSecondary: '#64748b', // Medium slate
    border: '#e2e8f0', // Light slate
    card: '#ffffff', // White
    overlay: 'rgba(0, 0, 0, 0.5)', // Semi-transparent black
    activeStatus: '#dcfce7', // Light green background
    activeStatusText: '#16a34a', // Green text
    returnedStatus: '#dbeafe', // Light blue background
    returnedStatusText: '#2563eb', // Blue text
    overdueStatus: '#fee2e2', // Light red background
    overdueStatusText: '#dc2626', // Red text
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },
  typography: {
    h1: {
      fontSize: 28,
      fontWeight: 'bold',
    },
    h2: {
      fontSize: 24,
      fontWeight: 'bold',
    },
    h3: {
      fontSize: 20,
      fontWeight: 'bold',
    },
    h4: {
      fontSize: 18,
      fontWeight: 'bold',
    },
    subtitle: {
      fontSize: 16,
      fontWeight: '600',
    },
    body: {
      fontSize: 14,
    },
    small: {
      fontSize: 12,
    },
    xs: {
      fontSize: 10,
    },
  },
  shadow: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 3,
      elevation: 4,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 5,
      elevation: 8,
    },
  },
};

// Define TypeScript interfaces for our data
interface Asset {
  id: string;
  name: string;
  type: string;
  serialNumber: string;
  status: 'Available' | 'Assigned' | 'Maintenance' | 'Retired';
}

interface Officer {
  id: string;
  badgeNumber: string;
  name: string;
  rank: string;
  department: string;
}

interface Assignment {
  id: string;
  assetId: string;
  assetName: string;
  officerId: string;
  officerName: string;
  badgeNumber: string;
  assignedDate: Timestamp;
  dueDate: Timestamp | null;
  returnDate: Timestamp | null;
  status: 'Active' | 'Returned' | 'Overdue';
  notes: string;
}

// Asset types list
const assetTypes = [
  'Firearm',
  'Body Camera',
  'Radio',
  'Vehicle',
  'Laptop',
  'Mobile Device',
  'Badge',
  'Uniform',
  'Taser',
  'Handcuffs',
  'Other'
];

// Officer ranks
const officerRanks = [
  'Officer',
  'Detective',
  'Sergeant',
  'Lieutenant',
  'Captain',
  'Chief',
  'Other'
];

// Departments
const departments = [
  'Patrol',
  'Traffic',
  'Investigation',
  'Special Operations',
  'Administration',
  'K-9 Unit',
  'Narcotics',
  'Other'
];

// Create a reusable dropdown component
interface DropdownProps {
  label: string;
  value: string | null;
  placeholder: string;
  onPress: () => void;
  showAddButton?: boolean;
  onAddPress?: () => void;
}

const Dropdown: React.FC<DropdownProps> = ({
  label,
  value,
  placeholder,
  onPress,
  showAddButton = false,
  onAddPress
}) => {
  return (
    <View style={styles.inputContainer}>
      <View style={styles.rowBetween}>
        <Text style={styles.inputLabel}>{label}</Text>
        {showAddButton && onAddPress && (
          <Button
            mode="text"
            compact
            onPress={onAddPress}
            labelStyle={{ color: Theme.colors.primary }}
          >
            + Add New
          </Button>
        )}
      </View>
      <TouchableOpacity
        style={styles.dropdown}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.dropdownText,
            !value && { color: Theme.colors.textSecondary }
          ]}
        >
          {value || placeholder}
        </Text>
        <MaterialCommunityIcons
          name="chevron-down"
          size={20}
          color={Theme.colors.secondary}
        />
      </TouchableOpacity>
    </View>
  );
};

// Create a reusable dropdown menu component
interface DropdownMenuProps {
  visible: boolean;
  onDismiss: () => void;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (text: string) => void;
  data: any[];
  renderItem: (item: any) => React.ReactNode;
  noDataText: string;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({
  visible,
  onDismiss,
  searchPlaceholder,
  searchValue,
  onSearchChange,
  data,
  renderItem,
  noDataText
}) => {
  if (!visible) return null;

  return (
    <Card style={styles.dropdownCard}>
      {searchValue !== undefined && onSearchChange && (
        <Searchbar
          placeholder={searchPlaceholder || "Search"}
          onChangeText={onSearchChange}
          value={searchValue}
          style={styles.searchbar}
          iconColor={Theme.colors.primary}
        />
      )}
      <ScrollView style={styles.dropdownScroll} keyboardShouldPersistTaps="handled">
        {data.length > 0 ? (
          data.map(renderItem)
        ) : (
          <Text style={styles.noItemsText}>{noDataText}</Text>
        )}
      </ScrollView>
    </Card>
  );
};

// Create a reusable input field component
interface InputFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  multiline?: boolean;
  numberOfLines?: number;
  required?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  multiline = false,
  numberOfLines = 1,
  required = false
}) => {
  return (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>
        {label}{required ? '*' : ''}
      </Text>
      <TextInput
        mode="outlined"
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        numberOfLines={numberOfLines}
        style={[
          styles.input,
          multiline && { height: 24 * numberOfLines }
        ]}
        outlineColor={Theme.colors.border}
        activeOutlineColor={Theme.colors.primary}
        theme={{ colors: { primary: Theme.colors.primary } }}
      />
    </View>
  );
};

// Create a status chip component
interface StatusChipProps {
  status: 'Active' | 'Returned' | 'Overdue';
}

const StatusChip: React.FC<StatusChipProps> = ({ status }) => {
  let backgroundColor, textColor;

  switch (status) {
    case 'Active':
      backgroundColor = Theme.colors.activeStatus;
      textColor = Theme.colors.activeStatusText;
      break;
    case 'Returned':
      backgroundColor = Theme.colors.returnedStatus;
      textColor = Theme.colors.returnedStatusText;
      break;
    case 'Overdue':
      backgroundColor = Theme.colors.overdueStatus;
      textColor = Theme.colors.overdueStatusText;
      break;
  }

  return (
    <View style={[styles.statusChip, { backgroundColor }]}>
      <Text style={[styles.statusText, { color: textColor }]}>
        {status}
      </Text>
    </View>
  );
};

// Assignment Card Component
interface AssignmentCardProps {
  assignment: Assignment;
  onReturn: (assignment: Assignment) => void;
}

const AssignmentCard: React.FC<AssignmentCardProps> = ({ assignment, onReturn }) => {
  // Format a timestamp for display
  const formatDate = (timestamp: Timestamp | null) => {
    if (!timestamp) return 'N/A';
    return format(timestamp.toDate(), 'MMM dd, yyyy');
  };

  return (
    <Card style={styles.assignmentCard}>
      <Card.Content>
        <View style={styles.assignmentHeader}>
          <View style={styles.assetInfoContainer}>
            <Text style={styles.assetType}>{getAssetIcon(assignment.assetName)}</Text>
            <Text style={styles.assetName}>{assignment.assetName}</Text>
          </View>
          <StatusChip status={assignment.status} />
        </View>
        
        <Divider style={styles.divider} />
        
        <View style={styles.assignmentDetails}>
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Officer</Text>
              <Text style={styles.detailValue}>
                {assignment.officerName}
              </Text>
              <Text style={styles.badgeNumber}>
                Badge: {assignment.badgeNumber}
              </Text>
            </View>
            
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Timeline</Text>
              <Text style={styles.detailValue}>
                Assigned: {formatDate(assignment.assignedDate)}
              </Text>
              {assignment.dueDate && (
                <Text style={styles.detailValue}>
                  Due: {formatDate(assignment.dueDate)}
                </Text>
              )}
              {assignment.returnDate && (
                <Text style={styles.detailValue}>
                  Returned: {formatDate(assignment.returnDate)}
                </Text>
              )}
            </View>
          </View>
          
          {assignment.notes && (
            <View style={styles.notes}>
              <Text style={styles.detailLabel}>Notes:</Text>
              <Text style={styles.notesText}>{assignment.notes}</Text>
            </View>
          )}
        </View>
        
        {assignment.status === 'Active' && (
          <Button 
            mode="outlined" 
            onPress={() => onReturn(assignment)}
            style={styles.returnButton}
            icon="keyboard-return"
            labelStyle={{ color: Theme.colors.primary }}
            contentStyle={{ height: 40 }}
          >
            Return Asset
          </Button>
        )}
      </Card.Content>
    </Card>
  );
};

// Helper function to get an icon name based on asset type
const getAssetIcon = (assetName: string): string => {
  const lowerAssetName = assetName.toLowerCase();
  
  if (lowerAssetName.includes('firearm') || lowerAssetName.includes('gun')) {
    return '🔫';
  } else if (lowerAssetName.includes('camera')) {
    return '📷';
  } else if (lowerAssetName.includes('radio')) {
    return '📻';
  } else if (lowerAssetName.includes('vehicle') || lowerAssetName.includes('car')) {
    return '🚓';
  } else if (lowerAssetName.includes('laptop') || lowerAssetName.includes('computer')) {
    return '💻';
  } else if (lowerAssetName.includes('mobile') || lowerAssetName.includes('phone')) {
    return '📱';
  } else if (lowerAssetName.includes('badge')) {
    return '👮';
  } else if (lowerAssetName.includes('uniform')) {
    return '👕';
  } else if (lowerAssetName.includes('taser')) {
    return '⚡';
  } else if (lowerAssetName.includes('handcuffs') || lowerAssetName.includes('cuffs')) {
    return '⛓️';
  }
  
  return '🔧'; // Default icon
};

// Main Component
export default function AssignScreen() {
  // State variables for the component
  const [loading, setLoading] = useState(false);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [selectedOfficer, setSelectedOfficer] = useState<Officer | null>(null);
  const [notes, setNotes] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAssetDropdown, setShowAssetDropdown] = useState(false);
  const [showOfficerDropdown, setShowOfficerDropdown] = useState(false);
  const [assetSearchQuery, setAssetSearchQuery] = useState('');
  const [officerSearchQuery, setOfficerSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  
  // State variables for adding assets and officers
  const [assetModalVisible, setAssetModalVisible] = useState(false);
  const [officerModalVisible, setOfficerModalVisible] = useState(false);
  const [newAssetName, setNewAssetName] = useState('');
  const [newAssetType, setNewAssetType] = useState('');
  const [newAssetSerialNumber, setNewAssetSerialNumber] = useState('');
  const [newOfficerName, setNewOfficerName] = useState('');
  const [newOfficerBadgeNumber, setNewOfficerBadgeNumber] = useState('');
  const [newOfficerRank, setNewOfficerRank] = useState('');
  const [newOfficerDepartment, setNewOfficerDepartment] = useState('');
  const [showAssetTypeDropdown, setShowAssetTypeDropdown] = useState(false);
  const [showRankDropdown, setShowRankDropdown] = useState(false);
  const [showDepartmentDropdown, setShowDepartmentDropdown] = useState(false);
  
  // View mode state
  const [viewMode, setViewMode] = useState<'assignments' | 'form'>('form');

  // Fetch assignments, assets, and officers when component mounts
  useEffect(() => {
    fetchAssignments();
    fetchAssets();
    fetchOfficers();
  }, []);

  // Function to fetch assignments from Firestore
  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const assignmentsQuery = query(
        collection(db, 'assignments'),
        orderBy('assignedDate', 'desc')
      );
      
      const querySnapshot = await getDocs(assignmentsQuery);
      const assignmentsList: Assignment[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data() as Omit<Assignment, 'id'>;
        assignmentsList.push({
          id: doc.id,
          ...data
        });
      });
      
      setAssignments(assignmentsList);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      Alert.alert('Error', 'Failed to load assignment data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Function to fetch assets from Firestore
  const fetchAssets = async () => {
    try {
      const assetsQuery = query(collection(db, 'assets'));
      const querySnapshot = await getDocs(assetsQuery);
      const assetsList: Asset[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data() as Omit<Asset, 'id'>;
        assetsList.push({
          id: doc.id,
          ...data
        });
      });
      
      setAssets(assetsList);
    } catch (error) {
      console.error('Error fetching assets:', error);
      Alert.alert('Error', 'Failed to load asset data.');
    }
  };

  // Function to fetch officers from Firestore
  const fetchOfficers = async () => {
    try {
      const officersQuery = query(collection(db, 'officers'));
      const querySnapshot = await getDocs(officersQuery);
      const officersList: Officer[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data() as Omit<Officer, 'id'>;
        officersList.push({
          id: doc.id,
          ...data
        });
      });
      
      setOfficers(officersList);
    } catch (error) {
      console.error('Error fetching officers:', error);
      Alert.alert('Error', 'Failed to load officer data.');
    }
  };

  // Function to handle asset assignment
  const handleAssign = async () => {
    if (!selectedAsset || !selectedOfficer) {
      Alert.alert('Error', 'Please select both an asset and an officer.');
      return;
    }

    setLoading(true);
    try {
      // Check if the asset is already assigned
      const assetRef = doc(db, 'assets', selectedAsset.id);
      const assetDoc = await getDoc(assetRef);
      const assetData = assetDoc.data() as Asset;
      
      if (assetData.status === 'Assigned') {
        Alert.alert('Error', 'This asset is already assigned to an officer.');
        setLoading(false);
        return;
      }
      
      // Validate due date format if entered
      if (dueDate && !/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
        Alert.alert('Error', 'Please enter the due date in YYYY-MM-DD format.');
        setLoading(false);
        return;
      }
      
      // Create new assignment in Firestore
      const assignmentData: Omit<Assignment, 'id'> = {
        assetId: selectedAsset.id,
        assetName: selectedAsset.name,
        officerId: selectedOfficer.id,
        officerName: selectedOfficer.name,
        badgeNumber: selectedOfficer.badgeNumber,
        assignedDate: Timestamp.now(),
        dueDate: dueDate ? Timestamp.fromDate(new Date(dueDate)) : null,
        returnDate: null,
        status: 'Active',
        notes: notes
      };
      
      // Add the assignment to Firestore
      const docRef = await addDoc(collection(db, 'assignments'), assignmentData);
      
      // Update the asset status to 'Assigned'
      await updateDoc(assetRef, {
        status: 'Assigned'
      });
      
      // Refresh the assignments list
      fetchAssignments();
      fetchAssets();
      
      // Reset form
      setSelectedAsset(null);
      setSelectedOfficer(null);
      setNotes('');
      setDueDate('');
      
      Alert.alert(
        'Success', 
        'Asset has been assigned successfully.',
        [{ text: 'OK', onPress: () => setViewMode('assignments') }]
      );
    } catch (error) {
      console.error('Error assigning asset:', error);
      Alert.alert('Error', 'Failed to assign asset. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Function to handle returning an asset
  const handleReturn = async (assignment: Assignment) => {
    Alert.alert(
      'Confirm Return',
      `Are you sure you want to return ${assignment.assetName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Return', 
          style: 'default',
          onPress: async () => {
            setLoading(true);
            try {
              // Update the assignment status
              const assignmentRef = doc(db, 'assignments', assignment.id);
              await updateDoc(assignmentRef, {
                status: 'Returned',
                returnDate: Timestamp.now()
              });
              
              // Update the asset status back to 'Available'
              const assetRef = doc(db, 'assets', assignment.assetId);
              await updateDoc(assetRef, {
                status: 'Available'
              });
              
              // Refresh the assignments list
              fetchAssignments();
              fetchAssets();
              
              Alert.alert('Success', 'Asset has been returned successfully.');
            } catch (error) {
              console.error('Error returning asset:', error);
              Alert.alert('Error', 'Failed to return asset. Please try again.');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  // Function to add a new asset
  const handleAddAsset = async () => {
    if (!newAssetName || !newAssetType || !newAssetSerialNumber) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      // Check if asset with same serial number already exists
      const assetsQuery = query(collection(db, 'assets'));
      const querySnapshot = await getDocs(assetsQuery);
      const serialNumberExists = querySnapshot.docs.some(
        doc => doc.data().serialNumber === newAssetSerialNumber
      );

      if (serialNumberExists) {
        Alert.alert('Error', 'An asset with this serial number already exists.');
        setLoading(false);
        return;
      }

      // Create new asset in Firestore
      const assetData = {
        name: newAssetName,
        type: newAssetType,
        serialNumber: newAssetSerialNumber,
        status: 'Available'
      };
      
      await addDoc(collection(db, 'assets'), assetData);
      
      // Refresh the assets list
      fetchAssets();
      
      // Reset form and close modal
      setNewAssetName('');
      setNewAssetType('');
      setNewAssetSerialNumber('');
      setAssetModalVisible(false);
      
      Alert.alert('Success', 'Asset has been added successfully.');
    } catch (error) {
      console.error('Error adding asset:', error);
      Alert.alert('Error', 'Failed to add asset. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Function to add a new officer
  const handleAddOfficer = async () => {
    if (!newOfficerName || !newOfficerBadgeNumber || !newOfficerRank || !newOfficerDepartment) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      // Check if officer with same badge number already exists
      const officersQuery = query(collection(db, 'officers'));
      const querySnapshot = await getDocs(officersQuery);
      const badgeNumberExists = querySnapshot.docs.some(
        doc => doc.data().badgeNumber === newOfficerBadgeNumber
      );

      if (badgeNumberExists) {
        Alert.alert('Error', 'An officer with this badge number already exists.');
        setLoading(false);
        return;
      }

      // Create new officer in Firestore
      const officerData = {
        name: newOfficerName,
        badgeNumber: newOfficerBadgeNumber,
        rank: newOfficerRank,
        department: newOfficerDepartment
      };
      
      await addDoc(collection(db, 'officers'), officerData);
      
      // Refresh the officers list
      fetchOfficers();
      
      // Reset form and close modal
      setNewOfficerName('');
      setNewOfficerBadgeNumber('');
      setNewOfficerRank('');
      setNewOfficerDepartment('');
      setOfficerModalVisible(false);
      
      Alert.alert('Success', 'Officer has been added successfully.');
    } catch (error) {
      console.error('Error adding officer:', error);
      Alert.alert('Error', 'Failed to add officer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle refreshing the data
  const handleRefresh = () => {
    setRefreshing(true);
    fetchAssignments();
    fetchAssets();
    fetchOfficers();
  };

  // Filter assignments based on search query
  const filteredAssignments = assignments.filter(assignment => {
    const searchLower = searchQuery.toLowerCase();
    return (
      assignment.assetName.toLowerCase().includes(searchLower) ||
      assignment.officerName.toLowerCase().includes(searchLower) ||
      assignment.badgeNumber.toLowerCase().includes(searchLower)
    );
  });

  // Filter assets based on search query and availability
  const filteredAssets = assets
    .filter(asset => 
      asset.status === 'Available' && 
      asset.name.toLowerCase().includes(assetSearchQuery.toLowerCase())
    );

  // Filter officers based on search query
  const filteredOfficers = officers
    .filter(officer => 
      officer.name.toLowerCase().includes(officerSearchQuery.toLowerCase()) || 
      officer.badgeNumber.toLowerCase().includes(officerSearchQuery.toLowerCase())
    );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={Theme.colors.primary} barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Asset Management</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              viewMode === 'form' && styles.activeTabButton
            ]}
            onPress={() => setViewMode('form')}
          >
            <MaterialCommunityIcons
              name="plus-box"
              size={22}
              color={viewMode === 'form' ? Theme.colors.primary : Theme.colors.textSecondary}
            />
            <Text
              style={[
                styles.tabButtonText,
                viewMode === 'form' && styles.activeTabButtonText
              ]}
            >
              Assign
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.tabButton,
              viewMode === 'assignments' && styles.activeTabButton
            ]}
            onPress={() => setViewMode('assignments')}
          >
            <MaterialCommunityIcons
              name="clipboard-list"
              size={22}
              color={viewMode === 'assignments' ? Theme.colors.primary : Theme.colors.textSecondary}
            />
            <Text
              style={[
                styles.tabButtonText,
                viewMode === 'assignments' && styles.activeTabButtonText
              ]}
            >
              History
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {viewMode === 'form' ? (
          <>
            {/* Dashboard Card */}
            <Card style={[styles.card, Theme.shadow.medium]}>
              <Card.Content>
                <View style={styles.dashboardHeader}>
                  <MaterialCommunityIcons
                    name="police-badge"
                    size={36}
                    color={Theme.colors.primary}
                  />
                  <View style={styles.dashboardTitleContainer}>
                    <Text style={styles.dashboardTitle}>Asset Assignment</Text>
                    <Text style={styles.description}>
                      Manage hardware asset assignments to police officers.
                    </Text>
                  </View>
                </View>
                
                <View style={styles.statsContainer}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>
                      {assets.filter(a => a.status === 'Available').length}
                    </Text>
                    <Text style={styles.statLabel}>Available Assets</Text>
                  </View>
                  
                  <View style={styles.statDivider} />
                  
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>
                      {assignments.filter(a => a.status === 'Active').length}
                    </Text>
                    <Text style={styles.statLabel}>Active Assignments</Text>
                  </View>
                  
                  <View style={styles.statDivider} />
                  
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>
                      {officers.length}
                    </Text>
                    <Text style={styles.statLabel}>Officers</Text>
                  </View>
                </View>
              </Card.Content>
            </Card>
            
            {/* Asset Assignment Form */}
            <Card style={[styles.card, Theme.shadow.medium]}>
              <Card.Content>
                <Text style={styles.formTitle}>Assign Assets to Officers</Text>
                
                {/* Asset Selection */}
                {/* Asset Selection */}
                <Dropdown
                  label="Select Asset"
                  value={selectedAsset ? selectedAsset.name : null}
                  placeholder="Choose an asset"
                  onPress={() => setShowAssetDropdown(true)}
                  showAddButton={true}
                  onAddPress={() => setAssetModalVisible(true)}
                />
                
                {/* Asset Dropdown Menu */}
                <DropdownMenu
                  visible={showAssetDropdown}
                  onDismiss={() => setShowAssetDropdown(false)}
                  searchPlaceholder="Search assets..."
                  searchValue={assetSearchQuery}
                  onSearchChange={setAssetSearchQuery}
                  data={filteredAssets}
                  renderItem={(asset) => (
                    <TouchableOpacity
                      key={asset.id}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setSelectedAsset(asset);
                        setShowAssetDropdown(false);
                      }}
                    >
                      <View style={styles.assetItemContainer}>
                        <Text style={styles.assetItemText}>{asset.name}</Text>
                        <Text style={styles.assetItemDetail}>
                          {asset.type} • SN: {asset.serialNumber}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  )}
                  noDataText="No available assets found"
                />
                
                {/* Officer Selection */}
                <Dropdown
                  label="Select Officer"
                  value={selectedOfficer ? selectedOfficer.name : null}
                  placeholder="Choose an officer"
                  onPress={() => setShowOfficerDropdown(true)}
                  showAddButton={true}
                  onAddPress={() => setOfficerModalVisible(true)}
                />
                
                {/* Officer Dropdown Menu */}
                <DropdownMenu
                  visible={showOfficerDropdown}
                  onDismiss={() => setShowOfficerDropdown(false)}
                  searchPlaceholder="Search officers..."
                  searchValue={officerSearchQuery}
                  onSearchChange={setOfficerSearchQuery}
                  data={filteredOfficers}
                  renderItem={(officer) => (
                    <TouchableOpacity
                      key={officer.id}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setSelectedOfficer(officer);
                        setShowOfficerDropdown(false);
                      }}
                    >
                      <View style={styles.officerItemContainer}>
                        <Text style={styles.officerItemText}>{officer.name}</Text>
                        <Text style={styles.officerItemDetail}>
                          {officer.rank} • Badge: {officer.badgeNumber} • {officer.department}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  )}
                  noDataText="No officers found"
                />
                
                {/* Additional Fields */}
                <InputField
                  label="Due Date (YYYY-MM-DD)"
                  value={dueDate}
                  onChangeText={setDueDate}
                  placeholder="Optional - Enter due date for return"
                />
                
                <InputField
                  label="Notes"
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Add optional notes about this assignment"
                  multiline={true}
                  numberOfLines={3}
                />
                
                {/* Submit Button */}
                <Button
                  mode="contained"
                  onPress={handleAssign}
                  disabled={loading || !selectedAsset || !selectedOfficer}
                  loading={loading}
                  style={styles.submitButton}
                >
                  Assign Asset
                </Button>
              </Card.Content>
            </Card>
          </>
        ) : (
          <>
            {/* Assignments List View */}
            <View style={styles.assignmentsHeader}>
              <Text style={styles.assignmentsTitle}>Assignment History</Text>
              <IconButton
                icon="refresh"
                size={24}
                color={Theme.colors.primary}
                onPress={handleRefresh}
                disabled={refreshing}
              />
            </View>
            
            <Searchbar
              placeholder="Search assignments..."
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={styles.searchbar}
              iconColor={Theme.colors.primary}
            />
            
            {loading ? (
              <ActivityIndicator 
                size="large" 
                color={Theme.colors.primary}
                style={styles.loader} 
              />
            ) : filteredAssignments.length > 0 ? (
              <View style={styles.assignmentsList}>
                {filteredAssignments.map((assignment) => (
                  <AssignmentCard
                    key={assignment.id}
                    assignment={assignment}
                    onReturn={handleReturn}
                  />
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons
                  name="clipboard-text-outline"
                  size={64}
                  color={Theme.colors.secondary}
                />
                <Text style={styles.emptyStateText}>
                  No assignments found
                </Text>
                <Text style={styles.emptyStateSubtext}>
                  {searchQuery ? 'Try a different search term' : 'Assign your first asset to get started'}
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
      
      {/* Add Asset Modal */}
      <Modal
        visible={assetModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setAssetModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Asset</Text>
              <IconButton
                icon="close"
                size={24}
                onPress={() => setAssetModalVisible(false)}
              />
            </View>
            
            <ScrollView>
              <InputField
                label="Asset Name"
                value={newAssetName}
                onChangeText={setNewAssetName}
                placeholder="Enter asset name"
                required={true}
              />
              
              <Dropdown
                label="Asset Type"
                value={newAssetType}
                placeholder="Select asset type"
                onPress={() => setShowAssetTypeDropdown(true)}
                required={true}
              />
              
              <DropdownMenu
                visible={showAssetTypeDropdown}
                onDismiss={() => setShowAssetTypeDropdown(false)}
                data={assetTypes}
                renderItem={(type) => (
                  <TouchableOpacity
                    key={type}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setNewAssetType(type);
                      setShowAssetTypeDropdown(false);
                    }}
                  >
                    <Text style={styles.dropdownItemText}>{type}</Text>
                  </TouchableOpacity>
                )}
                noDataText="No asset types available"
              />
              
              <InputField
                label="Serial Number"
                value={newAssetSerialNumber}
                onChangeText={setNewAssetSerialNumber}
                placeholder="Enter serial number"
                required={true}
              />
              
              <View style={styles.modalButtons}>
                <Button
                  mode="outlined"
                  onPress={() => setAssetModalVisible(false)}
                  style={styles.cancelButton}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={handleAddAsset}
                  disabled={loading || !newAssetName || !newAssetType || !newAssetSerialNumber}
                  loading={loading}
                  style={styles.addButton}
                >
                  Add Asset
                </Button>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
      
      {/* Add Officer Modal */}
      <Modal
        visible={officerModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setOfficerModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Officer</Text>
              <IconButton
                icon="close"
                size={24}
                onPress={() => setOfficerModalVisible(false)}
              />
            </View>
            
            <ScrollView>
              <InputField
                label="Officer Name"
                value={newOfficerName}
                onChangeText={setNewOfficerName}
                placeholder="Enter officer full name"
                required={true}
              />
              
              <InputField
                label="Badge Number"
                value={newOfficerBadgeNumber}
                onChangeText={setNewOfficerBadgeNumber}
                placeholder="Enter badge number"
                required={true}
              />
              
              <Dropdown
                label="Rank"
                value={newOfficerRank}
                placeholder="Select rank"
                onPress={() => setShowRankDropdown(true)}
                required={true}
              />
              
              <DropdownMenu
                visible={showRankDropdown}
                onDismiss={() => setShowRankDropdown(false)}
                data={officerRanks}
                renderItem={(rank) => (
                  <TouchableOpacity
                    key={rank}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setNewOfficerRank(rank);
                      setShowRankDropdown(false);
                    }}
                  >
                    <Text style={styles.dropdownItemText}>{rank}</Text>
                  </TouchableOpacity>
                )}
                noDataText="No ranks available"
              />
              
              <Dropdown
                label="Department"
                value={newOfficerDepartment}
                placeholder="Select department"
                onPress={() => setShowDepartmentDropdown(true)}
                required={true}
              />
              
              <DropdownMenu
                visible={showDepartmentDropdown}
                onDismiss={() => setShowDepartmentDropdown(false)}
                data={departments}
                renderItem={(department) => (
                  <TouchableOpacity
                    key={department}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setNewOfficerDepartment(department);
                      setShowDepartmentDropdown(false);
                    }}
                  >
                    <Text style={styles.dropdownItemText}>{department}</Text>
                  </TouchableOpacity>
                )}
                noDataText="No departments available"
              />
              
              <View style={styles.modalButtons}>
                <Button
                  mode="outlined"
                  onPress={() => setOfficerModalVisible(false)}
                  style={styles.cancelButton}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={handleAddOfficer}
                  disabled={loading || !newOfficerName || !newOfficerBadgeNumber || !newOfficerRank || !newOfficerDepartment}
                  loading={loading}
                  style={styles.addButton}
                >
                  Add Officer
                </Button>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// Styles for the component
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  header: {
    backgroundColor: Theme.colors.primary,
    paddingTop: Theme.spacing.lg,
    paddingBottom: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...Theme.shadow.medium,
  },
  headerText: {
    ...Theme.typography.h3,
    color: Theme.colors.surface,
  },
  headerButtons: {
    flexDirection: 'row',
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.full,
    padding: Theme.spacing.xs,
    ...Theme.shadow.small,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Theme.spacing.xs,
    paddingHorizontal: Theme.spacing.md,
    borderRadius: Theme.borderRadius.full,
  },
  activeTabButton: {
    backgroundColor: Theme.colors.background,
  },
  tabButtonText: {
    ...Theme.typography.body,
    color: Theme.colors.textSecondary,
    marginLeft: Theme.spacing.xs,
  },
  activeTabButtonText: {
    color: Theme.colors.primary,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: Theme.spacing.md,
    paddingBottom: Theme.spacing.xl,
  },
  card: {
    marginBottom: Theme.spacing.md,
    borderRadius: Theme.borderRadius.lg,
  },
  dashboardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  dashboardTitleContainer: {
    marginLeft: Theme.spacing.md,
  },
  dashboardTitle: {
    ...Theme.typography.h3,
    color: Theme.colors.text,
  },
  description: {
    ...Theme.typography.body,
    color: Theme.colors.textSecondary,
    marginTop: Theme.spacing.xs,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Theme.colors.background,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
    marginTop: Theme.spacing.sm,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: Theme.colors.border,
  },
  statValue: {
    ...Theme.typography.h2,
    color: Theme.colors.primary,
  },
  statLabel: {
    ...Theme.typography.small,
    color: Theme.colors.textSecondary,
    marginTop: Theme.spacing.xs,
    textAlign: 'center',
  },
  formTitle: {
    ...Theme.typography.h4,
    color: Theme.colors.text,
    marginBottom: Theme.spacing.md,
  },
  inputContainer: {
    marginBottom: Theme.spacing.md,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inputLabel: {
    ...Theme.typography.subtitle,
    color: Theme.colors.text,
    marginBottom: Theme.spacing.xs,
  },
  input: {
    backgroundColor: Theme.colors.surface,
    fontSize: 16,
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Theme.colors.surface,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
    height: 56,
  },
  dropdownText: {
    ...Theme.typography.body,
    color: Theme.colors.text,
  },
  dropdownCard: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 1000,
    elevation: 5,
    borderRadius: Theme.borderRadius.md,
    maxHeight: 300,
    marginTop: Theme.spacing.xs,
    ...Theme.shadow.medium,
  },
  dropdownScroll: {
    maxHeight: 250,
  },
  searchbar: {
    marginBottom: Theme.spacing.md,
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.md,
    ...Theme.shadow.small,
  },
  dropdownItem: {
    padding: Theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  dropdownItemText: {
    ...Theme.typography.body,
    color: Theme.colors.text,
  },
  assetItemContainer: {
    padding: Theme.spacing.xs,
  },
  assetItemText: {
    ...Theme.typography.subtitle,
    color: Theme.colors.text,
  },
  assetItemDetail: {
    ...Theme.typography.small,
    color: Theme.colors.textSecondary,
    marginTop: 2,
  },
  officerItemContainer: {
    padding: Theme.spacing.xs,
  },
  officerItemText: {
    ...Theme.typography.subtitle,
    color: Theme.colors.text,
  },
  officerItemDetail: {
    ...Theme.typography.small,
    color: Theme.colors.textSecondary,
    marginTop: 2,
  },
  submitButton: {
    backgroundColor: Theme.colors.primary,
    marginTop: Theme.spacing.md,
    paddingVertical: Theme.spacing.xs,
  },
  noItemsText: {
    ...Theme.typography.body,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    padding: Theme.spacing.md,
  },
  assignmentsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
  },
  assignmentsTitle: {
    ...Theme.typography.h3,
    color: Theme.colors.text,
  },
  assignmentsList: {
    marginTop: Theme.spacing.sm,
  },
  assignmentCard: {
    marginBottom: Theme.spacing.md,
    borderRadius: Theme.borderRadius.lg,
    ...Theme.shadow.small,
  },
  assignmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
  },
  assetInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  assetType: {
    fontSize: 24,
    marginRight: Theme.spacing.xs,
  },
  assetName: {
    ...Theme.typography.h4,
    color: Theme.colors.text,
  },
  statusChip: {
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.full,
  },
  statusText: {
    ...Theme.typography.small,
    fontWeight: '600',
  },
  divider: {
    marginVertical: Theme.spacing.sm,
  },
  assignmentDetails: {
    marginTop: Theme.spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    flex: 1,
    marginBottom: Theme.spacing.md,
  },
  detailLabel: {
    ...Theme.typography.small,
    color: Theme.colors.textSecondary,
    marginBottom: 4,
  },
  detailValue: {
    ...Theme.typography.body,
    color: Theme.colors.text,
  },
  badgeNumber: {
    ...Theme.typography.small,
    color: Theme.colors.textSecondary,
    marginTop: 2,
  },
  notes: {
    marginTop: Theme.spacing.xs,
  },
  notesText: {
    ...Theme.typography.body,
    color: Theme.colors.text,
  },
  returnButton: {
    marginTop: Theme.spacing.sm,
    borderColor: Theme.colors.primary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Theme.spacing.xl,
    marginTop: Theme.spacing.xl,
  },
  emptyStateText: {
    ...Theme.typography.h4,
    color: Theme.colors.textSecondary,
    marginTop: Theme.spacing.md,
  },
  emptyStateSubtext: {
    ...Theme.typography.body,
    color: Theme.colors.textSecondary,
    marginTop: Theme.spacing.sm,
    textAlign: 'center',
  },
  loader: {
    marginTop: Theme.spacing.xl,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: Theme.colors.overlay,
  },
  modalContent: {
    backgroundColor: Theme.colors.surface,
    borderTopLeftRadius: Theme.borderRadius.lg,
    borderTopRightRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.md,
    maxHeight: '80%',
    ...Theme.shadow.large,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  modalTitle: {
    ...Theme.typography.h3,
    color: Theme.colors.text,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Theme.spacing.lg,
    marginBottom: Theme.spacing.md,
  },
  cancelButton: {
    flex: 1,
    marginRight: Theme.spacing.sm,
    borderColor: Theme.colors.border,
  },
  addButton: {
    flex: 1,
    marginLeft: Theme.spacing.sm,
    backgroundColor: Theme.colors.primary,
  },
});