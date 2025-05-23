import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { 
  Card, 
  Button, 
  FAB, 
  TextInput,
  Portal,
  Modal,
  List,
  IconButton
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';
import { colors, spacing, fonts } from '../../styles/theme';
import api from '../../services/api';

interface Expense {
  id: number;
  title: string;
  amount: number;
  description?: string;
  created_at: string;
}

const ActivityExpensesScreen = () => {
  const route = useRoute();
  const { activityId } = route.params as { activityId: number };

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newExpense, setNewExpense] = useState({
    title: '',
    amount: '',
    description: '',
  });

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const response = await api.get(`/activities/${activityId}/expenses`);
      setExpenses(response.data.data.expenses || []);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = async () => {
    if (!newExpense.title || !newExpense.amount) {
      Alert.alert('Erreur', 'Le titre et le montant sont obligatoires');
      return;
    }

    const amount = parseFloat(newExpense.amount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Erreur', 'Le montant doit être un nombre positif');
      return;
    }

    setSaving(true);
    try {
      const response = await api.post(`/activities/${activityId}/expenses`, {
        title: newExpense.title,
        amount: amount,
        description: newExpense.description,
      });

      setExpenses(prev => [...prev, response.data.data.expense]);
      setNewExpense({ title: '', amount: '', description: '' });
      setShowAddModal(false);
      Alert.alert('Succès', 'Dépense ajoutée avec succès');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'ajouter la dépense');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteExpense = (expenseId: number) => {
    Alert.alert(
      'Confirmation',
      'Supprimer cette dépense ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/activities/${activityId}/expenses/${expenseId}`);
              setExpenses(prev => prev.filter(e => e.id !== expenseId));
              Alert.alert('Succès', 'Dépense supprimée');
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de supprimer la dépense');
            }
          },
        },
      ]
    );
  };

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <View style={styles.container}>
      <Card style={styles.summaryCard}>
        <Card.Content>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total des dépenses</Text>
            <Text style={styles.summaryValue}>{totalExpenses.toFixed(2)} €</Text>
          </View>
        </Card.Content>
      </Card>

      <ScrollView showsVerticalScrollIndicator={false}>
        {expenses.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content>
              <View style={styles.emptyContainer}>
                <MaterialCommunityIcons 
                  name="currency-eur-off" 
                  size={48} 
                  color={colors.textMuted} 
                />
                <Text style={styles.emptyText}>Aucune dépense enregistrée</Text>
              </View>
            </Card.Content>
          </Card>
        ) : (
          <Card style={styles.card}>
            <Card.Content>
              {expenses.map((expense) => (
                <List.Item
                  key={expense.id}
                  title={expense.title}
                  description={expense.description}
                  left={() => (
                    <View style={styles.amountContainer}>
                      <Text style={styles.amount}>{expense.amount.toFixed(2)} €</Text>
                    </View>
                  )}
                  right={() => (
                    <IconButton
                      icon="delete"
                      iconColor={colors.danger}
                      size={20}
                      onPress={() => handleDeleteExpense(expense.id)}
                    />
                  )}
                  style={styles.listItem}
                />
              ))}
            </Card.Content>
          </Card>
        )}
      </ScrollView>

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => setShowAddModal(true)}
      />

      <Portal>
        <Modal
          visible={showAddModal}
          onDismiss={() => setShowAddModal(false)}
          contentContainerStyle={styles.modal}
        >
          <Text style={styles.modalTitle}>Ajouter une dépense</Text>
          
          <TextInput
            label="Titre *"
            value={newExpense.title}
            onChangeText={(text) => 
              setNewExpense(prev => ({ ...prev, title: text }))
            }
            mode="outlined"
            style={styles.modalInput}
          />
          
          <TextInput
            label="Montant (€) *"
            value={newExpense.amount}
            onChangeText={(text) => 
              setNewExpense(prev => ({ ...prev, amount: text }))
            }
            mode="outlined"
            keyboardType="decimal-pad"
            style={styles.modalInput}
          />
          
          <TextInput
            label="Description"
            value={newExpense.description}
            onChangeText={(text) => 
              setNewExpense(prev => ({ ...prev, description: text }))
            }
            mode="outlined"
            multiline
            numberOfLines={3}
            style={styles.modalInput}
          />
          
          <View style={styles.modalButtons}>
            <Button
              mode="outlined"
              onPress={() => {
                setShowAddModal(false);
                setNewExpense({ title: '', amount: '', description: '' });
              }}
              style={styles.modalButton}
            >
              Annuler
            </Button>
            <Button
              mode="contained"
              onPress={handleAddExpense}
              loading={saving}
              disabled={saving}
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
    backgroundColor: colors.secondary,
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
  emptyCard: {
    marginHorizontal: spacing.md,
    backgroundColor: colors.backgroundLight,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyText: {
    fontSize: fonts.md,
    color: colors.textMuted,
    marginTop: spacing.md,
  },
  listItem: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  amountContainer: {
    justifyContent: 'center',
    minWidth: 80,
  },
  amount: {
    fontSize: fonts.md,
    fontWeight: 'bold',
    color: colors.primary,
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

export default ActivityExpensesScreen;