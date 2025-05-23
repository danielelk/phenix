// src/screens/adherents/AdherentsScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Searchbar, Card, Avatar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { createStackNavigator } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, fonts } from '../../styles/theme';
import api from '../../services/api';
import ParticipantDetailsScreen from './ParticipantDetailsScreen';

const Stack = createStackNavigator();

interface Adherent {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  medical_notes?: string;
}

const AdherentsListScreen = () => {
  const [adherents, setAdherents] = useState<Adherent[]>([]);
  const [filteredAdherents, setFilteredAdherents] = useState<Adherent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigation = useNavigation();

  useEffect(() => {
    fetchAdherents();
  }, []);

  useEffect(() => {
    filterAdherents();
  }, [searchQuery, adherents]);

  const fetchAdherents = async () => {
    try {
      const response = await api.get('/users/adherents');
      setAdherents(response.data.data.adherents || []);
    } catch (error) {
      console.error('Error fetching adherents:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterAdherents = () => {
    if (!searchQuery) {
      setFilteredAdherents(adherents);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = adherents.filter(
      (adherent) =>
        adherent.first_name.toLowerCase().includes(query) ||
        adherent.last_name.toLowerCase().includes(query) ||
        adherent.email.toLowerCase().includes(query)
    );
    setFilteredAdherents(filtered);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchAdherents();
  };

  const renderAdherent = ({ item }: { item: Adherent }) => {
    const initials = `${item.first_name[0]}${item.last_name[0]}`;

    return (
      <TouchableOpacity
        onPress={() => 
          navigation.navigate('ParticipantDetails', { participant: item })
        }
      >
        <Card style={styles.adherentCard}>
          <Card.Content>
            <View style={styles.adherentRow}>
              <Avatar.Text 
                size={48} 
                label={initials} 
                style={styles.avatar}
              />
              <View style={styles.adherentInfo}>
                <Text style={styles.adherentName}>
                  {item.last_name} {item.first_name}
                </Text>
                <Text style={styles.adherentEmail}>{item.email}</Text>
                {item.phone && (
                  <View style={styles.phoneRow}>
                    <MaterialCommunityIcons 
                      name="phone" 
                      size={14} 
                      color={colors.textLight} 
                    />
                    <Text style={styles.adherentPhone}>{item.phone}</Text>
                  </View>
                )}
              </View>
              <MaterialCommunityIcons 
                name="chevron-right" 
                size={24} 
                color={colors.textLight} 
              />
            </View>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Rechercher un adhérent..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />

      <FlatList
        data={filteredAdherents}
        renderItem={renderAdherent}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons 
              name="account-group-outline" 
              size={64} 
              color={colors.textMuted} 
            />
            <Text style={styles.emptyText}>
              {searchQuery ? 'Aucun adhérent trouvé' : 'Aucun adhérent'}
            </Text>
          </View>
        }
      />
    </View>
  );
};

const AdherentsScreen = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="AdherentsList" component={AdherentsListScreen} />
      <Stack.Screen 
        name="ParticipantDetails" 
        component={ParticipantDetailsScreen}
        options={{ 
          headerShown: true,
          title: 'Détails de l\'adhérent',
          headerStyle: {
            backgroundColor: colors.primary,
          },
          headerTintColor: colors.backgroundLight,
        }}
      />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchBar: {
    margin: spacing.md,
    elevation: 2,
  },
  listContainer: {
    paddingBottom: spacing.xl,
  },
  adherentCard: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.backgroundLight,
  },
  adherentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: colors.primary,
    marginRight: spacing.md,
  },
  adherentInfo: {
    flex: 1,
  },
  adherentName: {
    fontSize: fonts.md,
    fontWeight: '600',
    color: colors.text,
  },
  adherentEmail: {
    fontSize: fonts.sm,
    color: colors.textLight,
    marginTop: spacing.xs,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    gap: spacing.xs,
  },
  adherentPhone: {
    fontSize: fonts.sm,
    color: colors.textLight,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: fonts.md,
    color: colors.textMuted,
    marginTop: spacing.md,
  },
});

export default AdherentsScreen;