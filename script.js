import { FORM_SECTIONS, DOCUMENT_REQUIREMENTS } from './config.js';
import Sortable from 'sortablejs';

// Toggle dependents section
window.toggleDependents = function (show) {
    const dependentsSection = document.getElementById('dependentsSection');
    const addButton = document.querySelector('.add-dependent');
    
    if (show) {
        dependentsSection.classList.remove('hidden');
        addButton.disabled = dependentCount >= 5;
        if (dependentCount === 0) {
            addDependent();
        }
    } else {
        dependentsSection.classList.add('hidden');
        dependentCount = 0;
        addButton.disabled = false;
        document.querySelectorAll('.dependent-form').forEach(el => el.remove());
    }
}

let dependentCount = 0;
let dependentTemplate = null;

let travelEntryCount = 0;
let travelEntryTemplate = null;

let travelIssueCount = 0;
let travelIssueTemplate = null;

 // Add radio button event listeners
function setupConditionalFields() {
    const toggleMap = {
        'otherNameYes': 'previousNamesField',
        'otherNationalityYes': 'otherNationalityField',
        'correspondenceNo': 'correspondenceAddressField',
        'licenseYes': 'licenseNumberField',
        'spouseTravelYes': 'spousePassportField',
        'motherNationalityNo': 'motherPreviousNationalityField',
        'fatherNationalityNo': 'fatherPreviousNationalityField',
        'ukFamilyYes': 'ukFamilyDetailsField'
    };

    Object.entries(toggleMap).forEach(([triggerId, targetId]) => {
        const trigger = document.getElementById(triggerId);
        if (trigger) {
            // For radio buttons, attach change listener to the group if possible, or individual buttons if names are unique.
            // Using existing logic, it attaches to the 'Yes' trigger.
            trigger.addEventListener('change', () => {
                const targetField = document.getElementById(targetId);
                targetField.style.display = trigger.checked ? 'block' : 'none';
            });
        }
    });

    // Handle 'travelIssues' checkboxes to toggle 'travelIssueDetailsField'
    const travelIssueCheckboxes = document.querySelectorAll('input[name="travelIssues"]');
    travelIssueCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            const anyChecked = Array.from(travelIssueCheckboxes).some(cb => cb.checked);
            toggleTravelIssueDetails(anyChecked);
        });
    });
}

