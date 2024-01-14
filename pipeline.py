import sqlite3
from scrapy.exceptions import DropItem

class SQLitePipeline:
    def open_spider(self, spider):
        self.connection = sqlite3.connect('researchers.db')
        self.cursor = self.connection.cursor()
        self.cursor.execute('''
            CREATE TABLE IF NOT EXISTS researchers (
                id INTEGER PRIMARY KEY,
                name TEXT,
                email TEXT
            )
        ''')
        self.connection.commit()

    def close_spider(self, spider):
        self.cursor.close()
        self.connection.close()

    def process_item(self, item, spider):
        try:
            self.cursor.execute("INSERT INTO researchers (name, email) VALUES (?, ?)", (item['name'], item['email']))
            self.connection.commit()
            return item
        except sqlite3.DatabaseError as e:
            self.connection.rollback()
            raise DropItem(f"Database error: {e}")
