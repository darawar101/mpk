
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


let allData = [];
async function fetchData() {
    const sheetID = "1GAuXwfN3L7Gdbyn7RXP4sWImIwo72T7xgDBN1Uw7vTs";
    const apiKey = "AIzaSyD2A2M4nM0_mUyPopG-9d3_piiljHgCq58";
    const sheetNames = ["Protest Cases", "Others Cases", "Land Grabber", "Child Marrige", "Murder", "Sucide", "Force Conversion", "Kidnap"];
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
        displayData(allData);
    } catch (error) {
        console.error("Error fetching data:", error);
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
        let imageUrl = row["Case Picture"];
        let formattedDate = formatDateForDisplay(row["Date"]);

        table.innerHTML += `<tr class='border border-gray-700'>
            <td class='p-2' translate="no">${startIndex + index + 1}</td>
            <td class='p-2' translate="no">${row.Timestamp}</td>
            <td class='p-2' translate="no">${formattedDate}</td>
            <td class='p-2' translate="no">${row.Day}</td>
            <td class='p-2' translate="no">${row.Time}</td>
            <td class='p-2' translate="no">${row["Victim Name"]}</td>
            <td class='p-2' translate="no"><a href='${imageUrl}' target='_blank' class='bg-blue-500 text-white px-3 py-1 rounded'>Image</a></td>
            <td class='p-2' translate="no">${row.Gender}</td>
            <td class='p-2' translate="no">${row.Religion}</td>
            <td class='p-2' translate="no">${row.Location}</td>
            <td class='p-2 dc-t'>${row["Case Description"]}</td>
        </tr>`;
    });

    createPaginationControls(data.length);
}

function createPaginationControls(totalCases) {
    const paginationContainer = document.getElementById("pagination");
    paginationContainer.innerHTML = "";

    const totalPages = Math.ceil(totalCases / casesPerPage);

    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement("button");
        button.innerText = i;
        button.className = `px-3 py-1 m-1 border rounded ${i === currentPage ? "bg-blue-600 text-white" : "bg-gray-200"}`;
        button.addEventListener("click", () => {
            displayData(allData, i);
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

    let imageUrl = latestCase["Case Picture"];
    let formattedDate = formatDateForDisplay(latestCase["Date"]); // Convert to DD/MM/YYYY

    table.innerHTML += `<tr class='border border-gray-700'>
<td class='p-2'>${latestCase.Timestamp}</td>
<td class='p-2'>${formattedDate}</td> <!-- Display formatted date -->
<td class='p-2'>${latestCase.Day}</td>
<td class='p-2'>${latestCase.Time}</td>
<td class='p-2'>${latestCase["Victim Name"]}</td>
<td class='p-2'><a href='${imageUrl}' target='_blank' class='bg-blue-500 text-white px-3 py-1 rounded'>Image</a></td>
<td class='p-2'>${latestCase.Gender}</td>
<td class='p-2'>${latestCase.Religion}</td>
<td class='p-2'>${latestCase.Location}</td>
<td class='p-2'>${latestCase["Case Description"]}</td>
</tr>`;
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

    const headers = [["S.No", "Timestamp", "Date", "Day", "Time", "Victim Name", "Gender", "Religion", "Location", "Case Description"]];
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

    doc.autoTable({
        startY: 25,
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
            0: { cellWidth: 10 },
            1: { cellWidth: 20 },
            2: { cellWidth: 15 },
            3: { cellWidth: 12 },
            4: { cellWidth: 15 },
            5: { cellWidth: 25 },
            6: { cellWidth: 15 },
            7: { cellWidth: 18 },
            8: { cellWidth: 25 },
            9: { cellWidth: 35 },
        },
        headStyles: {
            fillColor: [41, 128, 185],
            textColor: 255,
            halign: 'center',
        },
        tableWidth: "wrap",

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
