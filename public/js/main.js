// This file can be used for client-side functionality
console.log("Bookkeeping Service API")

// Load Firebase configuration if needed
// const firebaseConfig = await import('./firebase-config.js').catch(err => console.error('Firebase config not loaded:', err));

document.addEventListener("DOMContentLoaded", () => {
  // Close alert messages
  const closeButtonsAlert = document.querySelectorAll(".close-btn")
  closeButtonsAlert.forEach((button) => {
    button.addEventListener("click", function () {
      this.parentElement.style.display = "none"
    })
  })

  // Update the language switcher functionality
  // Language switcher
  const languageLinks = document.querySelectorAll(".change-language")
  languageLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault()
      const lang = this.getAttribute("data-lang")
      console.log(`Changing language to: ${lang}`)

      // Store language preference in localStorage
      localStorage.setItem("preferredLanguage", lang)

      // Update user preference if logged in
      if (isLoggedIn()) {
        updateLanguagePreference(lang)
      }

      // Reload the page
      location.reload()
    })
  })

  // Login form submission
  const loginForm = document.getElementById("login-form")
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault()

      const formData = {
        email: document.getElementById("email").value,
        password: document.getElementById("password").value,
        preferredLanguage: document.getElementById("preferredLanguage").value,
      }

      fetch("/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            // Store token in localStorage
            localStorage.setItem("token", data.token)

            // Redirect to home page
            window.location.href = "/"
          } else {
            showAlert(data.error, "danger")
          }
        })
        .catch((error) => {
          showAlert("An error occurred. Please try again.", "danger")
          console.error("Error:", error)
        })
    })
  }

  // Register form submission
  const registerForm = document.getElementById("register-form")
  if (registerForm) {
    registerForm.addEventListener("submit", (e) => {
      e.preventDefault()

      const formData = {
        name: document.getElementById("name").value,
        email: document.getElementById("email").value,
        password: document.getElementById("password").value,
        role: document.getElementById("role").value,
        preferredLanguage: document.getElementById("preferredLanguage").value,
      }

      fetch("/api/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            // Store token in localStorage
            localStorage.setItem("token", data.token)

            // Redirect to home page
            window.location.href = "/"
          } else {
            showAlert(data.error, "danger")
          }
        })
        .catch((error) => {
          showAlert("An error occurred. Please try again.", "danger")
          console.error("Error:", error)
        })
    })
  }

  // Add Book form submission
  const addBookForm = document.getElementById("add-book-form")
  if (addBookForm) {
    // Image preview
    const imageInput = document.getElementById("image")
    const imagePreview = document.getElementById("image-preview")

    imageInput.addEventListener("change", function () {
      const file = this.files[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`
        }
        reader.readAsDataURL(file)
      }
    })

    addBookForm.addEventListener("submit", function (e) {
      e.preventDefault()

      const formData = new FormData(this)

      fetch("/api/books", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
        body: formData,
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            window.location.href = `/books/${data.data._id}`
          } else {
            showAlert(data.error, "danger")
          }
        })
        .catch((error) => {
          showAlert("An error occurred. Please try again.", "danger")
          console.error("Error:", error)
        })
    })
  }

  // Edit Book form submission
  const editBookForm = document.getElementById("edit-book-form")
  if (editBookForm) {
    // Image preview
    const imageInput = document.getElementById("image")
    const imagePreview = document.getElementById("image-preview")

    imageInput.addEventListener("change", function () {
      const file = this.files[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`
        }
        reader.readAsDataURL(file)
      }
    })

    editBookForm.addEventListener("submit", function (e) {
      e.preventDefault()

      const bookId = this.getAttribute("data-id")
      const formData = new FormData(this)

      fetch(`/api/books/${bookId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
        body: formData,
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            window.location.href = `/books/${bookId}`
          } else {
            showAlert(data.error, "danger")
          }
        })
        .catch((error) => {
          showAlert("An error occurred. Please try again.", "danger")
          console.error("Error:", error)
        })
    })
  }

  // Add Library form submission
  const addLibraryForm = document.getElementById("add-library-form")
  if (addLibraryForm) {
    addLibraryForm.addEventListener("submit", (e) => {
      e.preventDefault()

      const formData = {
        name: document.getElementById("name").value,
        address: document.getElementById("address").value,
        description: document.getElementById("description").value,
      }

      fetch("/api/libraries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(formData),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            window.location.href = `/libraries/${data.data._id}`
          } else {
            showAlert(data.error, "danger")
          }
        })
        .catch((error) => {
          showAlert("An error occurred. Please try again.", "danger")
          console.error("Error:", error)
        })
    })
  }

  // Edit Library form submission
  const editLibraryForm = document.getElementById("edit-library-form")
  if (editLibraryForm) {
    editLibraryForm.addEventListener("submit", function (e) {
      e.preventDefault()

      const libraryId = this.getAttribute("data-id")
      const formData = {
        name: document.getElementById("name").value,
        address: document.getElementById("address").value,
        description: document.getElementById("description").value,
      }

      fetch(`/api/libraries/${libraryId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(formData),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            window.location.href = `/libraries/${libraryId}`
          } else {
            showAlert(data.error, "danger")
          }
        })
        .catch((error) => {
          showAlert("An error occurred. Please try again.", "danger")
          console.error("Error:", error)
        })
    })
  }

  // Add to Inventory form submission
  const addToInventoryForm = document.getElementById("add-to-inventory-form")
  if (addToInventoryForm) {
    // Image preview
    const imageInput = document.getElementById("image")
    const imagePreview = document.getElementById("image-preview")

    imageInput.addEventListener("change", function () {
      const file = this.files[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`
        }
        reader.readAsDataURL(file)
      }
    })

    addToInventoryForm.addEventListener("submit", function (e) {
      e.preventDefault()

      const libraryId = this.getAttribute("data-library")
      const formData = new FormData(this)

      fetch(`/api/libraries/${libraryId}/inventory`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
        body: formData,
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            window.location.href = `/libraries/${libraryId}`
          } else {
            showAlert(data.error, "danger")
          }
        })
        .catch((error) => {
          showAlert("An error occurred. Please try again.", "danger")
          console.error("Error:", error)
        })
    })
  }

  // Borrow book
  const borrowButtons = document.querySelectorAll(".borrow-btn")
  borrowButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const bookId = this.getAttribute("data-id")

      fetch("/api/borrow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ bookId }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            showAlert("Book borrowed successfully!", "success")
            setTimeout(() => {
              location.reload()
            }, 1500)
          } else {
            showAlert(data.error, "danger")
          }
        })
        .catch((error) => {
          showAlert("An error occurred. Please try again.", "danger")
          console.error("Error:", error)
        })
    })
  })

  // Return book
  const returnButtons = document.querySelectorAll(".return-btn")
  returnButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const bookId = this.getAttribute("data-id")

      fetch(`/api/return/${bookId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            showAlert("Book returned successfully!", "success")
            setTimeout(() => {
              location.reload()
            }, 1500)
          } else {
            showAlert(data.error, "danger")
          }
        })
        .catch((error) => {
          showAlert("An error occurred. Please try again.", "danger")
          console.error("Error:", error)
        })
    })
  })

  // Delete book
  const deleteBookButtons = document.querySelectorAll(".delete-book")
  deleteBookButtons.forEach((button) => {
    button.addEventListener("click", function () {
      if (confirm("Are you sure you want to delete this book?")) {
        const bookId = this.getAttribute("data-id")

        fetch(`/api/books/${bookId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.success) {
              window.location.href = "/books"
            } else {
              showAlert(data.error, "danger")
            }
          })
          .catch((error) => {
            showAlert("An error occurred. Please try again.", "danger")
            console.error("Error:", error)
          })
      }
    })
  })

  // Delete library
  const deleteLibraryButtons = document.querySelectorAll(".delete-library")
  deleteLibraryButtons.forEach((button) => {
    button.addEventListener("click", function () {
      if (confirm("Are you sure you want to delete this library?")) {
        const libraryId = this.getAttribute("data-id")

        fetch(`/api/libraries/${libraryId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.success) {
              window.location.href = "/libraries"
            } else {
              showAlert(data.error, "danger")
            }
          })
          .catch((error) => {
            showAlert("An error occurred. Please try again.", "danger")
            console.error("Error:", error)
          })
      }
    })
  })

  // Remove book from inventory
  const removeFromInventoryButtons = document.querySelectorAll(".remove-from-inventory")
  removeFromInventoryButtons.forEach((button) => {
    button.addEventListener("click", function () {
      if (confirm("Are you sure you want to remove this book from the inventory?")) {
        const libraryId = this.getAttribute("data-library")
        const bookId = this.getAttribute("data-book")

        fetch(`/api/libraries/${libraryId}/inventory/${bookId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.success) {
              location.reload()
            } else {
              showAlert(data.error, "danger")
            }
          })
          .catch((error) => {
            showAlert("An error occurred. Please try again.", "danger")
            console.error("Error:", error)
          })
      }
    })
  })

  // Profile modals
  const editProfileBtn = document.getElementById("edit-profile-btn")
  const changePasswordBtn = document.getElementById("change-password-btn")
  const editProfileModal = document.getElementById("edit-profile-modal")
  const changePasswordModal = document.getElementById("change-password-modal")
  const closeButtonsModal = document.querySelectorAll(".close")

  if (editProfileBtn) {
    editProfileBtn.addEventListener("click", () => {
      editProfileModal.style.display = "block"
    })
  }

  if (changePasswordBtn) {
    changePasswordBtn.addEventListener("click", () => {
      changePasswordModal.style.display = "block"
    })
  }

  closeButtonsModal.forEach((button) => {
    button.addEventListener("click", () => {
      editProfileModal.style.display = "none"
      changePasswordModal.style.display = "none"
    })
  })

  window.addEventListener("click", (e) => {
    if (e.target === editProfileModal) {
      editProfileModal.style.display = "none"
    }
    if (e.target === changePasswordModal) {
      changePasswordModal.style.display = "none"
    }
  })

  // Edit profile form submission
  const editProfileForm = document.getElementById("edit-profile-form")
  if (editProfileForm) {
    editProfileForm.addEventListener("submit", (e) => {
      e.preventDefault()

      const formData = {
        name: document.getElementById("edit-name").value,
        email: document.getElementById("edit-email").value,
        preferredLanguage: document.getElementById("edit-language").value,
      }

      fetch("/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(formData),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            showAlert("Profile updated successfully!", "success")
            setTimeout(() => {
              location.reload()
            }, 1500)
          } else {
            showAlert(data.error, "danger")
          }
        })
        .catch((error) => {
          showAlert("An error occurred. Please try again.", "danger")
          console.error("Error:", error)
        })
    })
  }

  // Change password form submission
  const changePasswordForm = document.getElementById("change-password-form")
  if (changePasswordForm) {
    changePasswordForm.addEventListener("submit", (e) => {
      e.preventDefault()

      const newPassword = document.getElementById("new-password").value
      const confirmPassword = document.getElementById("confirm-password").value

      if (newPassword !== confirmPassword) {
        showAlert("Passwords do not match!", "danger")
        return
      }

      const formData = {
        currentPassword: document.getElementById("current-password").value,
        newPassword: newPassword,
      }

      fetch("/api/users/password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(formData),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            showAlert("Password changed successfully!", "success")
            document.getElementById("change-password-form").reset()
            changePasswordModal.style.display = "none"
          } else {
            showAlert(data.error, "danger")
          }
        })
        .catch((error) => {
          showAlert("An error occurred. Please try again.", "danger")
          console.error("Error:", error)
        })
    })
  }

  // Search functionality
  const searchBooksInput = document.getElementById("search-books")
  if (searchBooksInput) {
    searchBooksInput.addEventListener(
      "input",
      debounce(function () {
        const searchTerm = this.value.toLowerCase()
        const bookCards = document.querySelectorAll(".book-card")

        bookCards.forEach((card) => {
          const title = card.querySelector("h3").textContent.toLowerCase()
          const author = card.querySelector(".author").textContent.toLowerCase()

          if (title.includes(searchTerm) || author.includes(searchTerm)) {
            card.style.display = "block"
          } else {
            card.style.display = "none"
          }
        })
      }, 300),
    )
  }

  const searchLibrariesInput = document.getElementById("search-libraries")
  if (searchLibrariesInput) {
    searchLibrariesInput.addEventListener(
      "input",
      debounce(function () {
        const searchTerm = this.value.toLowerCase()
        const libraryCards = document.querySelectorAll(".library-card")

        libraryCards.forEach((card) => {
          const name = card.querySelector("h3").textContent.toLowerCase()
          const address = card.querySelector(".address").textContent.toLowerCase()

          if (name.includes(searchTerm) || address.includes(searchTerm)) {
            card.style.display = "block"
          } else {
            card.style.display = "none"
          }
        })
      }, 300),
    )
  }

  // Filter functionality
  const filterLibrary = document.getElementById("filter-library")
  const filterAvailability = document.getElementById("filter-availability")

  if (filterLibrary) {
    filterLibrary.addEventListener("change", () => {
      applyFilters()
    })
  }

  if (filterAvailability) {
    filterAvailability.addEventListener("change", () => {
      applyFilters()
    })
  }

  function applyFilters() {
    const libraryFilter = filterLibrary ? filterLibrary.value : ""
    const availabilityFilter = filterAvailability ? filterAvailability.value : ""
    const bookCards = document.querySelectorAll(".book-card")

    bookCards.forEach((card) => {
      let showCard = true

      if (libraryFilter && card.querySelector(".library")) {
        const libraryText = card.querySelector(".library").textContent
        if (!libraryText.includes(libraryFilter)) {
          showCard = false
        }
      }

      if (availabilityFilter) {
        const statusElement = card.querySelector(".status")
        if (availabilityFilter === "available" && !statusElement.classList.contains("available")) {
          showCard = false
        } else if (availabilityFilter === "borrowed" && !statusElement.classList.contains("borrowed")) {
          showCard = false
        }
      }

      card.style.display = showCard ? "block" : "none"
    })
  }

  // Helper functions
  function showAlert(message, type) {
    const alertsContainer = document.querySelector(".container")
    const alertDiv = document.createElement("div")
    alertDiv.className = `alert alert-${type}`
    alertDiv.innerHTML = `
      ${message}
      <span class="close-btn">&times;</span>
    `

    alertsContainer.insertBefore(alertDiv, alertsContainer.firstChild)

    // Add event listener to close button
    alertDiv.querySelector(".close-btn").addEventListener("click", () => {
      alertDiv.style.display = "none"
    })

    // Auto close after 5 seconds
    setTimeout(() => {
      alertDiv.style.display = "none"
    }, 5000)
  }

  function getToken() {
    return localStorage.getItem("token")
  }

  function isLoggedIn() {
    return !!getToken()
  }

  // Update the updateLanguagePreference function
  function updateLanguagePreference(lang) {
    console.log(`Updating language preference to: ${lang}`)
    fetch("/api/users/language", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ preferredLanguage: lang }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Language preference updated:", data)
      })
      .catch((error) => {
        console.error("Error updating language preference:", error)
      })
  }

  function debounce(func, delay) {
    let timeout
    return function () {
      const args = arguments
      clearTimeout(timeout)
      timeout = setTimeout(() => func.apply(this, args), delay)
    }
  }
})

