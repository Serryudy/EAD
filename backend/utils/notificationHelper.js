const notificationService = require('../services/notificationService');

/**
 * Helper functions to send notifications from controllers
 */

// Appointment notifications
async function notifyAppointmentCreated(appointment, customerId) {
  try {
    await notificationService.notifyAppointmentCreated(appointment, customerId);
  } catch (error) {
    console.error('Failed to send appointment created notification:', error);
  }
}

async function notifyAppointmentConfirmed(appointment, customerId) {
  try {
    await notificationService.notifyAppointmentConfirmed(appointment, customerId);
  } catch (error) {
    console.error('Failed to send appointment confirmed notification:', error);
  }
}

async function notifyAppointmentCancelled(appointment, userId, role) {
  try {
    await notificationService.notifyAppointmentCancelled(appointment, userId, role);
  } catch (error) {
    console.error('Failed to send appointment cancelled notification:', error);
  }
}

async function notifyAppointmentReminder(appointment, customerId) {
  try {
    await notificationService.notifyAppointmentReminder(appointment, customerId);
  } catch (error) {
    console.error('Failed to send appointment reminder notification:', error);
  }
}

// Service notifications
async function notifyServiceStarted(serviceRecord, customerId) {
  try {
    await notificationService.notifyServiceStarted(serviceRecord, customerId);
  } catch (error) {
    console.error('Failed to send service started notification:', error);
  }
}

async function notifyServiceCompleted(serviceRecord, customerId) {
  try {
    await notificationService.notifyServiceCompleted(serviceRecord, customerId);
  } catch (error) {
    console.error('Failed to send service completed notification:', error);
  }
}

async function notifyVehicleReady(serviceRecord, customerId) {
  try {
    await notificationService.notifyVehicleReady(serviceRecord, customerId);
  } catch (error) {
    console.error('Failed to send vehicle ready notification:', error);
  }
}

// Custom notification
async function sendCustomNotification(userId, notificationData) {
  try {
    await notificationService.sendToUser(userId, notificationData);
  } catch (error) {
    console.error('Failed to send custom notification:', error);
  }
}

// Broadcast to role
async function notifyRole(role, notificationData) {
  try {
    await notificationService.sendToRole(role, notificationData);
  } catch (error) {
    console.error('Failed to send role notification:', error);
  }
}

module.exports = {
  notifyAppointmentCreated,
  notifyAppointmentConfirmed,
  notifyAppointmentCancelled,
  notifyAppointmentReminder,
  notifyServiceStarted,
  notifyServiceCompleted,
  notifyVehicleReady,
  sendCustomNotification,
  notifyRole
};
