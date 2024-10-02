import os
import time
import json
from openai import OpenAI
from elasticsearch import Elasticsearch
from dotenv import load_dotenv

load_dotenv()

ELASTIC_URL = os.getenv("ELASTIC_URL", "http://localhost:9200")
print(ELASTIC_URL)
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
# print(OPENAI_API_KEY)
INDEX_NAME = os.getenv("INDEX_NAME", "movement-wiki")

es_client = Elasticsearch(ELASTIC_URL)
client = OpenAI(api_key=OPENAI_API_KEY)

def test_es_connection():
    try:
        if es_client.ping():
            print("Connected to Elasticsearch")
        else:
            print("Could not connect to Elasticsearch")
    except Exception as e:
        print(f"Error connecting to Elasticsearch: {str(e)}")

# Call this function at the start of your script
test_es_connection()

def elastic_search(query, size=5, source=None):
    search_query = {
        "size": size,
        "query": {
            "bool": {
                "must": [
                    {
                        "multi_match": {
                            "query": query,
                            "fields": ["title", "text^3"],
                            "type": "best_fields",
                            "fuzziness": "AUTO"
                        }
                    }
                ],
                "should": [
                    {
                        "match_phrase": {
                            "text": {
                                "query": query,
                                "boost": 2
                            }
                        }
                    }
                ]
            }
        }
    }
    if source:
        search_query["query"]["bool"]["filter"] = {
            "term": {
                "source": source
            }
        }

    response = es_client.search(index=INDEX_NAME, body=search_query)
    return [hit['_source'] for hit in response['hits']['hits']]

def build_prompt(query, search_results):
    prompt_template = """
You are an AI-powered Assistant for Movement Labs, specializing in the Move language and the Movement Network ecosystem. 
Answer the QUESTION based strictly on the CONTEXT from the knowledge base. If the CONTEXT does not provide enough details, request more information or clarify the question. 

Your answer should be clear, concise, and factual. Follow these guidelines:
- Provide a complete answer in 2-3 short paragraphs or bullet points for clarity.
- Focus on the most relevant information.
- If the QUESTION is unclear, ask for clarification.
- Do not speculate or generate information not present in the CONTEXT.
- Ensure your response is complete and not cut off mid-sentence.

QUESTION: {question}

CONTEXT:
{context}
""".strip()

    context = "\n\n".join([
        f"Document ID: {doc['doc_id']}\n"
        f"Chunk ID: {doc['chunk_id']}\n"
        f"Title: {doc['title']}\n"
        f"URL: {doc['url']}\n"
        f"Content: {doc['text']}"
        for doc in search_results
    ])

    return prompt_template.format(question=query, context=context).strip(), context

def llm(prompt, model='gpt-4o-mini', max_tokens=500):
    try:
        response = client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=max_tokens
        )
        return response.choices[0].message.content, response.usage
    except Exception as e:
        print(f"An error occurred: {e}")
        return None, None

def evaluate_relevance(question, answer):
    evaluation_prompt_template = """
    You are an expert evaluator for a RAG system.
    Your task is to analyze the relevance of the generated answer to the given question.
    Based on the relevance of the generated answer, you will classify it
    as "NON_RELEVANT", "PARTLY_RELEVANT", or "RELEVANT".

    Here is the data for evaluation:

    Question: {question}
    Generated Answer: {answer}

    Please analyze the content and context of the generated answer in relation to the question
    and provide your evaluation in parsable JSON without using code blocks:

    {{
      "Relevance": "NON_RELEVANT" | "PARTLY_RELEVANT" | "RELEVANT",
      "Explanation": "[Provide a brief explanation for your evaluation]"
    }}
    """.strip()

    prompt = evaluation_prompt_template.format(question=question, answer=answer)
    evaluation, usage = llm(prompt, 'gpt-4o-mini')
    try:
        json_eval = json.loads(evaluation)
        return json_eval, usage
    except json.JSONDecodeError:
        result = {"Relevance": "UNKNOWN", "Explanation": "Failed to parse evaluation"}
        return result, usage

def calculate_openai_cost(selected_model, tokens):
    openai_cost = 0
    if selected_model == "gpt-4o-mini":
        openai_cost = (
            tokens.prompt_tokens * 0.00015 + tokens.completion_tokens * 0.0006
        ) / 1000
    else:
        print(f"Model {selected_model} not recognized. OpenAI cost calculation failed.")
    return openai_cost


def get_answer(query, selected_model, size=3, source=None):
    search_results = elastic_search(query, size, source)
    prompt, context = build_prompt(query, search_results)
    start_time = time.time()
    answer, usage = llm(prompt, model=selected_model)
    end_time = time.time()
    response_time = end_time - start_time
    
 
    evaluation, eval_usage = evaluate_relevance(query, answer)
    
    openai_cost_rag = calculate_openai_cost(selected_model, usage)
    openai_cost_eval = calculate_openai_cost(selected_model, eval_usage)

    openai_cost = openai_cost_rag + openai_cost_eval

    return {
        'query': query,
        'context': context,
        'prompt': prompt,
        'answer': answer,
        'search_results': search_results,
        'response_time': response_time,
        "relevance": evaluation.get("Relevance", "UNKNOWN"),
        "relevance_explanation": evaluation.get(
            "Explanation", "Failed to parse evaluation"
        ),
        'model_used': selected_model,
        'prompt_tokens': usage.prompt_tokens,
        'completion_tokens': usage.completion_tokens,
        'total_tokens': usage.total_tokens,
        'eval_prompt_tokens': eval_usage.prompt_tokens,
        'eval_completion_tokens': eval_usage.completion_tokens,
        'eval_total_tokens': eval_usage.total_tokens,
        'openai_cost': openai_cost
    }