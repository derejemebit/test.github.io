
/**
 * Personal Website JavaScript
 * Handles navigation, animations, form validation, and interactive features
 */

// Main application object using module pattern
const PersonalWebsite = {
  
  // ===== NAVIGATION FUNCTIONALITY =====
  navigation: {
    
    /**
     * Initialize navigation functionality
     */
    init: function() {
      this.setupMobileMenu();
      this.setupSmoothScrolling();
      this.setupActiveNavigation();
    },
    
    /**
     * Setup mobile hamburger menu toggle
     */
    setupMobileMenu: function() {
      const hamburger = document.querySelector('.hamburger');
      const navMenu = document.querySelector('.nav-menu');
      
      if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
          this.toggleMobileMenu();
        });
        
        // Close mobile menu when clicking on nav links
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
          link.addEventListener('click', () => {
            if (navMenu.classList.contains('active')) {
              this.toggleMobileMenu();
            }
          });
        });
      }
    },
    
    /**
     * Toggle mobile menu visibility
     */
    toggleMobileMenu: function() {
      const hamburger = document.querySelector('.hamburger');
      const navMenu = document.querySelector('.nav-menu');
      
      if (hamburger && navMenu) {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
      }
    },
    
    /**
     * Setup smooth scrolling for navigation links
     */
    setupSmoothScrolling: function() {
      const navLinks = document.querySelectorAll('.nav-link, .cta-button');
      
      navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
          const href = link.getAttribute('href');
          
          // Only handle internal links (starting with #)
          if (href && href.startsWith('#')) {
            e.preventDefault();
            this.smoothScrollTo(href);
          }
        });
      });
    },
    
    /**
     * Smooth scroll to target section
     * @param {string} target - CSS selector for target element
     */
    smoothScrollTo: function(target) {
      const targetElement = document.querySelector(target);
      
      if (targetElement) {
        const headerHeight = document.querySelector('.header').offsetHeight;
        const targetPosition = targetElement.offsetTop - headerHeight;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    },
    
    /**
     * Setup active navigation highlighting based on scroll position
     */
    setupActiveNavigation: function() {
      const sections = document.querySelectorAll('section[id]');
      const navLinks = document.querySelectorAll('.nav-link');
      
      if (sections.length === 0 || navLinks.length === 0) return;
      
      // Throttle scroll events for better performance
      let ticking = false;
      
      const updateActiveNav = () => {
        const scrollPosition = window.scrollY + 100; // Offset for header
        
        sections.forEach(section => {
          const sectionTop = section.offsetTop;
          const sectionHeight = section.offsetHeight;
          const sectionId = section.getAttribute('id');
          
          if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            // Remove active class from all nav links
            navLinks.forEach(link => link.classList.remove('active'));
            
            // Add active class to current section's nav link
            const activeLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
            if (activeLink) {
              activeLink.classList.add('active');
            }
          }
        });
        
        ticking = false;
      };
      
      const onScroll = () => {
        if (!ticking) {
          requestAnimationFrame(updateActiveNav);
          ticking = true;
        }
      };
      
      window.addEventListener('scroll', onScroll, { passive: true });
    }
  },
  
  // ===== ANIMATIONS AND INTERACTIONS =====
  animations: {
    
    /**
     * Initialize all animations
     */
    init: function() {
      this.setupScrollAnimations();
      this.setupSkillsAnimation();
    },
    
    /**
     * Setup scroll-triggered animations using Intersection Observer
     */
    setupScrollAnimations: function() {
      // Elements to animate on scroll
      const animatedElements = document.querySelectorAll('.skill-item, .project-card, .about-content, .contact-content, .schedule-content');
      
      if (animatedElements.length === 0) return;
      
      // Add animation classes to elements
      animatedElements.forEach((element, index) => {
        if (element.classList.contains('skill-item') || element.classList.contains('project-card')) {
          element.classList.add('fade-in-up');
        } else if (index % 2 === 0) {
          element.classList.add('slide-in-left');
        } else {
          element.classList.add('slide-in-right');
        }
      });
      
      // Intersection Observer for scroll animations
      const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      };
      
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate');
            observer.unobserve(entry.target);
          }
        });
      }, observerOptions);
      
      animatedElements.forEach(element => {
        observer.observe(element);
      });
    },
    
    /**
     * Setup skills section progress bar animations
     */
    setupSkillsAnimation: function() {
      const skillsSection = document.querySelector('#skills');
      const skillBars = document.querySelectorAll('.skill-progress');
      
      if (!skillsSection || skillBars.length === 0) return;
      
      let skillsAnimated = false;
      
      const animateSkills = () => {
        if (skillsAnimated) return;
        
        skillBars.forEach((bar, index) => {
          const width = bar.getAttribute('data-width');
          
          setTimeout(() => {
            bar.style.width = width + '%';
          }, index * 200); // Stagger animation
        });
        
        skillsAnimated = true;
      };
      
      // Intersection Observer for skills animation
      const skillsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            animateSkills();
            skillsObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.3 });
      
      skillsObserver.observe(skillsSection);
    }
  },
  
  // ===== SCHEDULE FUNCTIONALITY =====
  schedule: {
    
    isEditMode: false,
    originalScheduleData: null,
    isConnected: false,
    
    /**
     * Initialize schedule functionality
     */
    init: function() {
      this.generateSchedule();
      this.updateCurrentTime();
      this.highlightCurrentTimeSlot();
      this.setupScheduleControls();
      this.setupModal();
      this.initializeRealTimeSync();
      
      // Update time every minute
      setInterval(() => {
        this.updateCurrentTime();
        this.highlightCurrentTimeSlot();
      }, 60000);
    },
    
    /**
     * Initialize real-time synchronization with Firebase
     */
    initializeRealTimeSync: function() {
      if (typeof firebase === 'undefined' || !window.firebaseDB) {
        console.log('Firebase not available, using local storage only');
        this.loadSchedule();
        return;
      }
      
      try {
        const scheduleRef = window.firebaseDB.ref('schedule');
        
        // Listen for real-time updates
        scheduleRef.on('value', (snapshot) => {
          const data = snapshot.val();
          if (data && !this.isUpdatingFirebase) {
            console.log('Received real-time update from Firebase');
            this.scheduleData = data;
            this.regenerateSchedule();
            this.showNotification('Schedule updated by another user', 'info');
          }
        });
        
        // Load initial data or create default schedule
        scheduleRef.once('value', (snapshot) => {
          if (snapshot.exists()) {
            this.scheduleData = snapshot.val();
            this.regenerateSchedule();
          } else {
            // Upload default schedule to Firebase
            this.syncToFirebase();
          }
        });
        
        this.isConnected = true;
        this.updateConnectionStatus(true);
        console.log('Real-time sync initialized');
        
      } catch (error) {
        console.error('Failed to initialize Firebase:', error);
        this.updateConnectionStatus(false);
        this.loadSchedule(); // Fallback to local storage
      }
    },
    
    /**
     * Update connection status indicator
     */
    updateConnectionStatus: function(isOnline) {
      const statusElement = document.getElementById('connectionStatus');
      if (statusElement) {
        const indicator = statusElement.querySelector('.status-indicator');
        if (indicator) {
          if (isOnline) {
            indicator.className = 'status-indicator online';
            indicator.innerHTML = '🟢 Live Collaboration Active';
          } else {
            indicator.className = 'status-indicator offline';
            indicator.innerHTML = '🔴 Offline Mode';
          }
        }
      }
    },
    
    /**
     * Sync schedule data to Firebase
     */
    syncToFirebase: function() {
      if (!this.isConnected || !window.firebaseDB) {
        return;
      }
      
      this.isUpdatingFirebase = true;
      
      window.firebaseDB.ref('schedule').set(this.scheduleData)
        .then(() => {
          console.log('Schedule synced to Firebase');
          this.isUpdatingFirebase = false;
        })
        .catch((error) => {
          console.error('Failed to sync to Firebase:', error);
          this.isUpdatingFirebase = false;
        });
    },
    
    /**
     * Schedule data - customize this to match your actual schedule
     */
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
     * Generate the schedule grid
     */
    generateSchedule: function() {
      const scheduleBody = document.getElementById('scheduleBody');
      if (!scheduleBody) return;
      
      const timeSlots = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
      const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      
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
     * Highlight current time slot
     */
    highlightCurrentTimeSlot: function() {
      // Remove previous current highlights
      document.querySelectorAll('.schedule-cell.current').forEach(cell => {
        cell.classList.remove('current');
      });
      
      const now = new Date();
      const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
      const currentHour = now.getHours();
      
      // Map day numbers to day names
      const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const dayName = dayNames[currentDay];
      
      // Find the current time slot (round down to nearest hour)
      const timeSlot = String(currentHour).padStart(2, '0') + ':00';
      
      // Highlight the current cell
      const currentCell = document.querySelector(`[data-day="${dayName}"][data-time="${timeSlot}"]`);
      if (currentCell) {
        currentCell.classList.add('current');
      }
    },
    
    /**
     * Setup schedule control buttons
     */
    setupScheduleControls: function() {
      const editBtn = document.getElementById('editScheduleBtn');
      const saveBtn = document.getElementById('saveScheduleBtn');
      const cancelBtn = document.getElementById('cancelEditBtn');
      
      if (editBtn) {
        editBtn.addEventListener('click', () => this.enterEditMode());
      }
      
      if (saveBtn) {
        saveBtn.addEventListener('click', () => this.saveSchedule());
      }
      
      if (cancelBtn) {
        cancelBtn.addEventListener('click', () => this.cancelEdit());
      }
    },
    
    /**
     * Enter edit mode
     */
    enterEditMode: function() {
      this.isEditMode = true;
      this.originalScheduleData = JSON.parse(JSON.stringify(this.scheduleData));
      
      // Show/hide buttons
      document.getElementById('editScheduleBtn').style.display = 'none';
      document.getElementById('saveScheduleBtn').style.display = 'flex';
      document.getElementById('cancelEditBtn').style.display = 'flex';
      
      // Make schedule cells editable
      const scheduleCells = document.querySelectorAll('.schedule-cell');
      scheduleCells.forEach(cell => {
        cell.classList.add('editable');
        cell.addEventListener('click', (e) => this.openEditModal(e.target));
      });
      
      // Show notification
      this.showNotification('Edit mode enabled. Click any schedule cell to modify it.', 'info');
    },
    
    /**
     * Exit edit mode
     */
    exitEditMode: function() {
      this.isEditMode = false;
      
      // Show/hide buttons
      document.getElementById('editScheduleBtn').style.display = 'flex';
      document.getElementById('saveScheduleBtn').style.display = 'none';
      document.getElementById('cancelEditBtn').style.display = 'none';
      
      // Remove editable class
      const scheduleCells = document.querySelectorAll('.schedule-cell');
      scheduleCells.forEach(cell => {
        cell.classList.remove('editable');
        cell.removeEventListener('click', this.openEditModal);
      });
    },
    
    /**
     * Save schedule changes
     */
    saveSchedule: function() {
      // Save to Firebase for real-time sync
      this.syncToFirebase();
      
      // Also save to localStorage as backup
      localStorage.setItem('personalWebsiteSchedule', JSON.stringify(this.scheduleData));
      
      this.exitEditMode();
      this.showNotification('Schedule saved and synced to all users!', 'success');
    },
    
    /**
     * Cancel edit and restore original data
     */
    cancelEdit: function() {
      if (this.originalScheduleData) {
        this.scheduleData = this.originalScheduleData;
        this.regenerateSchedule();
      }
      
      this.exitEditMode();
      this.showNotification('Changes cancelled.', 'info');
    },
    
    /**
     * Setup modal functionality
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
      
      // Close modal when clicking outside
      if (modal) {
        modal.addEventListener('click', (e) => {
          if (e.target === modal) {
            this.closeModal();
          }
        });
      }
    },
    
    /**
     * Open edit modal for a schedule cell
     */
    openEditModal: function(cell) {
      if (!this.isEditMode) return;
      
      const day = cell.dataset.day;
      const time = cell.dataset.time;
      
      // Populate modal with current data
      document.getElementById('modalDay').value = day;
      document.getElementById('modalTime').value = time;
      
      const currentEntry = this.scheduleData[day] && this.scheduleData[day][time];
      if (currentEntry) {
        document.getElementById('modalActivity').value = currentEntry.activity;
        document.getElementById('modalType').value = currentEntry.type;
      } else {
        document.getElementById('modalActivity').value = '';
        document.getElementById('modalType').value = 'empty';
      }
      
      // Show modal
      document.getElementById('scheduleModal').classList.add('show');
    },
    
    /**
     * Close modal
     */
    closeModal: function() {
      document.getElementById('scheduleModal').classList.remove('show');
    },
    
    /**
     * Save modal entry
     */
    saveModalEntry: function() {
      const day = document.getElementById('modalDay').value;
      const time = document.getElementById('modalTime').value;
      const activity = document.getElementById('modalActivity').value.trim();
      const type = document.getElementById('modalType').value;
      
      // Initialize day if it doesn't exist
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
      
      // Sync to Firebase immediately for real-time updates
      this.syncToFirebase();
      
      // Regenerate schedule display
      this.regenerateSchedule();
      this.closeModal();
      
      this.showNotification('Schedule entry updated and synced!', 'success');
    },
    
    /**
     * Regenerate schedule display
     */
    regenerateSchedule: function() {
      const scheduleBody = document.getElementById('scheduleBody');
      if (scheduleBody) {
        scheduleBody.innerHTML = '';
        this.generateSchedule();
        
        // Re-add editable class if in edit mode
        if (this.isEditMode) {
          const scheduleCells = document.querySelectorAll('.schedule-cell');
          scheduleCells.forEach(cell => {
            cell.classList.add('editable');
            cell.addEventListener('click', (e) => this.openEditModal(e.target));
          });
        }
      }
    },
    
    /**
     * Load schedule from localStorage
     */
    loadSchedule: function() {
      const saved = localStorage.getItem('personalWebsiteSchedule');
      if (saved) {
        try {
          this.scheduleData = JSON.parse(saved);
        } catch (e) {
          console.error('Error loading saved schedule:', e);
        }
      }
    },
    
    /**
     * Show notification message
     */
    showNotification: function(message, type = 'info') {
      // Create notification element
      const notification = document.createElement('div');
      notification.className = `schedule-notification ${type}`;
      notification.textContent = message;
      
      // Style the notification
      Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '12px 20px',
        borderRadius: '8px',
        color: 'white',
        fontWeight: '600',
        zIndex: '3000',
        animation: 'slideInRight 0.3s ease-out',
        maxWidth: '300px'
      });
      
      // Set background color based on type
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
      
      // Add to page
      document.body.appendChild(notification);
      
      // Remove after 3 seconds
      setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        }, 300);
      }, 3000);
    }
  },

  // ===== COMMUNICATION FUNCTIONALITY =====
  communication: {
    
    /**
     * Initialize communication features
     */
    init: function() {
      this.setupChatWidget();
      this.setupFloatingButton();
      this.setupCommModal();
      this.initializeBotResponses();
    },
    
    /**
     * Setup chat widget functionality
     */
    setupChatWidget: function() {
      const chatInput = document.getElementById('chatInput');
      const chatSendBtn = document.getElementById('chatSendBtn');
      const closeChatBtn = document.getElementById('closeChatBtn');
      const chatOptions = document.querySelectorAll('.chat-option');
      
      // Send message on button click
      if (chatSendBtn) {
        chatSendBtn.addEventListener('click', () => this.sendMessage());
      }
      
      // Send message on Enter key
      if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') {
            this.sendMessage();
          }
        });
      }
      
      // Close chat widget
      if (closeChatBtn) {
        closeChatBtn.addEventListener('click', () => this.closeChatWidget());
      }
      
      // Quick chat options
      chatOptions.forEach(option => {
        option.addEventListener('click', () => {
          const message = option.dataset.message;
          this.sendUserMessage(message);
        });
      });
    },
    
    /**
     * Setup floating chat button
     */
    setupFloatingButton: function() {
      const floatBtn = document.getElementById('chatFloatBtn');
      const openChatBtn = document.getElementById('openChatBtn');
      
      if (floatBtn) {
        floatBtn.addEventListener('click', () => this.openChatWidget());
      }
      
      if (openChatBtn) {
        openChatBtn.addEventListener('click', () => this.openChatWidget());
      }
    },
    
    /**
     * Setup communication modal
     */
    setupCommModal: function() {
      const modal = document.getElementById('commModal');
      const closeBtn = document.getElementById('commModalClose');
      const startChatBtn = document.getElementById('startChatBtn');
      
      if (closeBtn) {
        closeBtn.addEventListener('click', () => this.closeCommModal());
      }
      
      if (startChatBtn) {
        startChatBtn.addEventListener('click', () => {
          this.closeCommModal();
          this.openChatWidget();
        });
      }
      
      // Close modal when clicking outside
      if (modal) {
        modal.addEventListener('click', (e) => {
          if (e.target === modal) {
            this.closeCommModal();
          }
        });
      }
    },
    
    /**
     * Open chat widget
     */
    openChatWidget: function() {
      const chatWidget = document.getElementById('chatWidget');
      const floatBtn = document.getElementById('chatFloatBtn');
      const notification = document.getElementById('chatNotification');
      
      if (chatWidget) {
        chatWidget.classList.add('show');
      }
      
      if (floatBtn) {
        floatBtn.style.display = 'none';
      }
      
      if (notification) {
        notification.style.display = 'none';
      }
      
      // Focus on input
      setTimeout(() => {
        const chatInput = document.getElementById('chatInput');
        if (chatInput) {
          chatInput.focus();
        }
      }, 300);
    },
    
    /**
     * Close chat widget
     */
    closeChatWidget: function() {
      const chatWidget = document.getElementById('chatWidget');
      const floatBtn = document.getElementById('chatFloatBtn');
      
      if (chatWidget) {
        chatWidget.classList.remove('show');
      }
      
      if (floatBtn) {
        floatBtn.style.display = 'flex';
      }
    },
    
    /**
     * Open communication modal
     */
    openCommModal: function() {
      const modal = document.getElementById('commModal');
      if (modal) {
        modal.classList.add('show');
      }
    },
    
    /**
     * Close communication modal
     */
    closeCommModal: function() {
      const modal = document.getElementById('commModal');
      if (modal) {
        modal.classList.remove('show');
      }
    },
    
    /**
     * Send message from input
     */
    sendMessage: function() {
      const chatInput = document.getElementById('chatInput');
      if (chatInput && chatInput.value.trim()) {
        this.sendUserMessage(chatInput.value.trim());
        chatInput.value = '';
      }
    },
    
    /**
     * Send user message
     */
    sendUserMessage: function(message) {
      this.addMessage(message, 'user');
      
      // Simulate typing indicator
      setTimeout(() => {
        this.showTypingIndicator();
      }, 500);
      
      // Generate bot response
      setTimeout(() => {
        this.hideTypingIndicator();
        const response = this.generateBotResponse(message);
        this.addMessage(response, 'bot');
      }, 1500 + Math.random() * 1000);
    },
    
    /**
     * Add message to chat
     */
    addMessage: function(text, sender) {
      const chatMessages = document.getElementById('chatMessages');
      if (!chatMessages) return;
      
      const messageDiv = document.createElement('div');
      messageDiv.className = `message ${sender}`;
      
      const now = new Date();
      const timeString = now.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
      
      messageDiv.innerHTML = `
        <div class="message-content">
          <p>${text}</p>
          <span class="message-time">${timeString}</span>
        </div>
      `;
      
      chatMessages.appendChild(messageDiv);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    },
    
    /**
     * Show typing indicator
     */
    showTypingIndicator: function() {
      const chatMessages = document.getElementById('chatMessages');
      if (!chatMessages) return;
      
      const typingDiv = document.createElement('div');
      typingDiv.className = 'message bot typing-indicator';
      typingDiv.id = 'typingIndicator';
      
      typingDiv.innerHTML = `
        <div class="message-content">
          <p>
            <span class="typing-dots">
              <span>.</span><span>.</span><span>.</span>
            </span>
          </p>
        </div>
      `;
      
      chatMessages.appendChild(typingDiv);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    },
    
    /**
     * Hide typing indicator
     */
    hideTypingIndicator: function() {
      const typingIndicator = document.getElementById('typingIndicator');
      if (typingIndicator) {
        typingIndicator.remove();
      }
    },
    
    /**
     * Generate bot response based on user message
     */
    generateBotResponse: function(userMessage) {
      const message = userMessage.toLowerCase();
      
      // Predefined responses
      const responses = {
        greetings: [
          "Hello! Great to meet you. How can I help you today?",
          "Hi there! Thanks for reaching out. What can I do for you?",
          "Hey! Nice to hear from you. What's on your mind?"
        ],
        services: [
          "I offer web development, UI/UX design, and consulting services. Would you like to know more about any specific service?",
          "I specialize in full-stack development, responsive design, and modern web applications. What type of project are you working on?",
          "My services include frontend development, backend APIs, and complete web solutions. Tell me about your project!"
        ],
        projects: [
          "I'd love to hear about your project! Can you tell me more about what you have in mind?",
          "That sounds interesting! What kind of project are you thinking about? I'm here to help bring your ideas to life.",
          "Great! I'm always excited about new projects. What's your vision?"
        ],
        contact: [
          "You can reach me via phone at +1 (234) 567-8900, email at john.doe@example.com, or we can continue chatting here!",
          "I'm available through multiple channels - phone, email, text, or right here in this chat. What works best for you?",
          "Feel free to call, text, or email me anytime. My contact details are in the contact section below!"
        ],
        schedule: [
          "I'm generally available Monday through Friday, 9 AM to 6 PM EST. Would you like to schedule a call?",
          "You can check my schedule above to see when I'm available. I'd be happy to set up a meeting!",
          "Let's find a time that works for both of us. When would be convenient for you?"
        ],
        default: [
          "That's a great question! Could you tell me a bit more so I can give you the best answer?",
          "I'd be happy to help with that. Can you provide some more details?",
          "Interesting! Let me know more about what you're looking for and I'll do my best to assist.",
          "Thanks for asking! I'm here to help. Could you elaborate a bit more?"
        ]
      };
      
      // Determine response category
      let category = 'default';
      
      if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
        category = 'greetings';
      } else if (message.includes('service') || message.includes('work') || message.includes('development')) {
        category = 'services';
      } else if (message.includes('project') || message.includes('idea') || message.includes('build')) {
        category = 'projects';
      } else if (message.includes('contact') || message.includes('reach') || message.includes('call') || message.includes('email')) {
        category = 'contact';
      } else if (message.includes('schedule') || message.includes('meeting') || message.includes('available') || message.includes('time')) {
        category = 'schedule';
      }
      
      // Return random response from category
      const categoryResponses = responses[category];
      return categoryResponses[Math.floor(Math.random() * categoryResponses.length)];
    },
    
    /**
     * Initialize bot responses and features
     */
    initializeBotResponses: function() {
      // Add CSS for typing indicator
      const style = document.createElement('style');
      style.textContent = `
        .typing-dots {
          display: inline-block;
        }
        
        .typing-dots span {
          animation: typing 1.4s infinite;
          animation-fill-mode: both;
        }
        
        .typing-dots span:nth-child(2) {
          animation-delay: 0.2s;
        }
        
        .typing-dots span:nth-child(3) {
          animation-delay: 0.4s;
        }
        
        @keyframes typing {
          0%, 60%, 100% {
            transform: translateY(0);
            opacity: 0.4;
          }
          30% {
            transform: translateY(-10px);
            opacity: 1;
          }
        }
      `;
      document.head.appendChild(style);
    }
  },

  // ===== FORM HANDLING =====
  forms: {
    
    /**
     * Initialize form validation and handling
     */
    init: function() {
      this.setupFormValidation();
      this.setupFormSubmission();
    },
    
    /**
     * Setup real-time form validation
     */
    setupFormValidation: function() {
      const form = document.getElementById('contactForm');
      if (!form) return;
      
      const inputs = form.querySelectorAll('.form-input');
      
      inputs.forEach(input => {
        // Validate on blur (when user leaves field)
        input.addEventListener('blur', () => {
          this.validateField(input);
        });
        
        // Clear errors on input (when user starts typing)
        input.addEventListener('input', () => {
          this.clearFieldError(input);
        });
      });
    },
    
    /**
     * Validate individual form field
     * @param {HTMLElement} field - Form field to validate
     * @returns {boolean} - Whether field is valid
     */
    validateField: function(field) {
      const fieldName = field.getAttribute('name');
      const fieldValue = field.value.trim();
      const errorElement = document.getElementById(fieldName + 'Error');
      
      let isValid = true;
      let errorMessage = '';
      
      // Check if required field is empty
      if (field.hasAttribute('required') && fieldValue === '') {
        isValid = false;
        errorMessage = `${this.getFieldLabel(fieldName)} is required.`;
      }
      // Validate email format
      else if (field.type === 'email' && fieldValue !== '') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(fieldValue)) {
          isValid = false;
          errorMessage = 'Please enter a valid email address.';
        }
      }
      // Validate minimum length for message
      else if (fieldName === 'message' && fieldValue !== '' && fieldValue.length < 10) {
        isValid = false;
        errorMessage = 'Message must be at least 10 characters long.';
      }
      
      // Update field appearance and error message
      if (isValid) {
        field.classList.remove('error');
        if (errorElement) {
          errorElement.textContent = '';
          errorElement.classList.remove('show');
        }
      } else {
        field.classList.add('error');
        if (errorElement) {
          errorElement.textContent = errorMessage;
          errorElement.classList.add('show');
        }
      }
      
      return isValid;
    },
    
    /**
     * Clear field error styling and message
     * @param {HTMLElement} field - Form field to clear errors for
     */
    clearFieldError: function(field) {
      const fieldName = field.getAttribute('name');
      const errorElement = document.getElementById(fieldName + 'Error');
      
      field.classList.remove('error');
      if (errorElement) {
        errorElement.classList.remove('show');
      }
    },
    
    /**
     * Get user-friendly field label
     * @param {string} fieldName - Field name
     * @returns {string} - User-friendly label
     */
    getFieldLabel: function(fieldName) {
      const labels = {
        'name': 'Name',
        'email': 'Email',
        'message': 'Message'
      };
      return labels[fieldName] || fieldName;
    },
    
    /**
     * Setup form submission handling
     */
    setupFormSubmission: function() {
      const form = document.getElementById('contactForm');
      if (!form) return;
      
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleFormSubmit(form);
      });
    },
    
    /**
     * Handle form submission
     * @param {HTMLFormElement} form - Form element
     */
    handleFormSubmit: function(form) {
      const inputs = form.querySelectorAll('.form-input');
      const submitButton = form.querySelector('.submit-button');
      const successMessage = document.getElementById('successMessage');
      
      let isFormValid = true;
      
      // Validate all fields
      inputs.forEach(input => {
        if (!this.validateField(input)) {
          isFormValid = false;
        }
      });
      
      if (!isFormValid) {
        return;
      }
      
      // Disable submit button during processing
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Sending...';
      }
      
      // Simulate form submission (replace with actual submission logic)
      setTimeout(() => {
        // Show success message
        if (successMessage) {
          successMessage.classList.add('show');
        }
        
        // Reset form
        form.reset();
        
        // Re-enable submit button
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = 'Send Message';
        }
        
        // Hide success message after 5 seconds
        setTimeout(() => {
          if (successMessage) {
            successMessage.classList.remove('show');
          }
        }, 5000);
        
      }, 1500); // Simulate network delay
    }
  },
  
  // ===== UTILITY FUNCTIONS =====
  utils: {
    
    /**
     * Debounce function to limit function calls
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     * @returns {Function} - Debounced function
     */
    debounce: function(func, wait) {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    },
    
    /**
     * Throttle function to limit function calls
     * @param {Function} func - Function to throttle
     * @param {number} limit - Time limit in milliseconds
     * @returns {Function} - Throttled function
     */
    throttle: function(func, limit) {
      let inThrottle;
      return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
          func.apply(context, args);
          inThrottle = true;
          setTimeout(() => inThrottle = false, limit);
        }
      };
    }
  },
  
  // ===== INITIALIZATION =====
  
  /**
   * Initialize all website functionality
   */
  init: function() {
    // Wait for DOM to be fully loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.initializeComponents();
      });
    } else {
      this.initializeComponents();
    }
  },
  
  /**
   * Initialize all components
   */
  initializeComponents: function() {
    try {
      this.navigation.init();
      this.animations.init();
      this.schedule.loadSchedule(); // Load saved schedule first
      this.schedule.init();
      this.communication.init();
      this.forms.init();
      
      // Add loaded class to body for CSS animations
      document.body.classList.add('loaded');
      
      console.log('Personal Website initialized successfully');
    } catch (error) {
      console.error('Error initializing Personal Website:', error);
    }
  }
};

