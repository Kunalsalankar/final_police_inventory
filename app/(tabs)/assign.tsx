import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  FlatList
} from 'react-native';
import { Card, Button, Divider, Chip, Searchbar, List, Avatar } from 'react-native-paper';
import { MaterialIcons, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { db } from '../../lib/firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  Timestamp, 
  doc, 
  getDoc, 
  updateDoc,
  where,
  serverTimestamp,
  DocumentData
} from 'firebase/firestore';
import { toast } from 'react-toastify';

// Define interfaces for our data types
interface Officer {
  id: string;
  uid: string;
  firstName: string;
  lastName: string;
  badgeNumber: string;
  policeStation: string;
  department?: string;
  rank?: string;
  reportingOfficer?: string;
  status: string;
}

interface Asset {
  id?: string;
  name: string;
  category?: string;
  serialNumber?: string;
  purchaseDate?: Timestamp;
  status?: string;
}

interface Assignment {
  id: string;
  assetId: string;
  assetName: string;
  officerId: string;
  officerName: string;
  officerFullName?: string;
  officerBadge?: string;
  officerStation?: string;
  assignedDate: Timestamp;
  returnedDate?: Timestamp;
  status: string;
}

// Color scheme matching the project
const PoliceColors = {
  primary: '#003366',
  secondary: '#1a3c61',
  accent: '#bf2c37',
  background: '#f5f7fa',
  cardBackground: '#ffffff',
  text: '#333333',
  textLight: '#6c757d',
  border: '#d1d9e6',
  lightBlue: '#e6f0ff',
  gold: '#ffd700',
  white: '#ffffff',
  darkBlue: '#00264d',
  shadowColor: 'rgba(0, 0, 0, 0.1)',
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
};

