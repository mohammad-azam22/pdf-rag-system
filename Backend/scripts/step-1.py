import os
import pickle
from langchain_community.document_loaders import UnstructuredPDFLoader
from langchain_ollama import OllamaEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
import ollama

def main():
    # Configuration
    pdf_path = "./Data/Data.pdf"
    model = "llama3.2"

    # Pull the language model
    ollama.pull(model)
    print("Pulling model:", model)

    # Load the PDF file
    if pdf_path:
        loader = UnstructuredPDFLoader(file_path=pdf_path)
        data = loader.load()
        print("Done loading...")
    else:
        print("Upload a PDF file")

    # Define paths for chunks and embeddings
    chunks_file_path = "./Data/chunks.pkl"

    # Check if chunks already exist
    if os.path.exists(chunks_file_path):
        with open(chunks_file_path, 'rb') as f:
            chunks = pickle.load(f)
        print("Loaded existing chunks from disk...")
    else:
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1200, chunk_overlap=300)
        chunks = text_splitter.split_documents(data)
        
        # Save chunks to a file
        with open(chunks_file_path, 'wb') as f:
            pickle.dump(chunks, f)
            print("Saved chunks to disk...")

if __name__ == "__main__":
    main()