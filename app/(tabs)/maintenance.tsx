import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { Card } from 'react-native-paper';

// Define our maintenance task interface
interface MaintenanceTask {
  id: string;
  assetName: string;
  assetId: string;
  taskType: 'Preventive' | 'Corrective' | 'Calibration';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Overdue';
  assignedTo: string;
  dueDate: string;
  description: string;
}

export default function MaintenanceScreen() {
  // Sample maintenance tasks data
  const [maintenanceTasks, setMaintenanceTasks] = useState<MaintenanceTask[]>([
    {
      id: 'MT001',
      assetName: 'Server Room Equipment',
      assetId: 'SVR-2023-001',
      taskType: 'Preventive',
      priority: 'High',
      status: 'Scheduled',
      assignedTo: 'Tech Officer Patel',
      dueDate: '25/02/2025',
      description: 'Routine maintenance for server room equipment including cooling systems check.',
    },
    {
      id: 'MT002',
      assetName: 'CCTV Cameras - HQ',
      assetId: 'CAM-2022-013',
      taskType: 'Corrective',
      priority: 'Critical',
      status: 'In Progress',
      assignedTo: 'External Vendor',
      dueDate: '22/02/2025',
      description: 'Fix connection issues in west wing security cameras.',
    },
    {
      id: 'MT003',
      assetName: 'Fingerprint Scanners',
      assetId: 'FPS-2024-005',
      taskType: 'Calibration',
      priority: 'Medium',
      status: 'Completed',
      assignedTo: 'Tech Officer Patel',
      dueDate: '10/02/2025',
      description: 'Calibrate all fingerprint scanners for increased accuracy.',
    }
  ]);

  // States for search and filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  // Task count summaries
  const taskCounts = {
    total: maintenanceTasks.length,
    overdue: maintenanceTasks.filter(task => task.status === 'Overdue').length,
    inProgress: maintenanceTasks.filter(task => task.status === 'In Progress').length,
    scheduled: maintenanceTasks.filter(task => task.status === 'Scheduled').length,
    completed: maintenanceTasks.filter(task => task.status === 'Completed').length,
  };

  // Filter maintenance tasks based on search and status filter
  const filteredTasks = maintenanceTasks.filter(task => {
    // Apply search filter
    const matchesSearch = searchQuery === '' || 
      task.assetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.assetId.toLowerCase().includes(searchQuery.toLowerCase());
      
    // Apply status filter
    const matchesStatus = statusFilter === null || task.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

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
      case 'Overdue': return '#f44336';    // Red
      default: return '#333333';
    }
  };

  // Function to handle task status change
  const handleStatusChange = (taskId: string, newStatus: 'Scheduled' | 'In Progress' | 'Completed' | 'Overdue') => {
    setMaintenanceTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );
  };

  // Simple styles
  const styles = {
    container: {
      flex: 1,
      backgroundColor: '#f5f5f5',
    },
    summaryContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      padding: 16,
    },
    summaryCard: {
      width: '31%',
      borderTopWidth: 3,
    },
    searchInput: {
      height: 40,
      borderWidth: 1,
      borderColor: '#ddd',
      borderRadius: 4,
      paddingHorizontal: 10,
      marginHorizontal: 16,
      marginVertical: 10,
    },
    filterContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingHorizontal: 16,
      marginBottom: 10,
    },
    filterButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      marginRight: 8,
      marginBottom: 8,
      borderRadius: 16,
      backgroundColor: '#f0f0f0',
    },
    taskCard: {
      marginHorizontal: 16,
      marginVertical: 8,
      padding: 16,
    },
    taskHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    assetName: {
      fontSize: 16,
      fontWeight: 'bold',
    },
    assetId: {
      fontSize: 12,
      color: '#666',
    },
    taskInfo: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 8,
    },
    priorityBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
    },
    priorityText: {
      color: 'white',
      fontSize: 12,
    },
    statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
    },
    statusText: {
      color: 'white',
      fontSize: 12,
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginTop: 12,
    },
    actionButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 4,
      marginLeft: 8,
    },
    buttonText: {
      color: 'white',
      fontSize: 12,
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Summary Cards Section */}
      <View style={styles.summaryContainer}>
        <Card style={{...styles.summaryCard, borderTopColor: '#9e9e9e'}}>
          <Card.Content>
            <Text>Total Tasks</Text>
            <Text style={{fontSize: 18, fontWeight: 'bold'}}>{taskCounts.total}</Text>
          </Card.Content>
        </Card>
        
        <Card style={{...styles.summaryCard, borderTopColor: '#f44336'}}>
          <Card.Content>
            <Text>Overdue</Text>
            <Text style={{fontSize: 18, fontWeight: 'bold', color: '#f44336'}}>{taskCounts.overdue}</Text>
          </Card.Content>
        </Card>
        
        <Card style={{...styles.summaryCard, borderTopColor: '#2196f3'}}>
          <Card.Content>
            <Text>In Progress</Text>
            <Text style={{fontSize: 18, fontWeight: 'bold', color: '#2196f3'}}>{taskCounts.inProgress}</Text>
          </Card.Content>
        </Card>
      </View>

      {/* Search Input */}
      <TextInput
        style={styles.searchInput}
        placeholder="Search by asset name or ID..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      
      {/* Status Filter Buttons */}
      <View style={styles.filterContainer}>
        <TouchableOpacity 
          style={{...styles.filterButton, backgroundColor: statusFilter === null ? '#2196f3' : '#f0f0f0'}}
          onPress={() => setStatusFilter(null)}
        >
          <Text style={{color: statusFilter === null ? 'white' : 'black'}}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={{...styles.filterButton, backgroundColor: statusFilter === 'Scheduled' ? '#2196f3' : '#f0f0f0'}}
          onPress={() => setStatusFilter('Scheduled')}
        >
          <Text style={{color: statusFilter === 'Scheduled' ? 'white' : 'black'}}>Scheduled</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={{...styles.filterButton, backgroundColor: statusFilter === 'In Progress' ? '#2196f3' : '#f0f0f0'}}
          onPress={() => setStatusFilter('In Progress')}
        >
          <Text style={{color: statusFilter === 'In Progress' ? 'white' : 'black'}}>In Progress</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={{...styles.filterButton, backgroundColor: statusFilter === 'Completed' ? '#2196f3' : '#f0f0f0'}}
          onPress={() => setStatusFilter('Completed')}
        >
          <Text style={{color: statusFilter === 'Completed' ? 'white' : 'black'}}>Completed</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={{...styles.filterButton, backgroundColor: statusFilter === 'Overdue' ? '#2196f3' : '#f0f0f0'}}
          onPress={() => setStatusFilter('Overdue')}
        >
          <Text style={{color: statusFilter === 'Overdue' ? 'white' : 'black'}}>Overdue</Text>
        </TouchableOpacity>
      </View>

      {/* Task Cards */}
      {filteredTasks.map((task) => (
        <Card key={task.id} style={styles.taskCard}>
          <Card.Content>
            <View style={styles.taskHeader}>
              <View>
                <Text style={styles.assetName}>{task.assetName}</Text>
                <Text style={styles.assetId}>{task.assetId}</Text>
              </View>
              <Text>{task.dueDate}</Text>
            </View>
            
            <Text style={{marginVertical: 8}}>{task.description}</Text>
            
            <View style={styles.taskInfo}>
              <View style={{...styles.priorityBadge, backgroundColor: getPriorityColor(task.priority)}}>
                <Text style={styles.priorityText}>{task.priority}</Text>
              </View>
              
              <View style={{...styles.statusBadge, backgroundColor: getStatusColor(task.status)}}>
                <Text style={styles.statusText}>{task.status}</Text>
              </View>
            </View>
            
            <View style={styles.buttonContainer}>
              {task.status !== 'In Progress' && task.status !== 'Completed' && (
                <TouchableOpacity 
                  style={{...styles.actionButton, backgroundColor: '#2196f3'}}
                  onPress={() => handleStatusChange(task.id, 'In Progress')}
                >
                  <Text style={styles.buttonText}>Start Task</Text>
                </TouchableOpacity>
              )}
              
              {task.status !== 'Completed' && (
                <TouchableOpacity 
                  style={{...styles.actionButton, backgroundColor: '#4caf50'}}
                  onPress={() => handleStatusChange(task.id, 'Completed')}
                >
                  <Text style={styles.buttonText}>Mark Complete</Text>
                </TouchableOpacity>
              )}
            </View>
          </Card.Content>
        </Card>
      ))}
      
      {filteredTasks.length === 0 && (
        <View style={{alignItems: 'center', padding: 32}}>
          <Text style={{fontSize: 16, color: '#666'}}>No maintenance tasks found</Text>
          <Text style={{fontSize: 14, color: '#999', marginTop: 4}}>Try adjusting your filters</Text>
        </View>
      )}
    </ScrollView>
  );
}