// Initialize the application
PersonalWebsite.init();

// ===== ADDITIONAL EVENT LISTENERS =====

// Handle window resize for responsive adjustments
window.addEventListener('resize', PersonalWebsite.utils.debounce(() => {
  // Close mobile menu on resize to desktop
  if (window.innerWidth > 767) {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
      hamburger.classList.remove('active');
      navMenu.classList.remove('active');
    }
  }
}, 250));

// Handle scroll events for header background
window.addEventListener('scroll', PersonalWebsite.utils.throttle(() => {
  const header = document.querySelector('.header');
  if (header) {
    if (window.scrollY > 50) {
      header.style.background = 'rgba(255, 255, 255, 0.98)';
      header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    } else {
      header.style.background = 'rgba(255, 255, 255, 0.95)';
      header.style.boxShadow = 'none';
    }
  }
}, 100), { passive: true });

// ===== ACCESSIBILITY ENHANCEMENTS =====

// Keyboard navigation for mobile menu
document.addEventListener('keydown', (e) => {
  const hamburger = document.querySelector('.hamburger');
  const navMenu = document.querySelector('.nav-menu');
  
  // Close mobile menu with Escape key
  if (e.key === 'Escape' && navMenu && navMenu.classList.contains('active')) {
    PersonalWebsite.navigation.toggleMobileMenu();
    hamburger.focus();
  }
});

