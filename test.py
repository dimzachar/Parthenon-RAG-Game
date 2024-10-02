import pandas as pd
import requests
import sys
import json

# Adjust these as necessary
GROUND_TRUTH_PATH = "./data/ground-truth-retrieval.csv"
BASE_URL = "http://localhost:5000"

def test_rag_endpoint():
    # Load the ground truth data and sample one question
    try:
        df = pd.read_csv(GROUND_TRUTH_PATH)
        print(f"Successfully loaded ground truth data from {GROUND_TRUTH_PATH}")
    except FileNotFoundError:
        print(f"Error: Ground truth file not found at {GROUND_TRUTH_PATH}")
        sys.exit(1)
    except Exception as e:
        print(f"Error loading ground truth file: {e}")
        sys.exit(1)

    sample = df.sample(n=1).iloc[0]
    question = sample['question']
    expected_doc_id = sample['doc_id']
    expected_chunk_id = sample['chunk_id']

    print(f"\nSample Question: {question}")
    print(f"Expected document ID: {expected_doc_id}")
    print(f"Expected chunk ID: {expected_chunk_id}")

    # Send request to the RAG endpoint
    url = f"{BASE_URL}/question"
    data = {
        "question": question,
        "selected_model": "gpt-4o-mini",
    }

    print(f"\nSending request to {url} with data: {data}")

    try:
        response = requests.post(url, json=data, timeout=30)
        
        # Print the response
        print("\nAPI Response:")
        # print(response.json())
        result = response.json()
        formatted_result = {
            "conversation_id": result.get("conversation_id"),
            "question": result.get("query"),
            "answer": result.get("answer"),
            "response_time": result.get("response_time"),
            "relevance": result.get("relevance"),
            "model_used": result.get("model_used"),
            "token_usage": {
                "prompt_tokens": result.get("prompt_tokens"),
                "completion_tokens": result.get("completion_tokens"),
                "total_tokens": result.get("total_tokens"),
                "eval_prompt_tokens": result.get("eval_prompt_tokens"),
                "eval_completion_tokens": result.get("eval_completion_tokens"),
                "eval_total_tokens": result.get("eval_total_tokens")
            },
            "openai_cost": result.get("openai_cost")
        }
        print(json.dumps(formatted_result, indent=2))
        
        # Optional: Add some basic checks
        if response.status_code == 200:
            
            print("\nStatus: Success")
            # answer = response.json().get('answer', 'No answer provided')
            # print(f"Generated Answer: {answer}")
            
            # Check if the expected document and chunk were retrieved
            search_results = response.json().get('search_results', [])
            retrieved_docs = [result['doc_id'] for result in search_results]
            retrieved_chunks = [result['chunk_id'] for result in search_results]
            
            if expected_doc_id in retrieved_docs:
                print(f"✅ Expected document {expected_doc_id} was retrieved.")
            else:
                print(f"❌ Expected document {expected_doc_id} was not retrieved.")
            
            if expected_chunk_id in retrieved_chunks:
                print(f"✅ Expected chunk {expected_chunk_id} was retrieved.")
            else:
                print(f"❌ Expected chunk {expected_chunk_id} was not retrieved.")
        else:
            print(f"\nStatus: Error (Code: {response.status_code})")
            print(f"Response content: {response.text}")
    
    except requests.exceptions.ConnectionError:
        print(f"Error: Unable to connect to the server at {BASE_URL}")
        print("Make sure your FastAPI server is running and accessible.")
    except requests.exceptions.Timeout:
        print(f"Error: Request to {BASE_URL} timed out.")
    except requests.exceptions.RequestException as e:
        print(f"An error occurred while making the request: {e}")

if __name__ == "__main__":
    test_rag_endpoint()
