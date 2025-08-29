import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  TextInput, 
  ScrollView, 
  Alert 
} from 'react-native';
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
  where 
} from 'firebase/firestore';
import { db, auth } from '../../../lib/firebase';
import { Card, Avatar } from 'react-native-paper';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

// Color scheme for consistent styling
const PoliceColors = {
  primary: '#003366',
  secondary: '#1a3c61',
  accent: '#bf2c37',
  background: '#f5f7fa',
  text: '#333333',
  textLight: '#6c757d',
  white: '#ffffff',
  lightBlue: '#e6f0ff',
};

// Interfaces for type safety
interface Asset {
  id: string;
  name: string;
  serialNumber: string;
  type: string;
  status: string;
}

interface Officer {
  id: string;
  name: string;
  badgeNumber: string;
}

interface Assignment {
  id: string;
  assetId: string;
  assetName: string;
  officerId: string;
  officerName: string;
  badgeNumber: string;
  assignedDate: Timestamp;
  status: string;
}

interface Handover {
  id?: string;
  assetId: string;
  fromOfficerId: string;
  toOfficerId: string;
  assetName: string;
  fromOfficerName?: string;
  toOfficerName?: string;
  date: Timestamp;
  status: 'Pending' | 'Completed' | 'Rejected';
}

export default function HandoverScreen() {
  // State management
  const [assets, setAssets] = useState<Asset[]>([]);
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [handovers, setHandovers] = useState<Handover[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [currentOfficer, setCurrentOfficer] = useState<Officer | null>(null);
  
  // Modal states
  const [isNewHandoverModalVisible, setNewHandoverModalVisible] = useState(false);
  const [isAddAssetModalVisible, setAddAssetModalVisible] = useState(false);
  const [isAddOfficerModalVisible, setAddOfficerModalVisible] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [selectedToOfficer, setSelectedToOfficer] = useState<Officer | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  
  // Form states
  const [newAssetName, setNewAssetName] = useState('');
  const [newAssetSerial, setNewAssetSerial] = useState('');
  const [newAssetType, setNewAssetType] = useState('');
  const [newOfficerName, setNewOfficerName] = useState('');
  const [newOfficerBadge, setNewOfficerBadge] = useState('');

  // Fetch assets, officers, and handovers on component mount
  useEffect(() => {
    fetchAssets();
    fetchOfficers();
    fetchHandovers();
    fetchAssignments();
    fetchCurrentOfficer();
  }, []);

  // Fetch current officer information based on logged-in user
  const fetchCurrentOfficer = async () => {
    try {
      // In a real app, you would use the authenticated user ID
      // For now, we'll simulate this with a mock user ID
      const currentUserId = auth.currentUser?.uid || 'ECCmaJszTIwHRCWzRG8H'; // Default ID for demo
      
      // Query the officers collection to find the officer with this ID
      const q = query(collection(db, 'officers'), where('id', '==', currentUserId));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        // Set the current officer
        const officerData = querySnapshot.docs[0].data() as Officer;
        officerData.id = querySnapshot.docs[0].id;
        setCurrentOfficer(officerData);
      } else {
        // If not found, fetch the first officer as a fallback
        const allOfficers = await getDocs(collection(db, 'officers'));
        if (!allOfficers.empty) {
          const fallbackOfficer = allOfficers.docs[0].data() as Officer;
          fallbackOfficer.id = allOfficers.docs[0].id;
          setCurrentOfficer(fallbackOfficer);
        }
      }
    } catch (error) {
      console.error("Error fetching current officer:", error);
      Alert.alert('Error', 'Could not fetch current officer details');
    }
  };

  // Fetch assignments from Firestore
  const fetchAssignments = async () => {
    try {
      const q = query(collection(db, 'assignments'), orderBy('assignedDate', 'desc'));
      const querySnapshot = await getDocs(q);
      const fetchedAssignments: Assignment[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Assignment));
      setAssignments(fetchedAssignments);
    } catch (error) {
      console.error("Error fetching assignments:", error);
      Alert.alert('Error', 'Could not fetch assignments');
    }
  };

  // Fetch assets from Firestore
  const fetchAssets = async () => {
    try {
      const q = query(collection(db, 'assets'), orderBy('name'));
      const querySnapshot = await getDocs(q);
      const fetchedAssets: Asset[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Asset));
      setAssets(fetchedAssets);
    } catch (error) {
      console.error("Error fetching assets:", error);
      Alert.alert('Error', 'Could not fetch assets');
    }
  };

  // Fetch officers from Firestore
  const fetchOfficers = async () => {
    try {
      const q = query(collection(db, 'officers'), orderBy('name'));
      const querySnapshot = await getDocs(q);
      const fetchedOfficers: Officer[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Officer));
      setOfficers(fetchedOfficers);
    } catch (error) {
      console.error("Error fetching officers:", error);
      Alert.alert('Error', 'Could not fetch officers');
    }
  };

  // Fetch handovers from Firestore
  const fetchHandovers = async () => {
    try {
      const q = query(collection(db, 'handovers'), orderBy('date', 'desc'));
      const querySnapshot = await getDocs(q);
      const fetchedHandovers: Handover[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Handover));
      setHandovers(fetchedHandovers);
    } catch (error) {
      console.error("Error fetching handovers:", error);
      Alert.alert('Error', 'Could not fetch handovers');
    }
  };

  // Find the current assignment for a given asset
  const findAssetAssignment = (assetId: string) => {
    return assignments.find(assignment => 
      assignment.assetId === assetId && assignment.status === 'Active'
    );
  };

  // Create a new handover
  const createHandover = async () => {
    if (!selectedAsset || !selectedToOfficer) {
      Alert.alert('Error', 'Please select an asset and an officer');
      return;
    }

    // Find the current assignment for this asset
    const currentAssignment = findAssetAssignment(selectedAsset.id);
    if (!currentAssignment) {
      Alert.alert('Error', 'No active assignment found for this asset');
      return;
    }

    try {
      // Create handover document
      const handoverDoc = await addDoc(collection(db, 'handovers'), {
        assetId: selectedAsset.id,
        fromOfficerId: currentAssignment.officerId,
        toOfficerId: selectedToOfficer.id,
        assetName: selectedAsset.name,
        fromOfficerName: currentAssignment.officerName,
        toOfficerName: selectedToOfficer.name,
        date: Timestamp.now(),
        status: 'Pending'
      });

      // Update asset status
      const assetRef = doc(db, 'assets', selectedAsset.id);
      await updateDoc(assetRef, {
        status: 'Pending Handover'
      });

      // Refresh data
      fetchHandovers();
      fetchAssets();

      // Close modal
      setNewHandoverModalVisible(false);
      setSelectedAsset(null);
      setSelectedToOfficer(null);
      Alert.alert('Success', 'Handover request created successfully');
    } catch (error) {
      console.error("Error creating handover:", error);
      Alert.alert('Error', 'Could not create handover');
    }
  };

  // Add a new asset
  const addAsset = async () => {
    if (!newAssetName || !newAssetSerial || !newAssetType) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      await addDoc(collection(db, 'assets'), {
        name: newAssetName,
        serialNumber: newAssetSerial,
        type: newAssetType,
        status: 'Available'
      });

      // Refresh assets
      fetchAssets();

      // Reset form and close modal
      setNewAssetName('');
      setNewAssetSerial('');
      setNewAssetType('');
      setAddAssetModalVisible(false);
      Alert.alert('Success', 'Asset added successfully');
    } catch (error) {
      console.error("Error adding asset:", error);
      Alert.alert('Error', 'Could not add asset');
    }
  };

  // Add a new officer
  const addOfficer = async () => {
    if (!newOfficerName || !newOfficerBadge) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      await addDoc(collection(db, 'officers'), {
        name: newOfficerName,
        badgeNumber: newOfficerBadge
      });

      // Refresh officers
      fetchOfficers();

      // Reset form and close modal
      setNewOfficerName('');
      setNewOfficerBadge('');
      setAddOfficerModalVisible(false);
      Alert.alert('Success', 'Officer added successfully');
    } catch (error) {
      console.error("Error adding officer:", error);
      Alert.alert('Error', 'Could not add officer');
    }
  };

  // Handle handover status update
  const handleUpdateHandoverStatus = async (handoverId: string | undefined, status: 'Completed' | 'Rejected') => {
    if (!handoverId) {
      Alert.alert('Error', 'Invalid handover ID');
      return;
    }

    try {
      const handoverRef = doc(db, 'handovers', handoverId);
      
      // Get the handover document
      const handoverSnap = await getDoc(handoverRef);
      if (!handoverSnap.exists()) {
        Alert.alert('Error', 'Handover not found');
        return;
      }

      const handoverData = handoverSnap.data() as Handover;

      // Update handover status
      await updateDoc(handoverRef, { status });

      // If handover is completed, update the assignment
      if (status === 'Completed') {
        // Find the current assignment for this asset
        const currentAssignment = findAssetAssignment(handoverData.assetId);
        
        if (currentAssignment) {
          // Update status to inactive
          const assignmentRef = doc(db, 'assignments', currentAssignment.id);
          await updateDoc(assignmentRef, { status: 'Inactive' });
        }
        
        // Create a new assignment
        await addDoc(collection(db, 'assignments'), {
          assetId: handoverData.assetId,
          assetName: handoverData.assetName,
          officerId: handoverData.toOfficerId,
          officerName: handoverData.toOfficerName,
          assignedDate: Timestamp.now(),
          status: 'Active'
        });

        // Update asset status
        const assetRef = doc(db, 'assets', handoverData.assetId);
        await updateDoc(assetRef, { status: 'Assigned' });
      } else {
        // If rejected, update asset status back to assigned
        const assetRef = doc(db, 'assets', handoverData.assetId);
        await updateDoc(assetRef, { status: 'Assigned' });
      }

      // Refresh data
      fetchHandovers();
      fetchAssets();
      fetchAssignments();

      Alert.alert('Success', `Handover ${status.toLowerCase()} successfully`);
    } catch (error) {
      console.error("Error updating handover:", error);
      Alert.alert('Error', 'Could not update handover');
    }
  };

  // Render new handover modal
  const renderNewHandoverModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isNewHandoverModalVisible}
      onRequestClose={() => setNewHandoverModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Create New Handover</Text>
          
          {/* Asset Selection */}
          <Text style={styles.label}>Select Asset</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {assets
              .filter(asset => {
                // Only show assets that have an active assignment
                const assignment = findAssetAssignment(asset.id);
                return assignment !== undefined;
              })
              .map(asset => {
                const assignment = findAssetAssignment(asset.id);
                return (
                  <TouchableOpacity 
                    key={asset.id} 
                    style={[
                      styles.assetCard, 
                      selectedAsset?.id === asset.id && styles.selectedCard
                    ]}
                    onPress={() => {
                      setSelectedAsset(asset);
                      setSelectedAssignment(assignment || null);
                    }}
                  >
                    <MaterialCommunityIcons 
                      name="cube" 
                      size={24} 
                      color={selectedAsset?.id === asset.id ? PoliceColors.primary : PoliceColors.textLight} 
                    />
                    <Text style={styles.assetCardText}>
                      {asset.name}
                      {assignment && (
                        <Text style={styles.assetAssignmentText}>
                          {`\n(Assigned to: ${assignment.officerName})`}
                        </Text>
                      )}
                    </Text>
                  </TouchableOpacity>
                );
              })}
          </ScrollView>

          {/* Officer Selection */}
          <Text style={styles.label}>Select Receiving Officer</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {officers
              .filter(officer => {
                // Don't show officers who already have the asset assigned
                const assignment = selectedAssignment;
                return !assignment || assignment.officerId !== officer.id;
              })
              .map(officer => (
                <TouchableOpacity 
                  key={officer.id} 
                  style={[
                    styles.officerCard, 
                    selectedToOfficer?.id === officer.id && styles.selectedCard
                  ]}
                  onPress={() => setSelectedToOfficer(officer)}
                >
                  <Avatar.Text 
                    size={40} 
                    label={officer.name.substring(0, 2).toUpperCase()} 
                    style={styles.avatar} 
                  />
                  <Text style={styles.officerCardText}>{officer.name}</Text>
                  <Text style={styles.badgeText}>Badge: {officer.badgeNumber}</Text>
                </TouchableOpacity>
              ))}
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.modalButtonContainer}>
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={() => setNewHandoverModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.createButton} 
              onPress={createHandover}
            >
              <Text style={styles.createButtonText}>Create Handover</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  // Render add asset modal
  const renderAddAssetModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isAddAssetModalVisible}
      onRequestClose={() => setAddAssetModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Add New Asset</Text>
          
          <Text style={styles.label}>Asset Name</Text>
          <TextInput
            style={styles.input}
            value={newAssetName}
            onChangeText={setNewAssetName}
            placeholder="Enter asset name"
          />
          
          <Text style={styles.label}>Serial Number</Text>
          <TextInput
            style={styles.input}
            value={newAssetSerial}
            onChangeText={setNewAssetSerial}
            placeholder="Enter serial number"
          />
          
          <Text style={styles.label}>Asset Type</Text>
          <TextInput
            style={styles.input}
            value={newAssetType}
            onChangeText={setNewAssetType}
            placeholder="Enter asset type"
          />

          {/* Action Buttons */}
          <View style={styles.modalButtonContainer}>
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={() => setAddAssetModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.createButton} 
              onPress={addAsset}
            >
              <Text style={styles.createButtonText}>Add Asset</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  // Render add officer modal
  const renderAddOfficerModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isAddOfficerModalVisible}
      onRequestClose={() => setAddOfficerModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Add New Officer</Text>
          
          <Text style={styles.label}>Officer Name</Text>
          <TextInput
            style={styles.input}
            value={newOfficerName}
            onChangeText={setNewOfficerName}
            placeholder="Enter officer name"
          />
          
          <Text style={styles.label}>Badge Number</Text>
          <TextInput
            style={styles.input}
            value={newOfficerBadge}
            onChangeText={setNewOfficerBadge}
            placeholder="Enter badge number"
          />

          {/* Action Buttons */}
          <View style={styles.modalButtonContainer}>
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={() => setAddOfficerModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.createButton} 
              onPress={addOfficer}
            >
              <Text style={styles.createButtonText}>Add Officer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  // Render Handover History Section
  const renderHandoverHistory = () => (
    <ScrollView>
      {handovers
        .filter(h => h.status !== 'Pending')
        .map(handover => (
          <Card key={handover.id} style={styles.historyCard}>
            <Card.Content>
              <View style={styles.historyCardHeader}>
                <Text style={styles.historyAssetName}>{handover.assetName}</Text>
                <Text 
                  style={[
                    styles.historyStatus, 
                    handover.status === 'Completed' 
                      ? styles.completedStatus 
                      : styles.rejectedStatus
                  ]}
                >
                  {handover.status}
                </Text>
              </View>
              <Text style={styles.historyDetails}>
                From: {handover.fromOfficerName}
                {'\n'}
                To: {handover.toOfficerName}
              </Text>
              <Text style={styles.historyDate}>
                {handover.date.toDate().toLocaleString()}
              </Text>
            </Card.Content>
          </Card>
        ))}
    </ScrollView>
  );

  // Main Render Method
  return (
    <View style={styles.container}>
      {/* Header with buttons */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Asset Handover Management</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={styles.newHandoverButton}
            onPress={() => setNewHandoverModalVisible(true)}
          >
            <Ionicons name="swap-horizontal" size={24} color={PoliceColors.white} />
            <Text style={styles.buttonText}>New Handover</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.addAssetButton}
            onPress={() => setAddAssetModalVisible(true)}
          >
            <Ionicons name="add" size={24} color={PoliceColors.white} />
            <Text style={styles.buttonText}>Add Asset</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.addOfficerButton}
            onPress={() => setAddOfficerModalVisible(true)}
          >
            <Ionicons name="person-add" size={24} color={PoliceColors.white} />
            <Text style={styles.buttonText}>Add Officer</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Current Officer Info */}
      

      {/* Pending Handovers Section */}
      <Text style={styles.sectionTitle}>Pending Handovers</Text>
      <ScrollView style={styles.sectionContent}>
        {handovers
          .filter(h => h.status === 'Pending')
          .map(handover => (
            <Card key={handover.id} style={styles.handoverCard}>
              <Card.Content style={styles.handoverCardContent}>
                <View style={styles.handoverCardHeader}>
                  <Text style={styles.handoverAssetName}>{handover.assetName}</Text>
                  <Text style={styles.handoverStatus}>Pending</Text>
                </View>
                <Text style={styles.handoverDetails}>
                  From: {handover.fromOfficerName}
                  {'\n'}
                  To: {handover.toOfficerName}
                </Text>
                <View style={styles.handoverCardActions}>
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.approveButton]}
                    onPress={() => handleUpdateHandoverStatus(handover.id, 'Completed')}
                  >
                    <Text style={styles.actionButtonText}>Approve</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.rejectButton]}
                    onPress={() => handleUpdateHandoverStatus(handover.id, 'Rejected')}
                  >
                    <Text style={styles.actionButtonText}>Reject</Text>
                  </TouchableOpacity>
                </View>
              </Card.Content>
            </Card>
          ))}
      </ScrollView>

      {/* Handover History Section */}
      <Text style={styles.sectionTitle}>Handover History</Text>
      <ScrollView style={styles.sectionContent}>
        {renderHandoverHistory()}
      </ScrollView>

      {/* Render Modals */}
      {renderNewHandoverModal()}
      {renderAddAssetModal()}
      {renderAddOfficerModal()}
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PoliceColors.background,
  },
  header: {
    backgroundColor: PoliceColors.primary,
    padding: 15,
  },
  headerTitle: {
    color: PoliceColors.white,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  headerButtons: {
    flexDirection: 'row',
  },
  newHandoverButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PoliceColors.accent,
    padding: 10,
    borderRadius: 8,
    marginRight: 10,
  },
  addAssetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PoliceColors.secondary,
    padding: 10,
    borderRadius: 8,
    marginRight: 10,
  },
  addOfficerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PoliceColors.secondary,
    padding: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: PoliceColors.white,
    marginLeft: 5,
  },
  currentOfficerContainer: {
    backgroundColor: PoliceColors.lightBlue,
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  currentOfficerTitle: {
    fontSize: 12,
    color: PoliceColors.textLight,
    marginBottom: 5,
  },
  currentOfficerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currentOfficerAvatar: {
    backgroundColor: PoliceColors.primary,
  },
  currentOfficerInfo: {
    marginLeft: 10,
  },
  currentOfficerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: PoliceColors.text,
  },
  currentOfficerBadge: {
    fontSize: 12,
    color: PoliceColors.textLight,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    padding: 15,
    color: PoliceColors.text,
  },
  sectionContent: {
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: PoliceColors.white,
    borderRadius: 15,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: PoliceColors.text,
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    color: PoliceColors.textLight,
    marginVertical: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: PoliceColors.textLight,
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  assetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PoliceColors.lightBlue,
    padding: 10,
    borderRadius: 10,
    marginRight: 10,
    minWidth: 150,
  },
  assetAssignmentText: {
    fontSize: 10,
    color: PoliceColors.textLight,
  },
  officerCard: {
    alignItems: 'center',
    backgroundColor: PoliceColors.lightBlue,
    padding: 10,
    borderRadius: 10,
    marginRight: 10,
    minWidth: 100,
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: PoliceColors.primary,
  },
  assetCardText: {
    marginLeft: 5,
    color: PoliceColors.text,
  },
  officerCardText: {
    marginTop: 5,
    color: PoliceColors.text,
    fontSize: 12,
    fontWeight: 'bold',
  },
  badgeText: {
    fontSize: 10,
    color: PoliceColors.textLight,
  },
  avatar: {
    backgroundColor: PoliceColors.primary,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    backgroundColor: PoliceColors.background,
    borderRadius: 8,
    marginRight: 10,
  },
  createButton: {
    flex: 1,
    padding: 12,
    backgroundColor: PoliceColors.primary,
    borderRadius: 8,
  },
  cancelButtonText: {
    color: PoliceColors.text,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  createButtonText: {
    color: PoliceColors.white,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  handoverCard: {
    marginHorizontal: 15,
    marginBottom: 10,
    elevation: 2,
  },
  handoverCardContent: {
    padding: 10,
  },
  handoverCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  handoverAssetName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: PoliceColors.text,
  },
  handoverStatus: {
    fontSize: 12,
    color: PoliceColors.accent,
    fontWeight: 'bold',
  },
  handoverDetails: {
    fontSize: 14,
    color: PoliceColors.textLight,
    marginBottom: 10,
  },
  handoverCardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    marginLeft: 10,
  },
  approveButton: {
    backgroundColor: '#28a745',
  },
  rejectButton: {
    backgroundColor: PoliceColors.accent,
  },
  actionButtonText: {
    color: PoliceColors.white,
    fontWeight: 'bold',
  },
  historyCard: {
    marginHorizontal: 15,
    marginBottom: 10,
    elevation: 1,
  },
  historyCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  historyAssetName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: PoliceColors.text,
  },
  historyStatus: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  completedStatus: {
    color: '#28a745',
  },
  rejectedStatus: {
    color: PoliceColors.accent,
  },
  historyDetails: {
    fontSize: 14,
    color: PoliceColors.textLight,
    marginBottom: 5,
  },
  historyDate: {
    fontSize: 12,
    color: PoliceColors.textLight,
    fontStyle: 'italic',
  }
});