/**
 * Simplified Personal Website JavaScript
 * Focus on working schedule editing functionality
 */

// Main application object
const PersonalWebsite = {
  
  // ===== SCHEDULE FUNCTIONALITY =====
  schedule: {
    
    isEditMode: false,
    
    // Sample schedule data
    scheduleData: {
      monday: {
        '09:00': { type: 'work', activity: 'Development' },
        '10:00': { type: 'work', activity: 'Development' },
        '11:00': { type: 'work', activity: 'Development' },
        '12:00': { type: 'break', activity: 'Lunch Break' },
        '13:00': { type: 'meeting', activity: 'Team Meeting' },
        '14:00': { type: 'work', activity: 'Code Review' },
        '15:00': { type: 'work', activity: 'Development' },
        '16:00': { type: 'learning', activity: 'Research' },
        '17:00': { type: 'available', activity: 'Available' }
      },
      tuesday: {
        '09:00': { type: 'work', activity: 'Development' },
        '10:00': { type: 'work', activity: 'Development' },
        '11:00': { type: 'meeting', activity: 'Client Call' },
        '12:00': { type: 'break', activity: 'Lunch Break' },
        '13:00': { type: 'work', activity: 'Development' },
        '14:00': { type: 'work', activity: 'Testing' },
        '15:00': { type: 'learning', activity: 'Learning' },
        '16:00': { type: 'available', activity: 'Available' },
        '17:00': { type: 'available', activity: 'Available' }
      },
      wednesday: {
        '09:00': { type: 'work', activity: 'Development' },
        '10:00': { type: 'work', activity: 'Development' },
        '11:00': { type: 'work', activity: 'Development' },
        '12:00': { type: 'break', activity: 'Lunch Break' },
        '13:00': { type: 'meeting', activity: 'Planning' },
        '14:00': { type: 'work', activity: 'Development' },
        '15:00': { type: 'work', activity: 'Documentation' },
        '16:00': { type: 'available', activity: 'Available' },
        '17:00': { type: 'available', activity: 'Available' }
      },
      thursday: {
        '09:00': { type: 'work', activity: 'Development' },
        '10:00': { type: 'work', activity: 'Development' },
        '11:00': { type: 'meeting', activity: 'Standup' },
        '12:00': { type: 'break', activity: 'Lunch Break' },
        '13:00': { type: 'work', activity: 'Development' },
        '14:00': { type: 'work', activity: 'Debugging' },
        '15:00': { type: 'learning', activity: 'Training' },
        '16:00': { type: 'available', activity: 'Available' },
        '17:00': { type: 'available', activity: 'Available' }
      },
      friday: {
        '09:00': { type: 'work', activity: 'Development' },
        '10:00': { type: 'work', activity: 'Development' },
        '11:00': { type: 'work', activity: 'Code Review' },
        '12:00': { type: 'break', activity: 'Lunch Break' },
        '13:00': { type: 'meeting', activity: 'Demo' },
        '14:00': { type: 'work', activity: 'Deployment' },
        '15:00': { type: 'learning', activity: 'Research' },
        '16:00': { type: 'available', activity: 'Available' },
        '17:00': { type: 'break', activity: 'Week Wrap-up' }
      },
      saturday: {
        '10:00': { type: 'learning', activity: 'Side Projects' },
        '11:00': { type: 'learning', activity: 'Side Projects' },
        '12:00': { type: 'break', activity: 'Personal Time' },
        '13:00': { type: 'available', activity: 'Available' },
        '14:00': { type: 'available', activity: 'Available' },
        '15:00': { type: 'learning', activity: 'Learning' },
        '16:00': { type: 'break', activity: 'Personal Time' }
      },
      sunday: {
        '11:00': { type: 'learning', activity: 'Reading' },
        '12:00': { type: 'break', activity: 'Personal Time' },
        '13:00': { type: 'available', activity: 'Available' },
        '14:00': { type: 'available', activity: 'Available' },
        '15:00': { type: 'learning', activity: 'Planning' },
        '16:00': { type: 'break', activity: 'Personal Time' }
      }
    },
    
    /**
     * Initialize schedule
     */
    init: function() {
      console.log('Initializing schedule...');
      this.generateSchedule();
      this.updateCurrentTime();
      this.setupControls();
      this.setupModal();
      
      // Update time every minute
      setInterval(() => {
        this.updateCurrentTime();
      }, 60000);
      
      console.log('Schedule initialized');
    },
    
    /**
     * Generate schedule grid
     */
    generateSchedule: function() {
      const scheduleBody = document.getElementById('scheduleBody');
      if (!scheduleBody) {
        console.log('Schedule body not found');
        return;
      }
      
      const timeSlots = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
      const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      
      scheduleBody.innerHTML = '';
      
      timeSlots.forEach(time => {
        const row = document.createElement('div');
        row.className = 'schedule-row';
        
        // Time slot
        const timeCell = document.createElement('div');
        timeCell.className = 'time-slot';
        timeCell.textContent = time;
        row.appendChild(timeCell);
        
        // Day cells
        days.forEach(day => {
          const cell = document.createElement('div');
          cell.className = 'schedule-cell';
          cell.dataset.day = day;
          cell.dataset.time = time;
          
          const dayData = this.scheduleData[day];
          if (dayData && dayData[time]) {
            const slot = dayData[time];
            cell.classList.add(slot.type);
            cell.textContent = slot.activity;
            cell.title = `${time} - ${slot.activity}`;
          } else {
            cell.classList.add('empty');
            cell.textContent = 'Free';
            cell.title = `${time} - Free time`;
          }
          
          row.appendChild(cell);
        });
        
        scheduleBody.appendChild(row);
      });
      
      console.log('Schedule generated');
    },
    
    /**
     * Update current time display
     */
    updateCurrentTime: function() {
      const currentTimeElement = document.getElementById('currentTime');
      const timezoneElement = document.getElementById('timezone');
      
      if (currentTimeElement && timezoneElement) {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', { 
          hour12: false, 
          hour: '2-digit', 
          minute: '2-digit',
          second: '2-digit'
        });
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        
        currentTimeElement.textContent = timeString;
        timezoneElement.textContent = `(${timezone})`;
      }
    },
    
    /**
     * Setup control buttons
     */
    setupControls: function() {
      const editBtn = document.getElementById('editScheduleBtn');
      const saveBtn = document.getElementById('saveScheduleBtn');
      const cancelBtn = document.getElementById('cancelEditBtn');
      
      console.log('Setting up controls...', { editBtn, saveBtn, cancelBtn });
      
      if (editBtn) {
        editBtn.addEventListener('click', (e) => {
          e.preventDefault();
          console.log('Edit button clicked');
          this.enterEditMode();
        });
      }
      
      if (saveBtn) {
        saveBtn.addEventListener('click', (e) => {
          e.preventDefault();
          console.log('Save button clicked');
          this.saveSchedule();
        });
      }
      
      if (cancelBtn) {
        cancelBtn.addEventListener('click', (e) => {
          e.preventDefault();
          console.log('Cancel button clicked');
          this.cancelEdit();
        });
      }
    },
    
    /**
     * Setup modal
     */
    setupModal: function() {
      const modal = document.getElementById('scheduleModal');
      const closeBtn = document.getElementById('modalClose');
      const cancelBtn = document.getElementById('modalCancel');
      const saveBtn = document.getElementById('modalSave');
      
      if (closeBtn) {
        closeBtn.addEventListener('click', () => this.closeModal());
      }
      
      if (cancelBtn) {
        cancelBtn.addEventListener('click', () => this.closeModal());
      }
      
      if (saveBtn) {
        saveBtn.addEventListener('click', () => this.saveModalEntry());
      }
      
      if (modal) {
        modal.addEventListener('click', (e) => {
          if (e.target === modal) {
            this.closeModal();
          }
        });
      }
    },
    
    /**
     * Enter edit mode
     */
    enterEditMode: function() {
      console.log('Entering edit mode...');
      this.isEditMode = true;
      
      // Show/hide buttons
      const editBtn = document.getElementById('editScheduleBtn');
      const saveBtn = document.getElementById('saveScheduleBtn');
      const cancelBtn = document.getElementById('cancelEditBtn');
      
      if (editBtn) editBtn.style.display = 'none';
      if (saveBtn) saveBtn.style.display = 'flex';
      if (cancelBtn) cancelBtn.style.display = 'flex';
      
      // Make cells editable
      const cells = document.querySelectorAll('.schedule-cell');
      cells.forEach(cell => {
        cell.classList.add('editable');
        cell.addEventListener('click', (e) => {
          console.log('Cell clicked:', e.target.dataset);
          this.openEditModal(e.target);
        });
      });
      
      this.showNotification('Edit mode enabled. Click any cell to edit.', 'info');
    },
    
    /**
     * Exit edit mode
     */
    exitEditMode: function() {
      console.log('Exiting edit mode...');
      this.isEditMode = false;
      
      // Show/hide buttons
      const editBtn = document.getElementById('editScheduleBtn');
      const saveBtn = document.getElementById('saveScheduleBtn');
      const cancelBtn = document.getElementById('cancelEditBtn');
      
      if (editBtn) editBtn.style.display = 'flex';
      if (saveBtn) saveBtn.style.display = 'none';
      if (cancelBtn) cancelBtn.style.display = 'none';
      
      // Remove editable class
      const cells = document.querySelectorAll('.schedule-cell');
      cells.forEach(cell => {
        cell.classList.remove('editable');
      });
    },
    
    /**
     * Save schedule
     */
    saveSchedule: function() {
      console.log('Saving schedule...');
      localStorage.setItem('personalWebsiteSchedule', JSON.stringify(this.scheduleData));
      this.exitEditMode();
      this.showNotification('Schedule saved successfully!', 'success');
    },
    
    /**
     * Cancel edit
     */
    cancelEdit: function() {
      console.log('Cancelling edit...');
      this.exitEditMode();
      this.showNotification('Changes cancelled.', 'info');
    },
    
    /**
     * Open edit modal
     */
    openEditModal: function(cell) {
      if (!this.isEditMode) return;
      
      const day = cell.dataset.day;
      const time = cell.dataset.time;
      
      console.log('Opening modal for:', day, time);
      
      // Populate modal
      const daySelect = document.getElementById('modalDay');
      const timeSelect = document.getElementById('modalTime');
      const activityInput = document.getElementById('modalActivity');
      const typeSelect = document.getElementById('modalType');
      
      if (daySelect) daySelect.value = day;
      if (timeSelect) timeSelect.value = time;
      
      const currentEntry = this.scheduleData[day] && this.scheduleData[day][time];
      if (currentEntry) {
        if (activityInput) activityInput.value = currentEntry.activity;
        if (typeSelect) typeSelect.value = currentEntry.type;
      } else {
        if (activityInput) activityInput.value = '';
        if (typeSelect) typeSelect.value = 'empty';
      }
      
      // Show modal
      const modal = document.getElementById('scheduleModal');
      if (modal) {
        modal.classList.add('show');
      }
    },
    
    /**
     * Close modal
     */
    closeModal: function() {
      const modal = document.getElementById('scheduleModal');
      if (modal) {
        modal.classList.remove('show');
      }
    },
    
    /**
     * Save modal entry
     */
    saveModalEntry: function() {
      const day = document.getElementById('modalDay').value;
      const time = document.getElementById('modalTime').value;
      const activity = document.getElementById('modalActivity').value.trim();
      const type = document.getElementById('modalType').value;
      
      console.log('Saving entry:', { day, time, activity, type });
      
      // Initialize day if needed
      if (!this.scheduleData[day]) {
        this.scheduleData[day] = {};
      }
      
      // Update or remove entry
      if (type === 'empty' || activity === '') {
        delete this.scheduleData[day][time];
      } else {
        this.scheduleData[day][time] = {
          type: type,
          activity: activity
        };
      }
      
      // Regenerate schedule
      this.generateSchedule();
      
      // Re-enable edit mode
      if (this.isEditMode) {
        const cells = document.querySelectorAll('.schedule-cell');
        cells.forEach(cell => {
          cell.classList.add('editable');
          cell.addEventListener('click', (e) => {
            this.openEditModal(e.target);
          });
        });
      }
      
      this.closeModal();
      this.showNotification('Entry updated!', 'success');
    },
    
    /**
     * Show notification
     */
    showNotification: function(message, type = 'info') {
      console.log('Notification:', message, type);
      
      // Create notification
      const notification = document.createElement('div');
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        z-index: 3000;
        max-width: 300px;
      `;
      
      // Set color based on type
      switch (type) {
        case 'success':
          notification.style.background = '#10b981';
          break;
        case 'error':
          notification.style.background = '#ef4444';
          break;
        case 'info':
        default:
          notification.style.background = '#3b82f6';
          break;
      }
      
      notification.textContent = message;
      document.body.appendChild(notification);
      
      // Remove after 3 seconds
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 3000);
    }
  },
  
  // ===== INITIALIZATION =====
  init: function() {
    console.log('Initializing PersonalWebsite...');
    
    // Wait for DOM
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.schedule.init();
      });
    } else {
      this.schedule.init();
    }
  }
};

// Initialize the application
PersonalWebsite.init();

console.log('PersonalWebsite script loaded');