const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector(".site-nav");

if (menuToggle && siteNav) {
  menuToggle.addEventListener("click", () => {
    const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isExpanded));
    siteNav.classList.toggle("is-open");
  });

  siteNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      menuToggle.setAttribute("aria-expanded", "false");
      siteNav.classList.remove("is-open");
    });
  });
}

const currentPage = document.body.dataset.page;
if (currentPage) {
  document.querySelectorAll(`[data-link="${currentPage}"]`).forEach((activeLink) => {
    activeLink.classList.add("is-active");
  });
}

const tabButtons = document.querySelectorAll(".tab-button");
const tabForms = document.querySelectorAll(".contact-form");

const syncChoiceStates = () => {
  document.querySelectorAll(".segment-option").forEach((option) => {
    const input = option.querySelector("input");
    option.classList.toggle("selected", Boolean(input?.checked));
  });

  document.querySelectorAll(".radio-line").forEach((line) => {
    const input = line.querySelector("input");
    line.classList.toggle("active", Boolean(input?.checked));
  });
};

const syncAdaptiveContacts = () => {
  document.querySelectorAll("[data-contact-adapter]").forEach((wrapper) => {
    const form = wrapper.closest("form");
    const input = wrapper.querySelector("[data-contact-input]");
    const prefix = wrapper.querySelector("[data-contact-prefix]");
    const checkedMethod = form?.querySelector('input[name="contactMethod"]:checked');

    if (!form || !input || !prefix || !checkedMethod) {
      return;
    }

    const method = checkedMethod.value;
    const isEmail = method === "Email";

    prefix.textContent = isEmail ? "@" : "+1";
    input.type = isEmail ? "email" : "tel";
    input.placeholder =
      method === "WhatsApp"
        ? "Your WhatsApp number"
        : method === "Email"
          ? "Your email address"
          : "Your mobile number";
  });
};

const syncDisableToggles = () => {
  document.querySelectorAll("[data-toggle-disable]").forEach((toggle) => {
    const form = toggle.closest("form");
    const target = form?.querySelector(toggle.dataset.toggleDisable) || document.querySelector(toggle.dataset.toggleDisable);

    if (!target) {
      return;
    }

    target.disabled = toggle.checked;
  });
};

const setupSmartDateInputs = () => {
  document.querySelectorAll("[data-smart-date]").forEach((input) => {
    input.addEventListener("focus", () => {
      if (!input.value) {
        input.type = "date";
      }
    });

    input.addEventListener("blur", () => {
      if (!input.value) {
        input.type = "text";
      }
    });
  });
};

const syncServiceVariants = () => {
  const serviceForm = document.getElementById("service-form");

  if (!serviceForm) {
    return;
  }

  const selectedType = serviceForm.querySelector('input[name="eventType"]:checked')?.value || "Wedding";
  const activeVariant = selectedType === "Wedding" ? "wedding" : "generic";

  serviceForm.querySelectorAll("[data-variant]").forEach((block) => {
    block.classList.toggle("is-active", block.dataset.variant === activeVariant);
  });
};

const syncServiceIntroState = () => {
  const serviceForm = document.getElementById("service-form");

  if (!serviceForm) {
    return;
  }

  const eventType = serviceForm.querySelector('input[name="eventType"]:checked')?.value || "Wedding";
  const contactMethod = serviceForm.querySelector('input[name="contactMethod"]:checked')?.value || "Call";
  const introStep = serviceForm.querySelector('.contact-step[data-step="intro"]');
  const nextButton = introStep?.querySelector("[data-step-next]");
  const callSchedule = introStep?.querySelector("[data-call-schedule]");
  const showCallSchedule = eventType === "Wedding" && contactMethod === "Call";

  callSchedule?.classList.toggle("is-visible", showCallSchedule);

  if (nextButton) {
    const directSubmit = eventType === "Photoshoot";
    nextButton.textContent = directSubmit ? "Submit" : "Next";
    nextButton.dataset.directSubmit = directSubmit ? "true" : "false";
  }
};

const validateStep = (step) => {
  const fields = step.querySelectorAll("input, select, textarea");

  for (const field of fields) {
    if (field.disabled || field.type === "hidden" || !field.willValidate) {
      continue;
    }

    if (!field.checkValidity()) {
      field.reportValidity();
      return false;
    }
  }

  return true;
};

