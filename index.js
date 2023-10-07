const state = {
  filteredData: [],
  searchVal : 0,
  originalData: [], 
  headers: [
    "Id",
    "First Name",
    "Last Name",
    "Street",
    "City",
    "Post Code",
    "Email",
    "Telephone"
  ],
  fileName: '',
  loading: false,
  startIndex: 0,
  endIndex: 20,
  pageSize: 20,
  nextId: 1
};

function parseCSVData(csvData) {
  const lines = csvData.split("\n");
  const headers = lines[0].split(",").map((header) => header.trim().toLowerCase().replace(/\s+/g, "_")); 
  const data = [];

  for (let i = 1; i < lines.length; i++) {
    const rowData = lines[i].split(",");
    if (rowData.length === headers.length) {
      const entry = { id: state.nextId++ };
      for (let j = 0; j < headers.length; j++) {
        entry[headers[j]] = rowData[j].trim();
      }
      data.push(entry);
    }
  }

  return data;
}


function updateUI() {
  const containerDiv = document.getElementById("container");
  if (containerDiv) {
    containerDiv.innerHTML = '';
    const fileUploadContainerDiv = createFileUploadContainer();
    containerDiv.appendChild(fileUploadContainerDiv);

    if (state.loading) {
      const loaderDiv = createLoader();
      containerDiv.appendChild(loaderDiv);
    } else if (state.filteredData.length !== 0) {
      
      const searchContainerDiv = createSearchContainer();
      containerDiv.appendChild(searchContainerDiv);
      const tableContainer = renderTable();
      containerDiv.appendChild(tableContainer);
    }
  }
}

const handleUploadedData = async (event) => {
  const selectedFile = event.target.files[0];
  if (selectedFile) {
    state.fileName = selectedFile.name;
    state.loading = true;
    updateUI();

    const reader = new FileReader();

    reader.onload = (e) => {
      if (e.target) {
        // @ts-ignore
        state.originalData = parseCSVData(e.target.result); 
        state.filteredData = [...state.originalData]; 
        state.loading = false;
        updateUI();
      }
    };

    reader.readAsText(selectedFile);
  }
};

let searchTimeout;



function handleSearchInput(event) {
  clearTimeout(searchTimeout);
  const searchValue = event.target.value.toLowerCase();
  const searchWords = searchValue.split(' ');

  searchTimeout = setTimeout(() => {
    let filteredData;

    if (searchValue === "") {
      state.searchVal = searchValue.length; 
      filteredData = [...state.originalData];
    } else {
      filteredData = state.originalData.filter((item) => {
        // @ts-ignore
        const firstName = item["firstname"].toLowerCase();
        // @ts-ignore
        const lastName = item["lastname"].toLowerCase();
        // @ts-ignore
        const street = item["street"].toLowerCase();
        // @ts-ignore
        const city = item["city"].toLowerCase();

        const isMatch = searchWords.every(word => (
          firstName.includes(word) || lastName.includes(word) || city.includes(word) || street.includes(word)
        ));

        return isMatch || street.includes(searchValue) || city.includes(searchValue);
      });
      state.searchVal = searchValue; 
    }

    state.filteredData = filteredData;
    state.startIndex = 0;
    state.endIndex = state.pageSize;
    updateTable();
  }, 5);
}


function handleScroll(event) {
  const tableContainer = document.querySelector(".table-container");
  if (tableContainer) {
    const { scrollTop, scrollHeight, clientHeight } = tableContainer;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight;

    if (isAtBottom && state.endIndex < state.filteredData.length) {
      state.startIndex = state.endIndex;
      state.endIndex += state.pageSize;

      if (state.endIndex > state.filteredData.length) {
        state.endIndex = state.filteredData.length;
      }

      updateTable();
    }
  }
}


