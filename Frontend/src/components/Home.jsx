import React, { useState } from "react";
import { FaFileWord, FaFilePdf } from "react-icons/fa";
import axios from "axios";

function Home() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [conversionType, setConversionType] = useState("wordToPdf");
  const [message, setMessage] = useState("");
  const [downloadError, setDownloadError] = useState("");

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log("clicked")
    if (!selectedFile) {
      setMessage("Please select a file");
      return;
    }
    const formData = new FormData();
    formData.append("file", selectedFile);
    const url =
      conversionType === "wordToPdf"
        ? "http://localhost:3000/convertFile"
        : "http://localhost:3000/convertPdfToDocx";

    try {
      const response = await axios.post(url, formData, { responseType: "blob" });
      const urlBlob = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = urlBlob;
      link.setAttribute(
        "download",
        selectedFile.name.replace(/\.[^/.]+$/, "") +
          (conversionType === "wordToPdf" ? ".pdf" : ".docx")
      );
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      setSelectedFile(null);
      setMessage("File Converted Successfully");
      setDownloadError("");
    } catch (error) {
      if (error.response && error.response.status === 400) {
        setDownloadError("Error occurred: " + error.response.data.message);
      } else {
        setDownloadError("An error occurred. Please try again.");
      }
      setMessage("");
    }
  };

  return (
    <div className="max-w-screen-2xl mx-auto container px-6 py-3 md:px-40">
      <div className="flex h-screen items-center justify-center">
        <div className="border-2 border-dashed px-4 py-2 md:px-8 md:py-6 border-indigo-400 rounded-lg shadow-lg">
          <h1 className="text-3xl font-bold text-center mb-4">
            Document Conversion Tool
          </h1>
          <p className="text-sm text-center mb-5">
            Convert Word documents to PDF or PDF documents to Word format online.
          </p>

          <div className="flex flex-col items-center space-y-4">
            <div className="flex space-x-4 mb-4">
              <button
                onClick={() => setConversionType("wordToPdf")}
                className={`px-4 py-2 rounded-lg ${
                  conversionType === "wordToPdf" ? "bg-blue-500 text-white" : "bg-gray-200"
                }`}
              >
                Convert Word to PDF
              </button>
              <button
                onClick={() => setConversionType("pdfToWord")}
                className={`px-4 py-2 rounded-lg ${
                  conversionType === "pdfToWord" ? "bg-blue-500 text-white" : "bg-gray-200"
                }`}
              >
                Convert PDF to Word
              </button>
            </div>

            <input
              type="file"
              accept={conversionType === "wordToPdf" ? ".doc,.docx" : ".pdf"}
              onChange={handleFileChange}
              className="hidden"
              id="FileInput"
            />
            <label
              htmlFor="FileInput"
              className="w-full flex items-center justify-center px-4 py-6 bg-gray-100 text-gray-700 rounded-lg shadow-lg cursor-pointer border-blue-300 hover:bg-blue-700 duration-300 hover:text-white"
            >
              {conversionType === "wordToPdf" ? (
                <FaFileWord className="text-3xl mr-3" />
              ) : (
                <FaFilePdf className="text-3xl mr-3" />
              )}
              <span className="text-2xl">
                {selectedFile ? selectedFile.name : `Choose ${conversionType === "wordToPdf" ? "Word" : "PDF"} File`}
              </span>
            </label>
            <button
              onClick={handleSubmit}
              disabled={!selectedFile}
              className="text-white bg-blue-500 hover:bg-blue-700 disabled:bg-gray-400 disabled:pointer-events-none duration-300 font-bold px-4 py-2 rounded-lg"
            >
              Convert File
            </button>
            {message && (
              <div className={`text-center ${downloadError ? "text-red-500" : "text-green-500"}`}>
                {message}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