const setWizardStep = (form, stepName) => {
  form.querySelectorAll(".contact-step").forEach((step) => {
    step.classList.toggle("active", step.dataset.step === stepName);
  });
};

const formatPriceRange = (low, high) => {
  const formatter = new Intl.NumberFormat("en-CA");
  return `CAD ${formatter.format(low)} - ${formatter.format(high)}`;
};

const listCheckedValues = (form, name) =>
  Array.from(form.querySelectorAll(`input[name="${name}"]:checked`)).map((item) => item.value);

const readAttendeeSummary = (form, items) =>
  items
    .map((item) => {
      const count = Number(form.elements[item.count]?.value || 0);
      if (!count) {
        return null;
      }

      const services = item.services
        .filter((service) => form.elements[service.key]?.checked)
        .map((service) => service.label);

      return `${item.label} x${count}${services.length ? ` (${services.join(", ")})` : ""}`;
    })
    .filter(Boolean);

const renderSummaryList = (container, items) => {
  if (!container) {
    return;
  }

  container.innerHTML = "";
  const finalItems = items.length ? items : ["None selected"];

  finalItems.forEach((item) => {
    const listItem = document.createElement("li");
    listItem.textContent = item;
    container.appendChild(listItem);
  });
};

const buildServiceSummary = (form) => {
  const eventType = form.querySelector('input[name="eventType"]:checked')?.value || "Wedding";
  const contactMethod = form.querySelector('input[name="contactMethod"]:checked')?.value || "Call";
  const contactValue = form.elements.contactValue?.value?.trim() || "+1 0000000000";
  const fullName = form.elements.fullName?.value?.trim() || "there";
  const isWedding = eventType === "Wedding";
  const activeStep = form.querySelector(".contact-step.active")?.dataset.step || "intro";
  const includeDetailSelections = activeStep !== "intro";

  const selectedServices = includeDetailSelections
    ? isWedding
      ? [form.querySelector('input[name="bridalService"]:checked')?.value]
      : [form.querySelector('input[name="genericServiceChoice"]:checked')?.value]
    : [];

  const basicItems = [
    eventType,
    ...selectedServices.filter((item) => item && item !== "None"),
    form.elements.eventDate?.value ? `Date: ${form.elements.eventDate.value}` : "Date: To be confirmed",
    form.elements.eventTime?.value ? `Time: ${form.elements.eventTime.value}` : "Time: To be confirmed",
    includeDetailSelections
      ? form.elements.eventLocation?.value?.trim()
        ? `Location: ${form.elements.eventLocation.value.trim()}`
        : "Location: To be confirmed"
      : null,
  ];

  const premiumItems = listCheckedValues(form, "premiumServices");
  const additionalItems = isWedding
    ? readAttendeeSummary(form, [
        { label: "Groom", count: "groomCount", services: [{ key: "groomMakeup", label: "Makeup" }] },
        { label: "Bridesmaid", count: "bridesmaidCount", services: [{ key: "bridesmaidHair", label: "Hairstyle" }, { key: "bridesmaidMakeup", label: "Makeup" }] },
        { label: "Flower girl", count: "flowerGirlCount", services: [{ key: "flowerGirlHair", label: "Hairstyle" }, { key: "flowerGirlMakeup", label: "Makeup" }] },
      ])
    : readAttendeeSummary(form, [
        { label: "Woman", count: "womanCount", services: [{ key: "womanHair", label: "Hairstyle" }, { key: "womanMakeup", label: "Makeup" }] },
        { label: "Man", count: "manCount", services: [{ key: "manMakeup", label: "Makeup" }] },
      ]);

  let low = eventType === "Wedding" ? 1000 : eventType === "Party" ? 420 : 520;
  let high = eventType === "Wedding" ? 1200 : eventType === "Party" ? 620 : 760;

  low += premiumItems.length * 45;
  high += premiumItems.length * 70;
  low += additionalItems.length * 60;
  high += additionalItems.length * 110;

  return {
    fullName,
    note: `We will ${contactMethod === "Email" ? "email" : "contact"} ${contactValue} to confirm the appointment details with you.`,
    price: formatPriceRange(low, high),
    basicTitle: "Basic services",
    premiumTitle: "Premium services",
    additionalTitle: "Additional attendees",
    basicItems,
    premiumItems,
    additionalItems,
    shareText: `${fullName} | ${eventType} | ${formatPriceRange(low, high)} | ${basicItems.join(", ")}`,
  };
};

