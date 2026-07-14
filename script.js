// === TESTIMONIAL DATA =====
// Hard-coded from the dummy data provided
const testimonials = [
  {
    name: "June Cha",
    position: "Software Engineer",
    photo: "https://randomuser.me/api/portraits/women/44.jpg",
    text: "This platform is an absolute game-changer for competitive programmers. The extensive range of problems and challenges offered here truly hones your skills and prepares you for any coding competition. With detailed solutions and an active community, it's the perfect environment to sharpen your coding prowess.",
  },
  {
    name: "Iida Niskanen",
    position: "Data Engineer",
    photo: "https://randomuser.me/api/portraits/women/67.jpg",
    text: "I can't express enough how valuable this platform has been for me. As someone deeply passionate about algorithms and data structures, I've found the diverse set of problems here both stimulating and enriching. The intuitive interface and seamless experience make it my go-to destination for honing my problem-solving skills.",
  },
  {
    name: "Renee Sims",
    position: "Cloud engineer",
    photo: "https://randomuser.me/api/portraits/women/8.jpg",
    text: "If you're serious about excelling in competitive coding, look no further. This platform not only provides a comprehensive set of problems but also fosters a supportive community where you can exchange ideas and strategies. It's been instrumental in my journey towards becoming a better competitive coder.",
  },
  {
    name: "Sasha Ho",
    position: "Phd student",
    photo: "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?h=350&auto=compress&cs=tinysrgb",
    text: "I've tried numerous competitive programming platforms, but none come close to the quality and depth offered here. From beginner-friendly challenges to advanced algorithmic puzzles, there's something for everyone. The platform's commitment to excellence is evident in every aspect, making it my preferred choice for honing my coding skills.",
  },
  {
    name: "Veeti Seppanen",
    position: "Frontend developer",
    photo: "https://randomuser.me/api/portraits/men/97.jpg",
    text: "As a seasoned programmer, I'm always on the lookout for platforms that challenge and inspire me. This platform exceeds all expectations with its vast array of problems and unparalleled learning resources. Whether you're a novice or a seasoned coder, you'll find endless opportunities to push your boundaries and elevate your skills.",
  },
];

// ===== GRAB DOM ELEMENTS ===
const textEl = document.getElementById("testimonial-text");
const photoEl = document.getElementById("testimonial-photo");
const nameEl = document.getElementById("testimonial-name");
const positionEl = document.getElementById("testimonial-position");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");
const dots = document.querySelectorAll(".dot");

// ===== STATE ====
let currentIndex = 0;

// DISPLAY FUNCTION 
// Updates the testimonial card content and the active dot
function showTestimonial(index) {
  const t = testimonials[index];
  textEl.textContent = t.text;
  photoEl.src = t.photo;
  photoEl.alt = t.name;
  nameEl.textContent = t.name;
  positionEl.textContent = t.position;

  // Update dots — remove "active" from all, then add to current
  dots.forEach((dot) => dot.classList.remove("active"));
  dots[index].classList.add("active");
}

// === NAVIGATION ==
// Move to next testimonial (cyclic — wraps back to 0)
function nextTestimonial() {
  currentIndex = (currentIndex + 1) % testimonials.length;
  showTestimonial(currentIndex);
}

// Move to previous testimonial (cyclic — wraps to last)
function prevTestimonial() {
  currentIndex = (currentIndex - 1 + testimonials.length) % testimonials.length;
  showTestimonial(currentIndex);
}

// == EVENT LISTENERS ========
nextBtn.addEventListener("click", function () {
  nextTestimonial();
  resetAutoPlay(); // restart the timer when user clicks
});

prevBtn.addEventListener("click", function () {
  prevTestimonial();
  resetAutoPlay(); // restart the timer when user clicks
});

// ========= AUTO-PLAY (INFINITE LOOP) ===========
// Automatically advance every 3 seconds using setInterval
let autoPlayInterval = setInterval(nextTestimonial, 3000);

// Reset the timer whenever the user manually navigates,
// so it doesn't jump immediately after a click
function resetAutoPlay() {
  clearInterval(autoPlayInterval);
  autoPlayInterval = setInterval(nextTestimonial, 3000);
}

// =====INITIAL DISPLAY ==
// Show the first testimonial on page load
showTestimonial(currentIndex);

// ===DYNAMIC COPYRIGHT YEAR =
// Use the Date API to always show the current year in the footer
const yearEl = document.getElementById("copyright-year");
yearEl.textContent = new Date().getFullYear();

// === CONTACT FORM VALIDATION ===
const contactForm = document.getElementById("contact-form");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const messageInput = document.getElementById("message");

const nameError = document.getElementById("name-error");
const emailError = document.getElementById("email-error");
const messageError = document.getElementById("message-error");

// Helper: simple email format check
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Clear error message when the user focuses on the field
nameInput.addEventListener("focus", function () {
  nameError.textContent = "";
});

emailInput.addEventListener("focus", function () {
  emailError.textContent = "";
});

messageInput.addEventListener("focus", function () {
  messageError.textContent = "";
});

// Handle form submission
contactForm.addEventListener("submit", function (e) {
  e.preventDefault(); // stop the form from actually submitting

  let isValid = true;

  // Validate name
  if (nameInput.value.trim() === "") {
    nameError.textContent = "Name is required";
    isValid = false;
  }

  // Validate email
  if (emailInput.value.trim() === "") {
    emailError.textContent = "Email is required";
    isValid = false;
  } else if (!isValidEmail(emailInput.value.trim())) {
    emailError.textContent = "Please enter a valid email address";
    isValid = false;
  }

  // Validate message
  if (messageInput.value.trim() === "") {
    messageError.textContent = "Message is required";
    isValid = false;
  }

  // If all fields pass, show the SweetAlert and reset the form
  if (isValid) {
    Swal.fire({
      icon: "success",
      title: "Thank you for reaching out",
      confirmButtonText: "OK",
      confirmButtonColor: "#4AA3DF",
    });
    contactForm.reset();
  }
});
