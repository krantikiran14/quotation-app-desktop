const { ipcRenderer } = require('electron');
const path = require('path');
const fs = require('fs');

document.getElementById('quotationForm').addEventListener('submit', async (event) => {
  event.preventDefault();

  // Collect all form data
  const data = {
    document_number: document.getElementById('document_number').value,
    date: document.getElementById('date').value,
    ka: document.getElementById('ka').value,
    to: document.getElementById('to').value,
    subject: document.getElementById('subject').value,
    reference: document.getElementById('reference').value,
    mobile_number: document.getElementById('mobile_number').value,
    product_description: document.getElementById('product_description').value,
    quantity: parseInt(document.getElementById('quantity').value, 10),
    unit_price: parseFloat(document.getElementById('unit_price').value),
  };

  try {
    // Invoke the backend process to generate the quotation document
    const outputPath = await ipcRenderer.invoke('generate-quotation', data);

    // Open file dialog to save the generated document
    const savePath = path.join(process.cwd(), 'quotation.docx');
    fs.copyFileSync(outputPath, savePath);

    alert(`Quotation saved successfully to ${savePath}`);
  } catch (error) {
    console.error('Error generating quotation:', error);
    alert('An error occurred while generating the quotation. Please try again.');
  }
});
