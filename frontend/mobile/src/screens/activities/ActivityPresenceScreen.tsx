import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { 
  Card, 
  Button, 
  FAB, 
  TextInput,
  Portal,
  Modal,
  List,
  Chip
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { colors, spacing, fonts } from '../../styles/theme';
import api from '../../services/api';

interface Participant {
  id: number;
  first_name: string;
  last_name: string;
  present?: boolean;
}

interface ManualParticipant {
  first_name: string;
  last_name: string;
  phone?: string;
  present: boolean;
  temporary: boolean;
}

const ActivityPresenceScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { activityId, participants: initialParticipants } = route.params as { 
    activityId: number; 
    participants: Participant[] 
  };

  const [participants, setParticipants] = useState<Participant[]>(
    initialParticipants.map(p => ({ ...p, present: false }))
  );
  const [manualParticipants, setManualParticipants] = useState<ManualParticipant[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newParticipant, setNewParticipant] = useState({
    first_name: '',
    last_name: '',
    phone: '',
  });
  const [saving, setSaving] = useState(false);

  const togglePresence = (participantId: number) => {
    setParticipants(prev =>
      prev.map(p =>
        p.id === participantId ? { ...p, present: !p.present } : p
      )
    );
  };

  const toggleManualPresence = (index: number) => {
    setManualParticipants(prev =>
      prev.map((p, i) =>
        i === index ? { ...p, present: !p.present } : p
      )
    );
  };

  const handleAddManualParticipant = () => {
    if (!newParticipant.first_name || !newParticipant.last_name) {
      Alert.alert('Erreur', 'Le nom et le prénom sont obligatoires');
      return;
    }

    setManualParticipants(prev => [
      ...prev,
      {
        ...newParticipant,
        temporary: true,
        present: true,
      },
    ]);

    setNewParticipant({ first_name: '', last_name: '', phone: '' });
    setShowAddModal(false);
  };

  const removeManualParticipant = (index: number) => {
    Alert.alert(
      'Confirmation',
      'Supprimer ce participant ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            setManualParticipants(prev => prev.filter((_, i) => i !== index));
          },
        },
      ]
    );
  };

  const savePresence = async () => {
    setSaving(true);
    try {
      const presenceData = participants.map(p => ({
        userId: p.id,
        present: p.present || false,
      }));

      const manualData = manualParticipants.map(p => ({
        firstName: p.first_name,
        lastName: p.last_name,
        phone: p.phone,
        present: p.present || false,
        temporary: true,
      }));

      await api.post(`/activities/${activityId}/presence`, {
        participants: presenceData,
        manualParticipants: manualData,
      });

      Alert.alert('Succès', 'Présence enregistrée avec succès');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'enregistrer la présence');
    } finally {
      setSaving(false);
    }
  };

  const presentCount = participants.filter(p => p.present).length + 
                      manualParticipants.filter(p => p.present).length;
  const totalCount = participants.length + manualParticipants.length;

  const renderParticipant = (participant: Participant) => (
    <TouchableOpacity
      key={participant.id}
      onPress={() => togglePresence(participant.id)}
      style={[
        styles.participantItem,
        participant.present && styles.participantItemPresent
      ]}
    >
      <View style={styles.participantInfo}>
        <Text style={[
          styles.participantName,
          participant.present && styles.participantNamePresent
        ]}>
          {participant.last_name} {participant.first_name}
        </Text>
        <Chip 
          mode={participant.present ? 'flat' : 'outlined'}
          style={[
            styles.statusChip,
            participant.present ? styles.presentChip : styles.absentChip
          ]}
          textStyle={[
            styles.statusChipText,
            participant.present ? styles.presentChipText : styles.absentChipText
          ]}
        >
          {participant.present ? 'Présent' : 'Absent'}
        </Chip>
      </View>
      <MaterialCommunityIcons 
        name={participant.present ? "account-check" : "account-outline"} 
        size={24} 
        color={participant.present ? colors.success : colors.textMuted} 
      />
    </TouchableOpacity>
  );

  const renderManualParticipant = (participant: ManualParticipant, index: number) => (
    <TouchableOpacity
      key={index}
      onPress={() => toggleManualPresence(index)}
      style={[
        styles.participantItem,
        participant.present && styles.participantItemPresent
      ]}
    >
      <View style={styles.participantInfo}>
        <Text style={[
          styles.participantName,
          participant.present && styles.participantNamePresent
        ]}>
          {participant.last_name} {participant.first_name}
        </Text>
        {participant.phone && (
          <Text style={styles.participantPhone}>{participant.phone}</Text>
        )}
        <Chip 
          mode={participant.present ? 'flat' : 'outlined'}
          style={[
            styles.statusChip,
            participant.present ? styles.presentChip : styles.absentChip
          ]}
          textStyle={[
            styles.statusChipText,
            participant.present ? styles.presentChipText : styles.absentChipText
          ]}
        >
          {participant.present ? 'Présent' : 'Absent'}
        </Chip>
      </View>
      <TouchableOpacity onPress={() => removeManualParticipant(index)}>
        <MaterialCommunityIcons
          name="close-circle"
          size={24}
          color={colors.danger}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Card style={styles.summaryCard}>
        <Card.Content>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Présents</Text>
            <Text style={styles.summaryValue}>
              {presentCount} / {totalCount}
            </Text>
          </View>
        </Card.Content>
      </Card>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Card style={styles.card}>
          <Card.Title 
            title="Participants inscrits" 
            titleStyle={styles.cardTitle}
          />
          <Card.Content>
            {participants.map(renderParticipant)}
          </Card.Content>
        </Card>

        {manualParticipants.length > 0 && (
          <Card style={styles.card}>
            <Card.Title 
              title="Participants ajoutés manuellement" 
              titleStyle={styles.cardTitle}
            />
            <Card.Content>
              {manualParticipants.map(renderManualParticipant)}
            </Card.Content>
          </Card>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>

      <FAB
        style={styles.fab}
        icon="account-plus"
        onPress={() => setShowAddModal(true)}
      />

      <View style={styles.saveButtonContainer}>
        <Button
          mode="contained"
          onPress={savePresence}
          loading={saving}
          disabled={saving}
          style={styles.saveButton}
        >
          Enregistrer la présence
        </Button>
      </View>

      <Portal>
        <Modal
          visible={showAddModal}
          onDismiss={() => setShowAddModal(false)}
          contentContainerStyle={styles.modal}
        >
          <Text style={styles.modalTitle}>Ajouter un participant</Text>
          
          <TextInput
            label="Prénom *"
            value={newParticipant.first_name}
            onChangeText={(text) => 
              setNewParticipant(prev => ({ ...prev, first_name: text }))
            }
            mode="outlined"
            style={styles.modalInput}
          />
          
          <TextInput
            label="Nom *"
            value={newParticipant.last_name}
            onChangeText={(text) => 
              setNewParticipant(prev => ({ ...prev, last_name: text }))
            }
            mode="outlined"
            style={styles.modalInput}
          />
          
          <TextInput
            label="Téléphone"
            value={newParticipant.phone}
            onChangeText={(text) => 
              setNewParticipant(prev => ({ ...prev, phone: text }))
            }
            mode="outlined"
            keyboardType="phone-pad"
            style={styles.modalInput}
          />
          
          <View style={styles.modalButtons}>
            <Button
              mode="outlined"
              onPress={() => setShowAddModal(false)}
              style={styles.modalButton}
            >
              Annuler
            </Button>
            <Button
              mode="contained"
              onPress={handleAddManualParticipant}
              style={styles.modalButton}
            >
              Ajouter
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
  summaryCard: {
    margin: spacing.md,
    backgroundColor: colors.primary,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: fonts.lg,
    color: colors.backgroundLight,
    fontWeight: '600',
  },
  summaryValue: {
    fontSize: fonts.xxl,
    color: colors.backgroundLight,
    fontWeight: 'bold',
  },
  card: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: colors.backgroundLight,
  },
  cardTitle: {
    fontSize: fonts.md,
    fontWeight: '600',
  },
  participantItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    borderRadius: 8,
    marginBottom: spacing.xs,
  },
  participantItemPresent: {
    backgroundColor: 'rgba(40, 167, 69, 0.1)',
    borderColor: colors.success,
  },
  participantInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  participantName: {
    fontSize: fonts.md,
    color: colors.text,
    flex: 1,
  },
  participantNamePresent: {
    fontWeight: '600',
  },
  participantPhone: {
    fontSize: fonts.sm,
    color: colors.textLight,
    marginTop: spacing.xs,
  },
  statusChip: {
    height: 28,
    marginLeft: spacing.sm,
  },
  statusChipText: {
    fontSize: fonts.sm,
  },
  presentChip: {
    backgroundColor: colors.success,
  },
  presentChipText: {
    color: colors.backgroundLight,
  },
  absentChip: {
    backgroundColor: 'transparent',
    borderColor: colors.textMuted,
  },
  absentChipText: {
    color: colors.textMuted,
  },
  bottomPadding: {
    height: 100,
  },
  fab: {
    position: 'absolute',
    margin: spacing.md,
    right: 0,
    bottom: 80,
    backgroundColor: colors.secondary,
  },
  saveButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.md,
    backgroundColor: colors.backgroundLight,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  saveButton: {
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
    marginBottom: spacing.lg,
  },
  modalInput: {
    marginBottom: spacing.md,
    backgroundColor: colors.backgroundLight,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  modalButton: {
    minWidth: 100,
  },
});

export default ActivityPresenceScreen;