// Focus management for mobile menu
const navLinks = document.querySelectorAll('.nav-link');
if (navLinks.length > 0) {
  navLinks.forEach((link, index) => {
    link.addEventListener('keydown', (e) => {
      const navMenu = document.querySelector('.nav-menu');
      
      if (navMenu && navMenu.classList.contains('active')) {
        // Navigate with arrow keys
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          const nextLink = navLinks[index + 1] || navLinks[0];
          nextLink.focus();
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          const prevLink = navLinks[index - 1] || navLinks[navLinks.length - 1];
          prevLink.focus();
        }
      }
    });
  });
}

// ===== PERFORMANCE OPTIMIZATIONS =====

// Lazy load images when they come into view (if any images are added later)
if ('IntersectionObserver' in window) {
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.classList.remove('lazy');
          imageObserver.unobserve(img);
        }
      }
    });
  });
  
  // Observe all images with data-src attribute
  document.querySelectorAll('img[data-src]').forEach(img => {
    imageObserver.observe(img);
  });
}

// Preload critical resources
const preloadCriticalResources = () => {
  // This function can be used to preload fonts, critical images, etc.
  // Example: preload web fonts
  const fontLink = document.createElement('link');
  fontLink.rel = 'preload';
  fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap';
  fontLink.as = 'style';
  fontLink.onload = function() {
    this.onload = null;
    this.rel = 'stylesheet';
  };
  document.head.appendChild(fontLink);
};

// Call preload function
preloadCriticalResources();