const buildAcademySummary = (form) => {
  const classType = form.querySelector('input[name="classType"]:checked')?.value || "1-on-1 Master Subscription";
  const contactMethod = form.querySelector('input[name="contactMethod"]:checked')?.value || "Call";
  const contactValue = form.elements.contactValue?.value?.trim() || "+1 0000000000";
  const fullName = form.elements.fullName?.value?.trim() || "Janny";
  const questions = form.elements.questions?.value?.trim();

  const priceMap = {
    "1-on-1 Master Subscription": [180, 260],
    "1-day Makeup Workshop": [140, 220],
    "Self-Makeup beginner class": [110, 160],
  };

  const [low, high] = priceMap[classType] || [150, 220];

  return {
    fullName,
    note: `We will ${contactMethod === "Email" ? "email" : "call"} ${contactValue} to get back to your enquiry`,
    price: formatPriceRange(low, high),
    basicTitle: "Selected class",
    premiumTitle: "Your questions",
    additionalTitle: "Contact details",
    basicItems: [classType, form.elements.preferredDate?.value || "Date to be confirmed"],
    premiumItems: questions ? [questions] : [],
    additionalItems: [`Preferred contact: ${contactMethod}`, contactValue],
    shareText: `${fullName} | ${classType} | ${formatPriceRange(low, high)}`,
  };
};

const fillSummary = (form, summary) => {
  const nameNodes = form.querySelectorAll("[data-success-name]");
  const noteNode = form.querySelector("[data-success-note]");
  const priceNode = form.querySelector("[data-success-price]");
  const basicTitleNode = form.querySelector("[data-summary-title-basic]");
  const premiumTitleNode = form.querySelector("[data-summary-title-premium]");
  const additionalTitleNode = form.querySelector("[data-summary-title-additional]");

  nameNodes.forEach((node) => {
    node.textContent = summary.fullName;
  });

  if (noteNode) {
    noteNode.textContent = summary.note;
  }

  if (priceNode) {
    priceNode.textContent = summary.price;
  }

  if (basicTitleNode) {
    basicTitleNode.textContent = summary.basicTitle;
  }

  if (premiumTitleNode) {
    premiumTitleNode.textContent = summary.premiumTitle;
  }

  if (additionalTitleNode) {
    additionalTitleNode.textContent = summary.additionalTitle;
  }

  renderSummaryList(form.querySelector("[data-summary-basic]"), summary.basicItems);
  renderSummaryList(form.querySelector("[data-summary-premium]"), summary.premiumItems);
  renderSummaryList(form.querySelector("[data-summary-additional]"), summary.additionalItems);
  form.dataset.shareSummary = summary.shareText;
};

const submitWizardSummary = (form) => {
  const summary = form.id === "service-form" ? buildServiceSummary(form) : buildAcademySummary(form);
  fillSummary(form, summary);
  console.log(`${form.dataset.form} submission`, Object.fromEntries(new FormData(form).entries()));
  setWizardStep(form, "success");
};

const setActiveForm = (targetId) => {
  tabButtons.forEach((item) => {
    item.classList.toggle("is-active", item.dataset.formTarget === targetId);
  });

  tabForms.forEach((form) => {
    form.classList.toggle("active", form.id === targetId);
  });
};

tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setActiveForm(button.dataset.formTarget);
  });
});

if (window.location.hash === "#academy-form") {
  setActiveForm("academy-form");
}

if (window.location.hash === "#service-form" || window.location.hash === "#services-form") {
  setActiveForm("service-form");
}

document.querySelectorAll(".segment-option input, .radio-line input").forEach((input) => {
  input.addEventListener("change", syncChoiceStates);
  input.addEventListener("change", syncAdaptiveContacts);
  input.addEventListener("change", syncServiceVariants);
  input.addEventListener("change", syncServiceIntroState);
});

