const db = require("../config/db");
const logger = require("../utils/logger");

/**
 * Transport model - Handle transportation needs for activities
 */
class Transport {
  /**
   * Get transport needs for an activity
   * @param {number} activityId - Activity ID
   * @returns {Promise<Object>} Transport information
   */
  static async getTransportNeeds(activityId) {
    try {
      // Get activity transport information
      const activityQuery = `
        SELECT 
          transport_available,
          transport_capacity
        FROM activities
        WHERE id = $1
      `;

      const { rows: activityRows } = await db.query(activityQuery, [
        activityId,
      ]);

      if (activityRows.length === 0) {
        throw new Error("Activity not found");
      }

      const activityTransport = activityRows[0];

      // If transport is not available for this activity
      if (!activityTransport.transport_available) {
        return {
          transportAvailable: false,
          transportCapacity: 0,
          participantsNeedingTransport: [],
          availableSeats: 0,
          totalParticipantsNeedingTransport: 0,
        };
      }

      // Get participants needing transport
      const participantsQuery = `
        SELECT
          u.id,
          u.first_name,
          u.last_name,
          u.phone,
          u.emergency_contact_name,
          u.emergency_contact_phone
        FROM activity_participants ap
        JOIN users u ON ap.user_id = u.id
        WHERE ap.activity_id = $1 AND ap.needs_transport = true
        ORDER BY u.last_name, u.first_name
      `;

      const { rows: participantsRows } = await db.query(participantsQuery, [
        activityId,
      ]);

      // Get accompagnateurs with vehicles
      const accompagnateursQuery = `
        SELECT
          u.id,
          u.first_name,
          u.last_name,
          u.phone,
          u.is_vehiculed
        FROM activity_accompagnateurs aa
        JOIN users u ON aa.user_id = u.id
        WHERE aa.activity_id = $1 AND u.is_vehiculed = true
        ORDER BY u.last_name, u.first_name
      `;

      const { rows: accompagnateursRows } = await db.query(
        accompagnateursQuery,
        [activityId]
      );

      // Calculate total participants needing transport
      const totalParticipantsNeedingTransport = participantsRows.length;

      // Calculate available seats (base capacity plus vehiculed accompagnateurs)
      // Assuming each accompagnateur with vehicle can take additional participants
      const additionalCapacity = accompagnateursRows.length * 4; // Assuming 4 seats per accompagnateur vehicle
      const availableSeats =
        activityTransport.transport_capacity + additionalCapacity;

      return {
        transportAvailable: true,
        transportCapacity: activityTransport.transport_capacity,
        participantsNeedingTransport: participantsRows,
        accompagnateursWithVehicles: accompagnateursRows,
        availableSeats,
        totalParticipantsNeedingTransport,
        sufficientCapacity: availableSeats >= totalParticipantsNeedingTransport,
      };
    } catch (error) {
      logger.error(
        `Error getting transport needs for activity ${activityId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Update participant's transport need
   * @param {number} activityId - Activity ID
   * @param {number} userId - User ID
   * @param {boolean} needsTransport - Whether participant needs transport
   * @returns {Promise<Object>} Updated participant
   */
  static async updateTransportNeed(activityId, userId, needsTransport) {
    try {
      // Check if user is a participant in the activity
      const checkQuery = `
        SELECT id FROM activity_participants
        WHERE activity_id = $1 AND user_id = $2
      `;

      const { rows: checkRows } = await db.query(checkQuery, [
        activityId,
        userId,
      ]);

      if (checkRows.length === 0) {
        throw new Error("User is not a participant in this activity");
      }

      // Update transport need
      const updateQuery = `
        UPDATE activity_participants
        SET needs_transport = $3
        WHERE activity_id = $1 AND user_id = $2
        RETURNING *
      `;

      const { rows } = await db.query(updateQuery, [
        activityId,
        userId,
        needsTransport,
      ]);

      return rows[0];
    } catch (error) {
      logger.error(
        `Error updating transport need for user ${userId} in activity ${activityId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Get transport plan for an activity
   * @param {number} activityId - Activity ID
   * @returns {Promise<Object>} Transport plan
   */
  static async getTransportPlan(activityId) {
    try {
      // Get transport needs first
      const transportNeeds = await this.getTransportNeeds(activityId);

      // If transport is not available or no participants need transport
      if (
        !transportNeeds.transportAvailable ||
        transportNeeds.totalParticipantsNeedingTransport === 0
      ) {
        return {
          ...transportNeeds,
          transportPlan: [],
        };
      }

      // Create transport plan
      // This is a simplified example - in a real app, you might have more complex logic
      // for assigning participants to vehicles based on location, etc.

      // Start with association vehicle(s)
      let remainingCapacity = transportNeeds.transportCapacity;
      let remainingParticipants = [
        ...transportNeeds.participantsNeedingTransport,
      ];

      const transportPlan = [];

      // Add association vehicle if available
      if (remainingCapacity > 0) {
        const associationVehicle = {
          type: "association",
          capacity: remainingCapacity,
          participants: remainingParticipants.slice(0, remainingCapacity),
        };

        transportPlan.push(associationVehicle);

        // Update remaining participants
        remainingParticipants = remainingParticipants.slice(remainingCapacity);
      }

      // Add accompagnateur vehicles
      transportNeeds.accompagnateursWithVehicles.forEach((accompagnateur) => {
        // Assume capacity of 4 per accompagnateur vehicle
        const capacity = 4;
        const vehicleParticipants = remainingParticipants.slice(0, capacity);

        if (vehicleParticipants.length > 0) {
          const accompagnateurVehicle = {
            type: "accompagnateur",
            accompagnateur,
            capacity,
            participants: vehicleParticipants,
          };

          transportPlan.push(accompagnateurVehicle);

          // Update remaining participants
          remainingParticipants = remainingParticipants.slice(capacity);
        }
      });

      return {
        ...transportNeeds,
        transportPlan,
        unassignedParticipants: remainingParticipants,
      };
    } catch (error) {
      logger.error(
        `Error creating transport plan for activity ${activityId}:`,
        error
      );
      throw error;
    }
  }
}

module.exports = Transport;
