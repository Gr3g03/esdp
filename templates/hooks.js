export const parseCSVData = (csvData) =>{
    const lines = csvData.split("\n");
    const headers = lines[0].split(",");
    const data = [];
  
    for (let i = 1; i < lines.length; i++) {
      const rowData = lines[i].split(",");
      if (rowData.length === headers.length) {
        const entry = {};
        for (let j = 0; j < headers.length; j++) {
          entry[headers[j]] = rowData[j];
        }
        data.push(entry);
      }
    }
  
    return data;
  }
