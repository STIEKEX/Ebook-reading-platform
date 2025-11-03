document.addEventListener('DOMContentLoaded', function() {
    const pdfUpload = document.getElementById('pdfUpload');
    const pdfInput = document.getElementById('pdfInput');
    const pdfName = document.getElementById('pdfName');
    const uploadForm = document.getElementById('uploadForm');

    // PDF Upload Click
    pdfUpload.addEventListener('click', function() {
        pdfInput.click();
    });

    // PDF File Selected
    pdfInput.addEventListener('change', function() {
        if (this.files.length > 0) {
            const fileName = this.files[0].name;
            const fileSize = (this.files[0].size / 1024 / 1024).toFixed(2);
            pdfName.textContent = `✓ ${fileName} (${fileSize} MB)`;
            pdfName.style.display = 'block';
        }
    });

    // Drag & Drop
    pdfUpload.addEventListener('dragover', function(e) {                  
        e.preventDefault();
        pdfUpload.style.background = '#e8ebff';
    });

    pdfUpload.addEventListener('dragleave', function() {
        pdfUpload.style.background = '#f8f9fd';
    });

    pdfUpload.addEventListener('drop', function(e) {
        e.preventDefault();
        pdfUpload.style.background = '#f8f9fd';
        
        if (e.dataTransfer.files.length > 0) {
            pdfInput.files = e.dataTransfer.files;
            const fileName = e.dataTransfer.files[0].name;
            const fileSize = (e.dataTransfer.files[0].size / 1024 / 1024).toFixed(2);
            pdfName.textContent = `✓ ${fileName} (${fileSize} MB)`;
            pdfName.style.display = 'block';
        }
    });

    // Form Submit
   uploadForm.addEventListener('submit', async function(e) {
  e.preventDefault();

  if (!isLoggedIn()) {
    alert('Please login first');
    window.location.href = 'login.html';
    return;
  }

  const user = getCurrentUser();
  if (!user.isAdmin) {
    alert('Only admins can upload books');
    return;
  }

  const formData = new FormData();
  formData.append('title', document.getElementById('title')?.value || '');
  formData.append('author', document.getElementById('author')?.value || '');
  formData.append('description', document.getElementById('description')?.value || '');
  formData.append('category', document.getElementById('category')?.value || 'other');

  // Add files
  const files = pdfInput.files;
  for (let file of files) {
    formData.append('files', file);
  }

  if (files.length < 2) {
    alert('Please upload at least 1 cover image + 1 page image');
    return;
  }

  const result = await uploadBook(formData);
  
  if (result.book) {
    alert('Book uploaded successfully!');
    window.location.href = 'main.html';
  } else {
    alert('Error: ' + result.message);
  }
});

});
