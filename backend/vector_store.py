import faiss
import numpy as np
from sentence_transformers import SentenceTransformer

model = SentenceTransformer("all-MiniLM-L6-v2")

dimension = 384
index = faiss.IndexFlatL2(dimension)

documents = []  # stores text + metadata

def add_documents(chunks, document_name):
    for chunk in chunks:
        embedding = model.encode(chunk["text"])
        index.add(np.array([embedding]).astype("float32"))

        documents.append({
            "text": chunk["text"],
            "page": chunk["page"],
            "document": document_name
        })

def search(query, top_k=3):
    query_embedding = model.encode(query)
    distances, indices = index.search(
        np.array([query_embedding]).astype("float32"), top_k
    )

    results = []
    for idx in indices[0]:
        if idx < len(documents):
            results.append(documents[idx])

    return results
