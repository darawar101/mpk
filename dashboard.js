
function downloadurdu() {
    toggleFontSize()
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF("p", "mm", "a4"); // A4 Portrait

    const table = document.querySelector(".table-container");
    const rows = Array.from(document.querySelectorAll(".table-container tbody tr"));
    const rowsPerPage = 8; // Show 10 rows per page
    let currentPage = 0;

    // Store original styles
    const originalDisplay = rows.map(row => row.style.display);
    const originalBackground = table.style.background;
    const originalColor = table.style.color;
    const cells = document.querySelectorAll(".table-container th, .table-container td");

    // Set white background and black text for clarity in PDF
    table.style.background = "white";
    table.style.color = "black";
    cells.forEach(cell => {
        cell.style.background = "white";
        cell.style.color = "black";
        cell.style.border = "1px solid black"; // Ensure borders are visible
    });

    // Load watermark image first
    const watermark = new Image();
    watermark.src = "Adobe Express - file (1) (1).png"; // Ensure correct path

    watermark.onload = function () {

        function captureAndAddToPDF(callback) {
            setTimeout(() => {
                requestAnimationFrame(() => {
                    html2canvas(table, { scale: 1.0, backgroundColor: "#ffffff" }).then(canvas => {
                        const imgData = canvas.toDataURL("image/jpeg", 0.6); // Convert to compressed JPEG (Quality 60%)

                        // Adjust image size to prevent "Invalid string length" error
                        const imgWidth = 210; // A4 width in mm
                        const imgHeight = (canvas.height * imgWidth) / canvas.width; // Maintain aspect ratio
                        const maxHeight = 260; // Max height to prevent overflow

                        let finalHeight = Math.min(imgHeight, maxHeight); // Prevent large images

                        let y = 10; // Starting position

                        if (currentPage > 0) pdf.addPage(); // New page after first

                        pdf.setFont("helvetica", "bold");
                        pdf.setFontSize(14);
                        pdf.text("Pakistan Darawar Itehad ®", imgWidth / 2, y, { align: "center" });

                        y += 10; // Move down after title
                        pdf.addImage(imgData, "JPEG", 0, y, imgWidth, finalHeight); // Add table image

                        // Add watermark with reduced size & opacity
                        // Calculate watermark position to center it on the page
                        const logoWidth = 80;  // Adjust size if needed
                        const logoHeight = 80; // Adjust size if needed
                        const logoX = (210 - logoWidth) / 2; // A4 width is 210mm, center horizontally
                        const logoY = (297 - logoHeight) / 2; // A4 height is 297mm, center vertically

                        // Add watermark
                        pdf.setGState(pdf.GState({ opacity: 0.15 })); // Lower opacity
                        pdf.addImage(watermark, "PNG", logoX, logoY, logoWidth, logoHeight);
                        pdf.setGState(pdf.GState({ opacity: 1 })); // Reset opacity


                        pdf.setGState(pdf.GState({ opacity: 0.15 })); // Lower opacity
                        pdf.addImage(watermark, "PNG", logoX, logoY, logoWidth, logoHeight);
                        pdf.setGState(pdf.GState({ opacity: 1 })); // Reset opacity

                        currentPage++;
                        callback(); // Process next set of rows
                    }).catch(error => console.error("Error capturing canvas:", error));
                });
            }, 100);
        }

        function processRows(startIndex) {
            if (startIndex >= rows.length) {
                pdf.save("case_reports.pdf"); // Save the PDF after all rows are processed
                rows.forEach((row, i) => row.style.display = originalDisplay[i]); // Restore visibility
                table.style.background = originalBackground;
                table.style.color = originalColor;
                cells.forEach(cell => {
                    cell.style.background = "";
                    cell.style.color = "";
                    cell.style.border = "";
                });
                return;
            }

            // Hide all rows
            rows.forEach(row => (row.style.display = "none"));

            // Show only 10 rows per page
            for (let i = startIndex; i < Math.min(startIndex + rowsPerPage, rows.length); i++) {
                rows[i].style.display = "";
            }
 
            captureAndAddToPDF(() => processRows(startIndex + rowsPerPage)); // Process next set
        }

        processRows(0);
    };
}
window.addEventListener('load', async () => {
    document.getElementById('loader').style.display = 'flex'; // Show loader with logo
    document.getElementById('mainContent').style.display = 'none';
  
    await fetchData(); // Your data fetching function
  
    document.getElementById('loader').style.display = 'none'; // Hide loader
    document.getElementById('mainContent').style.display = 'block'; // Show main content
});

