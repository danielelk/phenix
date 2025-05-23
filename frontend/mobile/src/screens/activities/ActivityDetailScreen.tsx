import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { Card, Button, FAB, Chip, Portal, Modal } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useRoute, useNavigation } from '@react-navigation/native';
import { colors, spacing, fonts } from '../../styles/theme';
import api from '../../services/api';

interface Participant {
  id: number;
  first_name: string;
  last_name: string;
  phone?: string;
  needs_transport: boolean;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
}

interface Activity {
  id: number;
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  location: string;
  type: string;
  transport_available: boolean;
  transport_capacity?: number;
  is_paid: boolean;
  price?: number;
  participants: Participant[];
  accompagnateurs: any[];
  status?: 'pending' | 'started' | 'completed';
  started_at?: string;
  completed_at?: string;
}

const ActivityDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { activityId } = route.params as { activityId: number };
  
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [activityStarted, setActivityStarted] = useState(false);
  const [showStartModal, setShowStartModal] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);

  useEffect(() => {
    fetchActivityDetails();
  }, [activityId]);

  const fetchActivityDetails = async () => {
    try {
      const response = await api.get(`/activities/${activityId}`);
      const activityData = response.data.data.activity;
      const participants = response.data.data.participants || [];
      const accompagnateurs = response.data.data.accompagnateurs || [];
      
      setActivity({
        ...activityData,
        participants,
        accompagnateurs,
      });
      
      setActivityStarted(activityData.status === 'started');
    } catch (error) {
      console.error('Error fetching activity details:', error);
      Alert.alert('Erreur', 'Impossible de charger les détails de l\'activité');
    } finally {
      setLoading(false);
    }
  };

  const handleStartActivity = async () => {
    try {
      await api.post(`/activities/${activityId}/start`);
      setActivityStarted(true);
      setShowStartModal(false);
      Alert.alert('Succès', 'L\'activité a démarré');
      fetchActivityDetails();
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de démarrer l\'activité');
    }
  };

  const handleEndActivity = async () => {
    try {
      await api.post(`/activities/${activityId}/complete`);
      setShowEndModal(false);
      Alert.alert('Succès', 'L\'activité est terminée');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de terminer l\'activité');
    }
  };

  const navigateToPresence = () => {
    navigation.navigate('ActivityPresence', { 
      activityId, 
      participants: activity?.participants || [] 
    });
  };

  const navigateToExpenses = () => {
    navigation.navigate('ActivityExpenses', { activityId });
  };

  const navigateToParticipantDetails = (participant: Participant) => {
    navigation.navigate('ParticipantDetails', { participant });
  };

  if (loading || !activity) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Chargement...</Text>
      </View>
    );
  }

  const startTime = format(parseISO(activity.start_date), 'HH:mm');
  const endTime = format(parseISO(activity.end_date), 'HH:mm');
  const date = format(parseISO(activity.start_date), 'EEEE d MMMM yyyy', { locale: fr });

  const transportNeeded = activity.participants.filter(p => p.needs_transport).length;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Card style={styles.mainCard}>
          <Card.Content>
            <Text style={styles.title}>{activity.title}</Text>
            <Text style={styles.date}>{date}</Text>
            <Text style={styles.time}>{startTime} - {endTime}</Text>
            
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="map-marker" size={20} color={colors.textLight} />
              <Text style={styles.infoText}>{activity.location}</Text>
            </View>

            {activity.description && (
              <Text style={styles.description}>{activity.description}</Text>
            )}

            {activityStarted && activity.started_at && (
              <View style={styles.statusBadge}>
                <MaterialCommunityIcons name="play-circle" size={16} color={colors.success} />
                <Text style={styles.statusText}>
                  Démarrée à {format(parseISO(activity.started_at), 'HH:mm')}
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>

        {activity.type === 'with_adherents' && (
          <>
            <Card style={styles.card}>
              <Card.Content>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Participants</Text>
                  <Chip>{activity.participants.length}</Chip>
                </View>

                {activity.participants.map((participant) => (
                  <TouchableOpacity
                    key={participant.id}
                    onPress={() => navigateToParticipantDetails(participant)}
                  >
                    <View style={styles.participantItem}>
                      <View style={styles.participantInfo}>
                        <Text style={styles.participantName}>
                          {participant.last_name} {participant.first_name}
                        </Text>
                        {participant.needs_transport && (
                          <Chip 
                            icon="bus" 
                            style={styles.transportChip}
                            textStyle={styles.transportChipText}
                          >
                            Transport
                          </Chip>
                        )}
                      </View>
                      <MaterialCommunityIcons 
                        name="chevron-right" 
                        size={24} 
                        color={colors.textLight} 
                      />
                    </View>
                  </TouchableOpacity>
                ))}
              </Card.Content>
            </Card>

            {activity.transport_available && (
              <Card style={styles.card}>
                <Card.Content>
                  <Text style={styles.sectionTitle}>Transport</Text>
                  <View style={styles.transportInfo}>
                    <Text style={styles.transportText}>
                      Places disponibles: {activity.transport_capacity}
                    </Text>
                    <Text style={styles.transportText}>
                      Participants nécessitant transport: {transportNeeded}
                    </Text>
                    {transportNeeded > (activity.transport_capacity || 0) && (
                      <View style={styles.warningBadge}>
                        <MaterialCommunityIcons 
                          name="alert" 
                          size={16} 
                          color={colors.warning} 
                        />
                        <Text style={styles.warningText}>
                          Capacité de transport insuffisante
                        </Text>
                      </View>
                    )}
                  </View>
                </Card.Content>
              </Card>
            )}
          </>
        )}

        {activityStarted && (
          <View style={styles.actionButtons}>
            <Button
              mode="contained"
              onPress={navigateToPresence}
              style={[styles.actionButton, { backgroundColor: colors.info }]}
              icon="account-check"
            >
              Gérer la présence
            </Button>
            
            <Button
              mode="contained"
              onPress={navigateToExpenses}
              style={[styles.actionButton, { backgroundColor: colors.secondary }]}
              icon="currency-eur"
            >
              Gérer les dépenses
            </Button>
          </View>
        )}
      </ScrollView>

      {!activityStarted && (
        <FAB
          style={styles.fab}
          icon="play"
          label="Démarrer"
          onPress={() => setShowStartModal(true)}
        />
      )}

      {activityStarted && (
        <FAB
          style={[styles.fab, { backgroundColor: colors.danger }]}
          icon="stop"
          label="Terminer"
          onPress={() => setShowEndModal(true)}
        />
      )}

      <Portal>
        <Modal
          visible={showStartModal}
          onDismiss={() => setShowStartModal(false)}
          contentContainerStyle={styles.modal}
        >
          <Text style={styles.modalTitle}>Démarrer l'activité ?</Text>
          <Text style={styles.modalText}>
            Confirmez-vous le démarrage de l'activité "{activity.title}" ?
          </Text>
          <View style={styles.modalButtons}>
            <Button
              mode="outlined"
              onPress={() => setShowStartModal(false)}
              style={styles.modalButton}
            >
              Annuler
            </Button>
            <Button
              mode="contained"
              onPress={handleStartActivity}
              style={styles.modalButton}
            >
              Démarrer
            </Button>
          </View>
        </Modal>

        <Modal
          visible={showEndModal}
          onDismiss={() => setShowEndModal(false)}
          contentContainerStyle={styles.modal}
        >
          <Text style={styles.modalTitle}>Terminer l'activité ?</Text>
          <Text style={styles.modalText}>
            Confirmez-vous la fin de l'activité "{activity.title}" ?
          </Text>
          <View style={styles.modalButtons}>
            <Button
              mode="outlined"
              onPress={() => setShowEndModal(false)}
              style={styles.modalButton}
            >
              Annuler
            </Button>
            <Button
              mode="contained"
              onPress={handleEndActivity}
              style={styles.modalButton}
              buttonColor={colors.danger}
            >
              Terminer
            </Button>
          </View>
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainCard: {
    margin: spacing.md,
    backgroundColor: colors.backgroundLight,
  },
  card: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: colors.backgroundLight,
  },
  title: {
    fontSize: fonts.xl,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  date: {
    fontSize: fonts.md,
    color: colors.textLight,
    marginBottom: spacing.xs,
    textTransform: 'capitalize',
  },
  time: {
    fontSize: fonts.md,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  infoText: {
    fontSize: fonts.md,
    color: colors.textLight,
  },
  description: {
    fontSize: fonts.md,
    color: colors.text,
    marginTop: spacing.md,
    lineHeight: 22,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
    backgroundColor: colors.backgroundDark,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: fonts.sm,
    color: colors.success,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fonts.lg,
    fontWeight: '600',
    color: colors.text,
  },
  participantItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  participantInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  participantName: {
    fontSize: fonts.md,
    color: colors.text,
  },
  transportChip: {
    height: 24,
    backgroundColor: colors.primaryLight,
  },
  transportChipText: {
    fontSize: 11,
    color: colors.primaryDark,
  },
  transportInfo: {
    gap: spacing.sm,
  },
  transportText: {
    fontSize: fonts.md,
    color: colors.text,
  },
  warningBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 4,
  },
  warningText: {
    fontSize: fonts.sm,
    color: colors.warning,
  },
  actionButtons: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl * 3,
    gap: spacing.sm,
  },
  actionButton: {
    marginBottom: spacing.sm,
  },
  fab: {
    position: 'absolute',
    margin: spacing.md,
    right: 0,
    bottom: 0,
    backgroundColor: colors.primary,
  },
  modal: {
    backgroundColor: colors.backgroundLight,
    padding: spacing.lg,
    margin: spacing.lg,
    borderRadius: 8,
  },
  modalTitle: {
    fontSize: fonts.lg,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.md,
  },
  modalText: {
    fontSize: fonts.md,
    color: colors.textLight,
    marginBottom: spacing.lg,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
  },
  modalButton: {
    minWidth: 100,
  },
});

export default ActivityDetailScreen;