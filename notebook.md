# Parthenon Project: Experiment Results

## Getting Started

To begin experimenting, start Jupyter by running:

```bash
cd notebooks
pipenv run jupyter notebook
```

Open [`rag.ipynb`](notebooks/rag.ipynb) to access the experiments. 

> **Note**: Running the notebook will incur OpenAI API costs.

## Retrieval Evaluation Results

We evaluated four different retrieval methods. Here are the results:

### 1. Text Search

| Metric | Value |
|--------|-------|
| Document Hit Rate | 0.8349 |
| Document MRR | 0.6939 |
| Chunk Hit Rate | 0.8179 |
| Chunk MRR | 0.6683 |
| Total Evaluation Time | 124.00 seconds |
| Average Query Time | 63.23 ms |
| Min Query Time | 0.00 ms |
| Max Query Time | 98.97 ms |

### 2. Text Vector KNN

| Metric | Value |
|--------|-------|
| Document Hit Rate | 0.7056 |
| Document MRR | 0.5286 |
| Chunk Hit Rate | 0.6641 |
| Chunk MRR | 0.4871 |
| Total Evaluation Time | 291.27 seconds |
| Average Query Time | 148.56 ms |
| Min Query Time | 116.75 ms |
| Max Query Time | 713.85 ms |

### 3. Hybrid Search

| Metric | Value |
|--------|-------|
| Document Hit Rate | 0.8359 |
| Document MRR | 0.6971 |
| Chunk Hit Rate | 0.8195 |
| Chunk MRR | 0.6716 |
| Total Evaluation Time | 332.74 seconds |
| Average Query Time | 169.64 ms |
| Min Query Time | 96.06 ms |
| Max Query Time | 438.67 ms |

### 4. Hybrid Search RRF

| Metric | Value |
|--------|-------|
| Document Hit Rate | 0.8497 |
| Document MRR | 0.6489 |
| Chunk Hit Rate | 0.8328 |
| Chunk MRR | 0.6159 |
| Total Evaluation Time | 522.48 seconds |
| Average Query Time | 267.18 ms |
| Min Query Time | 214.56 ms |
| Max Query Time | 516.88 ms |

**Conclusion**: While Hybrid Search RRF shows the best overall performance, Text Search is very close in accuracy and is significantly faster (4x faster than Hybrid Search RRF and 2x faster than Hybrid Search). For this reason, we've chosen to implement Text Search in our current system.

## RAG Evaluation: LLM-as-a-Judge

We used the LLM-as-a-Judge metric to evaluate the quality of our RAG flow. In a sample of 100 records, we compared two models:

### gpt-4o-mini

| Relevance | Count | Percentage |
|-----------|-------|------------|
| RELEVANT | 91 | 91.9% |
| PARTLY_RELEVANT | 4 | 4.0% |
| NON_RELEVANT | 4 | 4.0% |

### gpt-4o

| Relevance | Count | Percentage |
|-----------|-------|------------|
| RELEVANT | 79 | 79.0% |
| PARTLY_RELEVANT | 15 | 15.0% |
| NON_RELEVANT | 6 | 6.0% |

**Decision**: Based on these results, we've opted to use `gpt-4o-mini` for our system.

## User Query Rewriting

We experimented with query rewriting for user queries to potentially improve response quality. However, the results were suboptimal:

| Relevance | Count | Percentage |
|-----------|-------|------------|
| RELEVANT | 82 | 82.0% |
| PARTLY_RELEVANT | 10 | 10.0% |
| NON_RELEVANT | 8 | 8.0% |

**Conclusion**: While query rewriting shows potential, our current implementation didn't yield improved results. We've decided to use the original queries for now. Future work could explore better prompting strategies to enhance query rewriting effectiveness.


## Resources

For detailed results and raw data, please refer to the following files:

- [Evaluation Results (JSON)](notebooks/evaluation_results.json)
- [RAG Evaluation Results (gpt-4o-mini)](notebooks/rag-eval-results-gpt-4o-mini.csv)
- [RAG Evaluation Results (gpt-4o)](notebooks/rag-eval-results-gpt-4o.csv)
- [RAG Evaluation Results with Rewriting (gpt-4o-mini)](notebooks/rag-eval-results-with-rewriting-gpt-4o-mini.csv)
- [RAG Evaluation Results with Rewriting (gpt-4o)](notebooks/rag-eval-results-with-rewriting-gpt-4o.csv)

These files contain the raw data and detailed results from the experiments, which you can use for further analysis or verification of the findings.