// Load templates on page load
window.addEventListener('load', async () => {
    // Existing signature initialization
    resizeCanvas();
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';

    // Load dependent template
    const dependentResponse = await fetch('/dependent-template.html');
    const parser = new DOMParser();
    const dependentDoc = parser.parseFromString(await dependentResponse.text(), 'text/html');
    dependentTemplate = dependentDoc.getElementById('dependentTemplate').innerHTML;

    // Load travel entry template
    const travelEntryResponse = await fetch('/travel-entry-template.html');
    const travelEntryDoc = parser.parseFromString(await travelEntryResponse.text(), 'text/html');
    travelEntryTemplate = travelEntryDoc.getElementById('travelEntryTemplate').innerHTML;
    
    // Load travel issue template
    const travelIssueResponse = await fetch('/travel-issue-entry-template.html');
    const travelIssueDoc = parser.parseFromString(await travelIssueResponse.text(), 'text/html');
    travelIssueTemplate = travelIssueDoc.getElementById('travelIssueEntryTemplate').innerHTML;
    
    setupConditionalFields();

    // Initialize visibility of conditional fields based on default checked states
    document.querySelectorAll('input[type="radio"]').forEach(radio => {
        if (radio.checked) {
            // Manually trigger change for conditional fields if already checked on load
            const triggerId = radio.id;
            // Check against the toggleMap to see if this radio button controls a conditional field
            if (radio.name === 'otherName' && triggerId === 'otherNameYes') document.getElementById('previousNamesField').style.display = 'block';
            if (radio.name === 'otherName' && triggerId === 'otherNameNo') document.getElementById('previousNamesField').style.display = 'none';

            if (radio.name === 'otherNationality' && triggerId === 'otherNationalityYes') document.getElementById('otherNationalityField').style.display = 'block';
            if (radio.name === 'otherNationality' && triggerId === 'otherNationalityNo') document.getElementById('otherNationalityField').style.display = 'none';

            if (radio.name === 'correspondence' && triggerId === 'correspondenceNo') document.getElementById('correspondenceAddressField').style.display = 'block';
            if (radio.name === 'correspondence' && triggerId === 'correspondenceYes') document.getElementById('correspondenceAddressField').style.display = 'none';

            if (radio.name === 'license' && triggerId === 'licenseYes') document.getElementById('licenseNumberField').style.display = 'block';
            if (radio.name === 'license' && triggerId === 'licenseNo') document.getElementById('licenseNumberField').style.display = 'none';

            if (radio.name === 'spouseTravel' && triggerId === 'spouseTravelYes') document.getElementById('spousePassportField').style.display = 'block';
            if (radio.name === 'spouseTravel' && triggerId === 'spouseTravelNo') document.getElementById('spousePassportField').style.display = 'none';

            if (radio.name === 'motherNationalitySame' && triggerId === 'motherNationalityNo') document.getElementById('motherPreviousNationalityField').style.display = 'block';
            if (radio.name === 'motherNationalitySame' && triggerId === 'motherNationalityYes') document.getElementById('motherPreviousNationalityField').style.display = 'none';

            if (radio.name === 'fatherNationalitySame' && triggerId === 'fatherNationalityNo') document.getElementById('fatherPreviousNationalityField').style.display = 'block';
            if (radio.name === 'fatherNationalitySame' && triggerId === 'fatherNationalityYes') document.getElementById('fatherPreviousNationalityField').style.display = 'none';

            // Handle UK family details toggling
            if (radio.name === 'ukFamily' && triggerId === 'ukFamilyYes') document.getElementById('ukFamilyDetailsField').style.display = 'block';
            if (radio.name === 'ukFamily' && triggerId === 'ukFamilyNo') document.getElementById('ukFamilyDetailsField').style.display = 'none';
            
            // Handle new otherTravel field
            if (radio.name === 'otherTravel' && triggerId === 'otherTravelYes') toggleOtherTravelDetails(true);
            if (radio.name === 'otherTravel' && triggerId === 'otherTravelNo') toggleOtherTravelDetails(false);
        }
    });

    // Initialize visibility for travelIssueDetailsField based on checkboxes
    const travelIssueCheckboxes = document.querySelectorAll('input[name="travelIssues"]');
    const anyTravelIssueChecked = Array.from(travelIssueCheckboxes).some(cb => cb.checked);
    toggleTravelIssueDetails(anyTravelIssueChecked);
    // If any are checked initially, make sure to add one entry if none exist
    if (anyTravelIssueChecked && travelIssueCount === 0) {
        addTravelIssueEntry();
    }
    
    setupDocumentClickListener();
});

// Setup click listener for document list items
function setupDocumentClickListener() {
    const listItems = document.querySelectorAll('.sortable-item');
    
    listItems.forEach(item => {
        item.addEventListener('click', (e) => {
            const docKey = item.getAttribute('data-doc-key');
            if (docKey && DOCUMENT_REQUIREMENTS[docKey]) {
                displayDocumentDetails(docKey, item);
            }
        });
    });
}