window.addEventListener('load', async () => {
    document.getElementById('loader').style.display = 'flex';
    document.getElementById('mainContent').style.display = 'none';
  
    await fetchData(); // Your data fetching function
  
    document.getElementById('loader').style.display = 'none';
    document.getElementById('mainContent').style.display = 'block';
});


let allData = [];
async function fetchData() {
    const loader = document.getElementById("loader");
    loader.style.display = "flex"; // Show loader

    const sheetID = "1GAuXwfN3L7Gdbyn7RXP4sWImIwo72T7xgDBN1Uw7vTs";
    const apiKey = "AIzaSyD2A2M4nM0_mUyPopG-9d3_piiljHgCq58";
    const sheetNames = ["Protest Cases", "Others Cases", "Land Grabber", "Child Marrige", "Murder", "Sucide", "Force Conversion", "Kidnap", "Rap", "Road Accident", "Fire Incident", "Meetings"];
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetID}/values:batchGet?${sheetNames.map(name => `ranges=${encodeURIComponent(name)}`).join("&")}&key=${apiKey}`;

    try {
        const response = await fetch(url);
        const json = await response.json(); 
        allData = [];
        json.valueRanges.forEach((sheet, index) => {
            if (sheet.values) {
                const headers = sheet.values[0].map(header => header.trim());
                const rows = sheet.values.slice(1);
                rows.forEach(row => {
                    let rowData = {};
                    headers.forEach((header, i) => {
                        rowData[header] = row[i] ? row[i].trim() : "";
                    });
                    rowData["Crime Type"] = sheetNames[index];
                    allData.push(rowData);
                });
            }
        });
        filteredData = allData; // <-- Also update filteredData
        displayData(allData);
    } catch (error) {
        console.error("Error fetching data:", error);
    } finally {
        loader.style.display = "none"; // Hide loader after everything is done
    }
}


function formatDateForDisplay(dateString) {
    if (!dateString) return "";

    const parts = dateString.split("/");
    if (parts.length === 3) {
        const mm = parts[0].padStart(2, '0'); // Month
        const dd = parts[1].padStart(2, '0'); // Day
        const yyyy = parts[2]; // Year

        return `${dd}/${mm}/${yyyy}`; // Convert to DD/MM/YYYY format
    }
    return dateString;
}


let currentPage = 1;
const casesPerPage = 100;

function displayData(data = filteredData, page = 1) {
    const table = document.getElementById("reportTable");
    table.innerHTML = "";

    currentPage = page;

    data.sort((a, b) => {
        const dateA = new Date(convertDateFormat(a["Date"]));
        const dateB = new Date(convertDateFormat(b["Date"]));
        return dateB - dateA;
    });

    const startIndex = (page - 1) * casesPerPage;
    const endIndex = startIndex + casesPerPage;
    const paginatedData = data.slice(startIndex, endIndex);

    paginatedData.forEach((row, index) => {
       let imageUrl = convertDriveLink(row["Case Picture"]);

        let formattedDate = formatDateForDisplay(row["Date"]);

        table.innerHTML += `<tr class='border border-gray-700'>
            <td class='p-2 ' translate="no">${startIndex + index + 1}</td>
            <td class='p-2 ' translate="no">${row.Timestamp}</td>
            <td class='p-2' translate="no">${formattedDate}</td>
            <td class='p-2 ' translate="no">${row.Day}</td>
            <td class='p-2 ' translate="no">${row.Time}</td>
            <td class='p-2 ' translate="no">${row["Victim Name"]}</td>
           
            <td class='p-2 ' translate="no">${row.Gender}</td>
            <td class='p-2 ' translate="no">${row.Religion}</td>
            <td class='p-2 ' translate="no">${row.Location}</td>
            <td class='p-2  dc-t'>${row["Case Description"]}</td>
            <td class='p-2' translate="no">
  ${
    imageUrl
      ? `<img src="${imageUrl}" alt="Case Image" class="max-w-[200px] max-h-[200px] object-cover rounded border border-gray-300" referrerpolicy="no-referrer"/>`
      : `<div class="w-[100px] h-[100px] flex items-center justify-center text-sm bg-gray-100 text-gray-500 border border-gray-300 rounded text-center p-2">No case image</div>`
  }