function updateTable() {
  const tbody = document.querySelector("#tableContainer tbody");

  if (tbody) {

    if(state.searchVal !== 0 ){
      tbody.innerHTML = '';
    }


    if (state.filteredData.length === 0) {
      const messageRow = document.createElement("tr");
      const messageCell = document.createElement("td");
      messageCell.colSpan = state.headers.length;
      messageCell.textContent = "Data not available.";
      messageRow.appendChild(messageCell);
      tbody.appendChild(messageRow);
    } else {
      for (let i = state.startIndex; i < state.endIndex && i < state.filteredData.length; i++) {
        const rowData = state.filteredData[i];

        if (rowData) {
          const row = document.createElement("tr");
          row.setAttribute("data-row-index", i.toString());
          Object.values(rowData).forEach((cellData) => {
            const cell = document.createElement("td");
            cell.textContent = cellData;
            row.appendChild(cell);
          });
          tbody.appendChild(row);
        }
      }
    }
  }
}
function createWrapper() {
  const wrapperDiv = document.createElement("div");
  wrapperDiv.className = "wrapper";
  return wrapperDiv;
}

function createContainer() {
  const containerDiv = document.createElement("div");
  containerDiv.className = "container";
  return containerDiv;
}

function createFileUploadContainer() {
  const fileUploadContainerDiv = document.createElement("div");
  fileUploadContainerDiv.className = "file-upload-container";

  const fileLabel = document.createElement("label");
  fileLabel.className = "file-label";
  fileLabel.textContent = 'Choose a Text File';
  fileLabel.setAttribute("for", "file");

  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.className = "file-input";
  fileInput.id = "file";

  const selectedFileDiv = document.createElement("div");
  selectedFileDiv.className = "selected-file";
  selectedFileDiv.id = "selectedFile";
  selectedFileDiv.textContent = state.fileName ? state.fileName : "No file selected";

  fileInput.addEventListener('change', handleUploadedData);
  fileUploadContainerDiv.appendChild(fileLabel);
  fileUploadContainerDiv.appendChild(fileInput);
  fileUploadContainerDiv.appendChild(selectedFileDiv);

  return fileUploadContainerDiv;
}

function createSearchContainer() {
  const searchContainerDiv = document.createElement("div");
  searchContainerDiv.className = "search-container";

  const searchInput = document.createElement("input");
  searchInput.type = "text";
  searchInput.className = "search-input";
  searchInput.placeholder = "Search...";
  searchInput.addEventListener('input', handleSearchInput); 

  searchContainerDiv.appendChild(searchInput);

  return searchContainerDiv;
}
function createTable() {
  const tableContainer = document.createElement("div");
  tableContainer.className = "table-container";
  tableContainer.style.height = "500px";
  tableContainer.style.overflow = "auto";

  const table = document.createElement("table");
  table.id = "tableContainer";

  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");
  state.headers.forEach((headerText) => {
    const th = document.createElement("th");
    th.textContent = headerText;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);

  const tbody = document.createElement("tbody");
  if (tableContainer) {
    tableContainer.addEventListener("scroll", handleScroll);
  }

  for (let i = state.startIndex; i < state.endIndex && i < state.filteredData.length; i++) {
    const rowData = state.filteredData[i];
    const row = document.createElement("tr");
    // @ts-ignore
    row.setAttribute("data-row-index", i); 
    Object.values(rowData).forEach((cellData) => {
      const cell = document.createElement("td");
      cell.textContent = cellData;
      row.appendChild(cell);
    });
    tbody.appendChild(row);
  }

  table.appendChild(thead);
  table.appendChild(tbody);

  tableContainer.appendChild(table);

  return tableContainer;
}


function createLoader() {
  const loaderDiv = document.createElement("div");
  loaderDiv.className = "loader-container";
  loaderDiv.id = "loaderContainer";
  const loader = document.createElement("div");
  loader.className = "loader";
  loaderDiv.appendChild(loader);
  return loaderDiv;
}

function renderTable() {
  const tableContainer = document.createElement("div");
  tableContainer.className = "table-container";

  const table = createTable();
  tableContainer.appendChild(table);

  return tableContainer;
}

function onInit() {
  const wrapperDiv = createWrapper();
  const containerDiv = createContainer();
  containerDiv.id = "container";

  const fileUploadContainerDiv = createFileUploadContainer();
  containerDiv.appendChild(fileUploadContainerDiv);

  wrapperDiv.appendChild(containerDiv);
  document.body.appendChild(wrapperDiv)
  
  updateTable();
}

document.addEventListener("DOMContentLoaded", () => {
  onInit();
});

