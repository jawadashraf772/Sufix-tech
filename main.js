document.addEventListener('DOMContentLoaded', () => {
  
  // 1. Header scroll state management
  const header = document.getElementById('main-header');
  const handleScroll = () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', handleScroll);
  handleScroll(); // Initial check in case page starts scrolled

  // 2. Scroll Animation Observer (Fade In)
  const fadeElements = document.querySelectorAll('.fade-in-on-scroll');
  
  if ('IntersectionObserver' in window) {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('appear');
          observer.unobserve(entry.target); // Stop observing once it has appeared
        }
      });
    }, observerOptions);

    fadeElements.forEach(el => observer.observe(el));
  } else {
    // Fallback if IntersectionObserver is not supported
    fadeElements.forEach(el => el.classList.add('appear'));
  }

  // 3. Testimonial Video Modal Handling
  const videoModal = document.getElementById('video-modal');
  const modalVideoPlayer = document.getElementById('modal-video-player');
  const closeModalBtn = document.getElementById('close-modal-btn');
  const videoThumbnails = document.querySelectorAll('.testimonial-thumbnail');

  const openVideoModal = (videoUrl) => {
    if (!videoUrl) return;
    
    // Set video source
    modalVideoPlayer.src = videoUrl;
    
    // Show modal
    videoModal.classList.add('active');
    videoModal.setAttribute('aria-hidden', 'false');
    
    // Play video
    modalVideoPlayer.load();
    const playPromise = modalVideoPlayer.play();
    
    // Handle autoplay errors if browser blocks it
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.log("Playback prevented, user needs to click play manually.", error);
      });
    }
  };

  const closeVideoModal = () => {
    videoModal.classList.remove('active');
    videoModal.setAttribute('aria-hidden', 'true');
    // Stop and clear video resource to prevent loading in background
    modalVideoPlayer.pause();
    modalVideoPlayer.src = '';
  };

  // Add event listeners to testimonials
  videoThumbnails.forEach(thumb => {
    thumb.addEventListener('click', (e) => {
      const videoUrl = thumb.getAttribute('data-video-url');
      openVideoModal(videoUrl);
    });
  });

  // Close modal when close button is clicked
  closeModalBtn.addEventListener('click', closeVideoModal);

  // Close modal when clicking outside the video container
  videoModal.addEventListener('click', (e) => {
    if (e.target === videoModal) {
      closeVideoModal();
    }
  });

  // Close modal on Escape key press
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && videoModal.classList.contains('active')) {
      closeVideoModal();
    }
  });

  // 4. Booking Form Handling
  const bookingForm = document.getElementById('booking-form');
  const submitButton = document.getElementById('submit-booking-btn');

  const GHL_WEBHOOK_URL = 'https://services.leadconnectorhq.com/hooks/EOHnOtxAxO3NZV7FKamH/webhook-trigger/8b2bd2db-add4-4183-909e-6040af1ffef1';

  if (bookingForm) {
    bookingForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Collect all form data
      const formData = {
        full_name:       document.getElementById('full-name').value.trim(),
        email:           document.getElementById('email-address').value.trim(),
        phone:           document.getElementById('phone-number').value.trim(),
        website:         document.getElementById('company-website').value.trim(),
        service_needed:  document.getElementById('service-needed').value,
        message:         document.getElementById('message').value.trim(),
        submitted_at:    new Date().toISOString(),
        source:          'SufixTech GHL Landing Page'
      };

      // Show loading state
      const originalBtnText = submitButton.textContent;
      submitButton.disabled = true;
      submitButton.textContent = 'SUBMITTING...';

      try {
        const response = await fetch(GHL_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });

        if (response.ok) {
          // Alert user and reset form without hiding it or redirecting
          alert('Thank you! Your request has been submitted successfully.');
          
          // Optionally reset form
          bookingForm.reset();
          
          // Restore button
          submitButton.disabled = false;
          submitButton.textContent = originalBtnText;
        } else {
          throw new Error(`Server responded with status ${response.status}`);
        }

      } catch (err) {
        console.error('Webhook submission error:', err);
        alert('Something went wrong. Please try again or contact us directly.');
        // Restore button so user can retry
        submitButton.disabled = false;
        submitButton.textContent = originalBtnText;
      }
    });
  }

});