</td>


        </tr>`;
    });

    createPaginationControls(data.length);
}
filteredData = allData;

function createPaginationControls(totalCases) {
    const paginationContainer = document.getElementById("pagination");
    paginationContainer.innerHTML = "";

    const totalPages = Math.ceil(totalCases / casesPerPage);

    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement("button");
        button.innerText = i;
        button.className = `px-3 py-1 m-1 border rounded ${i === currentPage ? "bg-blue-600 text-white" : "bg-gray-200"}`;
        button.addEventListener("click", () => {
            displayData(filteredData, i);
        });
        
        paginationContainer.appendChild(button);
    }
}


function displayLatestCase(data) {
    const table = document.getElementById("reportTable");
    table.innerHTML = "";

    if (data.length === 0) return;

    // Sort data by date (latest first)
    data.sort((a, b) => {
        const dateA = new Date(convertDateFormat(a["Date"]));
        const dateB = new Date(convertDateFormat(b["Date"]));
        return dateB - dateA; // Descending order
    });

    // Get the latest case (first entry after sorting)
    const latestCase = data[0];

  let imageUrl = convertDriveLink(latestCase["Case Picture"]);

    let formattedDate = formatDateForDisplay(latestCase["Date"]); 

    table.innerHTML += `<tr class='border border-gray-700'>
<td class='p-2'>${latestCase.Timestamp}</td>
<td class='p-2'>${formattedDate}</td> <!-- Display formatted date -->
<td class='p-2'>${latestCase.Day}</td>
<td class='p-2'>${latestCase.Time}</td>
<td class='p-2'>${latestCase["Victim Name"]}</td>

<td class='p-2'>${latestCase.Gender}</td>
<td class='p-2'>${latestCase.Religion}</td>
<td class='p-2'>${latestCase.Location}</td>
<td class='p-2'>${latestCase["Case Description"]}</td>
<td class='p-2' translate="no">
  ${
    imageUrl
      ? `<img src="${imageUrl}" alt="Case Image" class="max-w-[100px] max-h-[100px] object-cover rounded border border-gray-300" referrerpolicy="no-referrer"/>`
      : `<div class="w-[100px] h-[100px] flex items-center justify-center text-sm bg-gray-100 text-gray-500 border border-gray-300 rounded text-center p-2">No case image</div>`
  }
</td>

</tr>`;

}

function convertDriveLink(link) {
    if (!link) return "";

    // Match file ID in either /d/FILE_ID/ or /d/FILE_ID pattern
    let match = link.match(/\/d\/([a-zA-Z0-9_-]+)/);

    // Or match ?id=FILE_ID pattern
    if (!match) {
        match = link.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    }

    if (match && match[1]) {
        // Return Google Drive thumbnail URL
        return `https://drive.google.com/thumbnail?id=${match[1]}`;
    }

    // If no match, return original link
    return link;
}



function convertDateFormat(dateString) {
    // Check if the date string is valid
    if (!dateString) return "";

    const parts = dateString.split("/");
    if (parts.length === 3) {
        return `${parts[2]}-${parts[1]}-${parts[0]}`; // Convert MM/DD/YYYY to YYYY-MM-DD
    }
    return dateString;
}

