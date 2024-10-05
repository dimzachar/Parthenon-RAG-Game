## FAQ

### 1. What is Parthenon?
Parthenon is an immersive 2D pixel-art game that teaches players about Movementlabs, a Move-based blockchain network, and its ecosystem. It utilises a Retrieval Augmented Generation (RAG) system, allowing players to interact with a knowledge base through engaging NPC conversations.

### 2. How is the problem described in Parthenon?
Parthenon addresses the challenge of educating users about the Movementlabs ecosystem and blockchain technology in an engaging way. It combines a 2D pixel-art game with AI-powered conversations to create an interactive learning experience.

### 3. How does the game incorporate AI?
The game uses OpenAI's language model to power its AI-driven conversations. When a player interacts with an NPC, the game sends a query to the backend, which uses Elasticsearch to find relevant information from its knowledge base. This information is then used to create a prompt for the OpenAI model, which generates a response that is displayed to the player.

### 4. How does Parthenon implement the RAG flow?
Parthenon uses a full RAG (Retrieval Augmented Generation) flow:
1. It uses Elasticsearch as a knowledge base to store information about Movementlabs and blockchain concepts.
2. When a player asks a question, the system retrieves relevant information from the knowledge base.
3. This information is used to construct a prompt for the OpenAI language model.
4. The LLM generates a response based on the retrieved information and the player's question.

### 5. What technologies were used to build Parthenon?

- **Backend**: Python with FastAPI framework
- **Frontend**: Next.js, TypeScript, and Phaser game framework
- **Databases**: PostgreSQL (main database) and Elasticsearch (vector search)
- **AI**: OpenAI's language models
- **Monitoring**: Grafana

### 6. How was retrieval evaluated in Parthenon?
Four retrieval methods were evaluated, including Text Search, Text Vector KNN, Hybrid Search, and Hybrid Search RRF. Each method was tested for accuracy and speed. While Hybrid Search RRF had the highest accuracy, Text Search was ultimately chosen for its balance of speed and accuracy.

### 7. How was the RAG approach evaluated in Parthenon?
Several RAG approaches were tested, including different prompt structures and retrieval methods. The evaluation considered factors such as response relevance, accuracy, and generation speed. The best-performing approach was selected for the final implementation.

### 8. Which LLM was chosen for the RAG system and why?
Both gpt-4o-mini and gpt-4o were evaluated for the RAG system. gpt-4o-mini was ultimately selected because, despite gpt-4o scoring higher in initial testing, gpt-4o-mini proved to be more cost-effective while still providing suitable results for the project's needs.

### 9. What kind of interface does Parthenon provide?
Parthenon offers a full user interface in the form of a 2D pixel-art game. Players can explore the game world, interact with NPCs, and engage in AI-powered conversations through a graphical interface built with Next.js and Phaser.js.

### 10. How is data ingested into Parthenon's knowledge base?
Parthenon uses an automated ingestion pipeline to populate its Elasticsearch knowledge base. This pipeline processes documents about Movementlabs and blockchain technology, chunks the text appropriately, and indexes it for efficient retrieval.

### 11. Is Parthenon containerized?
Yes, Parthenon is fully containerized. It uses Docker Compose to manage all its components, including the game server, databases, and monitoring tools, ensuring easy deployment and scalability.

### 12. How can I monitor the performance of the application?
The project uses Grafana for real-time monitoring. The Grafana dashboard visualises various metrics, including user feedback, query volume, token usage, response times, and more, allowing you to track the system's health and performance.

### 13. How can someone reproduce the Parthenon project?
Detailed setup instructions are provided in the project documentation. These include steps for cloning the repository, setting up the required dependencies (with specified versions), and running the application. The dataset used is also made accessible, allowing for full reproducibility.

### 14. What best practices does Parthenon implement?
Parthenon implements hybrid search, combining text and vector search methods for optimal retrieval. While document re-ranking and user query rewriting were explored, they were not included in the final implementation due to performance considerations.

### 15. Was query rewriting used in the final implementation?
No, while query rewriting was explored as a potential method to improve the quality of responses, the implemented approach didn't yield better results compared to using the original user queries. This area may be revisited in the future.

### 16. Are there any bonus features in Parthenon?
The project is deployed in cloud. You are welcome to give extra points if you like this project. 

### 17. How can I contribute to the Parthenon project?
You can contribute to the project by forking the repository on GitHub and creating a pull request with your changes. Bug reports and feature requests can be submitted through the GitHub Issues tracker.
