document.getElementById("greetBtn").addEventListener("click", function() {
  const greetings = [
    "Hello there! 👋 Hope you're having a great day!",
    "Greetings! 🌟 You're awesome!",
    "Hi! 😊 Thanks for clicking the button!",
    "Hello! 🎉 You've just made my day!",
    "Hey there! 🚀 Ready to conquer the world?",
    "Greetings, friend! 💫 You're doing great!"
  ];
  
  const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
  const greetingDiv = document.getElementById("greeting");
  const greetingText = document.getElementById("greetingText");
  
  greetingText.textContent = randomGreeting;
  greetingDiv.style.display = "block";
  
  // Add a little animation effect
  greetingDiv.style.opacity = "0";
  setTimeout(() => {
    greetingDiv.style.transition = "opacity 0.5s ease-in";
    greetingDiv.style.opacity = "1";
  }, 10);
});