function convertDateFormat(dateString) {
    if (!dateString) return "";

    const parts = dateString.split("/"); // Assuming MM/DD/YYYY format
    if (parts.length === 3) {
        const mm = parts[0].padStart(2, '0'); // Ensure two-digit month
        const dd = parts[1].padStart(2, '0'); // Ensure two-digit day
        const yyyy = parts[2];

        return `${yyyy}-${mm}-${dd}`; // Convert to YYYY-MM-DD
    }
    return dateString; // Return unchanged if format is incorrect
}



function filterData() {
    const crimeType = document.getElementById("crimeType").value;
    const dateFilter = document.getElementById("dateFilter").value;
    const genderFilter = document.getElementById("genderFilter").value;
    const nameFilter = document.getElementById("nameFilter").value.toLowerCase();
    const monthFilter = document.getElementById("monthFilter").value;
    const yearFilter = document.getElementById("yearFilter").value;

    filteredData = allData.filter(row => {
        let rowCrimeType = row["Crime Type"];
        if (rowCrimeType === "Sucide") rowCrimeType = "Suicide";

        let rowDate = convertDateFormat(row["Date"]);
        let rowYear = rowDate.split("-")[0];
        let rowMonth = rowDate.split("-")[1];

        let matchesCrime = crimeType === "" || rowCrimeType === crimeType;
        let matchesDate = dateFilter === "" || rowDate === dateFilter;
        let matchesGender = genderFilter === "" || row["Gender"] === genderFilter;
        let matchesName = nameFilter === "" || (row["Victim Name"] && row["Victim Name"].toLowerCase().includes(nameFilter));
        let matchesMonth = monthFilter === "" || rowMonth === monthFilter;
        let matchesYear = yearFilter === "" || rowYear === yearFilter;

        return matchesCrime && matchesDate && matchesGender && matchesName && matchesMonth && matchesYear;
    });

    displayData(filteredData); // Use filteredData instead of allData
}






function toggleFontSize() {
    let descriptions = document.querySelectorAll("td:nth-child(11)"); // Adjust column number if needed
    descriptions.forEach(td => {
        let currentSize = window.getComputedStyle(td).fontSize;
        td.style.fontSize = (currentSize === "25px") ? "32px" : "25px";
    });
}
function downloadTableAsPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF("p", "mm", "a4");

    const headers = [["S.No", "Timestamp", "Date", "Day", "Time", "Victim Name", "Religion", "City", "Case Description", ]];
    const rows = [];

    const tableRows = document.querySelectorAll("#reportTable tr");
    tableRows.forEach((tr) => {
        const cells = tr.querySelectorAll("td");
        const row = [
            cells[0]?.innerText || "",
            cells[1]?.innerText || "",
            cells[2]?.innerText || "",
            cells[3]?.innerText || "",
            cells[4]?.innerText || "",
            cells[5]?.innerText || "",
            cells[7]?.innerText || "",
            cells[8]?.innerText || "",
            cells[9]?.innerText || "",
            cells[10]?.innerText || "",
        ];
        rows.push(row);
    });

    doc.setFont("NotoNastaliqUrdu-Regular");
    doc.setFontSize(10);

    // Track total pages
    const totalPagesExp = "{total_pages_count_string}";

    // Calculate a proportionate column width
    const columnWidths = [15, 20, 25, 20, 25, 40, 20, 25, 40, 50];
    const totalWidth = columnWidths.reduce((sum, width) => sum + width, 0);
    const scale = 190 / totalWidth; // Scale factor to ensure it fits on an A4 page

    // Apply the scale factor to adjust column widths dynamically
    const scaledColumnWidths = columnWidths.map(width => width * scale);

    doc.autoTable({
        startY: 30  ,
        head: headers,
        body: rows,
        styles: {
            font: "NotoNastaliqUrdu-Regular",
            fontSize: 8,
            cellPadding: 1.5,
            overflow: 'linebreak',
            lineWidth: 0.1,
            lineColor: [0, 0, 0],
        },
        columnStyles: {
            0: { cellWidth: scaledColumnWidths[0] },
            1: { cellWidth: scaledColumnWidths[1] },
            2: { cellWidth: scaledColumnWidths[2] },
            3: { cellWidth: scaledColumnWidths[3] },
            4: { cellWidth: scaledColumnWidths[4] },
            5: { cellWidth: scaledColumnWidths[5] },
            6: { cellWidth: scaledColumnWidths[6] },
            7: { cellWidth: scaledColumnWidths[7] },
            8: { cellWidth: scaledColumnWidths[8] },
            9: { cellWidth: scaledColumnWidths[9] }
        },
        headStyles: {
            fillColor: [41, 128, 185],
            textColor: 255,
            halign: 'center',
        },
        tableWidth: 'wrap', // This ensures the table wraps to fit within the page width

        didDrawPage: function (data) {
            // Title on every page
            doc.setFont("helvetica", "bold");
            doc.setFontSize(12);
            doc.text("Pakistan Darawar Itehad ® - Case Reports", doc.internal.pageSize.getWidth() / 2, 12, { align: "center" });

            // Add footer page number
            const str = "Page " + doc.internal.getNumberOfPages() + " of " + totalPagesExp;
            doc.setFontSize(8);
            doc.setTextColor(100);
            doc.text(str, doc.internal.pageSize.getWidth() - 20, doc.internal.pageSize.getHeight() - 10);
        }
    });

    // Replace placeholder with total pages
    if (typeof doc.putTotalPages === 'function') {
        doc.putTotalPages(totalPagesExp);
    }

    doc.save("case_reports.pdf");
}





