import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet,
  Alert,
  Modal,
  ActivityIndicator,
  Platform
} from 'react-native';
import { Card, Divider, Button, Menu, IconButton } from 'react-native-paper';
import { MaterialIcons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { collection, addDoc, getDocs, query, orderBy, Timestamp, doc, getDoc, updateDoc, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';

// Define interfaces
interface MaintenanceTask {
  id: string;
  assetId: string;
  assetName: string;
  maintenanceType: 'Preventive' | 'Corrective' | 'Calibration';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
  assignedTo: string;
  scheduledDate: Timestamp | null;
  completionDate: Timestamp | null;
  description: string;
  vendor: string;
  cost: number | null;
  notes: string;
  createdBy: string;
  createdAt: Timestamp;
}

interface MaintenanceHistory {
  id: string;
  assetId: string;
  assetName: string;
  maintenanceType: string;
  status: string;
  completionDate: Timestamp;
  technician: string;
  cost: number;
  findings: string;
  actionTaken: string;
  partsReplaced: string[];
  nextScheduledMaintenance: Timestamp | null;
  createdAt: Timestamp;
}

interface Asset {
  id: string;
  name: string;
  assetId: string;
  category: string;
  department: string;
  location: string;
  status: string;
}

export default function MaintenanceScreen() {
  // State variables
  const [maintenanceTasks, setMaintenanceTasks] = useState<MaintenanceTask[]>([]);
  const [maintenanceHistory, setMaintenanceHistory] = useState<MaintenanceHistory[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<MaintenanceTask | null>(null);
  const [selectedTaskHistory, setSelectedTaskHistory] = useState<MaintenanceHistory[]>([]);
  
  // New maintenance task form state
  const [newTask, setNewTask] = useState({
    assetId: '',
    assetName: '',
    maintenanceType: 'Preventive' as 'Preventive' | 'Corrective' | 'Calibration',
    priority: 'Medium' as 'Low' | 'Medium' | 'High' | 'Critical',
    assignedTo: '',
    scheduledDate: new Date(),
    description: '',
    vendor: '',
    notes: '',
  });
  
  // Date picker state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerMode, setDatePickerMode] = useState<'date' | 'time'>('date');
  
  // Asset menu state
  const [showAssetMenu, setShowAssetMenu] = useState(false);
  
  // Load data from Firebase
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch assets
        const assetsQuery = query(collection(db, 'assets'), orderBy('name'));
        const assetsSnapshot = await getDocs(assetsQuery);
        const assetsData = assetsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Asset));
        setAssets(assetsData);
        
        // Fetch maintenance tasks
        const maintenanceQuery = query(collection(db, 'maintenanceTasks'), orderBy('createdAt', 'desc'));
        const maintenanceSnapshot = await getDocs(maintenanceQuery);
        const maintenanceData = maintenanceSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as MaintenanceTask));
        setMaintenanceTasks(maintenanceData);
        
        // Fetch maintenance history
        const historyQuery = query(collection(db, 'maintenanceHistory'), orderBy('completionDate', 'desc'));
        const historySnapshot = await getDocs(historyQuery);
        const historyData = historySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as MaintenanceHistory));
        setMaintenanceHistory(historyData);
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        Alert.alert("Error", "Failed to load data. Please try again.");
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Filter maintenance tasks based on search and filters
  const filteredTasks = maintenanceTasks.filter(task => {
    // Apply search filter
    const matchesSearch = !searchQuery || 
      task.assetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.assetId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.vendor.toLowerCase().includes(searchQuery.toLowerCase());
      
    // Apply status filter
    const matchesStatus = !statusFilter || task.status === statusFilter;
    
    // Apply type filter
    const matchesType = !typeFilter || task.maintenanceType === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });
  
  // Filter maintenance history based on search
  const filteredHistory = maintenanceHistory.filter(history => {
    return !searchQuery || 
      history.assetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      history.assetId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      history.technician.toLowerCase().includes(searchQuery.toLowerCase()) ||
      history.findings.toLowerCase().includes(searchQuery.toLowerCase()) ||
      history.actionTaken.toLowerCase().includes(searchQuery.toLowerCase());
  });
  
  // Task count summaries
  const taskCounts = {
    total: maintenanceTasks.length,
    scheduled: maintenanceTasks.filter(task => task.status === 'Scheduled').length,
    inProgress: maintenanceTasks.filter(task => task.status === 'In Progress').length,
    completed: maintenanceTasks.filter(task => task.status === 'Completed').length,
    cancelled: maintenanceTasks.filter(task => task.status === 'Cancelled').length,
    critical: maintenanceTasks.filter(task => task.priority === 'Critical').length,
  };
  
  // Function to format dates (from Timestamp to string)
  const formatDate = (timestamp: Timestamp | null) => {
    if (!timestamp) return 'Not set';
    return timestamp.toDate().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Helper function to get color based on priority
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Low': return '#4caf50';  // Green
      case 'Medium': return '#ff9800'; // Orange
      case 'High': return '#f44336';  // Red
      case 'Critical': return '#9c27b0'; // Purple
      default: return '#333333';
    }
  };

  // Helper function to get color based on status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return '#4caf50';  // Green
      case 'In Progress': return '#2196f3'; // Blue
      case 'Scheduled': return '#9e9e9e';  // Gray
      case 'Cancelled': return '#f44336';  // Red
      default: return '#333333';
    }
  };
  
  // Function to handle status change
  const handleStatusChange = async (taskId: string, newStatus: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled') => {
    try {
      const taskRef = doc(db, 'maintenanceTasks', taskId);
      const updateData: any = { status: newStatus };
      
      // If marking as completed, set completion date
      if (newStatus === 'Completed') {
        updateData.completionDate = Timestamp.now();
        
        // Get the task data to create history record
        const taskDoc = await getDoc(taskRef);
        if (taskDoc.exists()) {
          const taskData = taskDoc.data() as MaintenanceTask;
          
          // Create history record
          await addDoc(collection(db, 'maintenanceHistory'), {
            assetId: taskData.assetId,
            assetName: taskData.assetName,
            maintenanceType: taskData.maintenanceType,
            status: 'Completed',
            completionDate: Timestamp.now(),
            technician: taskData.assignedTo,
            cost: taskData.cost || 0,
            findings: "Regular maintenance performed",
            actionTaken: "Maintenance completed successfully",
            partsReplaced: [],
            nextScheduledMaintenance: null,
            createdAt: Timestamp.now()
          });
        }
      }
      
      await updateDoc(taskRef, updateData);
      
      // Update local state
      setMaintenanceTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId ? { ...task, status: newStatus, completionDate: newStatus === 'Completed' ? Timestamp.now() : task.completionDate } : task
        )
      );
      
      // Refresh history if completed
      if (newStatus === 'Completed') {
        const historyQuery = query(collection(db, 'maintenanceHistory'), orderBy('completionDate', 'desc'));
        const historySnapshot = await getDocs(historyQuery);
        const historyData = historySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as MaintenanceHistory));
        setMaintenanceHistory(historyData);
      }
      
      Alert.alert("Success", `Task status updated to ${newStatus}`);
    } catch (error) {
      console.error("Error updating status:", error);
      Alert.alert("Error", "Failed to update task status. Please try again.");
    }
  };
  
  // Function to add new maintenance task
  const handleAddTask = async () => {
    try {
      if (!newTask.assetId || !newTask.description || !newTask.assignedTo) {
        Alert.alert("Error", "Please fill all required fields");
        return;
      }
      
      // Get asset details
      const assetRef = doc(db, 'assets', newTask.assetId);
      const assetSnap = await getDoc(assetRef);
      if (!assetSnap.exists()) {
        Alert.alert("Error", "Asset not found");
        return;
      }
      
      const assetData = assetSnap.data() as Asset;
      
      // Create new task document
      const newMaintenanceTask = {
        assetId: newTask.assetId,
        assetName: assetData.name,
        maintenanceType: newTask.maintenanceType,
        priority: newTask.priority,
        status: 'Scheduled' as 'Scheduled',
        assignedTo: newTask.assignedTo,
        scheduledDate: Timestamp.fromDate(newTask.scheduledDate),
        completionDate: null,
        description: newTask.description,
        vendor: newTask.vendor,
        cost: null,
        notes: newTask.notes,
        createdBy: "Current User", // Replace with actual user ID or name
        createdAt: Timestamp.now()
      };
      
      const docRef = await addDoc(collection(db, 'maintenanceTasks'), newMaintenanceTask);
      
      // Update local state
      setMaintenanceTasks(prev => [{
        id: docRef.id,
        ...newMaintenanceTask
      }, ...prev]);
      
      // Reset form
      setNewTask({
        assetId: '',
        assetName: '',
        maintenanceType: 'Preventive',
        priority: 'Medium',
        assignedTo: '',
        scheduledDate: new Date(),
        description: '',
        vendor: '',
        notes: '',
      });
      
      setShowAddModal(false);
      Alert.alert("Success", "Maintenance task created successfully");
    } catch (error) {
      console.error("Error adding task:", error);
      Alert.alert("Error", "Failed to create maintenance task. Please try again.");
    }
  };
  
  // Function to view task details
  const handleViewTask = async (taskId: string) => {
    try {
      const taskRef = doc(db, 'maintenanceTasks', taskId);
      const taskDoc = await getDoc(taskRef);
      
      if (taskDoc.exists()) {
        const taskData = {
          id: taskDoc.id,
          ...taskDoc.data()
        } as MaintenanceTask;
        
        setSelectedTask(taskData);
        
        // Get maintenance history for this asset
        const historyQuery = query(
          collection(db, 'maintenanceHistory'), 
          where('assetId', '==', taskData.assetId),
          orderBy('completionDate', 'desc')
        );
        const historySnapshot = await getDocs(historyQuery);
        const historyData = historySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as MaintenanceHistory));
        
        setSelectedTaskHistory(historyData);
        setShowViewModal(true);
      } else {
        Alert.alert("Error", "Task not found");
      }
    } catch (error) {
      console.error("Error viewing task:", error);
      Alert.alert("Error", "Failed to load task details. Please try again.");
    }
  };
  
  // Handle date picker change
  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setNewTask({...newTask, scheduledDate: selectedDate});
    }
  };
  
  // Handle asset selection
  const handleAssetSelect = (asset: Asset) => {
    setNewTask({
      ...newTask,
      assetId: asset.id,
      assetName: asset.name
    });
    setShowAssetMenu(false);
  };
  
  // Render loading indicator
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196f3" />
        <Text style={styles.loadingText}>Loading maintenance data...</Text>
      </View>
    );
  }
  
  return (
    <ScrollView style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Maintenance Management</Text>
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, !showHistory && styles.activeTab]}
            onPress={() => setShowHistory(false)}
          >
            <Text style={[styles.tabText, !showHistory && styles.activeTabText]}>Tasks</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, showHistory && styles.activeTab]}
            onPress={() => setShowHistory(true)}
          >
            <Text style={[styles.tabText, showHistory && styles.activeTabText]}>History</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Summary Cards Section - only show on Tasks tab */}
      {!showHistory && (
        <View style={styles.summaryContainer}>
          <Card style={styles.summaryCard}>
            <Card.Content>
              <View style={styles.summaryItem}>
                <MaterialIcons name="pending-actions" size={24} color="#9e9e9e" />
                <View style={styles.summaryTextContainer}>
                  <Text style={styles.summaryLabel}>Scheduled</Text>
                  <Text style={styles.summaryValue}>{taskCounts.scheduled}</Text>
                </View>
              </View>
            </Card.Content>
          </Card>
          
          <Card style={styles.summaryCard}>
            <Card.Content>
              <View style={styles.summaryItem}>
                <MaterialIcons name="trending-up" size={24} color="#2196f3" />
                <View style={styles.summaryTextContainer}>
                  <Text style={styles.summaryLabel}>In Progress</Text>
                  <Text style={styles.summaryValue}>{taskCounts.inProgress}</Text>
                </View>
              </View>
            </Card.Content>
          </Card>
          
          <Card style={styles.summaryCard}>
            <Card.Content>
              <View style={styles.summaryItem}>
                <MaterialIcons name="priority-high" size={24} color="#f44336" />
                <View style={styles.summaryTextContainer}>
                  <Text style={styles.summaryLabel}>Critical</Text>
                  <Text style={styles.summaryValue}>{taskCounts.critical}</Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        </View>
      )}

      {/* Search Input */}
      <TextInput
        style={styles.searchInput}
        placeholder={showHistory ? "Search maintenance history..." : "Search maintenance tasks..."}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      
      {/* Filter Buttons - only show on Tasks tab */}
      {!showHistory && (
        <View style={styles.filterContainer}>
          <Text style={styles.filterLabel}>Status:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity 
              style={[styles.filterButton, statusFilter === null && styles.activeFilter]}
              onPress={() => setStatusFilter(null)}
            >
              <Text style={[styles.filterText, statusFilter === null && styles.activeFilterText]}>All</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.filterButton, statusFilter === 'Scheduled' && styles.activeFilter]}
              onPress={() => setStatusFilter('Scheduled')}
            >
              <Text style={[styles.filterText, statusFilter === 'Scheduled' && styles.activeFilterText]}>Scheduled</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.filterButton, statusFilter === 'In Progress' && styles.activeFilter]}
              onPress={() => setStatusFilter('In Progress')}
            >
              <Text style={[styles.filterText, statusFilter === 'In Progress' && styles.activeFilterText]}>In Progress</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.filterButton, statusFilter === 'Completed' && styles.activeFilter]}
              onPress={() => setStatusFilter('Completed')}
            >
              <Text style={[styles.filterText, statusFilter === 'Completed' && styles.activeFilterText]}>Completed</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.filterButton, statusFilter === 'Cancelled' && styles.activeFilter]}
              onPress={() => setStatusFilter('Cancelled')}
            >
              <Text style={[styles.filterText, statusFilter === 'Cancelled' && styles.activeFilterText]}>Cancelled</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}
      
      {!showHistory && (
        <View style={styles.filterContainer}>
          <Text style={styles.filterLabel}>Type:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity 
              style={[styles.filterButton, typeFilter === null && styles.activeFilter]}
              onPress={() => setTypeFilter(null)}
            >
              <Text style={[styles.filterText, typeFilter === null && styles.activeFilterText]}>All</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.filterButton, typeFilter === 'Preventive' && styles.activeFilter]}
              onPress={() => setTypeFilter('Preventive')}
            >
              <Text style={[styles.filterText, typeFilter === 'Preventive' && styles.activeFilterText]}>Preventive</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.filterButton, typeFilter === 'Corrective' && styles.activeFilter]}
              onPress={() => setTypeFilter('Corrective')}
            >
              <Text style={[styles.filterText, typeFilter === 'Corrective' && styles.activeFilterText]}>Corrective</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.filterButton, typeFilter === 'Calibration' && styles.activeFilter]}
              onPress={() => setTypeFilter('Calibration')}
            >
              <Text style={[styles.filterText, typeFilter === 'Calibration' && styles.activeFilterText]}>Calibration</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}
      
      {/* Maintenance Tasks Section */}
      {!showHistory ? (
        filteredTasks.length > 0 ? (
          filteredTasks.map((task) => (
            <Card key={task.id} style={styles.taskCard}>
              <Card.Content>
                <View style={styles.taskHeader}>
                  <View>
                    <Text style={styles.assetName}>{task.assetName}</Text>
                    <Text style={styles.assetId}>{task.assetId}</Text>
                  </View>
                  <IconButton
                    icon="dots-vertical"
                    size={20}
                    onPress={() => handleViewTask(task.id)}
                  />
                </View>
                
                <Text style={styles.taskDescription}>{task.description}</Text>
                
                <View style={styles.taskInfoRow}>
                  <View style={styles.taskInfoItem}>
                    <MaterialIcons name="calendar-today" size={16} color="#666" />
                    <Text style={styles.taskInfoText}>
                      {task.scheduledDate ? formatDate(task.scheduledDate) : 'Not scheduled'}
                    </Text>
                  </View>
                  
                  <View style={styles.taskInfoItem}>
                    <MaterialIcons name="person" size={16} color="#666" />
                    <Text style={styles.taskInfoText}>{task.assignedTo}</Text>
                  </View>
                </View>
                
                <Divider style={styles.divider} />
                
                <View style={styles.taskFooter}>
                  <View style={{...styles.priorityBadge, backgroundColor: getPriorityColor(task.priority)}}>
                    <Text style={styles.priorityText}>{task.priority}</Text>
                  </View>
                  
                  <View style={{...styles.statusBadge, backgroundColor: getStatusColor(task.status)}}>
                    <Text style={styles.statusText}>{task.status}</Text>
                  </View>
                </View>
                
                <View style={styles.buttonContainer}>
                  {task.status === 'Scheduled' && (
                    <TouchableOpacity 
                      style={{...styles.actionButton, backgroundColor: '#2196f3'}}
                      onPress={() => handleStatusChange(task.id, 'In Progress')}
                    >
                      <Text style={styles.buttonText}>Start</Text>
                    </TouchableOpacity>
                  )}
                  
                  {task.status === 'In Progress' && (
                    <TouchableOpacity 
                      style={{...styles.actionButton, backgroundColor: '#4caf50'}}
                      onPress={() => handleStatusChange(task.id, 'Completed')}
                    >
                      <Text style={styles.buttonText}>Complete</Text>
                    </TouchableOpacity>
                  )}
                  
                  {(task.status === 'Scheduled' || task.status === 'In Progress') && (
                    <TouchableOpacity 
                      style={{...styles.actionButton, backgroundColor: '#f44336'}}
                      onPress={() => handleStatusChange(task.id, 'Cancelled')}
                    >
                      <Text style={styles.buttonText}>Cancel</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </Card.Content>
            </Card>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="tools" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No maintenance tasks found</Text>
            <Text style={styles.emptySubtext}>Try adjusting your filters or create a new task</Text>
          </View>
        )
      ) : (
        // Maintenance History Section
        filteredHistory.length > 0 ? (
          filteredHistory.map((history) => (
            <Card key={history.id} style={styles.historyCard}>
              <Card.Content>
                <View style={styles.taskHeader}>
                  <View>
                    <Text style={styles.assetName}>{history.assetName}</Text>
                    <Text style={styles.assetId}>{history.assetId}</Text>
                  </View>
                  <Text style={styles.historyDate}>{formatDate(history.completionDate)}</Text>
                </View>
                
                <View style={styles.historyRow}>
                  <View style={styles.historyType}>
                    <Text style={styles.historyTypeText}>{history.maintenanceType}</Text>
                  </View>
                  <Text style={styles.historyTechnician}>Technician: {history.technician}</Text>
                </View>
                
                <Divider style={styles.divider} />
                
                <Text style={styles.historyLabel}>Findings:</Text>
                <Text style={styles.historyText}>{history.findings}</Text>
                
                <Text style={styles.historyLabel}>Action Taken:</Text>
                <Text style={styles.historyText}>{history.actionTaken}</Text>
                
                {history.partsReplaced && history.partsReplaced.length > 0 && (
                  <>
                    <Text style={styles.historyLabel}>Parts Replaced:</Text>
                    <Text style={styles.historyText}>{history.partsReplaced.join(', ')}</Text>
                  </>
                )}
                
                <View style={styles.historyFooter}>
                  <Text style={styles.historyCost}>Cost: ₹{history.cost.toLocaleString()}</Text>
                  {history.nextScheduledMaintenance && (
                    <Text style={styles.historyNextDate}>
                      Next: {formatDate(history.nextScheduledMaintenance)}
                    </Text>
                  )}
                </View>
              </Card.Content>
            </Card>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="history" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No maintenance history found</Text>
            <Text style={styles.emptySubtext}>Completed maintenance tasks will appear here</Text>
          </View>
        )
      )}
      
      {/* Add Task Modal */}
      <Modal
  visible={showAddModal}
  animationType="slide"
  transparent={true}
  onRequestClose={() => setShowAddModal(false)}
>
<View style={styles.modalContainer}>
  <View style={styles.modalContent}>
    {/* Modal Header */}
    <View style={styles.modalHeader}>
      <Text style={styles.modalTitle}>Create Maintenance Task</Text>
      <TouchableOpacity onPress={() => setShowAddModal(false)}>
        <MaterialIcons name="close" size={24} color="#333" />
      </TouchableOpacity>
    </View>
    <Divider style={styles.divider} />

    {/* Task Details Section */}
    {selectedTask && ( // Add a null check for selectedTask
      <>
        <Text style={styles.detailDescriptionLabel}>Description:</Text>
        <Text style={styles.detailDescription}>{selectedTask.description}</Text>

        {selectedTask.vendor && (
          <>
            <Text style={styles.detailDescriptionLabel}>Vendor:</Text>
            <Text style={styles.detailDescription}>{selectedTask.vendor}</Text>
          </>
        )}

        {selectedTask.notes && (
          <>
            <Text style={styles.detailDescriptionLabel}>Notes:</Text>
            <Text style={styles.detailDescription}>{selectedTask.notes}</Text>
          </>
        )}

        {selectedTask.cost !== null && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Cost:</Text>
            <Text style={styles.detailValue}>₹{selectedTask.cost.toLocaleString()}</Text>
          </View>
        )}
      </>
    )}

    <Divider style={styles.divider} />

    {/* Maintenance History Section */}
    <Text style={styles.historyHeaderText}>Maintenance History</Text>

    {selectedTaskHistory.length > 0 ? (
      selectedTaskHistory.map((history) => (
        <Card key={history.id} style={styles.historyDetailCard}>
          <Card.Content>
            <View style={styles.historyDetailRow}>
              <Text style={styles.historyDetailDate}>{formatDate(history.completionDate)}</Text>
              <Text style={styles.historyDetailType}>{history.maintenanceType}</Text>
            </View>

            <Text style={styles.historyDetailLabel}>Findings:</Text>
            <Text style={styles.historyDetailText}>{history.findings}</Text>

            <Text style={styles.historyDetailLabel}>Action Taken:</Text>
            <Text style={styles.historyDetailText}>{history.actionTaken}</Text>

            <View style={styles.historyDetailFooter}>
              <Text style={styles.historyDetailTech}>Tech: {history.technician}</Text>
              <Text style={styles.historyDetailCost}>₹{history.cost.toLocaleString()}</Text>
            </View>
          </Card.Content>
        </Card>
      ))
    ) : (
      <Text style={styles.noHistoryText}>No maintenance history found for this asset</Text>
    )}
  </View>
</View>
                
                
                <View style={styles.modalFooter}>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setShowViewModal(false)}
                  >
                    <Text style={styles.closeButtonText}>Close</Text>
                  </TouchableOpacity>
                </View>
            
           
          </Modal>
          
          {/* Floating Action Button */}
          <TouchableOpacity 
            style={styles.fab}
            onPress={() => setShowAddModal(true)}
          >
            <MaterialIcons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </ScrollView>
      );
    }
    
    // Styles
    const styles = StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
      },
      loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
      },
      loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
      },
      header: {
        padding: 16,
        backgroundColor: '#2196f3',
      },
      headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 10,
      },
      tabContainer: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 8,
        overflow: 'hidden',
      },
      tab: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
      },
      activeTab: {
        backgroundColor: '#fff',
      },
      tabText: {
        color: '#fff',
        fontWeight: '500',
      },
      activeTabText: {
        color: '#2196f3',
        fontWeight: 'bold',
      },
      summaryContainer: {
        flexDirection: 'row',
        padding: 16,
        justifyContent: 'space-between',
      },
      summaryCard: {
        flex: 1,
        marginHorizontal: 4,
        elevation: 2,
      },
      summaryItem: {
        flexDirection: 'row',
        alignItems: 'center',
      },
      summaryTextContainer: {
        marginLeft: 8,
      },
      summaryLabel: {
        fontSize: 12,
        color: '#666',
      },
      summaryValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
      },
      searchInput: {
        margin: 16,
        backgroundColor: '#fff',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 10,
        elevation: 2,
        fontSize: 16,
      },
      filterContainer: {
        paddingHorizontal: 16,
        marginBottom: 8,
      },
      filterLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#666',
        marginBottom: 8,
      },
      filterButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        marginRight: 8,
        backgroundColor: '#f0f0f0',
      },
      activeFilter: {
        backgroundColor: '#2196f3',
      },
      filterText: {
        fontSize: 14,
        color: '#666',
      },
      activeFilterText: {
        color: '#fff',
        fontWeight: '500',
      },
      taskCard: {
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 8,
        elevation: 2,
      },
      taskHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
      },
      assetName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
      },
      assetId: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
      },
      taskDescription: {
        fontSize: 16,
        color: '#444',
        marginBottom: 10,
      },
      taskInfoRow: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        marginBottom: 8,
      },
      taskInfoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 16,
      },
      taskInfoText: {
        fontSize: 14,
        color: '#666',
        marginLeft: 4,
      },
      divider: {
        marginVertical: 10,
      },
      taskFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
      },
      priorityBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
      },
      priorityText: {
        color: '#fff',
        fontWeight: '500',
        fontSize: 12,
      },
      statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
      },
      statusText: {
        color: '#fff',
        fontWeight: '500',
        fontSize: 12,
      },
      buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 8,
      },
      actionButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 4,
        marginLeft: 8,
      },
      buttonText: {
        color: '#fff',
        fontWeight: '500',
      },
      emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
        marginTop: 32,
      },
      emptyText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#666',
        marginTop: 16,
      },
      emptySubtext: {
        fontSize: 14,
        color: '#888',
        marginTop: 8,
        textAlign: 'center',
      },
      historyCard: {
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 8,
        elevation: 2,
      },
      historyDate: {
        fontSize: 14,
        color: '#666',
      },
      historyRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginVertical: 8,
      },
      historyType: {
        backgroundColor: '#e0e0e0',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
      },
      historyTypeText: {
        fontSize: 12,
        color: '#333',
      },
      historyTechnician: {
        fontSize: 14,
        color: '#666',
      },
      historyLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 8,
      },
      historyText: {
        fontSize: 14,
        color: '#444',
        marginBottom: 8,
      },
      historyFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
      },
      historyCost: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#4caf50',
      },
      historyNextDate: {
        fontSize: 14,
        color: '#2196f3',
      },
      modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
      },
      modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        maxHeight: '90%',
      },
      modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
      },
      modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
      },
      modalBody: {
        padding: 16,
        maxHeight: '80%',
      },
      modalFooter: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
      },
      inputLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 12,
        marginBottom: 4,
      },
      textInput: {
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        fontSize: 16,
        marginBottom: 8,
      },
      assetSelector: {
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      },
      assetSelectorText: {
        fontSize: 16,
        color: '#333',
      },
      assetSelectorPlaceholder: {
        fontSize: 16,
        color: '#999',
      },
      assetMenu: {
        backgroundColor: '#fff',
        borderRadius: 8,
        marginTop: 4,
        elevation: 4,
        maxHeight: 200,
      },
      assetSearchInput: {
        padding: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
      },
      assetList: {
        maxHeight: 160,
      },
      assetMenuItem: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
      },
      assetMenuItemText: {
        fontSize: 16,
        color: '#333',
      },
      assetMenuItemId: {
        fontSize: 12,
        color: '#666',
      },
      typeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 8,
      },
      typeButton: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        marginHorizontal: 4,
        borderRadius: 4,
      },
      selectedTypeButton: {
        backgroundColor: '#2196f3',
        borderColor: '#2196f3',
      },
      typeButtonText: {
        color: '#666',
      },
      selectedTypeButtonText: {
        color: '#fff',
        fontWeight: 'bold',
      },
      priorityContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 8,
      },
      priorityButton: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        marginHorizontal: 2,
        borderRadius: 4,
      },
      selectedPriorityLow: {
        backgroundColor: '#4caf50',
        borderColor: '#4caf50',
      },
      selectedPriorityMedium: {
        backgroundColor: '#ff9800',
        borderColor: '#ff9800',
      },
      selectedPriorityHigh: {
        backgroundColor: '#f44336',
        borderColor: '#f44336',
      },
      selectedPriorityCritical: {
        backgroundColor: '#9c27b0',
        borderColor: '#9c27b0',
      },
      priorityButtonText: {
        color: '#666',
        fontSize: 12,
      },
      selectedPriorityText: {
        color: '#fff',
        fontWeight: 'bold',
      },
      dateSelector: {
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
      },
      dateSelectorText: {
        fontSize: 16,
        color: '#333',
      },
      cancelButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 4,
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#ddd',
      },
      cancelButtonText: {
        color: '#666',
      },
      saveButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 4,
        backgroundColor: '#2196f3',
      },
      saveButtonText: {
        color: '#fff',
        fontWeight: 'bold',
      },
      detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
      },
      detailLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        flex: 1,
      },
      detailValue: {
        fontSize: 16,
        color: '#444',
        flex: 2,
        textAlign: 'right',
      },
      detailDescriptionLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 8,
        marginBottom: 4,
      },
      detailDescription: {
        fontSize: 16,
        color: '#444',
        marginBottom: 12,
      },
      historyHeaderText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginVertical: 12,
      },
      historyDetailCard: {
        marginBottom: 12,
        elevation: 1,
      },
      historyDetailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
      },
      historyDetailDate: {
        fontSize: 14,
        color: '#666',
      },
      historyDetailType: {
        fontSize: 14,
        fontWeight: '500',
        color: '#2196f3',
      },
      historyDetailLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 4,
      },
      historyDetailText: {
        fontSize: 14,
        color: '#444',
        marginBottom: 4,
      },
      historyDetailFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
      },
      historyDetailTech: {
        fontSize: 14,
        color: '#666',
      },
      historyDetailCost: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#4caf50',
      },
      noHistoryText: {
        fontSize: 14,
        color: '#666',
        fontStyle: 'italic',
        textAlign: 'center',
        padding: 16,
      },
      closeButton: {
        paddingHorizontal: 24,
        paddingVertical: 10,
        borderRadius: 4,
        backgroundColor: '#f0f0f0',
      },
      closeButtonText: {
        fontSize: 16,
        color: '#333',
      },
      fab: {
        position: 'absolute',
        right: 20,
        bottom: 20,
        backgroundColor: '#2196f3',
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
      },
    });