const Assign = () => {
  // Asset information states
  const [assetId, setAssetId] = useState<string>('');
  const [assetName, setAssetName] = useState<string>('');
  const [officerId, setOfficerId] = useState<string>('');
  const [officerName, setOfficerName] = useState<string>('');
  const [status, setStatus] = useState<string>('active');
  
  // Officer selection states
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [selectedOfficer, setSelectedOfficer] = useState<Officer | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showOfficerDropdown, setShowOfficerDropdown] = useState<boolean>(false);
  
  // Assignment history states
  const [assignmentHistory, setAssignmentHistory] = useState<Assignment[]>([]);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [assetDetails, setAssetDetails] = useState<Asset | null>(null);

  // Fetch officers from Firestore
  useEffect(() => {
    const fetchOfficers = async () => {
      try {
        const officersRef = collection(db, 'normalofficers');
        const q = query(officersRef, where('status', '==', 'active'));
        const querySnapshot = await getDocs(q);
        
        const officersList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Officer[];
        
        setOfficers(officersList);
      } catch (error) {
        console.error('Error fetching officers:', error);
        Alert.alert('Error', 'Failed to load officers list');
      }
    };

    fetchOfficers();
  }, []);

  // Filter officers based on search query
  const filteredOfficers = officers.filter(officer => {
    const fullName = `${officer.firstName} ${officer.lastName}`;
    return fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
           officer.badgeNumber.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Fetch asset details
  const fetchAssetDetails = async (id: string) => {
    setLoading(true);
    try {
      // Check if asset exists in assets collection
      const assetRef = doc(db, 'assets', id);
      const assetDoc = await getDoc(assetRef);
      
      if (assetDoc.exists()) {
        const assetData = assetDoc.data() as Asset;
        setAssetName(assetData.name || '');
        setAssetDetails(assetData);
        
        // Fetch assignment history for this asset
        await fetchAssignmentHistory(id);
      } else {
        Alert.alert('Error', 'Asset not found in the database');
        setAssetName('');
        setAssetDetails(null);
      }
    } catch (error) {
      console.error('Error fetching asset details:', error);
      Alert.alert('Error', 'Failed to load asset details');
    } finally {
      setLoading(false);
    }
  };

  // Fetch assignment history for an asset
  const fetchAssignmentHistory = async (assetId: string) => {
    try {
      const assignmentsRef = collection(db, 'assignments');
      const q = query(
        assignmentsRef, 
        where('assetId', '==', assetId),
        orderBy('assignedDate', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const history: Assignment[] = [];
      
      for (const docSnapshot of querySnapshot.docs) {
        const assignment = docSnapshot.data() as Omit<Assignment, 'id'>;
        
        // Fetch officer details for each assignment
        if (assignment.officerId) {
          const officerRef = collection(db, 'normalofficers');
          const officerQuery = query(officerRef, where('uid', '==', assignment.officerId));
          const officerSnapshot = await getDocs(officerQuery);
          
          if (!officerSnapshot.empty) {
            const officerData = officerSnapshot.docs[0].data() as Officer;
            assignment.officerFullName = `${officerData.firstName} ${officerData.lastName}`;
            assignment.officerBadge = officerData.badgeNumber;
            assignment.officerStation = officerData.policeStation;
          }
        }
        
        history.push({
          id: docSnapshot.id,
          ...assignment
        });
      }
      
      setAssignmentHistory(history);
    } catch (error) {
      console.error('Error fetching assignment history:', error);
      Alert.alert('Error', 'Failed to load assignment history');
    }
  };

  // Select an officer from the dropdown
  const handleSelectOfficer = (officer: Officer) => {
    setSelectedOfficer(officer);
    setOfficerId(officer.uid);
    setOfficerName(`${officer.firstName} ${officer.lastName}`);
    setShowOfficerDropdown(false);
  };

  // Create a new asset assignment
  const handleSubmit = async () => {
    if (!assetId || !officerId) {
      Alert.alert('Error', 'Please provide both asset and officer information');
      return;
    }
    
    setLoading(true);
    
    try {
      // Check if asset is already assigned to someone
      const assignmentsRef = collection(db, 'assignments');
      const q = query(
        assignmentsRef,
        where('assetId', '==', assetId),
        where('status', '==', 'active')
      );
      
      const querySnapshot = await getDocs(q);
      
      // If asset is already assigned, update its status to 'inactive'
      if (!querySnapshot.empty) {
        const docRef = doc(db, 'assignments', querySnapshot.docs[0].id);
        await updateDoc(docRef, {
          status: 'inactive',
          returnedDate: serverTimestamp()
        });
      }
      
      // Create new assignment record
      const newAssignment = {
        assetId,
        assetName,
        officerId,
        officerName,
        assignedDate: serverTimestamp(),
        status: 'active'
      };
      
      await addDoc(collection(db, 'assignments'), newAssignment);
      
      Alert.alert('Success', 'Asset successfully assigned');
      
      // Refresh assignment history
      await fetchAssignmentHistory(assetId);
      
      // Clear form
      setOfficerId('');
      setOfficerName('');
      setSelectedOfficer(null);
    } catch (error) {
      console.error('Error assigning asset:', error);
      Alert.alert('Error', 'Failed to assign asset');
    } finally {
      setLoading(false);
    }
  };

  // Reset the form
  const handleReset = () => {
    setAssetId('');
    setAssetName('');
    setOfficerId('');
    setOfficerName('');
    setSelectedOfficer(null);
    setAssignmentHistory([]);
    setAssetDetails(null);
    setShowHistory(false);
  };

  // Format timestamp for display
  const formatDate = (timestamp: Timestamp | Date | undefined) => {
    if (!timestamp) return 'N/A';
    
    const date = timestamp instanceof Timestamp ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Render assignment history item
  const renderHistoryItem = ({ item }: { item: Assignment }) => (
    <Card style={styles.historyCard} mode="outlined">
      <Card.Content>
        <View style={styles.historyHeader}>
          <Text style={styles.historyOfficerName}>
            {item.officerFullName || item.officerName || 'N/A'}
          </Text>
          <Chip 
            mode="outlined"
            style={[
              styles.statusChip,
              { backgroundColor: item.status === 'active' ? PoliceColors.success + '20' : PoliceColors.textLight + '20' }
            ]}
            textStyle={{ color: item.status === 'active' ? PoliceColors.success : PoliceColors.textLight }}
          >
            {item.status === 'active' ? 'Active' : 'Inactive'}
          </Chip>
        </View>
        
        <View style={styles.historyDetails}>
          <Text style={styles.historyDetailText}>
            <Text style={styles.label}>Badge:</Text> {item.officerBadge || 'N/A'}
          </Text>
          <Text style={styles.historyDetailText}>
            <Text style={styles.label}>Station:</Text> {item.officerStation || 'N/A'}
          </Text>
          <Text style={styles.historyDetailText}>
            <Text style={styles.label}>Assigned:</Text> {formatDate(item.assignedDate)}
          </Text>
          {item.returnedDate && (
            <Text style={styles.historyDetailText}>
              <Text style={styles.label}>Returned:</Text> {formatDate(item.returnedDate)}
            </Text>
          )}
        </View>
      </Card.Content>
    </Card>
  );

  // Render officer item in dropdown
  const renderOfficerItem = ({ item }: { item: Officer }) => (
    <TouchableOpacity
      style={styles.officerItem}
      onPress={() => handleSelectOfficer(item)}
    >
      <View style={styles.officerInfo}>
        <Avatar.Text 
          size={40} 
          label={`${item.firstName[0]}${item.lastName[0]}`}
          style={{ backgroundColor: PoliceColors.primary }}
        />
        <View style={styles.officerDetails}>
          <Text style={styles.officerName}>{item.firstName} {item.lastName}</Text>
          <Text style={styles.officerBadge}>Badge: {item.badgeNumber}</Text>
          <Text style={styles.officerStation}>Station: {item.policeStation}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (showHistory) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => setShowHistory(false)}
          >
            <MaterialIcons name="arrow-back" size={24} color={PoliceColors.primary} />
            <Text style={styles.backButtonText}>Back to Assignment</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView}>
          <Card style={styles.mainCard}>
            <Card.Content>
              <Text style={styles.pageTitle}>
                Assignment History for Asset: {assetName}
              </Text>
              <Text style={styles.assetIdText}>Asset ID: {assetId}</Text>

              {assetDetails && (
                <Card style={styles.assetDetailsCard} mode="outlined">
                  <Card.Content>
                    <Text style={styles.sectionTitle}>Asset Details</Text>
                    <View style={styles.assetDetailsGrid}>
                      <View style={styles.assetDetailItem}>
                        <Text style={styles.label}>Category:</Text>
                        <Text style={styles.value}>{assetDetails.category || 'N/A'}</Text>
                      </View>
                      <View style={styles.assetDetailItem}>
                        <Text style={styles.label}>Serial Number:</Text>
                        <Text style={styles.value}>{assetDetails.serialNumber || 'N/A'}</Text>
                      </View>
                      <View style={styles.assetDetailItem}>
                        <Text style={styles.label}>Purchase Date:</Text>
                        <Text style={styles.value}>
                          {assetDetails.purchaseDate ? formatDate(assetDetails.purchaseDate) : 'N/A'}
                        </Text>
                      </View>
                      <View style={styles.assetDetailItem}>
                        <Text style={styles.label}>Status:</Text>
                        <Text style={styles.value}>{assetDetails.status || 'N/A'}</Text>
                      </View>
                    </View>
                  </Card.Content>
                </Card>
              )}

              {assignmentHistory.length > 0 ? (
                <FlatList
                  data={assignmentHistory}
                  renderItem={renderHistoryItem}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false}
                  style={styles.historyList}
                />
              ) : (
                <View style={styles.emptyState}>
                  <MaterialIcons name="history" size={48} color={PoliceColors.textLight} />
                  <Text style={styles.emptyStateText}>No assignment history found for this asset.</Text>
                </View>
              )}
            </Card.Content>
          </Card>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Card style={styles.mainCard}>
          <Card.Content>
            <Text style={styles.pageTitle}>Asset Assignment</Text>

            <View style={styles.formContainer}>
              {/* Asset Information Section */}
              <Card style={styles.sectionCard} mode="outlined">
                <Card.Content>
                  <View style={styles.sectionHeader}>
                    <MaterialCommunityIcons name="desktop-classic" size={24} color={PoliceColors.primary} />
                    <Text style={styles.sectionTitle}>Asset Information</Text>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Asset ID</Text>
                    <View style={styles.assetIdContainer}>
                      <TextInput
                        style={styles.textInput}
                        value={assetId}
                        onChangeText={setAssetId}
                        placeholder="Enter Asset ID"
                        placeholderTextColor={PoliceColors.textLight}
                      />
                      {assetId && (
                        <TouchableOpacity
                          style={styles.historyButton}
                          onPress={() => {
                            fetchAssetDetails(assetId);
                            setShowHistory(true);
                          }}
                        >
                          <MaterialIcons name="history" size={20} color={PoliceColors.white} />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Asset Name</Text>
                    <TextInput
                      style={styles.textInput}
                      value={assetName}
                      onChangeText={setAssetName}
                      placeholder="Asset Name"
                      placeholderTextColor={PoliceColors.textLight}
                    />
                  </View>

                  <Button
                    mode="contained"
                    onPress={() => fetchAssetDetails(assetId)}
                    style={styles.lookupButton}
                    buttonColor={PoliceColors.primary}
                  >
                    Look Up Asset
                  </Button>

                  {assetDetails && (
                    <Card style={styles.assetInfoCard} mode="outlined">
                      <Card.Content>
                        <Text style={styles.infoTitle}>Asset Details</Text>
                        <View style={styles.assetInfoGrid}>
                          <Text style={styles.infoText}>
                            <Text style={styles.label}>Category:</Text> {assetDetails.category || 'N/A'}
                          </Text>
                          <Text style={styles.infoText}>
                            <Text style={styles.label}>Serial Number:</Text> {assetDetails.serialNumber || 'N/A'}
                          </Text>
                          <Text style={styles.infoText}>
                            <Text style={styles.label}>Current Status:</Text> {
                              assignmentHistory.length > 0 && assignmentHistory[0].status === 'active' 
                                ? `Assigned to ${assignmentHistory[0].officerFullName || assignmentHistory[0].officerName}`
                                : 'Available'
                            }
                          </Text>
                        </View>
                      </Card.Content>
                    </Card>
                  )}
                </Card.Content>
              </Card>

              {/* Officer Information Section */}
              <Card style={styles.sectionCard} mode="outlined">
                <Card.Content>
                  <View style={styles.sectionHeader}>
                    <MaterialCommunityIcons name="badge-account" size={24} color={PoliceColors.primary} />
                    <Text style={styles.sectionTitle}>Officer Information</Text>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Search Officer</Text>
                    <Searchbar
                      placeholder="Search by name or badge number"
                      onChangeText={setSearchQuery}
                      value={searchQuery}
                      onFocus={() => setShowOfficerDropdown(true)}
                      style={styles.searchBar}
                      iconColor={PoliceColors.primary}
                    />
                  </View>

                  {showOfficerDropdown && (
                    <Card style={styles.dropdownCard} mode="outlined">
                      <Card.Content>
                        {filteredOfficers.length > 0 ? (
                          <FlatList
                            data={filteredOfficers}
                            renderItem={renderOfficerItem}
                            keyExtractor={(item) => item.id}
                            style={styles.officerDropdown}
                            scrollEnabled={false}
                          />
                        ) : (
                          <Text style={styles.noResultsText}>No officers found</Text>
                        )}
                      </Card.Content>
                    </Card>
                  )}

                  {selectedOfficer && (
                    <Card style={styles.selectedOfficerCard} mode="outlined">
                      <Card.Content>
                        <Text style={styles.infoTitle}>Selected Officer</Text>
                        <View style={styles.officerInfo}>
                          <Avatar.Text 
                            size={50} 
                            label={`${selectedOfficer.firstName[0]}${selectedOfficer.lastName[0]}`}
                            style={{ backgroundColor: PoliceColors.primary }}
                          />
                          <View style={styles.officerDetails}>
                            <Text style={styles.officerName}>
                              {selectedOfficer.firstName} {selectedOfficer.lastName}
                            </Text>
                            <Text style={styles.officerBadge}>Badge: {selectedOfficer.badgeNumber}</Text>
                            <Text style={styles.officerStation}>Station: {selectedOfficer.policeStation}</Text>
                            <Text style={styles.officerDetail}>Department: {selectedOfficer.department || 'N/A'}</Text>
                            <Text style={styles.officerDetail}>Rank: {selectedOfficer.rank || 'N/A'}</Text>
                          </View>
                        </View>
                      </Card.Content>
                    </Card>
                  )}
                </Card.Content>
              </Card>
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <Button
                mode="contained"
                onPress={handleSubmit}
                disabled={loading}
                style={styles.assignButton}
                buttonColor={PoliceColors.success}
                loading={loading}
              >
                {loading ? 'Processing...' : 'Assign Asset'}
              </Button>
              
              <Button
                mode="outlined"
                onPress={handleReset}
                style={styles.resetButton}
                textColor={PoliceColors.primary}
              >
                Reset
              </Button>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PoliceColors.background,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: PoliceColors.white,
    borderBottomWidth: 1,
    borderBottomColor: PoliceColors.border,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: PoliceColors.primary,
    fontWeight: '500',
  },
  mainCard: {
    marginBottom: 16,
    elevation: 2,
    shadowColor: PoliceColors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: PoliceColors.text,
    marginBottom: 8,
  },
  assetIdText: {
    fontSize: 16,
    color: PoliceColors.textLight,
    marginBottom: 16,
  },
  formContainer: {
    gap: 16,
  },
  sectionCard: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: PoliceColors.text,
    marginLeft: 8,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: PoliceColors.text,
    marginBottom: 8,
  },
  assetIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: PoliceColors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: PoliceColors.text,
    backgroundColor: PoliceColors.white,
  },
  historyButton: {
    backgroundColor: PoliceColors.primary,
    padding: 12,
    borderRadius: 8,
    marginLeft: 8,
  },
  lookupButton: {
    marginTop: 8,
  },
  searchBar: {
    backgroundColor: PoliceColors.white,
    elevation: 0,
    borderWidth: 1,
    borderColor: PoliceColors.border,
  },
  dropdownCard: {
    marginTop: 8,
    maxHeight: 200,
  },
  officerDropdown: {
    maxHeight: 150,
  },
  officerItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: PoliceColors.border,
  },
  officerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  officerDetails: {
    marginLeft: 12,
    flex: 1,
  },
  officerName: {
    fontSize: 16,
    fontWeight: '500',
    color: PoliceColors.text,
  },
  officerBadge: {
    fontSize: 14,
    color: PoliceColors.textLight,
    marginTop: 2,
  },
  officerStation: {
    fontSize: 12,
    color: PoliceColors.textLight,
    marginTop: 2,
  },
  officerDetail: {
    fontSize: 12,
    color: PoliceColors.textLight,
    marginTop: 2,
  },
  noResultsText: {
    textAlign: 'center',
    color: PoliceColors.textLight,
    padding: 16,
  },
  selectedOfficerCard: {
    marginTop: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: PoliceColors.text,
    marginBottom: 12,
  },
  assetInfoCard: {
    marginTop: 16,
  },
  assetInfoGrid: {
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: PoliceColors.text,
  },
  label: {
    fontWeight: '500',
    color: PoliceColors.text,
  },
  value: {
    color: PoliceColors.textLight,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginTop: 24,
  },
  assignButton: {
    flex: 1,
  },
  resetButton: {
    flex: 1,
    borderColor: PoliceColors.primary,
  },
  assetDetailsCard: {
    marginBottom: 16,
  },
  assetDetailsGrid: {
    gap: 8,
  },
  assetDetailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  historyList: {
    marginTop: 16,
  },
  historyCard: {
    marginBottom: 12,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyOfficerName: {
    fontSize: 16,
    fontWeight: '600',
    color: PoliceColors.text,
    flex: 1,
  },
  statusChip: {
    marginLeft: 8,
  },
  historyDetails: {
    gap: 4,
  },
  historyDetailText: {
    fontSize: 14,
    color: PoliceColors.textLight,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyStateText: {
    marginTop: 16,
    fontSize: 16,
    color: PoliceColors.textLight,
    textAlign: 'center',
  },
});

export default Assign;