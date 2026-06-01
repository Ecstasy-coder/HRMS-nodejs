const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  type:    { type: String }, // 'leave', 'helpdesk', 'user', 'attendance', 'info'
  title:   { type: String, required: true },
  message: { type: String },
  isRead:  { type: Boolean, default: false },
  link:    { type: String },  // optional href to navigate to
  icon:    { type: String }   // tabler icon class e.g. 'ti-leaf'
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
