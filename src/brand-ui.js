(() => {
  "use strict";

  const PROFILE_LINKS = {
    github: "https://github.com/TuhinSubhraSikdar",
    linkedin: "https://in.linkedin.com/in/tuhin-subhra-sikdar"
  };
  const allowedUrls = new Set(Object.values(PROFILE_LINKS));
  const logoUrl = chrome.runtime.getURL("data-scraper-brand.png");

  const createProfileLink = (label, href, icon) => {
    const link = document.createElement("a");
    link.className = "brand-profile-link";
    link.href = href;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.setAttribute("aria-label", `${label} — opens in a new tab`);

    const badge = document.createElement("span");
    badge.className = `brand-profile-icon brand-profile-icon--${icon}`;
    badge.setAttribute("aria-hidden", "true");
    badge.textContent = icon === "github" ? "GH" : "in";

    const text = document.createElement("span");
    text.textContent = label;
    link.append(badge, text);
    return link;
  };

  const ensureFooter = () => {
    if (document.querySelector(".brand-footer")) return;
    const footer = document.createElement("footer");
    footer.className = "brand-footer";
    footer.setAttribute("aria-label", "Creator profiles");
    footer.append(
      createProfileLink("GitHub", PROFILE_LINKS.github, "github"),
      createProfileLink("LinkedIn", PROFILE_LINKS.linkedin, "linkedin")
    );
    document.body.append(footer);
  };

  const replaceLegacyLogos = () => {
    document.querySelectorAll("img").forEach((image) => {
      if (image.classList.contains("options-logo")) {
        image.src = logoUrl;
        image.alt = "Data Scraper by Tuhin";
      }
    });
  };

  const removeAiProfileUi = () => {
    [
      "#createAiProfile",
      "#generatingAiProfile",
      "#copyAiProfile",
      "#notEnoughAiProfileData"
    ].forEach((selector) => document.querySelector(selector)?.classList.add("brand-ai-hidden"));

    document.querySelectorAll('[role="tab"]').forEach((tab) => {
      if (/ai work profile/i.test(tab.textContent || "")) tab.classList.add("brand-ai-hidden");
    });

    document.querySelectorAll("label").forEach((label) => {
      if (/ai work profile/i.test(label.textContent || "")) {
        label.parentElement?.classList.add("brand-ai-hidden");
      }
    });

    document.querySelectorAll(".options-data-item, .options-consent-card").forEach((card) => {
      if (/ai data|ai chat activity/i.test(card.textContent || "")) {
        card.classList.add("brand-ai-hidden");
      }
    });

    document.querySelectorAll(".options-carousel-dot").forEach((dot) => {
      if (/ai working profile|ai work profile/i.test(dot.getAttribute("aria-label") || "")) {
        dot.classList.add("brand-ai-hidden");
      }
    });

    const profilePreview = document.querySelector(".options-profile");
    const profileSlide = profilePreview?.closest(".options-carousel-slot");
    if (profileSlide?.getAttribute("aria-hidden") === "false") {
      document.querySelector(".options-carousel-dot")?.click();
    }
  };

  const improveDynamicCopy = () => {
    const review = document.querySelector("#pleaseRate");
    if (review && !review.dataset.brandCopyUpdated) {
      review.dataset.brandCopyUpdated = "true";
      const firstText = Array.from(review.childNodes).find((node) => node.nodeType === Node.TEXT_NODE);
      if (firstText) {
        firstText.nodeValue = "Enjoying Data Scraper? Your feedback helps shape the next update.";
      }
    }

    const rateButton = document.querySelector("#rate");
    if (rateButton && rateButton.textContent !== "Leave a review") {
      rateButton.textContent = "Leave a review";
    }
    const laterButton = document.querySelector("#rateLater");
    if (laterButton && laterButton.textContent !== "Maybe later") {
      laterButton.textContent = "Maybe later";
    }
  };

  const sanitizeLinks = () => {
    document.querySelectorAll("a[href]").forEach((link) => {
      let normalized = "";
      try {
        const parsed = new URL(link.href);
        normalized = `${parsed.origin}${parsed.pathname}`.replace(/\/$/, "");
      } catch (_error) {
        normalized = "";
      }

      const isProfileButton = link.classList.contains("brand-profile-link");
      if (!isProfileButton || !allowedUrls.has(normalized)) {
        link.removeAttribute("href");
        link.removeAttribute("target");
        link.removeAttribute("rel");
        link.classList.add("brand-disabled-link");
        link.setAttribute("aria-disabled", "true");
      }
    });
  };

  const updateWorkingState = () => {
    const waiting = Boolean(document.querySelector("#wait"));
    const workingButton = Array.from(document.querySelectorAll("button")).some((button) =>
      /stop crawling|stop collection|working|processing|collecting/i.test(button.textContent || "")
    );
    const working = waiting || workingButton;
    document.body.classList.toggle("brand-is-working", working);

    const label = document.querySelector(".brand-status-text");
    if (label) label.textContent = working ? "Working…" : "Ready";
    document.querySelectorAll("button").forEach((button) => {
      button.classList.toggle(
        "brand-working-button",
        /stop crawling|stop collection|working|processing|collecting/i.test(button.textContent || "")
      );
    });
  };

  let queued = false;
  const refresh = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      ensureFooter();
      replaceLegacyLogos();
      removeAiProfileUi();
      improveDynamicCopy();
      sanitizeLinks();
      updateWorkingState();
    });
  };

  ensureFooter();
  refresh();
  new MutationObserver(refresh).observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["href", "src", "class", "disabled", "aria-hidden", "style"]
  });
})();