function downloadTableAsJPEG() {
    const table = document.querySelector(".table-container");

    // Store original styles
    const originalBackground = table.style.background;
    const originalColor = table.style.color;
    const cells = document.querySelectorAll(".table-container th, .table-container td");

    // Apply white background and black text for capturing
    table.style.background = "white";
    table.style.color = "black";
    cells.forEach(cell => {
        cell.style.background = "white";
        cell.style.color = "black";
        cell.style.border = "1px solid black"; // Ensure borders are visible
    });

    html2canvas(table, { scale: 2, backgroundColor: "#ffffff" }).then(canvas => {
        const link = document.createElement("a");
        link.href = canvas.toDataURL("image/jpeg", 1.0);
        link.download = "case_reports.jpg";
        link.click();

        // Restore original styles
        table.style.background = originalBackground;
        table.style.color = originalColor;
        cells.forEach(cell => {
            cell.style.background = "";
            cell.style.color = "";
            cell.style.border = "";
        });
    });
}


fetchData();

function openLanguageModal() {
    document.getElementById("languageModal").classList.remove("hidden");
}

function closeLanguageModal() {
    document.getElementById("languageModal").classList.add("hidden");
}

function downloadSelectedPDF(language) {
    closeLanguageModal();
    if (language === 'urdu') {
        downloadurdu();
    } else if (language === 'english') {
        downloadTableAsPDF();
    } else if (language === 'sindhi') {
        downloadSindhiPDF(); // Make sure this function exists
    }
}

function loadTableData() {
    // Fetch the data and populate the table (your existing logic here)
    
    // After data is inserted into the table, trigger the animation
    document.getElementById('mainContent').style.animation = 'fadeIn 1s ease-out';
}




function openFilterModal() {
    document.getElementById('filterModal').classList.remove('hidden');
  }

  function closeFilterModal() {
    document.getElementById('filterModal').classList.add('hidden');
  }

  function applyFilters() {
    closeFilterModal();
    filterData(); // Call your filter function here
  }


  const c = document.querySelector('.container')
const indexs = Array.from(document.querySelectorAll('.index'))
let cur = -1
indexs.forEach((index, i) => {
  index.addEventListener('click', (e) => {
    // clear
    c.className = 'container'
    void c.offsetWidth; // Reflow
    c.classList.add('open')
    c.classList.add(`i${i + 1}`)
    if (cur > i) {
      c.classList.add('flip')
    }
    cur = i
  })
})



function clearFilters() {
    document.getElementById('crimeType').value = '';
    document.getElementById('genderFilter').value = '';
    document.getElementById('dateFilter').value = '';
    document.getElementById('monthFilter').value = '';
    document.getElementById('yearFilter').value = '';
}



