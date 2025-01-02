import os
import pickle
from langchain_ollama import OllamaEmbeddings
from langchain_community.vectorstores import Chroma
from langchain.prompts import ChatPromptTemplate, PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_ollama import ChatOllama
from langchain_core.runnables import RunnablePassthrough
from langchain.retrievers.multi_query import MultiQueryRetriever

def main():
    model = "llama3.2"

    chunks_file_path = "./Data/chunks.pkl"
    with open(chunks_file_path, 'rb') as f:
        chunks = pickle.load(f)
    print("Loaded existing chunks from disk...")

    # Initialize the embedding model
    embedding_model = OllamaEmbeddings(model="nomic-embed-text")

    embedding_file_path = "./Data/embeddings.pkl"

    # Check if embeddings already exist
    if os.path.exists(embedding_file_path):
        with open(embedding_file_path, 'rb') as f:
            embeddings_data = pickle.load(f)
            
        # Construct vector_db with the existing documents and use the embeddings from the saved data
        # Since Chroma needs the documents to build its index, we'll reconstruct the vector_db
        vector_db = Chroma.from_documents(documents=chunks, embedding=embedding_model, collection_name="simple-rag")
        print("Loaded existing embeddings from disk...")
    else:
        # Create embeddings from documents
        embeddings = embedding_model.embed_documents([chunk.page_content for chunk in chunks])
        
        # Construct vector_db with the new embeddings
        vector_db = Chroma.from_documents(documents=chunks, embedding=embedding_model, collection_name="simple-rag")

        # Prepare to save embeddings
        embeddings_data = {
            'embeddings': embeddings,
            'metadata': [chunk.metadata for chunk in chunks]
        }
        
        # Save the relevant embeddings and metadata to a file
        with open(embedding_file_path, 'wb') as f:
            pickle.dump(embeddings_data, f)
            print("Saved embeddings to disk...")


    # Set up the model for retrieval
    llm = ChatOllama(model=model)

    # Define the query prompt
    QUERY_PROMPT = PromptTemplate(input_variables=["question"],
        template="""You are an AI language model assistant. Your task is to generate three
        different versions of the given user question to retrieve relevant documents from
        a vector database. By generating multiple perspectives on the user question, your
        goal is to help the user overcome some of the limitations of the distance-based
        similarity search. Provide these alternative questions separated by newlines.
        Original question: {question}"""
    )

    # Set up the retriever
    retriever = MultiQueryRetriever.from_llm(retriever=vector_db.as_retriever(max_results=5), llm=llm, prompt=QUERY_PROMPT)

    # RAG Prompt
    template = """Answer the question based ONLY on the following context:
    {context}
    Question: {question}
    """
    prompt = ChatPromptTemplate.from_template(template=template)

    chain = ({"context": retriever, "question": RunnablePassthrough()} | prompt | llm | StrOutputParser())

    file = open("./Data/query.txt", 'r')
    query = file.readline()
    file.close()

    # Example query
    res = chain.invoke(input=(query,))
    print(res)
    file  = open("./Data/response.txt", 'w', encoding='utf-16')
    file.write(res)
    file.close()

if __name__ == "__main__":
    main()
