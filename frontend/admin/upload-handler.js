// Quick Upload Form Handler for Admin Dashboard
window.addEventListener('DOMContentLoaded', () => {
    const uploadForm = document.getElementById('quickUploadForm');
    if (!uploadForm) return;

    // File name display
    const coverInput = document.getElementById('coverImageInput');
    const bookInput = document.getElementById('bookFileInput');
    
    if (coverInput) {
        coverInput.addEventListener('change', (e) => {
            const fileName = e.target.files[0]?.name || '';
            document.getElementById('coverFileName').textContent = fileName ? `✓ ${fileName}` : '';
        });
    }
    
    if (bookInput) {
        bookInput.addEventListener('change', (e) => {
            const fileName = e.target.files[0]?.name || '';
            document.getElementById('bookFileName').textContent = fileName ? `✓ ${fileName}` : '';
        });
    }

    // Form submit
    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const statusDiv = document.getElementById('uploadStatus');
        const submitBtn = uploadForm.querySelector('button[type="submit"]');
        
        try {
            // Disable submit button
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="bx bx-loader bx-spin"></i> Uploading...';
            
            // Show loading status
            statusDiv.style.display = 'block';
            statusDiv.style.background = '#e3f2fd';
            statusDiv.style.color = '#1976d2';
            statusDiv.innerHTML = '<i class="bx bx-loader bx-spin"></i> Uploading book to database...';

            // Get form data
            const title = document.getElementById('bookTitle').value;
            const author = document.getElementById('bookAuthor').value;
            const description = document.getElementById('bookDescription').value;
            const category = document.getElementById('bookCategory').value;
            const coverFile = coverInput.files[0];
            const bookFile = bookInput.files[0];

            if (!coverFile || !bookFile) {
                throw new Error('Please select both cover image and book file');
            }

            // Build FormData - cover first, then PDF
            const formData = new FormData();
            formData.append('files', coverFile);  // First file = cover
            formData.append('files', bookFile);   // Second file = PDF
            formData.append('title', title);
            formData.append('author', author);
            formData.append('description', description);
            formData.append('category', category);

            console.log('📤 Uploading book:', { title, author, category });

            // Upload to API
            const response = await fetch(`${API_BASE}/books/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: formData
            });

            const result = await response.json();
            console.log('📥 Upload response:', result);

            if (!response.ok) {
                throw new Error(result.message || `Upload failed (${response.status})`);
            }

            // Success!
            statusDiv.style.background = '#e8f5e9';
            statusDiv.style.color = '#2e7d32';
            statusDiv.innerHTML = '<i class="bx bx-check-circle"></i> ✅ Book uploaded successfully! Saved to MongoDB.';
            
            // Reset form
            uploadForm.reset();
            document.getElementById('coverFileName').textContent = '';
            document.getElementById('bookFileName').textContent = '';
            
            // Reload dashboard stats
            setTimeout(() => {
                if (typeof loadDashboardData === 'function') {
                    loadDashboardData();
                }
                statusDiv.innerHTML = '<i class="bx bx-check"></i> Upload complete. You can upload another book.';
            }, 2000);

        } catch (error) {
            console.error('❌ Upload error:', error);
            statusDiv.style.background = '#ffebee';
            statusDiv.style.color = '#c62828';
            statusDiv.innerHTML = `<i class="bx bx-error-circle"></i> ❌ Error: ${error.message}`;
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="bx bx-upload"></i> Upload Book';
        }
    });
});
