import json
import glob
import os
import re
import hashlib
from bs4 import BeautifulSoup
from tqdm.auto import tqdm

def generate_document_id(doc):
    combined = f"{doc['title']}-{doc['url']}-{doc['html'][:50]}"
    hash_object = hashlib.md5(combined.encode())
    return hash_object.hexdigest()[:8]

def chunk_text(text, chunk_size=500, overlap_size=20):
    words = text.split()
    chunks = []
    start = 0
    text_length = len(words)
    while start < text_length:
        end = start + chunk_size
        chunk = " ".join(words[start:end])
        chunks.append(chunk)
        start += chunk_size - overlap_size
        if end >= text_length:
            break
    return chunks


def clean_html_content(html):
    cleaned_text = re.sub(r'^.*?Powered by GitBook', '', html, flags=re.DOTALL)
    cleaned_text = re.sub(r'^.*?Terms of Service', '', html, flags=re.DOTALL)
    cleaned_text = re.sub(r'^.*?Disclaimer', '', html, flags=re.DOTALL)
    cleaned_text = re.sub(r'Previous.*?Last updated.*?$', '', cleaned_text, flags=re.DOTALL)
    cleaned_text = re.sub(r'\*\*', '', cleaned_text)    
    cleaned_text = re.sub(r'[^\x00-\x7F]+', '', cleaned_text)
    cleaned_text = re.sub(r'@\w+', '', cleaned_text)
    cleaned_text = re.sub(r'<[^>]+>', '', cleaned_text)
    cleaned_text = re.sub(r'\\n', '', cleaned_text)
    cleaned_text = re.sub(r'\s+', ' ', cleaned_text).strip()
    
    return cleaned_text


def process_documents(documents):
    processed_docs = []
    irrelevant_titles = ['Terms of Use', 'Contact us', 'Disclaimer', 'Terms of Service']
    
    for doc in tqdm(documents, desc="Processing documents"):

        if any(title.lower() in doc['title'].lower() for title in irrelevant_titles):
            continue
        

        text = clean_html_content(doc['html'])
        title = clean_html_content(doc['title'])
        doc_id = generate_document_id(doc)
        
        chunks = chunk_text(text)
        
        for i, chunk in enumerate(chunks):
            chunk_id = f"{doc_id}_{i}"
            processed_docs.append({
                'doc_id': doc_id,
                'chunk_id': chunk_id,
                'text': chunk,
                'title': title,
                'url': doc['url'],
                'source': doc['source']
            })
    
    return processed_docs

def load_documents(directory_path):
    documents = []
    json_files = glob.glob(os.path.join(directory_path, 'json', '*.json'))

    for file_path in tqdm(json_files, desc="Loading JSON files"):
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                data = json.load(file)
        except UnicodeDecodeError:
            with open(file_path, 'r', encoding='cp1252') as file:
                data = json.load(file)
        
        if isinstance(data, list):
            for doc in data:
                documents.append({
                    'html': doc.get('html', ''),
                    'title': doc.get('title', ''),
                    'url': doc.get('url', ''),
                    'source': f"json/{os.path.basename(file_path)}"
                })
        elif isinstance(data, dict) and 'messages' in data:
            for message in data['messages']:
                content = message.get('content', '')
                if content:
                    documents.append({
                        'html': content,
                        'title': f"Message from {message.get('author', {}).get('name', 'Unknown')}",
                        'url': '',
                        'source': f"json/{os.path.basename(file_path)}"
                    })
        else:
            print(f"Unsupported JSON structure in file: {file_path}")

    return documents

def ingest_documents(directory_path):
    documents = load_documents(directory_path)
    print(f"Total documents ingested: {len(documents)}")
    processed_documents = process_documents(documents)
    print(f"Total documents ingested and processed: {len(processed_documents)}")
    return processed_documents