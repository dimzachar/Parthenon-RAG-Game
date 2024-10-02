import os
from elasticsearch import Elasticsearch
from elasticsearch.exceptions import NotFoundError
from dotenv import load_dotenv
from ingest import ingest_documents
from db import init_db

load_dotenv()

ELASTIC_URL = os.getenv("ELASTIC_URL", "http://localhost:9200")
INDEX_NAME = os.getenv("INDEX_NAME", "movement-wiki")

def setup_elasticsearch():
    print("Setting up Elasticsearch...")
    es_client = Elasticsearch(ELASTIC_URL)

    index_settings = {
        "settings": {
            "number_of_shards": 1,
            "number_of_replicas": 0
        },
        "mappings": {
            "properties": {
                "doc_id": {"type": "keyword"},
                "chunk_id": {"type": "keyword"},
                "text": {"type": "text"},
                "title": {"type": "text"},
                "url": {"type": "keyword"},
                "source": {"type": "keyword"}
            }
        }
    }

    # Delete existing index if it exists
    try:
        es_client.indices.delete(index=INDEX_NAME, ignore_unavailable=True)
        print(f"Deleted index: {INDEX_NAME}")
    except NotFoundError:
        print(f"Index {INDEX_NAME} not found, nothing to delete")

    # Create new index
    es_client.indices.create(index=INDEX_NAME, settings=index_settings['settings'], mappings=index_settings['mappings'])
    print(f"Created index: {INDEX_NAME}")

    return es_client

def index_documents(es_client, documents):
    print("Indexing documents...")
    for doc in documents:
        es_client.index(index=INDEX_NAME, document=doc)
    print(f"Indexed {len(documents)} documents")

    # Refresh the index to make the documents available for search
    es_client.indices.refresh(index=INDEX_NAME)
    print("Index refreshed")

def main():
    print("Starting the indexing process...")

    # Correct path to the data directory
    data_directory = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data")
    print(f"Data directory path: {data_directory}")
    print(f"Contents of data directory: {os.listdir(data_directory)}")
    
    documents = ingest_documents(data_directory)
    print(f"Total documents ingested and processed: {len(documents)}")
    
    es_client = setup_elasticsearch()
    index_documents(es_client, documents)

    print("Initializing database...")
    init_db()

    csv_path = os.path.join(data_directory, 'ground-truth-retrieval.csv')
    if os.path.exists(csv_path):
        print(f"ground-truth-retrieval.csv found at {csv_path}")
        print(f"File size: {os.path.getsize(csv_path)} bytes")
    else:
        print(f"Warning: ground-truth-retrieval.csv not found at {csv_path}")

    print("Indexing process completed successfully!")

if __name__ == "__main__":
    main()