function displayDocumentDetails(key, clickedItem) {
    const details = DOCUMENT_REQUIREMENTS[key];
    const displayArea = document.getElementById('documentDetailsDisplay');
    
    // Remove active class from all items
    document.querySelectorAll('.sortable-item').forEach(item => {
        item.classList.remove('active-doc');
    });

    // Add active class to the clicked item
    clickedItem.classList.add('active-doc');

    let html = `<h3>${key}</h3>`;
    html += `<p class="purpose"><strong>Purpose:</strong> ${details.purpose}</p>`;
    html += `<strong>Requirements:</strong>`;
    html += `<ul>${details.requirements.map(req => `<li>${req}</li>`).join('')}</ul>`;

    displayArea.innerHTML = html;
    displayArea.classList.remove('hidden');
    
    // Scroll the details into view
    displayArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Add additional dependents
window.addDependent = function() {
    if (dependentCount >= 5) return;
    dependentCount++;
    
    const dependentHTML = dependentTemplate.replace(/{n}/g, dependentCount);
    const newDependent = document.createElement('div');
    newDependent.className = 'dependent-form';
    newDependent.innerHTML = dependentHTML;
    
    const addButton = document.querySelector('.add-dependent');
    document.getElementById('dependentsSection').insertBefore(newDependent, addButton);

    // Disable button after 5 dependents
    if (dependentCount >= 5) {
        addButton.disabled = true;
    }
}

// Toggle Other Travel Details section
window.toggleOtherTravelDetails = function(show) {
    const otherTravelDetailsSection = document.getElementById('otherTravelDetailsField');
    const addButton = otherTravelDetailsSection.querySelector('.add-travel-entry');

    if (show) {
        otherTravelDetailsSection.style.display = 'block'; // Make visible
        addButton.disabled = travelEntryCount >= 5; // Assuming a limit, adjust as needed
        if (travelEntryCount === 0) {
            addTravelEntry(); // Add the first entry if none exist
        }
    } else {
        otherTravelDetailsSection.style.display = 'none'; // Hide
        travelEntryCount = 0;
        addButton.disabled = false; // Reset button state
        document.querySelectorAll('.travel-entry-form').forEach(el => el.remove()); // Clear entries
    }
}

// Add additional travel entries
window.addTravelEntry = function() {
    if (travelEntryCount >= 5) return; // Limit to 5 entries
    travelEntryCount++;
    
    const travelEntryHTML = travelEntryTemplate.replace(/{n}/g, travelEntryCount);
    const newTravelEntry = document.createElement('div');
    newTravelEntry.className = 'travel-entry-form';
    newTravelEntry.innerHTML = travelEntryHTML;
    
    const addButton = document.querySelector('.add-travel-entry');
    document.getElementById('otherTravelDetailsField').insertBefore(newTravelEntry, addButton);

    // Disable button after limit
    if (travelEntryCount >= 5) {
        addButton.disabled = true;
    }
}

// Toggle Travel Issue Details section
window.toggleTravelIssueDetails = function(show) {
    const travelIssueDetailsSection = document.getElementById('travelIssueDetailsField');
    const addButton = travelIssueDetailsSection.querySelector('.add-travel-issue-entry');

    if (show) {
        travelIssueDetailsSection.style.display = 'block';
        addButton.disabled = travelIssueCount >= 5; // Assuming a limit, adjust as needed
        if (travelIssueCount === 0) {
            addTravelIssueEntry(); // Add the first entry if none exist
        }
    } else {
        travelIssueDetailsSection.style.display = 'none';
        travelIssueCount = 0;
        addButton.disabled = false;
        document.querySelectorAll('.travel-issue-entry-form').forEach(el => el.remove());
    }
}

// Add additional travel issue entries
window.addTravelIssueEntry = function() {
    if (travelIssueCount >= 5) return; // Limit to 5 entries
    travelIssueCount++;
    
    const travelIssueHTML = travelIssueTemplate.replace(/{n}/g, travelIssueCount);
    const newTravelIssue = document.createElement('div');
    newTravelIssue.className = 'travel-issue-entry-form';
    newTravelIssue.innerHTML = travelIssueHTML;
    
    const addButton = document.querySelector('.add-travel-issue-entry');
    document.getElementById('travelIssueDetailsField').insertBefore(newTravelIssue, addButton);

    // Disable button after limit
    if (travelIssueCount >= 5) {
        addButton.disabled = true;
    }
}

// Signature functionality
const canvas = document.getElementById('signatureBox');
const ctx = canvas.getContext('2d');
let isDrawing = false;
let lastX = 0;
let lastY = 0;

// Set canvas size
function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
}

// Handle drawing
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('touchstart', handleTouchStart);

canvas.addEventListener('mousemove', draw);
canvas.addEventListener('touchmove', handleTouchMove);

canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('touchend', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);

function startDrawing(e) {
    isDrawing = true;
    [lastX, lastY] = getCoordinates(e);
}

function handleTouchStart(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousedown', {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    startDrawing(mouseEvent);
}

function draw(e) {
    if (!isDrawing) return;
    const [x, y] = getCoordinates(e);

    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.stroke();

    [lastX, lastY] = [x, y];
}

function handleTouchMove(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousemove', {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    draw(mouseEvent);
}

function stopDrawing() {
    isDrawing = false;
}

function getCoordinates(e) {
    const rect = canvas.getBoundingClientRect();
    return [
        e.clientX - rect.left,
        e.clientY - rect.top
    ];
}

// Initialize SortableJS
document.addEventListener('DOMContentLoaded', () => {
    const sortableList = document.querySelector('.sortable-list');
    if (sortableList) {
        Sortable.create(sortableList, {
            animation: 150,
            handle: '.sortable-item',
            ghostClass: 'sortable-ghost',
            dragClass: 'sortable-drag'
        });
    }
});