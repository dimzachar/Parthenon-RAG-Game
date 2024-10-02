import os
import psycopg2
from psycopg2.extras import DictCursor
from datetime import datetime
from zoneinfo import ZoneInfo


RUN_TIMEZONE_CHECK = os.getenv('RUN_TIMEZONE_CHECK', '1') == '1'

TZ_INFO = os.getenv("TZ", "Europe/Berlin")
tz = ZoneInfo(TZ_INFO)




def get_db_connection():
    host=os.getenv("POSTGRES_HOST", "postgres")
    database = os.getenv("POSTGRES_DB", "parthenon")
    user = os.getenv("POSTGRES_USER", "your_username")
    password = os.getenv("POSTGRES_PASSWORD", "your_password")

    # Print database connection parameters
    print(f"Database Host: {host}")
    print(f"Database Name: {database}")
    print(f"Database User: {user}")

    try:
        connection = psycopg2.connect(
            host=host,
            database=database,
            user=user,
            password=password,
        )
        print(f"Successfully connected to the database at {host}")
        return connection
    except Exception as e:
        print(f"Error connecting to the database: {e}")
        raise


def init_db():
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            print("Dropping tables if they exist...")
            cur.execute("DROP TABLE IF EXISTS feedback")
            cur.execute("DROP TABLE IF EXISTS conversations")

            print("Creating tables...")
            cur.execute("""
                CREATE TABLE conversations (
                    id TEXT PRIMARY KEY,
                    question TEXT NOT NULL,
                    answer TEXT NOT NULL,
                    model_used TEXT NOT NULL,
                    response_time FLOAT NOT NULL,
                    relevance TEXT NOT NULL,
                    relevance_explanation TEXT NOT NULL,
                    prompt_tokens INTEGER NOT NULL,
                    completion_tokens INTEGER NOT NULL,
                    total_tokens INTEGER NOT NULL,
                    eval_prompt_tokens INTEGER NOT NULL,
                    eval_completion_tokens INTEGER NOT NULL,
                    eval_total_tokens INTEGER NOT NULL,
                    openai_cost FLOAT NOT NULL,
                    timestamp TIMESTAMP WITH TIME ZONE NOT NULL
                )
            """)
            cur.execute("""
                CREATE TABLE feedback (
                    id SERIAL PRIMARY KEY,
                    conversation_id TEXT REFERENCES conversations(id),
                    feedback INTEGER NOT NULL,
                    timestamp TIMESTAMP WITH TIME ZONE NOT NULL
                )
            """)
            print("Tables created successfully.")
        conn.commit()
    except Exception as e:
        print(f"Error initializing database: {e}")
        conn.rollback()
    finally:
        conn.close()

def save_conversation(conversation_id, question, answer_data, timestamp=None):
    if timestamp is None:
        timestamp = datetime.now(tz)

    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO conversations 
                (id, question, answer, model_used, response_time, relevance, 
                relevance_explanation, prompt_tokens, completion_tokens, total_tokens, 
                eval_prompt_tokens, eval_completion_tokens, eval_total_tokens, openai_cost, timestamp)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """,
                (
                    conversation_id,
                    question,
                    answer_data["answer"],
                    answer_data["model_used"],
                    answer_data["response_time"],
                    answer_data["relevance"],
                    answer_data["relevance_explanation"],
                    answer_data["prompt_tokens"],
                    answer_data["completion_tokens"],
                    answer_data["total_tokens"],
                    answer_data["eval_prompt_tokens"],
                    answer_data["eval_completion_tokens"],
                    answer_data["eval_total_tokens"],
                    answer_data["openai_cost"],
                    timestamp,
                ),
            )
        conn.commit()
        print(f"Conversation {conversation_id} saved successfully.")
    except Exception as e:
        print(f"Error saving conversation {conversation_id}: {e}")
    finally:
        conn.close()

def save_feedback(conversation_id, feedback, timestamp=None):
    if timestamp is None:
        timestamp = datetime.now(tz)

    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                "INSERT INTO feedback (conversation_id, feedback, timestamp) VALUES (%s, %s, %s)",
                (conversation_id, feedback, timestamp),
            )
        conn.commit()
        print(f"Feedback for conversation {conversation_id} saved successfully.")
    except Exception as e:
        print(f"Error saving feedback for conversation {conversation_id}: {e}")
    finally:
        conn.close()

