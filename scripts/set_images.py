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

def update_work_images(conn):
    """
    Update the image column for all works in the database, 
    creating URLs based on the work names
    """
    # Create cursor
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        # First, fetch all works
        cur.execute("SELECT id, name FROM works")
        works = cur.fetchall()
        
        # Process each work
        for work in works:
            # Transform the name into the image URL
            image_name = work['name'].replace(" ", "_").replace("'", "")
            image_url = f"https://sph.chmod.site/static/rembrandt/{image_name}.jpg"
            
            # Update the database
            cur.execute(
                "UPDATE works SET image = %s WHERE id = %s",
                (image_url, work['id'])
            )
        
        # Commit the changes
        conn.commit()
        
        print(f"Successfully updated {len(works)} works")
        
    except Exception as e:
        conn.rollback()
        print(f"An error occurred: {e}")
        raise
    finally:
        cur.close()

update_work_images(connect_db())