import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Platform, Dimensions } from 'react-native';
import { Card, Divider, Chip, Button, SegmentedButtons, Menu } from 'react-native-paper';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { BarChart, LineChart, PieChart } from 'react-native-chart-kit';
import { DatePickerModal } from 'react-native-paper-dates';
import { Link, useRouter } from 'expo-router';

// Firebase imports
import { getDatabase, ref, onValue } from "firebase/database";

// Get screen width for charts
const screenWidth = Dimensions.get('window').width;

// Define color scheme
const PoliceColors = {
  primary: '#003366', // Dark blue
  secondary: '#1a3c61', // Slightly lighter blue
  accent: '#bf2c37', // Police red
  background: '#f5f7fa', // Light background
  cardBackground: '#ffffff', // White for cards
  text: '#333333', // Near black for text
  textLight: '#6c757d', // Gray for secondary text
  white: '#ffffff',
  lightGray: '#e9ecef',
  success: '#28a745',
  warning: '#ffc107',
  lightBlue: '#e6f2ff',
  border: '#dee2e6',
  chartColors: ['#003366', '#1a3c61', '#bf2c37', '#28a745', '#ffc107']
};

// Chart configurations
const chartConfig = {
  color: (opacity = 1) => `rgba(0, 51, 102, ${opacity})`,
  strokeWidth: 2,
  barPercentage: 0.6,
  useShadowColorFromDataset: false,
  decimalPlaces: 0,
  propsForLabels: {
    fontSize: 10,
  },
};

// Define mock data types
interface AssetAllocation {
  category: string;
  count: number;
  color: string;
}

interface MaintenanceRecord {
  month: string;
  planned: number;
  emergency: number;
}

interface InventoryTrend {
  month: string;
  acquisitions: number;
  decommissioned: number;
}

interface TopOfficerUsage {
  name: string;
  assets: number;
}

interface DepartmentAllocation {
  department: string;
  allocation: number;
}

