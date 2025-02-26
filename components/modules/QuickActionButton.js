// src/components/modules/QuickActionButton.js
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const QuickActionButton = ({ icon, text, onPress }) => {
  return (
    <TouchableOpacity style={styles.quickActionButton} onPress={onPress}>
      <Icon name={icon} size={22} color="#fff" />
      <Text style={styles.quickActionText}>{text}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a237e',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  quickActionText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: '500',
  },
});

export default QuickActionButton;