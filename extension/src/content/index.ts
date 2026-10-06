console.log("CareerPilot content script loaded");

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.action === "extract_job") {
    try {
      const jobData = extractJob();
      sendResponse({ success: true, data: jobData });
    } catch (error) {
      console.error("Error extracting job:", error);
      sendResponse({ 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  }
  return true; // Keep the message channel open for async response
});

function extractJob() {
  const hostname = window.location.hostname;

  if (hostname.includes("linkedin.com")) {
    return extractLinkedInJob();
  } else if (hostname.includes("greenhouse.io")) {
    return extractGreenhouseJob();
  } else if (hostname.includes("lever.co")) {
    return extractLeverJob();
  } else {
    // Fallback for any other site
    return extractGenericJob();
  }
}

function extractLinkedInJob() {
  const titleEl = document.querySelector('.job-details-jobs-unified-top-card__job-title') 
    || document.querySelector('h1.t-24') 
    || document.querySelector('h1');
  const title = titleEl?.textContent?.trim() || "";

  const companyEl = document.querySelector('.job-details-jobs-unified-top-card__company-name') 
    || document.querySelector('.jobs-unified-top-card__company-name');
  const company = companyEl?.textContent?.trim() || "";
  
  const locationEl = document.querySelector('.job-details-jobs-unified-top-card__primary-description-container span') 
    || document.querySelector('.jobs-unified-top-card__bullet');
  let location = locationEl?.textContent?.trim() || "";
  if (location.includes("·")) {
    location = location.split("·")[0].trim();
  }

  const descEl = document.querySelector('.jobs-description__content') || document.getElementById('job-details');
  const description = (descEl as HTMLElement)?.innerText?.trim() || descEl?.textContent?.trim() || "";

  if (!title) throw new Error("Could not find job title. Make sure you have a specific job open.");
  
  return { title, company, location, description, sourceUrl: window.location.href };
}

function extractGreenhouseJob() {
  const titleEl = document.querySelector('.app-title');
  const title = titleEl?.textContent?.trim() || document.title;
  
  const companyEl = document.querySelector('.company-name');
  const company = companyEl?.textContent?.replace('at ', '')?.trim() || "";
  
  const locationEl = document.querySelector('.location');
  const location = locationEl?.textContent?.trim() || "";

  const descEl = document.getElementById('content');
  const description = (descEl as HTMLElement)?.innerText?.trim() || descEl?.textContent?.trim() || "";

  return { title, company, location, description, sourceUrl: window.location.href };
}

function extractLeverJob() {
  const titleEl = document.querySelector('.posting-headline h2');
  const title = titleEl?.textContent?.trim() || document.title;
  
  // Lever doesn't usually show company name on the job posting clearly, might need to extract from title or footer
  const company = "Unknown Company (Lever)"; 
  
  const locationEl = document.querySelector('.sort-by-time.posting-category');
  const location = locationEl?.textContent?.trim() || "";

  // Content usually in multiple divs
  const descElements = document.querySelectorAll('.section.page-centered');
  let description = "";
  descElements.forEach(el => {
    description += (el as HTMLElement).innerText + "\n\n";
  });

  return { title, company, location, description: description.trim(), sourceUrl: window.location.href };
}

function extractGenericJob() {
  // 1. Get Title from document.title or h1
  const h1 = document.querySelector('h1');
  const title = h1?.textContent?.trim() || document.title;
  
  // 2. We often don't know the company on generic pages (unless it's in the title)
  const company = "Unknown Company";
  
  // 3. Location is hard to guess generically
  const location = "";
  
  // 4. Description: Try to grab main content
  let description = "";
  const mainEl = document.querySelector('main') || document.querySelector('[role="main"]');
  
  if (mainEl) {
    description = (mainEl as HTMLElement).innerText?.trim() || mainEl.textContent?.trim() || "";
  } else {
    // Just grab body text, but it will be messy (includes nav, footer, etc.)
    // We let CareerPilot's AI sort it out in the backend
    description = document.body.innerText?.trim() || document.body.textContent?.trim() || "";
  }

  // To prevent passing absolutely massive strings if the page is crazy big, we truncate
  if (description.length > 50000) {
    description = description.substring(0, 50000);
  }

  return { title, company, location, description, sourceUrl: window.location.href };
}
