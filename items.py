import scrapy

class ResearcherItem(scrapy.Item):
    name = scrapy.Field()
    email = scrapy.Field()
