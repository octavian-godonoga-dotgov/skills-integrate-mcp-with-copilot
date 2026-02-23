document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const messageDiv = document.getElementById("message");
  const addActivityForm = document.getElementById("add-activity-form");
  const addActivityMessage = document.getElementById("add-activity-message");
  // Handle add activity form submission
  if (addActivityForm) {
    addActivityForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const name = document.getElementById("activity-name").value.trim();
      const description = document.getElementById("activity-description").value.trim();
      const schedule = document.getElementById("activity-schedule").value.trim();
      const max_participants = parseInt(document.getElementById("activity-max").value, 10);

      if (!name || !description || !schedule || !max_participants) {
        addActivityMessage.textContent = "All fields are required.";
        addActivityMessage.className = "error";
        addActivityMessage.classList.remove("hidden");
        setTimeout(() => addActivityMessage.classList.add("hidden"), 3000);
        return;
      }

      try {
        const response = await fetch("/activities", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, description, schedule, max_participants })
        });
        const result = await response.json();
        if (response.ok) {
          addActivityMessage.textContent = result.message || "Activity added!";
          addActivityMessage.className = "success";
          addActivityForm.reset();
          fetchActivities();
        } else {
          addActivityMessage.textContent = result.detail || "Failed to add activity.";
          addActivityMessage.className = "error";
        }
        addActivityMessage.classList.remove("hidden");
        setTimeout(() => addActivityMessage.classList.add("hidden"), 4000);
      } catch (error) {
        addActivityMessage.textContent = "Error adding activity.";
        addActivityMessage.className = "error";
        addActivityMessage.classList.remove("hidden");
        setTimeout(() => addActivityMessage.classList.add("hidden"), 4000);
      }
    });
  }

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        // Create participants HTML with delete icons instead of bullet points
        const participantsHTML =
          details.participants.length > 0
            ? `<div class="participants-section">
                <h5>Participants:</h5>
                <ul class="participants-list">
                  ${details.participants
                    .map(
                      (email) =>
                        `<li><span class="participant-email">${email}</span><button class="delete-btn" data-activity="${name}" data-email="${email}">❌</button></li>`
                    )
                    .join("")}
                </ul>
              </div>`
            : `<p><em>No participants yet</em></p>`;

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          <div class="participants-container">
            ${participantsHTML}
          </div>
          <div class="register-section">
            <input type="email" class="register-email" placeholder="your-email@mergington.edu" />
            <button class="register-btn" data-activity="${name}">Register Student</button>
          </div>
        `;

        activitiesList.appendChild(activityCard);
      });

      // Add event listeners to delete buttons
      document.querySelectorAll(".delete-btn").forEach((button) => {
        button.addEventListener("click", handleUnregister);
      });

      // Add event listeners to register buttons
      document.querySelectorAll(".register-btn").forEach((button) => {
        button.addEventListener("click", handleRegister);
      });

      // Add event listeners to delete buttons
      document.querySelectorAll(".delete-btn").forEach((button) => {
        button.addEventListener("click", handleUnregister);
      });
    } catch (error) {
      activitiesList.innerHTML =
        "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle unregister functionality
  async function handleUnregister(event) {
    const button = event.target;
    const activity = button.getAttribute("data-activity");
    const email = button.getAttribute("data-email");

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(
          activity
        )}/unregister?email=${encodeURIComponent(email)}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";

        // Refresh activities list to show updated participants
        fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to unregister. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error unregistering:", error);
    }
  }


  // Handle register button click
  async function handleRegister(event) {
    const button = event.target;
    const activity = button.getAttribute("data-activity");
    const card = button.closest(".activity-card");
    const emailInput = card.querySelector(".register-email");
    const email = emailInput.value;

    if (!email) {
      messageDiv.textContent = "Please enter a student email.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 3000);
      return;
    }

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(
          activity
        )}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  }

  // Initialize app
  fetchActivities();
});
