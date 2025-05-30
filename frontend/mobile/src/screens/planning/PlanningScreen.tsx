import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Card, FAB } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { format, addDays, startOfWeek, parseISO, addWeeks } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { colors, spacing, fonts } from '../../styles/theme';
import api from '../../services/api';

interface Activity {
  id: number;
  title: string;
  start_date: string;
  end_date: string;
  location: string;
  type: string;
  participant_count?: number;
  max_participants?: number;
  transport_available: boolean;
  transport_capacity?: number;
}

const getActivityColor = (type: string) => {
  switch (type) {
    case 'with_adherents':
      return colors.primary;
    case 'without_adherents':
      return colors.secondary;
    case 'br':
      return colors.danger;
    default:
      return colors.textMuted;
  }
};

const getActivityTypeLabel = (type: string) => {
  switch (type) {
    case 'with_adherents':
      return 'Avec adhérents';
    case 'without_adherents':
      return 'Sans adhérents';
    case 'br':
      return 'Bureau Restreint';
    default:
      return type;
  }
};

const PlanningScreen = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState(0);
  const navigation = useNavigation();
  const { user } = useAuth();

  useEffect(() => {
    fetchActivities();
  }, [selectedWeek]);

  const fetchActivities = async () => {
    try {
      const startDate = startOfWeek(addWeeks(new Date(), selectedWeek), { locale: fr });
      const endDate = addDays(startDate, 6); // Only 7 days (one week)

      const response = await api.get('/activities/calendar', {
        params: {
          startDate: format(startDate, 'yyyy-MM-dd'),
          endDate: format(endDate, 'yyyy-MM-dd'),
          accompagnateurId: user?.id, // Filter by current user
        },
      });

      setActivities(response.data.data.activities);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchActivities();
  };

  const groupActivitiesByDay = () => {
    const grouped: { [key: string]: Activity[] } = {};
    
    activities.forEach((activity) => {
      const date = format(parseISO(activity.start_date), 'yyyy-MM-dd');
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(activity);
    });

    return grouped;
  };

  const renderActivity = (activity: Activity) => {
    const startTime = format(parseISO(activity.start_date), 'HH:mm');
    const endTime = format(parseISO(activity.end_date), 'HH:mm');
    const activityColor = getActivityColor(activity.type);

    return (
      <TouchableOpacity
        key={activity.id}
        onPress={() => navigation.navigate('ActivityDetail', { activityId: activity.id })}
      >
        <Card style={[styles.activityCard, { borderLeftColor: activityColor }]}>
          <Card.Content>
            <View style={styles.activityHeader}>
              <Text style={styles.activityTitle}>{activity.title}</Text>
              <Text style={styles.activityTime}>{startTime} - {endTime}</Text>
            </View>
            
            <View style={styles.activityInfo}>
              <View style={styles.infoRow}>
                <MaterialCommunityIcons name="map-marker" size={16} color={colors.textLight} />
                <Text style={styles.infoText}>{activity.location}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <View style={[styles.typeBadge, { backgroundColor: activityColor }]}>
                  <Text style={styles.typeText}>{getActivityTypeLabel(activity.type)}</Text>
                </View>
              </View>
              
              {activity.type === 'with_adherents' && (
                <View style={styles.infoRow}>
                  <MaterialCommunityIcons name="account-group" size={16} color={colors.textLight} />
                  <Text style={styles.infoText}>
                    {activity.participant_count || 0}
                    {activity.max_participants ? `/${activity.max_participants}` : ''} participants
                  </Text>
                </View>
              )}
              
              {activity.transport_available && (
                <View style={styles.infoRow}>
                  <MaterialCommunityIcons name="bus" size={16} color={colors.textLight} />
                  <Text style={styles.infoText}>
                    Transport: {activity.transport_capacity} places
                  </Text>
                </View>
              )}
            </View>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  const groupedActivities = groupActivitiesByDay();
  const weekStart = startOfWeek(addWeeks(new Date(), selectedWeek), { locale: fr });

  const getWeekTitle = () => {
    if (selectedWeek === 0) return 'Cette semaine';
    if (selectedWeek === 1) return 'Semaine prochaine';
    return format(weekStart, "'Semaine du' d MMMM", { locale: fr });
  };

  return (
    <View style={styles.container}>
      <View style={styles.weekSelector}>
        <TouchableOpacity
          onPress={() => setSelectedWeek(selectedWeek - 1)}
          style={styles.weekButton}
        >
          <MaterialCommunityIcons name="chevron-left" size={24} color={colors.primary} />
        </TouchableOpacity>
        
        <Text style={styles.weekText}>{getWeekTitle()}</Text>
        
        <TouchableOpacity
          onPress={() => setSelectedWeek(selectedWeek + 1)}
          style={styles.weekButton}
        >
          <MaterialCommunityIcons name="chevron-right" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {[...Array(7)].map((_, index) => {
          const currentDate = addDays(weekStart, index);
          const dateKey = format(currentDate, 'yyyy-MM-dd');
          const dayActivities = groupedActivities[dateKey] || [];

          return (
            <View key={dateKey} style={styles.dayContainer}>
              <Text style={styles.dayHeader}>
                {format(currentDate, 'EEEE d MMMM', { locale: fr })}
              </Text>
              
              {dayActivities.length > 0 ? (
                dayActivities.map(renderActivity)
              ) : (
                <Text style={styles.noActivities}>Aucune activité prévue</Text>
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  weekSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.backgroundLight,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  weekButton: {
    padding: spacing.sm,
  },
  weekText: {
    fontSize: fonts.md,
    fontWeight: '600',
    color: colors.text,
  },
  dayContainer: {
    marginBottom: spacing.lg,
  },
  dayHeader: {
    fontSize: fonts.md,
    fontWeight: '600',
    color: colors.text,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.backgroundDark,
    textTransform: 'capitalize',
  },
  activityCard: {
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    backgroundColor: colors.backgroundLight,
    borderLeftWidth: 4,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  activityTitle: {
    fontSize: fonts.md,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  activityTime: {
    fontSize: fonts.sm,
    color: colors.primary,
    fontWeight: '600',
  },
  activityInfo: {
    gap: spacing.xs,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  infoText: {
    fontSize: fonts.sm,
    color: colors.textLight,
  },
  typeBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 12,
  },
  typeText: {
    fontSize: fonts.sm,
    color: colors.backgroundLight,
    fontWeight: '600',
  },
  noActivities: {
    fontSize: fonts.sm,
    color: colors.textMuted,
    fontStyle: 'italic',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
});

export default PlanningScreen;