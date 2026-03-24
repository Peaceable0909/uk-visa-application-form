import { jsPDF } from 'jspdf';
import { FORM_SECTIONS } from './config.js';

window.generatePDF = function() {
  try {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const form = document.querySelector('.form-container');
    
    // PDF styling constants (points)
    const fontSize = 11;
    const sectionFontSize = 13;
    const headingFontSize = 16;
    const lineHeight = 16; // taller for readability
    const margin = 40;
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    let yPos = margin;
    
    // Title
    doc.setFontSize(headingFontSize);
    doc.text('UK Visa Application Form', margin, yPos);
    yPos += lineHeight * 1.2;

    // Small divider under title
    doc.setDrawColor(200);
    doc.setLineWidth(1);
    doc.line(margin, yPos - 6, pageWidth - margin, yPos - 6);
    yPos += lineHeight * 0.4;

    // Process each section in defined order
    FORM_SECTIONS.forEach((sectionTitle, sectionIndex) => {
      // Find the section heading element in DOM
      const sectionElem = Array.from(form.querySelectorAll('h2, h3'))
        .find(heading => heading.textContent === sectionTitle);
      if (!sectionElem) return;

      // Page-break check before new section
      if (yPos + lineHeight * 3 > pageHeight - margin) {
        doc.addPage();
        yPos = margin;
      }

      // Section heading with a light divider
      doc.setFontSize(sectionFontSize);
      doc.setTextColor(28,87,118);
      doc.text(sectionTitle, margin, yPos);
      yPos += lineHeight * 0.9;
      doc.setDrawColor(220);
      doc.setLineWidth(0.5);
      doc.line(margin, yPos - 6, pageWidth - margin, yPos - 6);
      yPos += lineHeight * 0.4;
      doc.setTextColor(0,0,0); // reset text color

      // Find the parent .section container
      let currentElem = sectionElem.parentElement;
      while(currentElem && !currentElem.classList.contains('section')) {
        currentElem = currentElem.parentElement;
      }

      const sectionElements = currentElem ? Array.from(currentElem.querySelectorAll('.form-group, .dependent-form, .travel-entry-form, .travel-issue-entry-form')) : [];

      const isVisible = (el) => {
        let current = el;
        while (current && current !== form) {
          if (current.classList && current.classList.contains('conditional-field') && current.style.display === 'none') {
            return false;
          }
          current = current.parentElement;
        }
        return true;
      };

      sectionElements.forEach(element => {
        if (!isVisible(element)) return;

        // Ensure enough space for next chunk
        const ensureSpace = (lines = 3) => {
          if (yPos + lineHeight * lines > pageHeight - margin) {
            doc.addPage();
            yPos = margin;
          }
        };

        // Handle dependent forms
        if (element.classList.contains('dependent-form')) {
          const dependentHeading = element.querySelector('h3');
          if (dependentHeading) {
            ensureSpace(2);
            doc.setFontSize(fontSize);
            yPos = addWrappedText(doc, dependentHeading.textContent, margin, yPos, lineHeight, pageWidth - 2 * margin);
            yPos += lineHeight * 0.2;
          }
          element.querySelectorAll('.form-group').forEach(depFormGroup => {
            if (!isVisible(depFormGroup)) return;
            const depLabel = depFormGroup.querySelector('label');
            const depInput = depFormGroup.querySelector('input, textarea, select');
            if (depLabel && depInput) {
              ensureSpace(2);
              const value = extractValue(depFormGroup, depInput);
              const labelText = depLabel.textContent.replace(':', '').trim();
              yPos = addWrappedText(doc, `${labelText}: ${value}`, margin + 10, yPos, lineHeight, pageWidth - 2 * margin - 10);
            }
          });
          yPos += lineHeight * 0.2;
          return;
        }

        // Handle travel entries
        if (element.classList.contains('travel-entry-form') || element.classList.contains('travel-issue-entry-form')) {
          const heading = element.querySelector('h3');
          if (heading) {
            ensureSpace(2);
            doc.setFontSize(fontSize);
            yPos = addWrappedText(doc, heading.textContent, margin, yPos, lineHeight, pageWidth - 2 * margin);
            yPos += lineHeight * 0.2;
          }
          element.querySelectorAll('.form-group').forEach(group => {
            if (!isVisible(group)) return;
            const label = group.querySelector('label');
            const input = group.querySelector('input, textarea, select');
            if (label && input) {
              ensureSpace(2);
              const value = extractValue(group, input);
              const labelText = label.textContent.replace(':', '').trim();
              yPos = addWrappedText(doc, `${labelText}: ${value}`, margin + 8, yPos, lineHeight, pageWidth - 2 * margin - 8);
            }
          });
          yPos += lineHeight * 0.2;
          return;
        }

        // Regular form groups (label + input)
        const labels = Array.from(element.querySelectorAll('label'));
        const inputs = Array.from(element.querySelectorAll('input, textarea, select'));
        if (labels.length === 1 && inputs.length <= 1) {
          const label = labels[0];
          const input = inputs[0];
          if (input) {
            ensureSpace(2);
            if (input.name === 'travelIssues') {
              // group of checkboxes handled below when iterating corresponding container - skip here
            } else {
              const value = extractValue(element, input);
              const labelText = label.textContent.replace(':', '').trim();
              yPos = addWrappedText(doc, `${labelText}: ${value}`, margin, yPos, lineHeight, pageWidth - 2 * margin);
            }
            return;
          } else if (label && inputs.length === 0) {
            // A free text label (rare) - print if relevant
            const labelText = label.textContent.trim();
            ensureSpace(1);
            yPos = addWrappedText(doc, labelText, margin, yPos, lineHeight, pageWidth - 2 * margin);
            return;
          }
        }

        // Textarea handling (e.g., personal statement)
        if (element.querySelector('textarea')) {
          const textarea = element.querySelector('textarea');
          if (textarea) {
            ensureSpace(3);
            doc.setFontSize(fontSize);
            // Add a small subheading for clarity
            if (sectionTitle === 'Personal Statement') {
              doc.setFontSize(fontSize);
              yPos = addWrappedText(doc, 'Statement:', margin, yPos, lineHeight, pageWidth - 2 * margin);
            }
            const textContent = textarea.value || 'Not provided';
            yPos = addWrappedText(doc, textContent, margin, yPos, lineHeight, pageWidth - 2 * margin);
            return;
          }
        }

        // Grouped travel issues (checkbox list)
        if (element.querySelector('input[name="travelIssues"]')) {
          ensureSpace(2);
          const mainLabel = element.querySelector('label:not([for])');
          if (mainLabel) {
            yPos = addWrappedText(doc, mainLabel.textContent.trim(), margin, yPos, lineHeight, pageWidth - 2 * margin);
          }
          const checkedTravelIssues = [];
          const travelIssueCheckboxes = element.querySelectorAll('input[name="travelIssues"]');
          travelIssueCheckboxes.forEach(input => {
            if (input.checked) {
              const label = form.querySelector(`label[for="${input.id}"]`);
              if (label) checkedTravelIssues.push(label.textContent.trim());
            }
          });
          if (checkedTravelIssues.length > 0) {
            checkedTravelIssues.forEach(issueText => {
              yPos = addWrappedText(doc, `• ${issueText}`, margin + 8, yPos, lineHeight, pageWidth - 2 * margin - 8);
            });
          } else {
            yPos = addWrappedText(doc, '• None selected', margin + 8, yPos, lineHeight, pageWidth - 2 * margin - 8);
          }
          return;
        }

      }); // end sectionElements loop

      // Small spacing after section
      yPos += lineHeight * 0.4;
    }); // end FORM_SECTIONS loop

    // Required Documents section (improved formatting)
    const docsSection = form.querySelector('.required-documents');
    if (docsSection) {
      if (yPos + lineHeight * 4 > pageHeight - margin) {
        doc.addPage();
        yPos = margin;
      }
      const sectionTitle = docsSection.querySelector('h2')?.textContent || 'Required Documents';
      doc.setFontSize(sectionFontSize);
      doc.setTextColor(28,87,118);
      doc.text(sectionTitle, margin, yPos);
      yPos += lineHeight * 0.8;
      doc.setDrawColor(220);
      doc.line(margin, yPos - 8, pageWidth - margin, yPos - 8);
      yPos += lineHeight * 0.3;
      doc.setTextColor(0,0,0);

      const docsList = docsSection.querySelector('.documents-list');
      if (docsList) {
        const listTitle = docsList.querySelector('h3')?.textContent;
        if (listTitle) {
          doc.setFontSize(fontSize);
          yPos = addWrappedText(doc, listTitle, margin, yPos, lineHeight, pageWidth - 2 * margin);
          yPos += lineHeight * 0.2;
        }
        const listItems = docsList.querySelectorAll('ul > li');
        listItems.forEach(item => {
          function processItem(currentItem, indentLevel) {
            const itemTextNode = currentItem.childNodes[0];
            const itemText = itemTextNode ? itemTextNode.textContent.trim() : '';
            if (itemText) {
              yPos = addWrappedText(doc, `• ${itemText}`, margin + indentLevel * 12, yPos, lineHeight, pageWidth - 2 * margin - indentLevel * 12);
            }
            const nested = currentItem.querySelector('ul');
            if (nested) {
              nested.querySelectorAll('li').forEach(nestedItem => processItem(nestedItem, indentLevel + 1));
            }
          }
          processItem(item, 0);
        });
      }
      yPos += lineHeight * 0.4;
    }

    // Signature area (ensure space)
    const signatureCanvas = document.getElementById('signatureBox');
    const signatureImage = signatureCanvas.toDataURL('image/png');

    if (yPos + 120 > pageHeight - margin) {
      doc.addPage();
      yPos = margin;
    } else {
      yPos += lineHeight * 0.6;
    }

    doc.setFontSize(fontSize);
    doc.text('Signature:', margin, yPos);
    yPos += lineHeight * 0.6;

    // Add signature image with a neat box
    const sigWidth = 180;
    const sigHeight = 70;
    doc.setDrawColor(180);
    doc.rect(margin - 4, yPos - 12, sigWidth + 8, sigHeight + 8); // border box
    doc.addImage(signatureImage, 'PNG', margin, yPos - 4, sigWidth, sigHeight);
    yPos += sigHeight + lineHeight * 0.6;

    // Declaration name and date
    const declarationName = document.getElementById('declarationName').value.trim() || 'Not provided';
    const signatureDate = document.getElementById('signatureDate').value;
    const formattedDate = signatureDate ? new Date(signatureDate).toLocaleDateString('en-GB') : 'Not provided';

    if (yPos + lineHeight * 2 > pageHeight - margin) {
      doc.addPage();
      yPos = margin;
    }

    doc.text(`Name: ${declarationName}`, margin, yPos);
    yPos += lineHeight * 0.9;
    doc.text(`Date: ${formattedDate}`, margin, yPos);
    yPos += lineHeight * 0.9;

    // Generate filename with applicant name
    const givenNames = document.getElementById('givenNames').value.trim();
    const familyName = document.getElementById('familyName').value.trim();
    const sanitize = (str) => str.replace(/[^a-zA-Z\s-]/g, '').replace(/\s+/g, ' ').trim();
    const fileName = givenNames || familyName 
      ? `${sanitize(givenNames)}${familyName ? ' ' + sanitize(familyName) : ''} – Visa Application Form.pdf`
      : 'uk_visa_application.pdf';

    doc.save(fileName);

  } catch (error) {
    console.error('PDF Generation Error:', error);
    alert('Could not generate PDF. Please check the console for details.');
  }
}

