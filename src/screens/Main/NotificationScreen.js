// MyAwesomeShop/src/screens/Main/NotificationsScreen.js
import React from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Text, Appbar, useTheme, List, Divider, Button } from 'react-native-paper'; // Removed Badge for now
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNotifications } from '../../contexts/NotificationsContext';

export default function NotificationsScreen({ navigation }) {
  const theme = useTheme(); // Hook used here
  const {
    notifications,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAllNotifications,
    unreadCount
  } = useNotifications();

  const renderNotificationItem = ({ item }) => (
    <TouchableOpacity onPress={() => !item.read && markAsRead(item.id)}>
      <List.Item
        title={item.title}
        description={item.message}
        descriptionNumberOfLines={2}
        left={props => <List.Icon {...props} icon={item.read ? "email-open-outline" : "email-outline"} color={item.read ? theme.colors.disabled || theme.colors.placeholder : theme.colors.primary} />}
        right={props => (
          <TouchableOpacity onPress={() => clearNotification(item.id)} style={{ justifyContent: 'center', paddingRight: 8}}>
            <MaterialCommunityIcons {...props} name="close-circle-outline" size={24} color={theme.colors.placeholder} />
          </TouchableOpacity>
        )}
        style={[
            styles.listItem,
            { backgroundColor: item.read ? theme.colors.surface : theme.colors.elevation.level2 } // Dynamic style
        ]}
        titleStyle={ item.read ? { color: theme.colors.onSurfaceDisabled } : styles.unreadTitle } // Dynamic style
      />
    </TouchableOpacity>
  );

  // For testing, let's add a button to simulate adding a notification
  const { addNotification } = useNotifications(); // Get addNotification
  const handleTestAddNotification = () => {
    addNotification("Test Notification", `This is a test notification message sent at ${new Date().toLocaleTimeString()}`);
  };


  return (
    <>
      <Appbar.Header>
        <Appbar.Content title={`Notifications (${unreadCount})`} />
        {notifications.length > 0 && (
            <Appbar.Action icon="email-check-outline" onPress={markAllAsRead} disabled={unreadCount === 0} />
        )}
        {notifications.length > 0 && (
             <Appbar.Action icon="delete-sweep-outline" onPress={clearAllNotifications} />
        )}
      </Appbar.Header>
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {/* Test Button - Remove for production */}
        <Button onPress={handleTestAddNotification} mode="contained" style={{margin:10}}>Add Test Notification</Button>

        {notifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="bell-off-outline" size={64} color={theme.colors.placeholder} />
            <Text style={[styles.emptyText, { color: theme.colors.placeholder }]}>No notifications yet.</Text>
          </View>
        ) : (
          <FlatList
            data={notifications}
            renderItem={renderNotificationItem}
            keyExtractor={item => item.id}
            ItemSeparatorComponent={() => <Divider />}
          />
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({ // Styles that don't depend on theme hook
  container: {
    flex: 1,
  },
  listItem: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  unreadTitle: {
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
  },
});