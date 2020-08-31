import React from 'react';
import { jsPDF } from 'jspdf';
import { CSVLink, CSVDownload } from 'react-csv';
import { AlignmentType, Document, HeadingLevel, Packer, Paragraph, TabStopPosition, TabStopType, TextRun } from 'docx';

// List all function that will be record in file
const printableFunctions = ['log', 'warn', 'error', 'debug'];

// Variable to store logs
const consoleValues = [];

const Console = (props = { showCustomButton: true }) => {
  const showCustomButton = props.showCustomButton
    ? (() => {
        const btn = document.createElement('BUTTON'); // Hidden button to download logs
        btn.innerHTML = 'Download Logs';
        btn.addEventListener('click', function () {
          props.downloadCSV
            ? saveCSV()
            : props.downloadDocx
            ? saveDocx()
            : props.downloadPdf
            ? savePdf()
            : returnLogs();
        });
        btn.style.display = 'none';
        document.body.appendChild(btn);
      })()
    : null;

  // replace console function with custom function using printableFunctions
  const initializeLogs = (() => {
    const consoleFunctions = {};
    const consoleTemp = console;
    printableFunctions.map((con) => {
      consoleFunctions[con] = console[con];
      consoleTemp[con] = function (msg) {
        addToFile(msg);
        consoleFunctions[con](msg);
      };
    });
  })();

  function addToFile(msg) {
    const printMsg = msg.split('\n');
    printMsg.map((o) => {
      consoleValues.push(o);
    });
  }

  // return pdf file to download
  function savePdf() {
    const doc = new jsPDF();
    doc.text(consoleValues, 10, 10);
    doc.save('Logs.pdf');
  }

  // return csv file to download
  function saveCSV() {
    const btn = React.createElement(CSVLink);
    btn.data = consoleValues;
    btn.click();
  }

  // return docx file to download
  async function saveDocx() {
    const doc = new Document();
    let logs = '';
    consoleValues.map((txt) => {
      logs += `${txt}\n`;
    });
    doc.addSection({
      children: [
        new Paragraph({
          children: [new TextRun(logs)],
        }),
      ],
    });
    const b64string = await Packer.toBase64String(doc);
    const btn = document.createElement('a');
    btn.download = 'Logs.docx';
    btn.href = `data:application/docx;base64,${b64string}`;
    btn.click();
  }

  // return logs as array not in downloadable file
  function returnLogs() {
    props.returnLogs ? props.returnLogs(consoleValues) : null;
  }
};

export default Console;
