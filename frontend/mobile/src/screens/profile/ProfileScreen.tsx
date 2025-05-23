import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { Card, List, Button, Avatar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { colors, spacing, fonts } from '../../styles/theme';

const ProfileScreen = () => {
  const { user, signOut } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Déconnexion', 
          style: 'destructive',
          onPress: signOut 
        },
      ]
    );
  };

  if (!user) return null;

  const initials = `${user.firstName[0]}${user.lastName[0]}`;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Card style={styles.profileCard}>
        <Card.Content>
          <View style={styles.profileHeader}>
            <Avatar.Text 
              size={80} 
              label={initials} 
              style={styles.avatar}
            />
            <Text style={styles.name}>
              {user.firstName} {user.lastName}
            </Text>
            <Text style={styles.role}>Accompagnateur</Text>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <List.Section>
          <List.Subheader>Informations du compte</List.Subheader>
          <List.Item
            title="Email"
            description={user.email}
            left={(props) => <List.Icon {...props} icon="email" />}
          />
          <List.Item
            title="Rôle"
            description="Accompagnateur"
            left={(props) => <List.Icon {...props} icon="account-tie" />}
          />
        </List.Section>
      </Card>

      <Card style={styles.card}>
        <List.Section>
          <List.Subheader>Application</List.Subheader>
          <List.Item
            title="Version"
            description="1.0.0"
            left={(props) => <List.Icon {...props} icon="information" />}
          />
          <List.Item
            title="À propos"
            description="Application Phénix Mobile"
            left={(props) => <List.Icon {...props} icon="heart" />}
          />
        </List.Section>
      </Card>

      <View style={styles.logoutContainer}>
        <Button
          mode="contained"
          onPress={handleLogout}
          style={styles.logoutButton}
          buttonColor={colors.danger}
          icon="logout"
        >
          Se déconnecter
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  profileCard: {
    margin: spacing.md,
    backgroundColor: colors.backgroundLight,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  avatar: {
    backgroundColor: colors.primary,
    marginBottom: spacing.md,
  },
  name: {
    fontSize: fonts.xl,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  role: {
    fontSize: fonts.md,
    color: colors.textLight,
  },
  card: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: colors.backgroundLight,
  },
  logoutContainer: {
    padding: spacing.md,
    marginBottom: spacing.xl,
  },
  logoutButton: {
    paddingVertical: spacing.xs,
  },
});

export default ProfileScreen;