export default function ReportsScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ startDate: new Date(2024, 0, 1), endDate: new Date() });
  const [visibleDatePicker, setVisibleDatePicker] = useState(false);
  const [datePickerMode, setDatePickerMode] = useState<'start' | 'end'>('start');
  const [reportType, setReportType] = useState('overview');
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedReport, setSelectedReport] = useState('Asset Allocation');
  
  // Sample data states
  const [assetAllocation, setAssetAllocation] = useState<AssetAllocation[]>([]);
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);
  const [inventoryTrends, setInventoryTrends] = useState<InventoryTrend[]>([]);
  const [topOfficerUsage, setTopOfficerUsage] = useState<TopOfficerUsage[]>([]);
  const [departmentAllocation, setDepartmentAllocation] = useState<DepartmentAllocation[]>([]);

  // Load data on component mount
  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      loadMockData();
      setIsLoading(false);
      
      // Add Firebase data fetching here if needed
      try {
        const db = getDatabase();
        // Example: fetch asset data
        const assetRef = ref(db, 'assets');
        onValue(assetRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            // Process firebase data here
            console.log("Firebase data loaded");
          }
        });
      } catch (error) {
        console.error("Firebase error:", error);
      }
    }, 1000);
  }, []);

  // Date picker handlers
  const onDismissSingle = () => {
    setVisibleDatePicker(false);
  };

  const onConfirmSingle = (params: any) => {
    setVisibleDatePicker(false);
    if (datePickerMode === 'start') {
      setDateRange({...dateRange, startDate: params.date});
    } else {
      setDateRange({...dateRange, endDate: params.date});
    }
  };

  const showDatePicker = (mode: 'start' | 'end') => {
    setDatePickerMode(mode);
    setVisibleDatePicker(true);
  };

  // Load mock data for demonstration
  const loadMockData = () => {
    // Asset Allocation by Type
    setAssetAllocation([
      { category: 'Radios', count: 354, color: PoliceColors.primary },
      { category: 'Laptops', count: 267, color: PoliceColors.secondary },
      { category: 'Firearms', count: 189, color: PoliceColors.accent },
      { category: 'Vehicles', count: 112, color: PoliceColors.success },
      { category: 'Bodycams', count: 323, color: PoliceColors.warning },
    ]);

    // Maintenance Records
    setMaintenanceRecords([
      { month: 'Jan', planned: 25, emergency: 8 },
      { month: 'Feb', planned: 28, emergency: 12 },
      { month: 'Mar', planned: 32, emergency: 10 },
      { month: 'Apr', planned: 30, emergency: 14 },
      { month: 'May', planned: 35, emergency: 9 },
      { month: 'Jun', planned: 33, emergency: 11 },
    ]);

    // Inventory Trends
    setInventoryTrends([
      { month: 'Jan', acquisitions: 15, decommissioned: 8 },
      { month: 'Feb', acquisitions: 12, decommissioned: 10 },
      { month: 'Mar', acquisitions: 18, decommissioned: 7 },
      { month: 'Apr', acquisitions: 25, decommissioned: 12 },
      { month: 'May', acquisitions: 22, decommissioned: 15 },
      { month: 'Jun', acquisitions: 20, decommissioned: 11 },
    ]);

    // Top Officer Usage
    setTopOfficerUsage([
      { name: 'S. Singh', assets: 12 },
      { name: 'P. Patel', assets: 10 },
      { name: 'A. Kumar', assets: 9 },
      { name: 'R. Sharma', assets: 8 },
      { name: 'M. Gupta', assets: 7 },
    ]);

    // Department Allocation
    setDepartmentAllocation([
      { department: 'Patrol', allocation: 35 },
      { department: 'Traffic', allocation: 20 },
      { department: 'Investigation', allocation: 22 },
      { department: 'Cybercrime', allocation: 15 },
      { department: 'Admin', allocation: 8 },
    ]);
  };

  // Format date for display
  const formatDate = (date: Date): string => {
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  // Generate pie chart data
  const getPieChartData = () => {
    // Add a safety check to ensure assetAllocation is not empty
    if (!assetAllocation || assetAllocation.length === 0) {
      // Return a default data structure if no data is available
      return {
        labels: ['No Data'],
        datasets: [{
          data: [100],
          color: (opacity = 1) => `rgba(0, 51, 102, ${opacity})`,
          colors: [PoliceColors.lightGray]
        }]
      };
    }
    
    return {
      labels: assetAllocation.map(item => item.category),
      datasets: [{
        data: assetAllocation.map(item => item.count),
        color: (opacity = 1) => `rgba(0, 51, 102, ${opacity})`,
        colors: assetAllocation.map(item => item.color)
      }]
    };
  };

  // Generate maintenance chart data
  const getMaintenanceChartData = () => {
    // Add a safety check for maintenanceRecords
    if (!maintenanceRecords || maintenanceRecords.length === 0) {
      return {
        labels: ['No Data'],
        datasets: [{ data: [0] }, { data: [0] }],
        legend: ['Planned', 'Emergency']
      };
    }
    
    return {
      labels: maintenanceRecords.map(item => item.month),
      datasets: [
        {
          data: maintenanceRecords.map(item => item.planned),
          color: (opacity = 1) => `rgba(0, 51, 102, ${opacity})`,
          strokeWidth: 2,
        },
        {
          data: maintenanceRecords.map(item => item.emergency),
          color: (opacity = 1) => `rgba(191, 44, 55, ${opacity})`,
          strokeWidth: 2,
        }
      ],
      legend: ['Planned', 'Emergency']
    };
  };

  // Generate inventory trend data
  const getInventoryTrendData = () => {
    // Add a safety check for inventoryTrends
    if (!inventoryTrends || inventoryTrends.length === 0) {
      return {
        labels: ['No Data'],
        datasets: [{ data: [0] }, { data: [0] }],
        legend: ['Acquisitions', 'Decommissioned']
      };
    }
    
    return {
      labels: inventoryTrends.map(item => item.month),
      datasets: [
        {
          data: inventoryTrends.map(item => item.acquisitions),
          color: (opacity = 1) => `rgba(40, 167, 69, ${opacity})`,
          strokeWidth: 2,
        },
        {
          data: inventoryTrends.map(item => item.decommissioned),
          color: (opacity = 1) => `rgba(191, 44, 55, ${opacity})`,
          strokeWidth: 2,
        }
      ],
      legend: ['Acquisitions', 'Decommissioned']
    };
  };

  // Generate bar chart data for officer usage
  const getOfficerUsageData = () => {
    // Add a safety check for topOfficerUsage
    if (!topOfficerUsage || topOfficerUsage.length === 0) {
      return {
        labels: ['No Data'],
        datasets: [{ data: [0] }]
      };
    }
    
    return {
      labels: topOfficerUsage.map(item => item.name),
      datasets: [
        {
          data: topOfficerUsage.map(item => item.assets),
          color: (opacity = 1) => `rgba(0, 51, 102, ${opacity})`,
        }
      ]
    };
  };

  // Generate department allocation data for pie chart
  const getDepartmentAllocationData = () => {
    // Add a safety check for departmentAllocation
    if (!departmentAllocation || departmentAllocation.length === 0) {
      return {
        labels: ['No Data'],
        datasets: [{
          data: [100]
        }]
      };
    }
    
    return {
      labels: departmentAllocation.map(item => item.department),
      datasets: [{
        data: departmentAllocation.map(item => item.allocation)
      }]
    };
  };

  // Export report functionality (mock)
  const exportReport = () => {
    alert('Report exported successfully. File saved to Downloads folder.');
  };

  // Render loading indicator
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={PoliceColors.primary} />
        <Text style={styles.loadingText}>Loading reports data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={PoliceColors.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Analytics & Reports</Text>
          </View>
          <TouchableOpacity onPress={exportReport} style={styles.exportButton}>
            <MaterialCommunityIcons name="file-export-outline" size={20} color={PoliceColors.white} />
            <Text style={styles.exportText}>Export</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Date Range Selector */}
        <View style={styles.filterContainer}>
          <View style={styles.dateSection}>
            <Text style={styles.filterTitle}>Date Range:</Text>
            <View style={styles.dateRangeContainer}>
              <TouchableOpacity 
                style={styles.dateButton} 
                onPress={() => showDatePicker('start')}
              >
                <Text style={styles.dateText}>{formatDate(dateRange.startDate)}</Text>
                <Ionicons name="calendar-outline" size={18} color={PoliceColors.primary} />
              </TouchableOpacity>
              <Text style={styles.dateToText}>to</Text>
              <TouchableOpacity 
                style={styles.dateButton} 
                onPress={() => showDatePicker('end')}
              >
                <Text style={styles.dateText}>{formatDate(dateRange.endDate)}</Text>
                <Ionicons name="calendar-outline" size={18} color={PoliceColors.primary} />
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.reportTypeContainer}>
            <Text style={styles.filterTitle}>Report Type:</Text>
            <SegmentedButtons
              value={reportType}
              onValueChange={setReportType}
              buttons={[
                { value: 'overview', label: 'Overview' },
                { value: 'detailed', label: 'Detailed' },
              ]}
              style={styles.segmentedButtons}
            />
          </View>
        </View>

        {/* Report Selection Menu */}
        <View style={styles.reportSelectionContainer}>
          <Text style={styles.filterTitle}>Selected Report:</Text>
          <TouchableOpacity 
            style={styles.reportSelector} 
            onPress={() => setMenuVisible(true)}
          >
            <Text style={styles.reportSelectorText}>{selectedReport}</Text>
            <Ionicons name="chevron-down" size={20} color={PoliceColors.primary} />
          </TouchableOpacity>
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={{ x: screenWidth / 2, y: 250 }}
            style={styles.menu}
          >
            <Menu.Item onPress={() => { setSelectedReport('Asset Allocation'); setMenuVisible(false); }} title="Asset Allocation" />
            <Menu.Item onPress={() => { setSelectedReport('Maintenance Records'); setMenuVisible(false); }} title="Maintenance Records" />
            <Menu.Item onPress={() => { setSelectedReport('Inventory Trends'); setMenuVisible(false); }} title="Inventory Trends" />
            <Menu.Item onPress={() => { setSelectedReport('Officer Usage'); setMenuVisible(false); }} title="Officer Usage" />
            <Menu.Item onPress={() => { setSelectedReport('Department Allocation'); setMenuVisible(false); }} title="Department Allocation" />
          </Menu>
        </View>

        {/* Insights Summary */}
        <View style={styles.insightsContainer}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="flash" size={18} color={PoliceColors.primary} style={styles.sectionIcon} />
            Key Insights
          </Text>
          <Card style={styles.insightCard}>
            <Card.Content>
              <View style={styles.insightItem}>
                <View style={[styles.insightIcon, { backgroundColor: `${PoliceColors.success}20` }]}>
                  <Ionicons name="trending-up" size={20} color={PoliceColors.success} />
                </View>
                <View style={styles.insightText}>
                  <Text style={styles.insightTitle}>Increased Efficiency</Text>
                  <Text style={styles.insightDescription}>
                    Asset utilization improved by 12% over the last quarter
                  </Text>
                </View>
              </View>
              <Divider style={styles.divider} />
              <View style={styles.insightItem}>
                <View style={[styles.insightIcon, { backgroundColor: `${PoliceColors.warning}20` }]}>
                  <MaterialCommunityIcons name="alert-circle-outline" size={20} color={PoliceColors.warning} />
                </View>
                <View style={styles.insightText}>
                  <Text style={styles.insightTitle}>Maintenance Alert</Text>
                  <Text style={styles.insightDescription}>
                    15% increase in emergency maintenance requests this month
                  </Text>
                </View>
              </View>
              <Divider style={styles.divider} />
              <View style={styles.insightItem}>
                <View style={[styles.insightIcon, { backgroundColor: `${PoliceColors.primary}20` }]}>
                  <FontAwesome5 name="map-marker-alt" size={18} color={PoliceColors.primary} />
                </View>
                <View style={styles.insightText}>
                  <Text style={styles.insightTitle}>Allocation Imbalance</Text>
                  <Text style={styles.insightDescription}>
                    North sector has 23% fewer devices than required by staffing
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        </View>

        {/* Charts */}
        <View style={styles.chartsContainer}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="bar-chart" size={18} color={PoliceColors.primary} style={styles.sectionIcon} />
            {selectedReport} Report
          </Text>

          {selectedReport === 'Asset Allocation' && (
            <Card style={styles.chartCard}>
              <Card.Content>
                <Text style={styles.chartTitle}>Asset Distribution by Type</Text>
                <Text style={styles.chartSubtitle}>Total Assets: 1,245</Text>
                <View style={styles.chartContainer}>
                  <PieChart
                    data={getPieChartData()}
                    width={screenWidth - 40}
                    height={220}
                    chartConfig={chartConfig}
                    accessor="count"
                    backgroundColor="transparent"
                    paddingLeft="10"
                    center={[10, 0]}
                    absolute
                  />
                </View>
                <View style={styles.legendContainer}>
                  {assetAllocation.map((item, index) => (
                    <View key={index} style={styles.legendItem}>
                      <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                      <Text style={styles.legendText}>{item.category}: {item.count}</Text>
                    </View>
                  ))}
                </View>
              </Card.Content>
            </Card>
          )}

          {selectedReport === 'Maintenance Records' && (
            <Card style={styles.chartCard}>
              <Card.Content>
                <Text style={styles.chartTitle}>Maintenance Activity</Text>
                <Text style={styles.chartSubtitle}>Planned vs Emergency</Text>
                <View style={styles.chartContainer}>
                  <LineChart
                    data={getMaintenanceChartData()}
                    width={screenWidth - 40}
                    height={220}
                    chartConfig={chartConfig}
                    bezier
                    style={styles.lineChart}
                  />
                </View>
                <View style={styles.chartSummary}>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Total Planned:</Text>
                    <Text style={styles.summaryValue}>183</Text>
                  </View>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Total Emergency:</Text>
                    <Text style={styles.summaryValue}>64</Text>
                  </View>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Average Monthly:</Text>
                    <Text style={styles.summaryValue}>41.2</Text>
                  </View>
                </View>
              </Card.Content>
            </Card>
          )}

          {selectedReport === 'Inventory Trends' && (
            <Card style={styles.chartCard}>
              <Card.Content>
                <Text style={styles.chartTitle}>Inventory Flow</Text>
                <Text style={styles.chartSubtitle}>Acquisitions vs Decommissioned</Text>
                <View style={styles.chartContainer}>
                  <LineChart
                    data={getInventoryTrendData()}
                    width={screenWidth - 40}
                    height={220}
                    chartConfig={{
                      ...chartConfig,
                      color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    }}
                    bezier
                    style={styles.lineChart}
                  />
                </View>
                <View style={styles.chipContainer}>
                  <Chip 
                    style={[styles.chip, { backgroundColor: `${PoliceColors.success}20` }]} 
                    textStyle={{ color: PoliceColors.success }}
                  >
                    Net Gain: 47 Assets
                  </Chip>
                  <Chip 
                    style={[styles.chip, { backgroundColor: `${PoliceColors.primary}20` }]} 
                    textStyle={{ color: PoliceColors.primary }}
                  >
                    18.7% Growth
                  </Chip>
                </View>
              </Card.Content>
            </Card>
          )}

          {selectedReport === 'Officer Usage' && (
            <Card style={styles.chartCard}>
              <Card.Content>
                <Text style={styles.chartTitle}>Top Officers by Asset Usage</Text>
                <Text style={styles.chartSubtitle}>Number of Assigned Equipment</Text>
                <View style={styles.chartContainer}>
                  <BarChart
                    data={getOfficerUsageData()}
                    width={screenWidth - 40}
                    height={220}
                    yAxisLabel=""
                    chartConfig={chartConfig}
                    verticalLabelRotation={30}
                    fromZero
                    style={styles.barChart}
                  />
                </View>
                <View style={styles.chartNote}>
                  <Ionicons name="information-circle" size={18} color={PoliceColors.textLight} />
                  <Text style={styles.noteText}>
                    Special task force officers typically utilize more equipment
                  </Text>
                </View>
              </Card.Content>
            </Card>
          )}

          {selectedReport === 'Department Allocation' && (
            <Card style={styles.chartCard}>
              <Card.Content>
                <Text style={styles.chartTitle}>Equipment Allocation by Department</Text>
                <Text style={styles.chartSubtitle}>Percentage of Total Inventory</Text>
                <View style={styles.chartContainer}>
                  <PieChart
                    data={getDepartmentAllocationData()}
                    width={screenWidth - 40}
                    height={220}
                    chartConfig={chartConfig}
                    accessor="population"
                    backgroundColor="transparent"
                    paddingLeft="10"
                    absolute
                  />
                </View>
                <View style={styles.departmentLegend}>
                  {departmentAllocation.map((item, index) => (
                    <View key={index} style={styles.deptItem}>
                      <View style={[styles.deptColor, { backgroundColor: PoliceColors.chartColors[index] }]} />
                      <Text style={styles.deptName}>{item.department}</Text>
                      <Text style={styles.deptValue}>{item.allocation}%</Text>
                    </View>
                  ))}
                </View>
              </Card.Content>
            </Card>
          )}
        </View>

        {/* Actions Section */}
        <View style={styles.actionsContainer}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="options" size={18} color={PoliceColors.primary} style={styles.sectionIcon} />
            Report Actions
          </Text>
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity style={styles.actionButton} onPress={exportReport}>
              <Ionicons name="download-outline" size={24} color={PoliceColors.white} />
              <Text style={styles.actionButtonText}>Export PDF</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, styles.secondaryButton]}>
              <Ionicons name="mail-outline" size={24} color={PoliceColors.primary} />
              <Text style={styles.secondaryButtonText}>Email Report</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, styles.outlineButton]}>
              <Ionicons name="print-outline" size={24} color={PoliceColors.primary} />
              <Text style={styles.secondaryButtonText}>Print</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Date Picker Modal */}
      <DatePickerModal
        locale="en"
        mode="single"
        visible={visibleDatePicker}
        onDismiss={onDismissSingle}
        date={datePickerMode === 'start' ? dateRange.startDate : dateRange.endDate}
        onConfirm={onConfirmSingle}
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
    color: PoliceColors.primary,
    fontSize: 16,
  },
  
  // Header styles
  headerContainer: {
    backgroundColor: PoliceColors.primary,
    paddingTop: Platform.OS === 'ios' ? 50 : 25,
    paddingBottom: 15,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: PoliceColors.white,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  exportText: {
    color: PoliceColors.white,
    fontSize: 14,
    marginLeft: 5,
  },
  
  // Filter section styles
  filterContainer: {
    backgroundColor: PoliceColors.white,
    padding: 15,
    marginBottom: 10,
  },
  dateSection: {
    marginBottom: 15,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: PoliceColors.text,
    marginBottom: 8,
  },
  dateRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: PoliceColors.lightGray,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
  },
  dateText: {
    fontSize: 14,
    color: PoliceColors.text,
  },
  dateToText: {
    marginHorizontal: 10,
    color: PoliceColors.textLight,
  },
  reportTypeContainer: {
    marginTop: 5,
  },
  segmentedButtons: {
    marginTop: 5,
  },
  
  // Report selection styles
  reportSelectionContainer: {
    backgroundColor: PoliceColors.white,
    padding: 15,
    marginBottom: 10,
  },
  reportSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: PoliceColors.lightGray,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
  },
  reportSelectorText: {
    fontSize: 15,
    color: PoliceColors.text,
    fontWeight: '500',
  },
  menu: {
    marginTop: 60,
  },
  
  // Insights section
  insightsContainer: {
    marginTop: 5,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 20,
    marginTop: 15,
    marginBottom: 10,
    color: PoliceColors.text,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionIcon: {
    marginRight: 8,
  },
  insightCard: {
    marginHorizontal: 20,
    borderRadius: 12,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  insightIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  insightText: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
    color: PoliceColors.text,
  },
  insightDescription: {
    fontSize: 14,
    color: PoliceColors.textLight,
  },
  divider: {
    marginVertical: 5,
  },
  
  // Charts section
  chartsContainer: {
    marginTop: 5,
    marginBottom: 10,
  },
  chartCard: {
    marginHorizontal: 20,
    borderRadius: 12,
    marginBottom: 15,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: PoliceColors.text,
  },
  chartSubtitle: {
    fontSize: 14,
    color: PoliceColors.textLight,
    marginBottom: 15,
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  lineChart: {
    borderRadius: 12,
  },
  barChart: {
    borderRadius: 12,
  },
  chartSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 13,
    color: PoliceColors.textLight,
    marginBottom: 5,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: PoliceColors.text,
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
    marginBottom: 8,
    width: '45%',
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: PoliceColors.text,
  },
  chipContainer: {
    flexDirection: 'row',
    marginTop: 5,
  },
  chip: {
    marginRight: 10,
  },
  chartNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PoliceColors.lightGray,
    padding: 10,
    borderRadius: 8,
    marginTop: 5,
  },
  noteText: {
    fontSize: 13,
    color: PoliceColors.textLight,
    marginLeft: 8,
    flex: 1,
  },
  departmentLegend: {
    marginTop: 10,
  },
  deptItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  deptColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  deptName: {
    fontSize: 14,
    color: PoliceColors.text,
    flex: 1,
  },
  deptValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: PoliceColors.text,
  },
  
  // Actions section
  actionsContainer: {
    marginBottom: 30,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  actionButton: {
    backgroundColor: PoliceColors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 0.31,
    flexDirection: 'column',
  },
  actionButtonText: {
    color: PoliceColors.white,
    fontWeight: '600',
    marginTop: 8,
    fontSize: 13,
    textAlign: 'center',
  },
  secondaryButton: {
    backgroundColor: PoliceColors.lightBlue,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: PoliceColors.primary,
  },
  secondaryButtonText: {
    color: PoliceColors.primary,
    fontWeight: '600',
    marginTop: 8,
    fontSize: 13,
    textAlign: 'center',
  }
});