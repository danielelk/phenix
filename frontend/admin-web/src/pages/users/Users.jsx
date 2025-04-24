import React, { useState, useEffect } from "react";
import styles from "./Users.module.css";
import { FiPlus, FiSearch, FiEdit, FiTrash2, FiFilter } from "react-icons/fi";
import { toast } from "react-toastify";
import userService from "../../services/users";
import UserForm from "../../components/users/UserForm";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  // Fetch users on component mount and when pagination, search or filter changes
  useEffect(() => {
    fetchUsers();
  }, [pagination.page, pagination.limit, searchTerm, filter]);

  // Fetch users from API
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm || undefined,
        role: filter !== "all" ? filter : undefined,
      };

      const response = await userService.getUsers(params);

      // Check if response has the expected structure
      console.log("API Response:", response); // Debug

      setUsers(response?.data?.users || []);

      // Safely update pagination if it exists in the response
      if (response?.pagination) {
        setPagination((prev) => ({
          ...prev,
          total: response.pagination.total || 0,
          pages: response.pagination.pages || 0,
        }));
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Erreur lors du chargement des utilisateurs");
    } finally {
      setLoading(false);
    }
  };

  // Handle user form submission (create/update)
  const handleUserSubmit = async (userData) => {
    try {
      if (currentUser) {
        // Update existing user
        await userService.updateUser(currentUser.id, userData);
        toast.success("Utilisateur mis à jour avec succès");
      } else {
        // Create new user
        await userService.createUser(userData);
        toast.success("Utilisateur créé avec succès");
      }

      setShowForm(false);
      fetchUsers();
    } catch (error) {
      console.error("Error saving user:", error);
      toast.error("Erreur lors de l'enregistrement de l'utilisateur");
    }
  };

  // Open form to create new user
  const handleAddUser = () => {
    setCurrentUser(null);
    setShowForm(true);
  };

  // Open form to edit user
  const handleEditUser = (user) => {
    setCurrentUser(user);
    setShowForm(true);
  };

  // Show delete confirmation
  const handleDeleteUser = (user) => {
    setConfirmDelete(user);
  };

  // Cancel delete
  const handleCancelDelete = () => {
    setConfirmDelete(null);
  };

  // Confirm delete
  const handleConfirmDelete = async () => {
    if (!confirmDelete) return;

    try {
      await userService.deleteUser(confirmDelete.id);
      setConfirmDelete(null);
      fetchUsers();
      toast.success("Utilisateur supprimé avec succès");
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Erreur lors de la suppression de l'utilisateur");
    }
  };

  // Role display mapping
  const getRoleDisplay = (role) => {
    switch (role) {
      case "admin":
        return "Administrateur";
      case "accompagnateur":
        return "Accompagnateur";
      case "adherent":
        return "Adhérent";
      case "benevole":
        return "Bénévole";
      default:
        return role;
    }
  };

  return (
    <div className={styles.usersPage}>
      <div className={styles.pageHeader}>
        <h2>Gestion des utilisateurs</h2>
        <button
          className={`btn btn-primary ${styles.addButton}`}
          onClick={handleAddUser}
        >
          <FiPlus size={18} /> Ajouter un utilisateur
        </button>
      </div>

      <div className={styles.filters}>
        <div className={styles.searchBar}>
          <FiSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Rechercher un utilisateur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.roleFilter}>
          <FiFilter className={styles.filterIcon} />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">Tous les rôles</option>
            <option value="admin">Administrateurs</option>
            <option value="accompagnateur">Accompagnateurs</option>
            <option value="adherent">Adhérents</option>
            <option value="benevole">Bénévoles</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className={styles.loading}>Chargement des utilisateurs...</div>
      ) : (
        <>
          <div className={styles.tableContainer}>
            <table className={styles.usersTable}>
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Email</th>
                  <th>Téléphone</th>
                  <th>Rôle</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="5" className={styles.noResults}>
                      Aucun utilisateur trouvé
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id}>
                      <td>
                        {user.last_name} {user.first_name}
                      </td>
                      <td>{user.email}</td>
                      <td>{user.phone || "-"}</td>
                      <td>{getRoleDisplay(user.role)}</td>
                      <td className={styles.actions}>
                        <button
                          className={styles.actionButton}
                          onClick={() => handleEditUser(user)}
                          title="Modifier"
                        >
                          <FiEdit size={18} />
                        </button>
                        <button
                          className={`${styles.actionButton} ${styles.deleteButton}`}
                          onClick={() => handleDeleteUser(user)}
                          title="Supprimer"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className={styles.pagination}>
            <button
              className={styles.pageButton}
              disabled={pagination.page <= 1}
              onClick={() =>
                setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
              }
            >
              Précédent
            </button>
            <span className={styles.pageInfo}>
              Page {pagination.page} sur {Math.max(1, pagination.pages)}
            </span>
            <button
              className={styles.pageButton}
              disabled={pagination.page >= pagination.pages}
              onClick={() =>
                setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
              }
            >
              Suivant
            </button>
          </div>
        </>
      )}

      {showForm && (
        <div className={styles.formOverlay}>
          <div className={styles.formContainer}>
            <UserForm
              user={currentUser}
              onSubmit={handleUserSubmit}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className={styles.confirmOverlay}>
          <div className={styles.confirmDialog}>
            <h3>Confirmer la suppression</h3>
            <p>
              Êtes-vous sûr de vouloir supprimer l'utilisateur{" "}
              {confirmDelete.last_name} {confirmDelete.first_name} ?
            </p>
            <div className={styles.confirmButtons}>
              <button
                className={`btn ${styles.cancelButton}`}
                onClick={handleCancelDelete}
              >
                Annuler
              </button>
              <button
                className={`btn btn-primary ${styles.confirmButton}`}
                onClick={handleConfirmDelete}
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
