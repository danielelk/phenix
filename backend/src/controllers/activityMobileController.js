const { Activity } = require("../models/Activity");
const db = require("../config/db");
const logger = require("../utils/logger");

exports.startActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const { started_at } = req.body;

    const activity = await Activity.findById(id);
    if (!activity) {
      return res.status(404).json({
        status: "fail",
        message: "Activity not found",
      });
    }

    const query = `
      UPDATE activities 
      SET status = 'started', started_at = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `;

    const { rows } = await db.query(query, [started_at || new Date(), id]);

    res.status(200).json({
      status: "success",
      data: {
        activity: rows[0],
      },
    });
  } catch (error) {
    logger.error("Start activity error:", error);
    res.status(500).json({
      status: "error",
      message: "Error starting activity",
    });
  }
};

exports.completeActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const { completed_at } = req.body;

    const query = `
      UPDATE activities 
      SET status = 'completed', completed_at = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `;

    const { rows } = await db.query(query, [completed_at || new Date(), id]);

    res.status(200).json({
      status: "success",
      data: {
        activity: rows[0],
      },
    });
  } catch (error) {
    logger.error("Complete activity error:", error);
    res.status(500).json({
      status: "error",
      message: "Error completing activity",
    });
  }
};

exports.savePresence = async (req, res) => {
  const client = await db.getClient();
  
  try {
    const { id } = req.params;
    const { participants, manualParticipants } = req.body;

    await client.query('BEGIN');

    await client.query(
      'DELETE FROM activity_presence WHERE activity_id = $1',
      [id]
    );

    for (const participant of participants) {
      await client.query(
        `INSERT INTO activity_presence (activity_id, user_id, present, marked_at)
         VALUES ($1, $2, $3, NOW())`,
        [id, participant.userId, participant.present]
      );
    }

    for (const manual of manualParticipants) {
      await client.query(
        `INSERT INTO activity_presence 
         (activity_id, manual_first_name, manual_last_name, manual_phone, present, is_temporary, marked_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
        [
          id,
          manual.firstName,
          manual.lastName,
          manual.phone,
          manual.present,
          manual.temporary
        ]
      );
    }

    await client.query('COMMIT');

    res.status(200).json({
      status: "success",
      message: "Presence saved successfully",
    });
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error("Save presence error:", error);
    res.status(500).json({
      status: "error",
      message: "Error saving presence",
    });
  } finally {
    client.release();
  }
};

exports.getExpenses = async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT * FROM activity_expenses 
      WHERE activity_id = $1 
      ORDER BY created_at DESC
    `;

    const { rows } = await db.query(query, [id]);

    res.status(200).json({
      status: "success",
      data: {
        expenses: rows,
      },
    });
  } catch (error) {
    logger.error("Get expenses error:", error);
    res.status(500).json({
      status: "error",
      message: "Error getting expenses",
    });
  }
};

exports.addExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, amount, description } = req.body;

    const query = `
      INSERT INTO activity_expenses (activity_id, title, amount, description, created_by)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const { rows } = await db.query(query, [
      id,
      title,
      amount,
      description,
      req.user.id
    ]);

    res.status(201).json({
      status: "success",
      data: {
        expense: rows[0],
      },
    });
  } catch (error) {
    logger.error("Add expense error:", error);
    res.status(500).json({
      status: "error",
      message: "Error adding expense",
    });
  }
};

exports.deleteExpense = async (req, res) => {
  try {
    const { id, expenseId } = req.params;

    const query = `
      DELETE FROM activity_expenses 
      WHERE id = $1 AND activity_id = $2
      RETURNING id
    `;

    const { rows } = await db.query(query, [expenseId, id]);

    if (rows.length === 0) {
      return res.status(404).json({
        status: "fail",
        message: "Expense not found",
      });
    }

    res.status(204).send();
  } catch (error) {
    logger.error("Delete expense error:", error);
    res.status(500).json({
      status: "error",
      message: "Error deleting expense",
    });
  }
};