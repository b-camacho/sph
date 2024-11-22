import json
import psycopg2
from psycopg2.extras import RealDictCursor
import sys
import os

def connect_db():
    """Create a connection to the PostgreSQL database"""
    return psycopg2.connect(
       f"postgresql://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}@{os.getenv('DB_HOST')}:{os.getenv('DB_PORT')}/{os.getenv('DB_NAME')}"
   )

def read_works_json(filepath):
    """Read works data from JSON file"""
    try:
        with open(filepath, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"Error: Could not find file {filepath}")
        sys.exit(1)
    except json.JSONDecodeError:
        print(f"Error: Invalid JSON format in {filepath}")
        sys.exit(1)

def seed_database(json_filepath):
    """Seed the database with Rembrandt and his works"""
    conn = connect_db()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        # Insert Rembrandt into authors table
        cur.execute(
            """
            INSERT INTO authors (name, bio)
            VALUES (%s, %s)
            RETURNING id;
            """,
            (
                "Rembrandt",
                "Rembrandt Harmenszoon van Rijn (1606-1669) was a Dutch Golden Age painter, "
                "printmaker and draughtsman. He is generally considered one of the greatest "
                "visual artists in the history of art."
            )
        )
        
        # Get Rembrandt's author ID
        rembrandt_id = cur.fetchone()['id']
        
        # Read works from JSON file
        works = read_works_json(json_filepath)
        
        # Insert each work
        for work in works:
            cur.execute(
                """
                INSERT INTO works (name, descr, author_id)
                VALUES (%s, %s, %s)
                """,
                (work['title'], work['description'], rembrandt_id)
            )
        
        # Commit the transaction
        conn.commit()
        print(f"Database seeded successfully with {len(works)} works!")
        
    except Exception as e:
        conn.rollback()
        print(f"Error seeding database: {e}")
        
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python seed_database.py <path_to_works.json>")
        sys.exit(1)
    
    json_filepath = sys.argv[1]
    seed_database(json_filepath)