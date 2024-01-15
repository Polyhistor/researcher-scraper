import scrapy
from yourproject.items import ResearcherItem

class ScholarSpider(scrapy.Spider):
    name = 'scholar_spider'
    start_urls = ['https://scholar.google.com/citations?view_op=view_org&hl=en&org=9834965955476762779'] # A specific organization for example

    def parse(self, response):
        # Parse the list of researchers
        for href in response.css('.gsc_1usr_name a::attr(href)').getall():
            yield response.follow(href, self.parse_researcher)

    def parse_researcher(self, response):
        item = ResearcherItem()
        item['name'] = response.css('.gsc_prf_in::text').get()
        # Example: Fetch email if available in the profile (usually not available)
        item['email'] = response.css('.gsc_prf_ivh::text').re_first(r'[\w\.-]+@[\w\.-]+')
        yield item
