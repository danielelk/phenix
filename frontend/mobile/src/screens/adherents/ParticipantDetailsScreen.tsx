import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Linking,
  TouchableOpacity,
} from 'react-native';
import { Card, List, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';
import { colors, spacing, fonts } from '../../styles/theme';

interface Participant {
  id: number;
  first_name: string;
  last_name: string;
  phone?: string;
  email?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  medical_notes?: string;
}

const ParticipantDetailsScreen = () => {
  const route = useRoute();
  const { participant } = route.params as { participant: Participant };

  const handleCall = (phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleEmail = (email: string) => {
    Linking.openURL(`mailto:${email}`);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {participant.first_name[0]}{participant.last_name[0]}
              </Text>
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.name}>
                {participant.first_name} {participant.last_name}
              </Text>
              <Text style={styles.role}>Adhérent</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <List.Section>
          <List.Subheader>Informations de contact</List.Subheader>
          
          {participant.phone && (
            <TouchableOpacity onPress={() => handleCall(participant.phone!)}>
              <List.Item
                title="Téléphone"
                description={participant.phone}
                left={(props) => <List.Icon {...props} icon="phone" />}
                right={(props) => 
                  <MaterialCommunityIcons 
                    name="phone-forward" 
                    size={24} 
                    color={colors.primary} 
                  />
                }
              />
            </TouchableOpacity>
          )}
          
          {participant.email && (
            <TouchableOpacity onPress={() => handleEmail(participant.email!)}>
              <List.Item
                title="Email"
                description={participant.email}
                left={(props) => <List.Icon {...props} icon="email" />}
                right={(props) => 
                  <MaterialCommunityIcons 
                    name="email-send" 
                    size={24} 
                    color={colors.primary} 
                  />
                }
              />
            </TouchableOpacity>
          )}
        </List.Section>
      </Card>

      {participant.emergency_contact_name && (
        <Card style={styles.card}>
          <List.Section>
            <List.Subheader>Contact d'urgence</List.Subheader>
            
            <List.Item
              title={participant.emergency_contact_name}
              description="Personne à contacter"
              left={(props) => <List.Icon {...props} icon="account-alert" />}
            />
            
            {participant.emergency_contact_phone && (
              <TouchableOpacity 
                onPress={() => handleCall(participant.emergency_contact_phone!)}
              >
                <List.Item
                  title="Téléphone d'urgence"
                  description={participant.emergency_contact_phone}
                  left={(props) => <List.Icon {...props} icon="phone" />}
                  right={(props) => 
                    <MaterialCommunityIcons 
                      name="phone-forward" 
                      size={24} 
                      color={colors.danger} 
                    />
                  }
                />
              </TouchableOpacity>
            )}
          </List.Section>
        </Card>
      )}

      {participant.medical_notes && (
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Informations médicales</Text>
            <Divider style={styles.divider} />
            <View style={styles.medicalNotesContainer}>
              <MaterialCommunityIcons 
                name="medical-bag" 
                size={20} 
                color={colors.danger} 
                style={styles.medicalIcon}
              />
              <Text style={styles.medicalNotes}>{participant.medical_notes}</Text>
            </View>
          </Card.Content>
        </Card>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  card: {
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    backgroundColor: colors.backgroundLight,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    fontSize: fonts.xl,
    fontWeight: 'bold',
    color: colors.backgroundLight,
  },
  headerInfo: {
    flex: 1,
  },
  name: {
    fontSize: fonts.xl,
    fontWeight: 'bold',
    color: colors.text,
  },
  role: {
    fontSize: fonts.md,
    color: colors.textLight,
    marginTop: spacing.xs,
  },
  sectionTitle: {
    fontSize: fonts.lg,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  divider: {
    marginBottom: spacing.md,
  },
  medicalNotesContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(220, 53, 69, 0.05)',
    padding: spacing.md,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.danger,
  },
  medicalIcon: {
    marginRight: spacing.sm,
    marginTop: 2,
  },
  medicalNotes: {
    flex: 1,
    fontSize: fonts.md,
    color: colors.text,
    lineHeight: 22,
  },
});

export default ParticipantDetailsScreen;