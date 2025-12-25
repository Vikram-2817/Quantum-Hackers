from fastapi import FastAPI, UploadFile, File # pyright: ignore[reportMissingImports]
from fastapi.middleware.cors import CORSMiddleware # pyright: ignore[reportMissingImports]
from pydantic import BaseModel # pyright: ignore[reportMissingImports]
import PyPDF2 # pyright: ignore[reportMissingImports]
import io
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

app = FastAPI(title="Decision Receipt AI")

# ---------- CORS ----------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- Storage ----------
documents = []
page_map = []
vectorizer = TfidfVectorizer()
doc_vectors = None

# ---------- Models ----------
class QueryRequest(BaseModel):
    question: str

# ---------- Helpers ----------
def extract_text_per_page(pdf_bytes):
    reader = PyPDF2.PdfReader(io.BytesIO(pdf_bytes))
    pages = []
    for i, page in enumerate(reader.pages):
        text = page.extract_text()
        if text:
            pages.append((i + 1, text))
    return pages

# ---------- APIs ----------
@app.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    global documents, page_map, doc_vectors

    content = await file.read()
    pages = extract_text_per_page(content)

    documents = []
    page_map = []

    for page_no, text in pages:
        documents.append(text)
        page_map.append(page_no)

    documents = [d.strip() for d in documents if d.strip()]

    if not documents:
        return {
            "error": "No readable text found in document. " "This PDF may be scanned or image-based."
        }
    doc_vectors = vectorizer.fit_transform(documents)

    return {
        "message": "Document uploaded and indexed",
        "pages_indexed": len(documents)
    }

@app.post("/query")
async def query_knowledge(payload: QueryRequest):
    global doc_vectors

    if doc_vectors is None:
        return {"error": "No document indexed yet"}

    query_vec = vectorizer.transform([payload.question])
    scores = cosine_similarity(query_vec, doc_vectors)[0]

    top_indices = scores.argsort()[-3:][::-1]

    results = []
    for idx in top_indices:
        results.append({
            "page": page_map[idx],
            "similarity": round(float(scores[idx]), 3),
            "policy_text": documents[idx][:600]
        })

    return {
        "question": payload.question,
        "matches": results
    }
