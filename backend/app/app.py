import os
import csv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from rag import get_answer
from db import save_conversation, save_feedback
import uuid

# Add these debug print statements at the beginning of the file
print("Current directory:", os.getcwd())
print("Files in current directory:", os.listdir())
app = FastAPI()

# Add CORS middleware
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],  # Allows all origins
#     allow_credentials=True,
#     allow_methods=["*"],  # Allows all methods
#     allow_headers=["*"],  # Allows all headers
# )
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],  # Add both potential frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Query(BaseModel):
    question: str
    selected_model: str

class Feedback(BaseModel):
    conversation_id: str
    feedback: int

    
@app.get("/faq")
async def get_faq_questions():
    print("Entering get_faq_questions function")
    try:
        faq_questions = []
        csv_path = '/backend/app/data/ground-truth-retrieval.csv'  # Updated path to match Docker volume
        print(f"Attempting to open CSV file at: {csv_path}")
        
        if not os.path.exists(csv_path):
            print(f"CSV file not found at {csv_path}")
            raise FileNotFoundError(f"CSV file not found at {csv_path}")
        
        with open(csv_path, 'r') as file:
            print("CSV file opened successfully")
            csv_reader = csv.DictReader(file)
            for row in csv_reader:
                faq_questions.append({
                    "text": row['question'],
                    "document_id": row['doc_id'],
                    "chunk_id": row['chunk_id']
                })
            print(f"Loaded {len(faq_questions)} questions from CSV")
        
        if not faq_questions:
            print("No questions were loaded from the CSV")
            raise ValueError("No questions were loaded from the CSV")
        
        print("Returning FAQ questions")
        return JSONResponse(content={"faq_questions": faq_questions})
    except Exception as e:
        print(f"Error in get_faq_questions: {str(e)}")
        print(f"Current working directory: {os.getcwd()}")
        print(f"Contents of current directory: {os.listdir()}")
        print(f"Contents of /backend/app/data directory: {os.listdir('/backend/app/data')}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    
@app.post("/question")
async def rag_query(query: Query):
    try:
        
        print(f"Received question: {query.question}")
        conversation_id = str(uuid.uuid4())
        print("Getting answer...")
        result = get_answer(query.question, query.selected_model)
        print(f"Sending response: {result}")
        print("Answer received, saving conversation...")
        save_conversation(conversation_id, query.question, result)
        print("Conversation saved, returning result...")
        return {"conversation_id": conversation_id, **result}
    except Exception as e:
        print(f"Error occurred: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
    
    
@app.post("/feedback")
async def submit_feedback(feedback: Feedback):
    try:
        if feedback.feedback not in [1, -1]:
            return JSONResponse(
                status_code=400,
                content={"error": "Invalid input. Feedback must be 1 or -1."}
            )

        save_feedback(feedback.conversation_id, feedback.feedback)
        
        result = {
            "message": f"Feedback received for conversation {feedback.conversation_id}: {feedback.feedback}"
        }
        return JSONResponse(content=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)