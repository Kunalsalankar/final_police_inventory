// src/components/modules/ModuleCard.js
import React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const ModuleCard = ({ name, icon, description, onPress }) => {
  return (
    <TouchableOpacity style={styles.moduleCard} onPress={onPress}>
      <Icon name={icon} size={36} color="#1a237e" />
      <Text style={styles.moduleName}>{name}</Text>
      <Text style={styles.moduleDescription}>{description}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  moduleCard: {
    width: '31%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  moduleName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 8,
    color: '#333',
  },
  moduleDescription: {
    fontSize: 10,
    textAlign: 'center',
    color: '#757575',
    marginTop: 4,
  },
});

export default ModuleCard;