import fitz  # PyMuPDF

def extract_pdf_chunks(file_path):
    doc = fitz.open(file_path)
    chunks = []

    for page_number in range(len(doc)):
        page = doc[page_number]
        text = page.get_text()

        if text.strip():
            chunks.append({
                "text": text,
                "page": page_number + 1
            })

    return chunks
