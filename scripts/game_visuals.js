const THEME_STORAGE_KEY = "crakkle-game-theme";

// Preferences and dialogs
function getPreferredTheme() {
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);

  if (savedTheme === "dark" || savedTheme === "light") {
    return savedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem(THEME_STORAGE_KEY, theme);
}

function setupToolbarDialog({
  containerSelector,
  buttonId,
  closeButtonId,
  dialogId,
  onOpen,
  onClose,
}) {
  const container = document.querySelector(containerSelector);
  const button = document.getElementById(buttonId);
  const closeButton = document.getElementById(closeButtonId);
  const dialog = document.getElementById(dialogId);

  if (!container || !button || !closeButton || !dialog) {
    return null;
  }

  const syncModalOpenState = () => {
    const hasOpenDialog = document.querySelector(
      ".how-to-dropdown:not(.hidden), .settings-dropdown:not(.hidden)",
    );
    document.body.classList.toggle("modal-open", Boolean(hasOpenDialog));
  };

  const setDialogState = (isOpen, options = {}) => {
    const { restoreFocus = true } = options;

    dialog.classList.toggle("hidden", !isOpen);
    button.setAttribute("aria-expanded", String(isOpen));
    dialog.setAttribute("aria-hidden", String(!isOpen));
    syncModalOpenState();

    if (isOpen) {
      closeButton.focus();
      onOpen?.();
    } else {
      onClose?.();

      if (restoreFocus) {
        button.focus();
      }
    }
  };

  button.addEventListener("click", () => {
    setDialogState(true, {
      restoreFocus: false,
    });
  });

  closeButton.addEventListener("click", () => {
    setDialogState(false);
  });

  document.addEventListener("click", (event) => {
    if (!container.contains(event.target)) {
      setDialogState(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setDialogState(false);
    }
  });

  return {
    close() {
      setDialogState(false);
    },
    open() {
      setDialogState(true, {
        restoreFocus: false,
      });
    },
  };
}

// Setup for the settings menu modal
function setupSettingsMenu(onOpen) {
  const darkModeToggle = document.getElementById("dark-mode-toggle");

  if (!darkModeToggle) {
    return null;
  }

  const startingTheme = getPreferredTheme();
  applyTheme(startingTheme);
  darkModeToggle.checked = startingTheme === "dark";

  darkModeToggle.addEventListener("change", () => {
    applyTheme(darkModeToggle.checked ? "dark" : "light");
  });

  return setupToolbarDialog({
    containerSelector: ".settings-menu",
    buttonId: "settings-cog-button",
    closeButtonId: "settings-close-button",
    dialogId: "settings-dropdown",
    onOpen,
  });
}

// Set up the "How To Play" modal dialog, which provides instructions to the player on how to play the game, ensuring that it can be opened and closed properly and that it interacts correctly with the settings menu to prevent both from being open at the same time.
function setupHowToModal(onOpen) {
  return setupToolbarDialog({
    containerSelector: ".how-to-modal",
    buttonId: "how-to-question-mark-button",
    closeButtonId: "how-to-close-button",
    dialogId: "how-to-dropdown",
    onOpen,
  });
}

// Initialization
function initializeToolbar() {
  let settingsControls = null;
  let howToControls = null;

  settingsControls = setupSettingsMenu(() => {
    howToControls?.close();
  });

  howToControls = setupHowToModal(() => {
    settingsControls?.close();
  });

  howToControls?.open();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeToolbar);
} else {
  initializeToolbar();
}
