from celery import shared_task
from typing import List
from rich import print
import io
import cohere
import guardrails as gd
from guardrails.validators import ValidRange, ValidChoices, Validator
from pydantic import BaseModel, Field
from celery.result import AsyncResult
import PyPDF2
from pdfminer.high_level import extract_pages
from pdfminer.layout import LTTextContainer
import requests
from dotenv import load_dotenv
import os

load_dotenv()

co = cohere.Client(api_key=os.getenv("COHERE_API_KEY"))

@shared_task(ignore_result=False, name="tasks.support")
def support(source, snippet, url):
    # get sources from body
    
    # download the pdf
    response = requests.get(url)
    # extract the pdf from the byte stream
    pdf = PyPDF2.PdfReader(io.BytesIO(response.content))
    # extract text from the pdf
    docs = []
    for pagenum, page in enumerate(extract_pages(pdf.stream)):
        pageText = ''
        for element in page:
            if isinstance(element, LTTextContainer):
                # remove multi new lines with format 32\n, 2\n ... 
                pageText += element.get_text().replace(r'/\d*\\n/g', '')
        docs.append(pageText)

    # print(docs, file=sys.stdout)
    # rerank the docs
    ranking = co.rerank(
        model="rerank-english-v2.0",
        query=snippet,
        documents=docs,
        top_n=2
    )
    
    docs = []
    for result in ranking.results:
        docs.append({
            "title": source['title'],
            "text": result.document['text'],
            "url": source['openAccessPdf']['url'],
            })

    res = co.chat(
        model="command",
        message="Rewrite the following text snippet: " + snippet + " with supporting evidence from the provided documents. Include a citation to the source.",
        documents=docs,
        max_tokens=1024,
        prompt_truncation="AUTO",
    )
    print(res.text)
    return { "response": res.text, "docs": res.documents, "citations": res.citations }

class SearchTerm(BaseModel):
    snippet: str = Field(..., description="Claim that needs supporting evidence")
    terms: str = Field(..., description="A search query to find research related to the claim")


class TermGenResponse(BaseModel):
    """Final response for term gen"""
    result: List[SearchTerm] = Field(..., description="Snippets of the text that need supporting evidence")

@shared_task(ignore_result=False, name="tasks.gen_terms")
def gen_terms(text: str):
    PROMPT = """Given the following text, extract a dictionary that contains claims that need supporting evidence.
    ${text}

    ${gr.complete_json_suffix_v2}
    """
    guard = gd.Guard.from_pydantic(output_class=TermGenResponse, prompt=PROMPT, num_reasks=5)

    _, validated_output, *rest = guard(
        co.generate,
        prompt_params={"text": text},
        model='command',
        max_tokens=1024,
        temperature=0.6
    )

    return validated_output.model_dump_json()