/**
 * Extract a sensible display value from an input/select/textarea within a form-group
 */
function extractValue(container, input) {
  if (!input) return 'Not provided';
  if (input.type === 'radio') {
    const groupName = input.name;
    const checked = container.querySelector(`input[name="${groupName}"]:checked`) || document.querySelector(`input[name="${groupName}"]:checked`);
    return checked ? checked.value : 'Not selected';
  }
  if (input.type === 'checkbox') {
    return input.checked ? 'Yes' : 'No';
  }
  if (input.type === 'date') {
    return input.value ? new Date(input.value).toLocaleDateString('en-GB') : 'Not provided';
  }
  if (input.tagName.toLowerCase() === 'select') {
    return input.value || 'Not provided';
  }
  if (input.tagName.toLowerCase() === 'textarea') {
    return input.value || 'Not provided';
  }
  return input.value?.trim() || 'Not provided';
}

function addWrappedText(doc, text, x, y, lineHeight, maxWidth) {
  // Page overflow check
  const pageHeight = doc.internal.pageSize.height;
  if (y >= pageHeight - pageHeight * 0.12) {
      doc.addPage();
      y = 40; // top margin consistent with above
      doc.setFontSize(11);
  }
  const splitText = doc.splitTextToSize(text, maxWidth);
  doc.text(splitText, x, y);
  return y + (splitText.length * lineHeight);
}

window.clearSignature = function() {
  const canvas = document.getElementById('signatureBox');
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}