document.querySelectorAll("[data-toggle-disable]").forEach((input) => {
  input.addEventListener("change", syncDisableToggles);
});

document.querySelectorAll("[data-step-next]").forEach((button) => {
  button.addEventListener("click", () => {
    const form = button.closest("form");
    const currentStep = button.closest(".contact-step");
    const selectedEventType =
      form?.id === "service-form"
        ? form.querySelector('input[name="eventType"]:checked')?.value || "Wedding"
        : null;
    const skipIntroValidation =
      form?.id === "service-form" &&
      currentStep?.dataset.step === "intro" &&
      selectedEventType === "Wedding";

    if (!form || !currentStep) {
      return;
    }

    if (!skipIntroValidation && !validateStep(currentStep)) {
      return;
    }

    if (form.id === "service-form" && button.dataset.directSubmit === "true") {
      submitWizardSummary(form);
      return;
    }

    syncServiceVariants();
    setWizardStep(form, button.dataset.stepNext);
  });
});

document.querySelectorAll("[data-step-back]").forEach((button) => {
  button.addEventListener("click", () => {
    const form = button.closest("form");

    if (!form) {
      return;
    }

    setWizardStep(form, button.dataset.stepBack);
  });
});

document.querySelectorAll("[data-edit-summary]").forEach((button) => {
  button.addEventListener("click", () => {
    const form = button.closest("form");

    if (!form) {
      return;
    }

    setWizardStep(form, button.dataset.editSummary);
  });
});

document.querySelectorAll("[data-stepper-action]").forEach((button) => {
  button.addEventListener("click", () => {
    const input = button.parentElement?.querySelector('input[type="number"]');

    if (!input) {
      return;
    }

    const currentValue = Number(input.value || 0);
    const min = Number(input.min || 0);
    const max = Number(input.max || 10);
    const nextValue =
      button.dataset.stepperAction === "increment"
        ? Math.min(max, currentValue + 1)
        : Math.max(min, currentValue - 1);

    input.value = String(nextValue);
  });
});

document.querySelectorAll("[data-share-summary]").forEach((button) => {
  button.addEventListener("click", async () => {
    const form = button.closest("form");
    const summaryText = form?.dataset.shareSummary;

    if (!summaryText) {
      return;
    }

    try {
      await navigator.clipboard.writeText(summaryText);
      alert("Summary copied to clipboard.");
    } catch (error) {
      console.error("Unable to copy summary", error);
      alert("Couldn't copy the summary this time.");
    }
  });
});

syncChoiceStates();
syncAdaptiveContacts();
syncDisableToggles();
syncServiceVariants();
syncServiceIntroState();
setupSmartDateInputs();

document.querySelectorAll("form[data-form]").forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (form.id === "home-service-form") {
      window.location.href = "./contact.html#service-form";
      return;
    }

    if (form.classList.contains("contact-wizard")) {
      const activeStep = form.querySelector(".contact-step.active");
      const skipWizardValidation =
        (form.id === "academy-form" && activeStep?.dataset.step === "intro") ||
        (form.id === "service-form" &&
          activeStep?.dataset.step === "intro" &&
          activeStep.querySelector("[data-step-next]")?.dataset.directSubmit === "true");

      if (!activeStep || (!skipWizardValidation && !validateStep(activeStep))) {
        return;
      }

      if (form.id === "academy-form" && activeStep.dataset.step === "intro") {
        submitWizardSummary(form);
        return;
      }

      if (form.id === "service-form" && activeStep.dataset.step === "intro") {
        if (activeStep.querySelector("[data-step-next]")?.dataset.directSubmit === "true") {
          submitWizardSummary(form);
        } else {
          syncServiceVariants();
          setWizardStep(form, "details");
        }
        return;
      }

      submitWizardSummary(form);
      return;
    }

    const data = Object.fromEntries(new FormData(form).entries());
    console.log(`${form.dataset.form} submission`, data);

    const formLabel = form.dataset.form.replace(/-/g, " ");
    alert(`Thanks! Your ${formLabel} was submitted successfully.`);
    form.reset();
    syncChoiceStates();
    syncAdaptiveContacts();
  });
});

document.querySelectorAll("[data-year]").forEach((yearNode) => {
  yearNode.textContent = new Date().getFullYear();
});
